const dgram = require('dgram');
const fs    = require('fs');
const server = dgram.createSocket('udp4');
const PORT   = 7777;

// ── Player store ──────────────────────────────────────────────────────────────
// key = "ip:port"
const players        = new Map(); // all connected players
const vehicles       = new Map(); // current active vehicle per player
const ownedVehicles  = new Map(); // vehicleId → { ownerId, modelHash, x, y, z, heading }

// ── Spawn points ──────────────────────────────────────────────────────────────
const CITY_SPAWNS = [
    { x:  190.5, y:  -931.3, z:  30.7 }, // Legion Square
    { x:  314.1, y:   180.2, z: 103.6 }, // Vinewood Blvd
    { x: -731.5, y:   -65.2, z:  41.7 }, // Rockford Hills
    { x: -204.9, y: -1005.1, z:  30.5 }, // Pillbox Hill
    { x:  115.1, y: -1763.5, z:  29.3 }, // Strawberry
];

// ── Synced server clock ───────────────────────────────────────────────────────
let syncedTime = { hours: 8, minutes: 0, seconds: 0 };

setInterval(() => {
    syncedTime.minutes++;
    if (syncedTime.minutes >= 60) { syncedTime.minutes = 0; syncedTime.hours++; }
    if (syncedTime.hours   >= 24)   syncedTime.hours = 0;

    // Broadcast time every game-minute so clients can drift-correct
    const timeMsg = Buffer.from(`TIME|${syncedTime.hours}|${syncedTime.minutes}|${syncedTime.seconds}`);
    players.forEach(p => server.send(timeMsg, p.port, p.address));
}, 2000); // 2 real seconds = 1 game minute = GTA V's native speed

// ── State persistence ─────────────────────────────────────────────────────────
setInterval(() => {
    const state = { time: syncedTime, players: {}, ownedVehicles: [] };

    players.forEach((p, id) => {
        state.players[id] = { username: p.username, x: p.x, y: p.y, z: p.z, canSpawnCars: p.canSpawnCars };
    });
    ownedVehicles.forEach((v, id) => {
        state.ownedVehicles.push({ id, ...v });
    });

    fs.writeFile('server_state.json', JSON.stringify(state, null, 2), err => {
        if (err) console.error('[STATE] Save error:', err);
    });
}, 1000);

// ── Stale player cleanup (no packets for 15 s) ────────────────────────────────
setInterval(() => {
    const now = Date.now();
    players.forEach((player, id) => {
        if (now - player.lastSeen > 15000) {
            console.log(`[TIMEOUT] ${player.username} (${id})`);
            broadcastExcept(id, `LEAVE|${id}`);
            removeAllOwnedBy(id);
            players.delete(id);
            vehicles.delete(id);
        }
    });
}, 5000);

// ── Helpers ───────────────────────────────────────────────────────────────────

function broadcast(msg) {
    const buf = Buffer.from(msg);
    players.forEach(p => server.send(buf, p.port, p.address));
}

function broadcastExcept(excludeId, msg) {
    const buf = Buffer.from(msg);
    players.forEach((p, id) => { if (id !== excludeId) server.send(buf, p.port, p.address); });
}

function sendTo(player, msg) {
    server.send(Buffer.from(msg), player.port, player.address);
}

/** Remove every vehicle and ped owned by a given playerId. */
function removeAllOwnedBy(playerId) {
    for (const [vehId, veh] of ownedVehicles) {
        if (veh.ownerId === playerId) {
            ownedVehicles.delete(vehId);
            broadcast(`REMOVE_VEHICLE|${vehId}`);
        }
    }
}

/** Check if a username is already in use (case-insensitive). */
function isUsernameTaken(username, excludeId = null) {
    for (const [id, p] of players) {
        if (id === excludeId) continue;
        if (p.username.toLowerCase() === username.toLowerCase()) return true;
    }
    return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

server.on('message', (msg, rinfo) => {
    const playerId = `${rinfo.address}:${rinfo.port}`;
    const data     = msg.toString();

    // ── JOIN ──────────────────────────────────────────────────────────────────
    if (data.startsWith('JOIN|')) {
        const username = data.split('|')[1]?.trim() || 'Player';

        // Reject duplicate joins
        if (players.has(playerId)) return;

        // *** USERNAME COLLISION CHECK ***
        if (isUsernameTaken(username)) {
            server.send(Buffer.from('NAMETAKEN'), rinfo.port, rinfo.address);
            console.log(`[NAMETAKEN] "${username}" tried to join but name is in use.`);
            return;
        }

        players.set(playerId, {
            address:     rinfo.address,
            port:        rinfo.port,
            username:    username,
            lastSeen:    Date.now(),
            x: 0, y: 0, z: 0,
            canSpawnCars: true,
        });

        const spawn  = CITY_SPAWNS[Math.floor(Math.random() * CITY_SPAWNS.length)];
        const canCars = players.get(playerId).canSpawnCars;

        // INIT includes the player's own server id so client can identify SPAWNCAR_RESPONSE ownership
        const initMsg = `INIT|${syncedTime.hours}|${syncedTime.minutes}|${syncedTime.seconds}` +
                        `|${spawn.x},${spawn.y},${spawn.z}|${canCars}|${playerId}`;
        sendTo(players.get(playerId), initMsg);

        console.log(`[JOIN] "${username}" (${playerId}) → spawn ${spawn.x},${spawn.y},${spawn.z}`);

        // Tell existing players about the newcomer
        broadcastExcept(playerId, `JOIN|${playerId}|${username}`);
        return;
    }

    // All further messages require a registered player
    if (!players.has(playerId)) return;
    const player = players.get(playerId);
    player.lastSeen = Date.now();

    // ── POS ───────────────────────────────────────────────────────────────────
    // Client sends:  POS|username|x,y,z,rx,ry,rz
    if (data.startsWith('POS|')) {
        const payload = data.slice(4); // "username|x,y,z,rx,ry,rz"
        const parts   = payload.split('|');
        if (parts.length > 1) {
            const coords = parts[1].split(',');
            player.x = parseFloat(coords[0]);
            player.y = parseFloat(coords[1]);
            player.z = parseFloat(coords[2]);
        }
        broadcastExcept(playerId, `POS|${playerId}|${payload}`);
        return;
    }

    // ── VEHICLE ───────────────────────────────────────────────────────────────
    // Client sends:  VEHICLE|username|modelHash,px,py,pz,rx,ry,rz,vx,vy,vz
    if (data.startsWith('VEHICLE|')) {
        const payload = data.slice(8); // "username|modelHash,..."
        const parts   = payload.split('|');
        if (parts.length > 1) {
            const d = parts[1].split(',');
            vehicles.set(playerId, {
                owner: parts[0],
                modelHash: d[0],
                x: parseFloat(d[1]),
                y: parseFloat(d[2]),
                z: parseFloat(d[3])
            });
        }
        broadcastExcept(playerId, `VEHICLE|${playerId}|${payload}`);
        return;
    }

    // ── SPAWNCAR request ──────────────────────────────────────────────────────
    // Client sends:  SPAWNCAR|username|modelHash
    if (data.startsWith('SPAWNCAR|')) {
        const parts     = data.split('|');
        const modelHash = parts[2];

        if (!player.canSpawnCars) {
            sendTo(player, `CARPERMISSION|false`);
            console.log(`[SPAWNCAR] ${player.username} denied — server blocked car spawning.`);
            return;
        }

        const vehicleId = `${playerId}_car_${Date.now()}`;
        const spawnX    = player.x + 3;
        const spawnY    = player.y;
        const spawnZ    = player.z;
        const heading   = 0;

        ownedVehicles.set(vehicleId, { ownerId: playerId, modelHash, x: spawnX, y: spawnY, z: spawnZ, heading });

        // Broadcast to everyone — client filters by ownerId to decide who sits in it
        const spawnMsg = `SPAWNCAR_RESPONSE|${playerId}|${vehicleId}|${modelHash},${spawnX},${spawnY},${spawnZ},${heading}`;
        broadcast(spawnMsg);
        console.log(`[SPAWNCAR] ${player.username} spawned ${modelHash} at ${spawnX.toFixed(1)},${spawnY.toFixed(1)},${spawnZ.toFixed(1)}`);
        return;
    }

    // ── ENTERED_REMOTE_VEH ───────────────────────────────────────────────────
    // Sent when local player gets into another player's car.
    // Server responds by telling everyone to remove this player's owned entities.
    if (data.startsWith('ENTERED_REMOTE_VEH|')) {
        console.log(`[ENTERED_VEH] ${player.username} climbed into someone else's car — clearing their entities.`);
        removeAllOwnedBy(playerId);
        // Inform all OTHER clients so they also clean up
        broadcastExcept(playerId, `REMOVE_ALL_OWNED|${playerId}`);
        return;
    }

    // ── REMOVE_VEHICLE ────────────────────────────────────────────────────────
    if (data.startsWith('REMOVE_VEHICLE|')) {
        const vehId = data.split('|')[1];
        ownedVehicles.delete(vehId);
        broadcast(`REMOVE_VEHICLE|${vehId}`);
        return;
    }

    // ── LEAVE ─────────────────────────────────────────────────────────────────
    if (data.startsWith('LEAVE|')) {
        console.log(`[LEAVE] ${player.username} (${playerId})`);
        broadcastExcept(playerId, `LEAVE|${playerId}`);
        removeAllOwnedBy(playerId);
        players.delete(playerId);
        vehicles.delete(playerId);
        return;
    }
});

server.on('error', err => {
    console.error('[SERVER ERROR]', err);
    server.close();
});

server.bind(PORT, () => {
    console.log(`╔═══════════════════════════════════════╗`);
    console.log(`║  GTA Multiplayer Server  —  UDP :${PORT}  ║`);
    console.log(`╚═══════════════════════════════════════╝`);
    console.log(`  Time starts at ${syncedTime.hours}:00`);
    console.log(`  Stale timeout: 15 s`);
    console.log(`  State saved to server_state.json every 1 s`);
});