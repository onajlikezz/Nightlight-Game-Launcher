const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// ── Open External Link ───────────────────────────────────────────────
async function openSocialLink(url) {
  await ipcRenderer.invoke('open-external-link', url);
}

// ── CHECK FOR UPDATES ────────────────────────────────────────────────
const CURRENT_VERSION_NUMBER = 5;
async function checkForUpdates() {
  const updateUrl = "https://api.github.com/repos/onajlikezz/Nightlight-Game-Launcher/releases/latest";
  const publicReleasePage = "https://github.com/onajlikezz/Nightlight-Game-Launcher/releases";
  showToast("Checking for updates...", "info");
  try {
    const response = await fetch(updateUrl);
    if (!response.ok) throw new Error("Failed to reach GitHub API");
    const data = await response.json();
    const latestTag = data.tag_name;
    const match = latestTag.match(/\d+/);
    if (!match) throw new Error("Could not parse version tag");
    const latestVersionNumber = parseInt(match[0]);
    if (latestVersionNumber > CURRENT_VERSION_NUMBER) {
      showToast(`New Update Found: ${latestTag}! Opening browser...`, "success");
      await ipcRenderer.invoke('open-external-link', publicReleasePage);
    } else {
      showToast("You are running the latest version (V5).", "success");
    }
  } catch (error) {
    console.error("Update Check Error:", error);
    showToast("Update check failed. Check your connection.", "error");
  }
}

// ── Global data ──────────────────────────────────────────────────────
let steamGameData = {};
let gameStatuses = {};
let discordAccounts = {};

// ── Steam API fetch ──────────────────────────────────────────────────
async function fetchSteamDataForIds(ids) {
  for (const id of ids) {
    if (steamGameData[id]) continue;
    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}`);
      const json = await res.json();
      if (json[id]?.success) steamGameData[id] = json[id].data;
    } catch(e) { console.error('Steam fetch error', e); }
  }
}

// ── Game scanning ────────────────────────────────────────────────────
function checkLocalGame(folderName) {
  const drives = 'CDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const commonSubPaths = [
    'Program Files (x86)\\Steam\\steamapps\\common',
    'SteamLibrary\\steamapps\\common',
    'Steam\\steamapps\\common'
  ];
  for (const drive of drives) {
    for (const subPath of commonSubPaths) {
      const fullPath = `${drive}:\\${subPath}\\${folderName}`;
      try {
        if (fs.existsSync(fullPath)) {
          return { installed: true, path: fullPath, isCustom: false };
        }
      } catch(e) {}
    }
  }
  return { installed: false, path: null };
}

const GAME_ID_MAP = {
  "Grand Theft Auto V": 271590,
  "Grand Theft Auto IV": 12210,
  "Red Dead Redemption 2": 1174180,
  "Red Dead Redemption": 2668510
};

async function scanForAllGames() {
  gameStatuses = {};

  // 1. Scan the four classic bypass games (Rockstar)
  const bypassGameNames = Object.keys(GAME_ID_MAP);
  for (const name of bypassGameNames) {
    const appId = GAME_ID_MAP[name];
    let status = checkLocalGame(name);
    const customs = await ipcRenderer.invoke('get-custom-paths');
    if (customs[name] && fs.existsSync(customs[name])) {
      status = { installed: true, path: customs[name], isCustom: true };
    }
    gameStatuses[name] = status;
    if (appId) gameStatuses[appId] = status;
  }

  // 2. Also scan games that appear in Discord accounts (e.g. Age of History 3)
    for (const appIdStr of Object.keys(discordAccounts)) {
    const appId = Number(appIdStr);
    if (gameStatuses[appId]) continue;

    const gameInfo = steamGameData[appId];
    if (!gameInfo) {
      console.warn(`⚠️ No Steam data for appId ${appId} – cannot scan`);
      continue;
    }
    const folderName = gameInfo.name;
    let status = checkLocalGame(folderName);
    const customs = await ipcRenderer.invoke('get-custom-paths');
    if (customs[folderName] && fs.existsSync(customs[folderName])) {
      status = { installed: true, path: customs[folderName], isCustom: true };
    }
    gameStatuses[folderName] = status;
    gameStatuses[appId] = status;
  }
}

// ── Discord accounts ─────────────────────────────────────────────────
async function fetchDiscordAccounts() {
  try {
    const result = await ipcRenderer.invoke('fetch-discord-accounts');
    if (result.success) {
      discordAccounts = result.accounts;
      return true;
    } else {
      showToast(`Discord error: ${result.error}`, 'error');
      return false;
    }
  } catch(e) {
    showToast('Failed to fetch Discord accounts', 'error');
    return false;
  }
}

// 🔁 Updated Refresh: now re-scans installations and updates both tabs
async function refreshAccounts() {
  await fetchDiscordAccounts();
  await scanForAllGames();           // re-check all drives + custom paths
  renderAccountsFromDiscord();      // update account cards with new status
  renderBypassCards();              // update bypass panel
}

// ── Render Accounts ──────────────────────────────────────────────────
function renderAccountsFromDiscord() {
  const container = document.getElementById('accounts-container');
  const gameIds = Object.keys(discordAccounts).filter(id => discordAccounts[id].length > 0);
  if (gameIds.length === 0) {
    container.innerHTML = '<p class="col-span-full text-center text-nl-textMuted py-8">No accounts found.</p>';
    return;
  }
  fetchSteamDataForIds(gameIds).then(() => {
    container.innerHTML = gameIds.map(id => {
      const game = steamGameData[id];
      if (!game) return '';
      const status = gameStatuses[id] || { installed: false };
      const installed = status.installed;
      return `
        <div class="game-card rounded-xl bg-nl-card border border-nl-border cursor-pointer" onclick="openGameDetail('${game.name.replace(/'/g, "\\'")}')">
          <div class="relative aspect-[16/7.5] rounded-t-xl overflow-hidden">
            <img src="${game.header_image}" alt="${game.name}" class="w-full h-full object-cover">
          </div>
          <div class="p-3">
            <h4 class="text-sm font-semibold truncate mb-1.5">${game.name}</h4>
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 ${installed ? 'bg-green-500' : 'bg-nl-textMuted'} rounded-full"></span>
              <span class="text-[10px] ${installed ? 'text-green-400' : 'text-nl-textMuted'} font-medium uppercase tracking-tighter">
                ${installed ? 'Installed' : 'Not Detected'}
              </span>
            </div>
          </div>
        </div>`;
    }).join('');
    lucide.createIcons();
  });
}

// ── Game Detail & Account Selection ─────────────────────────────────
let currentDetailGame = null;
function openGameDetail(gameName) {
  const gameEntry = Object.entries(steamGameData).find(([id, data]) => data.name === gameName);
  if (!gameEntry) return;
  const game = gameEntry[1];
  currentDetailGame = game;

  document.getElementById('detail-title').textContent = game.name;
  document.getElementById('detail-banner').src = game.header_image;
  document.getElementById('detail-appid').textContent = `STEAM ID: ${game.steam_appid}`;
  document.getElementById('detail-description').textContent = game.short_description || 'No description available.';
  document.getElementById('detail-date').textContent = game.release_date?.date || 'TBA';

  // Show/hide the Inject Bypass button depending on whether this game is bypass-supported
  const bypassBtn = document.getElementById('detail-bypass-btn');
  if (bypassBtn) {
    if (GAME_ID_MAP.hasOwnProperty(game.name)) {
      bypassBtn.style.display = 'flex';   // or 'block' according to your design
    } else {
      bypassBtn.style.display = 'none';
    }
  }

  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-game-details').classList.add('active');
  lucide.createIcons();
}

function showAccountSelection() {
  if (!currentDetailGame) return;
  const appid = currentDetailGame.steam_appid;
  const accounts = discordAccounts[appid] || [];
  const container = document.getElementById('account-selection-container');
  if (accounts.length === 0) {
    container.innerHTML = '<p class="text-nl-textMuted">No accounts available for this game.</p>';
  } else {
    container.innerHTML = accounts.map(acc => `
      <div class="bg-nl-card border border-nl-border p-6 rounded-2xl hover:border-nl-pink cursor-pointer group transition-all" onclick="steamLogin('${acc.user}','${acc.pass}')">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-nl-textMuted uppercase mb-1">Username</p>
            <p class="font-bold text-lg">${acc.user}</p>
          </div>
          <i data-lucide="log-in" class="w-6 h-6 text-nl-textMuted group-hover:text-nl-pink transition-colors"></i>
        </div>
      </div>`).join('');
  }
  lucide.createIcons();
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-select-account').classList.add('active');
}

function goBackToDetails() {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-game-details').classList.add('active');
}

async function bypassFromDetail() {
  if (!currentDetailGame) return;
  const name = currentDetailGame.name;
  const status = gameStatuses[name];
  if (!status || !status.installed) { showToast('Game not installed or path not set.', 'error'); return; }
  // switch to bypass tab and trigger injection
  switchTab('bypass');
  await injectBypass(name, status.path);
}

async function steamLogin(username, password) {
  const res = await ipcRenderer.invoke('steam-login', username, password);
  showToast(res.success ? `Launching Steam as ${username}...` : `Launch failed: ${res.error}`, res.success ? 'success' : 'error');
}

// ── Bypass Panel ────────────────────────────────────────────────────
function renderBypassCards() {
  const container = document.getElementById('bypass-games-container');
  const bypassGameNames = Object.keys(GAME_ID_MAP);
  container.innerHTML = bypassGameNames.map(name => {
    const status = gameStatuses[name] || { installed: false, path: null };
    const installed = status.installed;
    const gameInfo = Object.values(steamGameData).find(g => g.name === name) || {};
    const fallbackBanners = {
        "Grand Theft Auto V": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg",
        "Grand Theft Auto IV": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/12210/header.jpg",
        "Red Dead Redemption 2": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/header.jpg",
        "Red Dead Redemption": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2668510/header.jpg"
    };
    const coverImage = gameInfo.header_image || fallbackBanners[name] || 'https://via.placeholder.com/600x300?text=No+Image';
    const markerPath = status.path ? path.join(status.path, 'bypass_applied.txt') : null;
    const isApplied = markerPath && fs.existsSync(markerPath);
    const escapedPath = status.path ? status.path.replace(/\\/g, '\\\\').replace(/'/g, "\\'") : '';

    return `
      <div class="relative bg-nl-card border ${installed ? 'border-nl-border' : 'border-nl-border/30'} rounded-2xl flex items-center justify-between overflow-hidden min-h-[110px] group transition-all duration-300 hover:border-nl-pink/50">
        <div class="absolute top-0 left-0 w-[70%] h-full z-0 transition-opacity duration-300 ${installed ? 'opacity-40 group-hover:opacity-60' : 'opacity-10'}"
             style="background-image: url('${coverImage}'); background-size: cover; background-position: left center; 
                    -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 10%, rgba(0,0,0,0.4) 50%, transparent 100%); 
                    mask-image: linear-gradient(to right, rgba(0,0,0,1) 10%, rgba(0,0,0,0.4) 50%, transparent 100%);">
        </div>
        <div class="relative z-10 p-5 flex items-center w-full justify-between pl-6">
          <div class="flex items-center gap-4">
            <div class="w-2.5 h-2.5 rounded-full ${installed ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-nl-textMuted'}"></div>
            <div>
              <h3 class="font-bold text-[16px] text-white tracking-wide drop-shadow-lg">${name}</h3>
              <p class="text-[11px] text-nl-textMuted mt-0.5 uppercase tracking-tighter">
                STATUS: <span class="${installed ? 'text-green-400' : 'text-nl-textMuted'} font-semibold">${installed ? 'READY' : 'NOT DETECTED'}</span>
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            ${isApplied ? `
              <button onclick="revertBypass('${name.replace(/'/g,"\\'")}', '${escapedPath}')" 
                class="px-4 py-2.5 bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all">
                REVERT
              </button>
            ` : ''}
            <button onclick="${installed ? `injectBypass('${name.replace(/'/g,"\\'")}', '${escapedPath}')` : ''}" 
              class="px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 
              ${installed ? 'bg-nl-pink text-white hover:scale-105 shadow-lg shadow-nl-pink/20' : 'bg-[#150d17] border border-nl-border/30 text-nl-textMuted cursor-not-allowed'}"
              ${installed ? '' : 'disabled'}>
              <i data-lucide="${installed ? (isApplied ? 'refresh-cw' : 'download') : 'lock'}" class="w-3.5 h-3.5"></i> 
              ${installed ? (isApplied ? 'UPDATE' : 'INJECT') : 'N/A'}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
  lucide.createIcons();
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        https.get(response.headers.location, (res) => {
          res.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
          file.on('error', reject);
        }).on('error', reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function injectBypass(gameName, gamePath) {
  const files = launcherData.BYPASS_DATA?.[gameName];
  if (!files || files.length === 0) {
    showToast('No bypass files defined.', 'error');
    return;
  }
  if (!gamePath || !fs.existsSync(gamePath)) {
    showToast('Game path not found.', 'error');
    return;
  }

  const progressContainer = document.getElementById('bypass-progress-container');
  const bar = document.getElementById('bypass-progress-bar');
  const text = document.getElementById('bypass-progress-text');
  const percentEl = document.getElementById('bypass-progress-percent');
  switchTab('bypass');
  progressContainer.classList.remove('hidden');
  bar.style.width = '0%';
  text.textContent = `Preparing ${gameName} bypass...`;
  percentEl.textContent = '0%';

  const appId = launcherData.STEAM_APP_IDS?.[gameName] || 'unknown';
  const backupDir = path.join(os.homedir(), 'AppData', 'Local', 'nightlight launcher', 'saves', String(appId), 'original');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const totalFiles = files.length;
  for (let i = 0; i < totalFiles; i++) {
    const url = files[i];
    const fileName = path.basename(url);
    const destPath = path.join(gamePath, fileName);
    const backupPath = path.join(backupDir, fileName);
    const percent = Math.round(((i + 1) / totalFiles) * 100);
    text.textContent = `Backing up & replacing ${fileName} (${i + 1}/${totalFiles})`;
    bar.style.width = percent + '%';
    percentEl.textContent = percent + '%';

    // Backup existing file
    if (fs.existsSync(destPath)) {
      try { fs.renameSync(destPath, backupPath); } catch(e) {
        fs.copyFileSync(destPath, backupPath);
        fs.unlinkSync(destPath);
      }
    }
    try {
      await downloadFile(url, destPath);
    } catch(err) {
      // Restore original on failure
      if (fs.existsSync(backupPath)) try { fs.copyFileSync(backupPath, destPath); } catch(_) {}
      showToast(`Failed to download ${fileName}: ${err.message}`, 'error');
      progressContainer.classList.add('hidden');
      return;
    }
  }
  fs.writeFileSync(path.join(gamePath, 'bypass_applied.txt'), new Date().toISOString());
  showToast(`${gameName} bypass applied! Original files saved.`, 'success');
  progressContainer.classList.add('hidden');
  renderBypassCards();
}

async function revertBypass(gameName, gamePath) {
  if (!confirm(`Revert bypass for ${gameName}?`)) return;
  const files = launcherData.BYPASS_DATA?.[gameName];
  if (!files || files.length === 0) {
    showToast('No bypass files defined.', 'error');
    return;
  }
  const appId = launcherData.STEAM_APP_IDS?.[gameName] || 'unknown';
  const backupDir = path.join(os.homedir(), 'AppData', 'Local', 'nightlight launcher', 'saves', String(appId), 'original');
  try {
    if (!fs.existsSync(backupDir)) throw new Error('No backup files found.');
    for (const url of files) {
      const fileName = path.basename(url);
      const gameFilePath = path.join(gamePath, fileName);
      const backupFilePath = path.join(backupDir, fileName);
      if (fs.existsSync(gameFilePath)) fs.unlinkSync(gameFilePath);
      if (fs.existsSync(backupFilePath)) fs.copyFileSync(backupFilePath, gameFilePath);
    }
    const marker = path.join(gamePath, 'bypass_applied.txt');
    if (fs.existsSync(marker)) fs.unlinkSync(marker);
    showToast('Original files restored!', 'success');
  } catch(e) {
    showToast(`Revert failed: ${e.message}`, 'error');
  }
  renderBypassCards();
}

// ── Custom Path ──────────────────────────────────────────────────────
function toggleCustomPathModal() {
  const modal = document.getElementById('custom-path-modal');
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden'); modal.classList.add('show');
    document.getElementById('path-input').value = '';
    document.getElementById('custom-game-select').value = 'Not Detected';
  } else {
    modal.classList.add('hidden'); modal.classList.remove('show');
  }
  lucide.createIcons();
}

async function checkGameExistence(dirPath) {
  if (!document.getElementById('check-exist-toggle').checked) return;
  if (!dirPath) return;
  const result = await ipcRenderer.invoke('check-path', dirPath);
  document.getElementById('custom-game-select').value = result.detected ? result.game : 'Not Detected';
}

async function applyCustomPath() {
  const gameName = document.getElementById('custom-game-select').value;
  const dirPath = document.getElementById('path-input').value.trim();
  if (gameName === 'Not Detected' || !dirPath) { showToast('Select a valid game and path.', 'error'); return; }
  const res = await ipcRenderer.invoke('add-custom-path', { gameName, customPath: dirPath });
  if (res.success) {
    showToast(`Custom path for ${gameName} saved.`, 'success');
    toggleCustomPathModal();
    await scanForAllGames();
    renderBypassCards();
    renderAccountsFromDiscord();
  } else {
    showToast(res.error || 'Failed to save path.', 'error');
  }
}

// ── Tabs ─────────────────────────────────────────────────────────────
function switchTab(tabName) {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
  if (tabName === 'bypass') renderBypassCards();
  lucide.createIcons();
}

// ── Login ────────────────────────────────────────────────────────────
async function attemptLogin() {
  const input = document.getElementById('accessKeyInput').value.trim();
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  if (!input) return;
  btn.textContent = "Verifying...";
  try {
    // ✅ SECURE: verification stays in main.js
    const isValid = await ipcRenderer.invoke('verify-key', input);
    if (isValid) {
      document.getElementById('loginOverlay').classList.add('fade-out');
      showToast('Login successful!', 'success');
      // load data & scan as before ...
      await fetchSteamDataForIds(Object.values(GAME_ID_MAP));
      await fetchDiscordAccounts();
      const discordIds = Object.keys(discordAccounts).map(Number);
      await fetchSteamDataForIds(discordIds);
      await scanForAllGames();
      renderAccountsFromDiscord();
      renderBypassCards();
    } else {
      errorEl.textContent = "Invalid access key.";
      errorEl.classList.remove('hidden');
    }
  } catch(e) {
    errorEl.textContent = "Network error.";
    errorEl.classList.remove('hidden');
  } finally {
    btn.textContent = "Login";
  }
}

// ── Toasts & Window Controls ─────────────────────────────────────────
function showToast(message, type='info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const colors = { success:'border-green-500/30 bg-green-500/10', error:'border-red-500/30 bg-red-500/10', info:'border-nl-pink/30 bg-nl-pinkMuted' };
  const icons = { success:'check-circle', error:'alert-circle', info:'info' };
  toast.className = `toast flex items-center gap-3 px-4 py-3 rounded-xl border ${colors[type]} backdrop-blur-xl shadow-2xl min-w-[280px]`;
  toast.innerHTML = `<i data-lucide="${icons[type]}" class="w-4 h-4 ${type==='error'?'text-red-400':'text-nl-pink'} shrink-0"></i><span class="text-sm font-medium text-nl-text">${message}</span>`;
  container.appendChild(toast); lucide.createIcons();
  setTimeout(() => { toast.classList.add('toast-exit'); setTimeout(() => toast.remove(),300); },3000);
}

function closeApp() { ipcRenderer.send('close-app'); }
function minimizeApp() { ipcRenderer.send('minimize-app'); }
function maximizeApp() { ipcRenderer.send('maximize-app'); }

document.addEventListener('keydown', (e) => { if (e.key==="F12"||(e.ctrlKey&&e.shiftKey&&e.key==="I")||(e.ctrlKey&&e.key==="U")) { e.preventDefault(); return false; } });
document.addEventListener('contextmenu', (e) => e.preventDefault());
