const { app, BrowserWindow, ipcMain, shell, net } = require('electron');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const { exec } = require('child_process');

app.commandLine.appendSwitch('disable-devtools');

let mainWindow;

// ── Sanitize game name for use in folder names ──────────────────────
function sanitizeForPath(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_');
}

function extractZip(zipPath, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`, { stdio: 'ignore' });
}





// ── Fallback bypass data ───────────────────────────────────────────
const FALLBACK_BYPASS = [
  {
    name: "Grand Theft Auto V: Legacy",
    steamAppId: 271590,
    exeName: "PlayGTAV.exe",
    folderName: "Grand Theft Auto V Legacy",
    files: [
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAVFix/bink2w64.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAVFix/launc.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAVFix/orig_socialclub.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAVFix/PlayGTAV.exe",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAVFix/socialclub.dll"
    ]
  },
  {
    name: "Grand Theft Auto V: Enhanced",
    steamAppId: 3240220,
    exeName: "PlayGTAV.exe",
    folderName: "Grand Theft Auto V Enhanced",
    files: [
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/gtave/RUNE64.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/gtave/version.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/gtave/socialclub_emu.ini",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/gtave/PlayGTAV.exe",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/gtave/socialclub.dll"
    ]
  },
  {
    name: "Red Dead Redemption 2",
    steamAppId: 1174180,
    exeName: "RDR2.exe",
    launchExe: "Launcher.exe",
    files: [
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/RDR2Files/1911.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/RDR2Files/bink2w64.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/RDR2Files/Launcher.exe",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/RDR2Files/RDR2.exe"
    ]
  },
  {
    name: "Red Dead Redemption",
    steamAppId: 2668510,
    exeName: "RDR.exe",
    launchExe: "PlayRDR.exe",
    files: [
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/RDR1Files/1911.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/RDR1Files/PlayRDR.exe",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/RDR1Files/RDR.exe",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/RDR1Files/steam_api64.dll"
    ]
  },
  {
    name: "Grand Theft Auto IV",
    steamAppId: 12210,
    exeName: "GTAIV.exe",
    launchExe: "PlayGTAIV.exe",
    files: [
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAIVFiles/binkw32.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAIVFiles/GTAIV.exe",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAIVFiles/launc.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAIVFiles/orig_socialclub.dll",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAIVFiles/PlayGTAIV.exe",
      "https://github.com/uxqc/L4unch3rH0sting/releases/download/GTAIVFiles/socialclub.dll"
    ]
  }
];

const BYPASS_JSON_URL = 'https://raw.githubusercontent.com/uxqc/9423odcx/refs/heads/main/bypass.json';
let bypassGameData = null;

async function fetchBypassData() {
  return new Promise((resolve, reject) => {
    https.get(BYPASS_JSON_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            resolve(json.games || []);
          } catch (e) {
            reject(new Error('Invalid bypass JSON'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function loadBypassData() {
  if (bypassGameData) return bypassGameData;
  try {
    bypassGameData = await fetchBypassData();
    console.log('Bypass data loaded from remote');
  } catch (e) {
    console.warn('Failed to load remote bypass data, using fallback', e);
    bypassGameData = FALLBACK_BYPASS;
  }
  return bypassGameData;
}

// ── Custom paths ────────────────────────────────────────────────────
const customPathsFile = path.join(os.homedir(), 'AppData', 'Local', 'nightlight-launcher', 'custom_paths.json');
function loadCustomPaths() {
  try {
    if (fs.existsSync(customPathsFile)) return JSON.parse(fs.readFileSync(customPathsFile, 'utf8'));
  } catch (e) {}
  return {};
}
function saveCustomPaths(data) {
  const dir = path.dirname(customPathsFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(customPathsFile, JSON.stringify(data, null, 2));
}

// ── Discord Config ──────────────────────────────────────────────────
const DISCORD_TOKEN = " 8===============D ";
const DISCORD_CHANNEL_ID = "1499883720943993012";
const DISCORD_MESSAGE_ID = "1500161885268607199";

// ── File download with redirect support ─────────────────────────────
function downloadFile(urlStr, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const request = net.request(urlStr);
    request.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    request.setHeader('Accept', '*/*');

    let lastProgressTime = 0;
    const THROTTLE_MS = 500;

    request.on('response', (response) => {
      if ([301, 302, 307, 308].includes(response.statusCode) && response.headers.location) {
        return downloadFile(response.headers.location, destPath, onProgress)
          .then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}`));
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloaded = 0;
      const file = fs.createWriteStream(destPath);

      response.on('data', (chunk) => {
        downloaded += chunk.length;
        file.write(chunk);

        const now = Date.now();
        if (totalSize > 0 && now - lastProgressTime >= THROTTLE_MS && onProgress) {
          lastProgressTime = now;
          const percent = Math.floor((downloaded / totalSize) * 100);
          onProgress(percent);
        }
      });

      response.on('end', () => {
        file.end(() => {
          if (onProgress) onProgress(100);
          resolve();
        });
      });

      response.on('error', (err) => {
        file.end();
        fs.unlink(destPath, () => {});
        reject(err);
      });

      file.on('error', (err) => {
        file.end();
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    request.on('error', reject);
    request.end();
  });
}

// ── Window Creation ─────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800, minWidth: 900, minHeight: 600,
    frame: false, transparent: true,
    icon: path.join(__dirname, 'assets/icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false
    }
  });

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ── Title bar controls ──────────────────────────────────────────────
ipcMain.on('minimize-app', () => mainWindow.minimize());
ipcMain.on('maximize-app', () => mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize());
ipcMain.on('close-app', () => mainWindow.close());

// ── External link opener ────────────────────────────────────────────
ipcMain.handle('open-external-link', async (event, url) => {
  await shell.openExternal(url);
  return { success: true };
});

// ── Access Key Management ───────────────────────────────────────────
const keyFilePath = path.join(os.homedir(), 'AppData', 'Local', 'nightlight-launcher', 'access_key.txt');
function saveKeyToFile(key) {
  const dir = path.dirname(keyFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(keyFilePath, key, 'utf8');
}
function getSavedKey() {
  try {
    if (fs.existsSync(keyFilePath)) return fs.readFileSync(keyFilePath, 'utf8').trim();
  } catch {}
  return null;
}

// ── Provide bypass data ─────────────────────────────────────────────
ipcMain.handle('get-bypass-data', async () => {
  const data = await loadBypassData();
  return data;
});

ipcMain.handle('save-key', async (event, key) => {
  saveKeyToFile(key);
  return true;
});

ipcMain.handle('get-saved-key', async () => {
  return getSavedKey();
});

// ── Manual .env loader ──────────────────────────────────────────
const envPath = path.join(__dirname, '.env');   // adjust if .env is elsewhere
console.log('Looking for .env at:', envPath);
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  lines.forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return;
    const key = line.slice(0, eqIdx).trim();
    const val = line.slice(eqIdx + 1).trim();
    if (key) process.env[key] = val;
  });
  console.log('.env loaded. SUPABASE_URL:', process.env.SUPABASE_URL);
} else {
  console.warn('No .env file found at', envPath);
}

// ── Validate Access Key via Supabase RPC (https module) ─────────
ipcMain.handle('validate-access-key', async (event, key) => {
  return new Promise((resolve) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON;

    if (!supabaseUrl || !anonKey) {
      console.error('Missing Supabase env vars. SUPABASE_URL:', supabaseUrl);
      resolve(false);
      return;
    }

    const url = `${supabaseUrl}/rest/v1/rpc/check_key_exists`;
    console.log('Calling Supabase RPC:', url);

    const body = JSON.stringify({ key_input: key });
    const parsedUrl = new URL(url);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Supabase response status:', res.statusCode);
        console.log('Supabase body:', data);
        if (res.statusCode === 200) {
          resolve(data.trim() === 'true');
        } else {
          console.error('Supabase RPC error:', res.statusCode, data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('Key validation network error:', err);
      resolve(false);
    });

    req.write(body);
    req.end();
  });
});

// ── Achievements: Read unlocked achievement IDs from JSON files ──
ipcMain.handle('get-unlocked-achievements', async () => {
  const achievementDir = path.join(os.homedir(), 'AppData', 'Local', 'nightlight-launcher', 'achievement_pipe');
  const unlocked = new Set();
  
  if (!fs.existsSync(achievementDir)) return [];
  
  const files = fs.readdirSync(achievementDir);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const fullPath = path.join(achievementDir, file);
      const content = fs.readFileSync(fullPath, 'utf8');
      const data = JSON.parse(content);
      if (data.id) unlocked.add(data.id);
    } catch (e) {
      console.warn(`Failed to parse achievement file ${file}:`, e);
    }
  }
  return Array.from(unlocked);
});

// ── Custom Path Management ──────────────────────────────────────────
ipcMain.handle('get-custom-paths', () => loadCustomPaths());

ipcMain.handle('add-custom-path', async (event, { gameName, customPath }) => {
  if (!fs.existsSync(customPath)) return { success: false, error: 'Path does not exist.' };
  const customs = loadCustomPaths();
  customs[gameName] = customPath;
  saveCustomPaths(customs);
  return { success: true };
});

ipcMain.handle('remove-custom-path', async (event, gameName) => {
  const customs = loadCustomPaths();
  if (customs[gameName]) {
    delete customs[gameName];
    saveCustomPaths(customs);
    return { success: true };
  }
  return { success: false, error: 'No custom path set.' };
});

ipcMain.handle('check-path', async (event, dirPath) => {
  const games = await loadBypassData();
  for (const game of games) {
    if (fs.existsSync(path.join(dirPath, game.exeName))) {
      return { detected: true, game: game.name };
    }
  }
  return { detected: false, game: null };
});

// ── Open folder ─────────────────────────────────────────────────────
ipcMain.handle('open-folder', async (event, folderPath) => {
  if (fs.existsSync(folderPath)) {
    await shell.openPath(folderPath);
    return { success: true };
  }
  return { success: false, error: 'Folder not found' };
});

// ── Launch game executable (normal or as admin) ──────────────────
ipcMain.handle('launch-game-exe', async (event, { gamePath, exeName, runAsAdmin }) => {
  const exePath = path.join(gamePath, exeName);
  if (!fs.existsSync(exePath)) {
    return { success: false, error: `Executable not found: ${exeName}` };
  }

  try {
    if (runAsAdmin) {
      // Use PowerShell to start with admin privileges (UAC prompt will appear)
      const psCommand = `Start-Process -FilePath '${exePath}' -Verb RunAs`;
      exec(`powershell -Command "${psCommand}"`, (error) => {
        if (error) {
          console.error('Admin launch failed:', error);
          return { success: false, error: error.message };
        }
      });
      return { success: true };
    } else {
      await shell.openPath(exePath);
      return { success: true };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// ── Discord Accounts Fetch ──────────────────────────────────────────
ipcMain.handle('fetch-discord-accounts', async () => {
  try {
    const url = `https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages/${DISCORD_MESSAGE_ID}`;
    const options = {
      headers: {
        'Authorization': `Bot ${DISCORD_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    const response = await new Promise((resolve, reject) => {
      https.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) resolve(JSON.parse(data));
          else reject(new Error(`Discord API error: ${res.statusCode}`));
        });
      }).on('error', reject);
    });

    let content = response.content || '';
    content = content.replace(/```[\s\S]*?```/g, (match) => {
      const inner = match.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
      return inner;
    });

    const accountsByGame = {};
    const lines = content.split(/\r?\n/);
    let currentAppId = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const blockStart = line.match(/^(\d+)\s*:\s*\{/);
      if (blockStart) {
        currentAppId = blockStart[1];
        if (!accountsByGame[currentAppId]) accountsByGame[currentAppId] = [];
        continue;
      }

      if (line === '}') {
        currentAppId = null;
        continue;
      }

      if (currentAppId) {
        const pairMatch = line.match(/^\s*"([^"]*)"\s*:\s*"([^"]*)"\s*,?\s*$/);
        if (pairMatch) {
          const user = pairMatch[1];
          const pass = pairMatch[2];
          if (user && pass) {
            accountsByGame[currentAppId].push({ user, pass });
          }
        }
      }
    }

    return { success: true, accounts: accountsByGame };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ── Bypass Injection ────────────────────────────────────────────────
ipcMain.handle('start-bypass', async (event, { gameName, gamePath }) => {
  const games = await loadBypassData();
  const game = games.find(g => g.name === gameName);
  if (!game) return { success: false, error: 'Game not found in bypass data' };

  const backupDir = path.join(os.homedir(), 'AppData', 'Local', 'nightlight-launcher', 'OriginalFiles', sanitizeForPath(gameName));
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  try {
    if (game.zip) {
      const tempDir = path.join(os.tmpdir(), `nightlight-bypass-${Date.now()}`);
      const zipPath = path.join(tempDir, 'fix.zip');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      event.sender.send('bypass-progress', { percent: 0, message: 'Downloading ZIP...' });
      await downloadFile(game.zip, zipPath, (pct) => {
        event.sender.send('bypass-progress', { percent: Math.floor(pct * 0.5), message: `Downloading ZIP (${pct}%)` });
      });

      event.sender.send('bypass-progress', { percent: 50, message: 'Extracting...' });
      extractZip(zipPath, tempDir);

      const extractedFiles = [];
      function walk(dir, base = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          const rel = path.join(base, entry.name);
          if (entry.isDirectory()) {
            walk(full, rel);
          } else {
            extractedFiles.push({ fullPath: full, relativePath: rel });
          }
        }
      }
      walk(tempDir);

      const totalFiles = extractedFiles.length;
      const manifest = [];

      for (let i = 0; i < totalFiles; i++) {
        const { fullPath: src, relativePath: rel } = extractedFiles[i];
        const dest = path.join(gamePath, rel);
        const backup = path.join(backupDir, rel);

        const percent = 50 + Math.floor((i / totalFiles) * 50);
        event.sender.send('bypass-progress', { percent, message: `Processing ${rel} (${i+1}/${totalFiles})` });

        fs.mkdirSync(path.dirname(dest), { recursive: true });

        if (fs.existsSync(dest) && !fs.existsSync(backup)) {
          fs.mkdirSync(path.dirname(backup), { recursive: true });
          fs.copyFileSync(dest, backup);
          manifest.push(rel);
        } else if (!fs.existsSync(dest)) {
          manifest.push(rel);
        } else {
          if (!manifest.includes(rel)) manifest.push(rel);
        }

        fs.copyFileSync(src, dest);
      }

      fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
      fs.rmSync(tempDir, { recursive: true, force: true });

      event.sender.send('bypass-progress', { percent: 100, message: 'Bypass applied.' });
      fs.writeFileSync(path.join(gamePath, 'bypass_applied.txt'), 'true');
      return { success: true };

    } else {
      const files = game.files;
      for (let i = 0; i < files.length; i++) {
        const url = files[i];
        const fileName = path.basename(url);
        const destPath = path.join(gamePath, fileName);
        const backupPath = path.join(backupDir, fileName);

        if (fs.existsSync(destPath) && !fs.existsSync(backupPath)) {
          fs.copyFileSync(destPath, backupPath);
        }

        event.sender.send('bypass-progress', {
          percent: Math.floor((i / files.length) * 100),
          message: `Downloading ${fileName} (${i + 1}/${files.length})`
        });

        await downloadFile(url, destPath, (filePercent) => {
          const totalPercent = Math.floor(((i + filePercent / 100) / files.length) * 100);
          event.sender.send('bypass-progress', {
            percent: totalPercent,
            message: `Downloading ${fileName} (${filePercent}%)`
          });
        });
      }

      event.sender.send('bypass-progress', { percent: 100, message: 'Bypass applied.' });
      fs.writeFileSync(path.join(gamePath, 'bypass_applied.txt'), 'true');
      return { success: true };
    }
  } catch (err) {
    event.sender.send('bypass-progress', { percent: 100, message: `Error: ${err.message}` });
    return { success: false, error: err.message };
  }
});

// ── Revert Bypass ───────────────────────────────────────────────────
ipcMain.handle('revert-bypass', async (event, { gameName, gamePath }) => {
  const games = await loadBypassData();
  const game = games.find(g => g.name === gameName);
  if (!game) return { success: false, error: 'Game not found in bypass data' };

  const backupDir = path.join(os.homedir(), 'AppData', 'Local', 'nightlight-launcher', 'OriginalFiles', sanitizeForPath(gameName));

  try {
    if (game.zip) {
      const manifestPath = path.join(backupDir, 'manifest.json');
      if (!fs.existsSync(manifestPath)) throw new Error('No manifest found. Try manual restore.');

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

      for (const rel of manifest) {
        const dest = path.join(gamePath, rel);
        const backup = path.join(backupDir, rel);

        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        if (fs.existsSync(backup)) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(backup, dest);
        }
      }
    } else {
      const files = game.files;
      for (const url of files) {
        const fileName = path.basename(url);
        const dest = path.join(gamePath, fileName);
        const backup = path.join(backupDir, fileName);

        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        if (fs.existsSync(backup)) fs.copyFileSync(backup, dest);
      }
    }

    const marker = path.join(gamePath, 'bypass_applied.txt');
    if (fs.existsSync(marker)) fs.unlinkSync(marker);

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// ── Verify Bypass (re-download without backup) ───────────────────────
ipcMain.handle('verify-bypass', async (event, { gameName, gamePath }) => {
  const games = await loadBypassData();
  const game = games.find(g => g.name === gameName);
  if (!game) return { success: false, error: 'Game not found in bypass data' };

  try {
    if (game.zip) {
      const tempDir = path.join(os.tmpdir(), `nightlight-verify-${Date.now()}`);
      const zipPath = path.join(tempDir, 'fix.zip');
      fs.mkdirSync(tempDir, { recursive: true });

      event.sender.send('bypass-progress', { percent: 0, message: 'Downloading ZIP...' });
      await downloadFile(game.zip, zipPath, (pct) => {
        event.sender.send('bypass-progress', { percent: Math.floor(pct * 0.5), message: `Downloading ZIP (${pct}%)` });
      });

      event.sender.send('bypass-progress', { percent: 50, message: 'Extracting...' });
      extractZip(zipPath, tempDir);

      const extractedFiles = [];
      function walk(dir, base = '') {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          const rel = path.join(base, entry.name);
          if (entry.isDirectory()) {
            walk(full, rel);
          } else {
            extractedFiles.push({ fullPath: full, relativePath: rel });
          }
        }
      }
      walk(tempDir);

      const totalFiles = extractedFiles.length;
      for (let i = 0; i < totalFiles; i++) {
        const { fullPath: src, relativePath: rel } = extractedFiles[i];
        const dest = path.join(gamePath, rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        const percent = 50 + Math.floor((i / totalFiles) * 50);
        event.sender.send('bypass-progress', { percent, message: `Copying ${rel}...` });
      }

      fs.rmSync(tempDir, { recursive: true, force: true });
      event.sender.send('bypass-progress', { percent: 100, message: 'Verification complete.' });
    } else {
      const files = game.files;
      for (let i = 0; i < files.length; i++) {
        const url = files[i];
        const fileName = path.basename(url);
        const destPath = path.join(gamePath, fileName);
        await downloadFile(url, destPath, (filePercent) => {
          const totalPercent = Math.floor(((i + filePercent / 100) / files.length) * 100);
          event.sender.send('bypass-progress', { percent: totalPercent, message: `Downloading ${fileName} (${filePercent}%)` });
        });
      }
      event.sender.send('bypass-progress', { percent: 100, message: 'Verification complete.' });
    }
    return { success: true };
  } catch (err) {
    event.sender.send('bypass-progress', { percent: 100, message: `Error: ${err.message}` });
    return { success: false, error: err.message };
  }
});

// ── Steam Login ─────────────────────────────────────────────────────
ipcMain.handle('steam-login', async (event, username, password) => {
  return new Promise((resolve) => {
    exec('taskkill /F /IM steam.exe', (err) => {
      setTimeout(() => {
        exec(`"C:\\Program Files (x86)\\Steam\\Steam.exe" -login ${username} ${password}`, (launchErr) => {
          if (launchErr) resolve({ success: false, error: launchErr.message });
          else resolve({ success: true });
        });
      }, 1000);
    });
  });
});