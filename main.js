// main.js (with Steam auto‑detection, cross‑platform zip, batching & better error reporting)
const { app, BrowserWindow, ipcMain, shell, net, dialog } = require('electron');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const https = require('https');
const os = require('os');
const { exec } = require('child_process');
const SteamUser = require('steam-user');

// Disable GPU cache if you want
app.commandLine.appendSwitch('disable-gpu-cache');

// ⬇️ Fix the disk cache errors
app.setPath('userData', path.join(os.homedir(), 'AppData', 'Local', 'nightlight-launcher'));
app.commandLine.appendSwitch('disable-devtools');

let mainWindow;
let detectedSteamPath = 'C:\\Program Files (x86)\\Steam'; // default fallback (Windows)

// ── Sanitize game name for use in folder names ──────────────────────
function sanitizeForPath(name) {
  return name.replace(/[<>:"/\\|?*]/g, '_');
}

// ── Cross‑platform zip extraction (prefers adm‑zip, falls back to PowerShell) ──
let extractZip;
try {
  const AdmZip = require('adm-zip');
  extractZip = (zipPath, destDir) => {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(destDir, true);
  };
} catch (_) {
  // Fallback for Windows only if adm‑zip isn’t installed
  extractZip = (zipPath, destDir) => {
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`, { stdio: 'ignore' });
  };
}

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

ipcMain.handle('get-app-version', () => app.getVersion());

// ── Steam auto‑detection (hardened) ──────────────────────────────────
function getSteamInstallPath() {
  // Windows registry
  try {
    const regOutput = execSync(
      'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Valve\\Steam" /v InstallPath',
      { encoding: 'utf8' }
    );
    const match = regOutput.match(/REG_SZ\s+(.+)/i);
    if (match && match[1]) {
      const p = match[1].trim();
      if (fs.existsSync(p)) return p;
    }
  } catch (_) { /* registry read failed */ }
  // Fallback for other OS – use common paths
  const platform = os.platform();
  if (platform === 'win32') {
    const defaultPath = 'C:\\Program Files (x86)\\Steam';
    if (fs.existsSync(defaultPath)) return defaultPath;
  } else if (platform === 'darwin') {
    const defaultPath = path.join(os.homedir(), 'Library', 'Application Support', 'Steam');
    if (fs.existsSync(defaultPath)) return defaultPath;
  } else if (platform === 'linux') {
    const defaultPath = path.join(os.homedir(), '.steam', 'steam');
    if (fs.existsSync(defaultPath)) return defaultPath;
  }
  return null;
}

function getSteamLibraryFolders(steamPath) {
  const libraries = [];
  if (!steamPath) return libraries;                      // ← guard against null
  if (fs.existsSync(steamPath)) libraries.push(steamPath);
  const vdfPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
  if (!fs.existsSync(vdfPath)) return libraries;
  try {
    const content = fs.readFileSync(vdfPath, 'utf8');
    const regex = /"path"\s+"([^"]+)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      let libPath = match[1].replace(/\\\\/g, '\\');
      if (fs.existsSync(libPath) && !libraries.includes(libPath)) {
        libraries.push(libPath);
      }
    }
  } catch (_) {}
  return libraries;
}

// ── Access key storage ──────────────────────────────────────────────
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

// ── Bypass API integration ──────────────────────────────────────────
let bypassGameData = null;
const BYPASS_BASE_URL = 'https://onajlikezz.xyz/api/bypass.php';
const DOWNLOAD_BASE_URL = 'https://onajlikezz.xyz/api/downloadManager.php';

function httpGetText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data.trim());
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

async function loadBypassData() {
  if (bypassGameData) return bypassGameData;
  const key = getSavedKey();
  if (!key) {
    console.warn('No access key, cannot load bypass data');
    bypassGameData = [];
    return bypassGameData;
  }
  try {
    const url = `${BYPASS_BASE_URL}?key=${encodeURIComponent(key)}`;
    const raw = await httpGetText(url);
    bypassGameData = JSON.parse(raw);
    console.log('Bypass games loaded:', bypassGameData.length);
  } catch (e) {
    console.error('Failed to load bypass data:', e);
    bypassGameData = [];
  }
  return bypassGameData;
}

function getBypassDownloadUrl(steamAppId) {
  const key = getSavedKey();
  if (!key) return null;
  return `${DOWNLOAD_BASE_URL}?key=${encodeURIComponent(key)}&id=${steamAppId}`;
}

ipcMain.handle('get-bypass-download-url', async (event, steamAppId) => {
  return getBypassDownloadUrl(steamAppId);
});

// ── Custom paths (persistent per‑game paths) ────────────────────────
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
  const steamPath = getSteamInstallPath();
  if (steamPath) {
    detectedSteamPath = steamPath;
    console.log('Steam detected at:', steamPath);
  } else {
    console.warn('Steam installation not found, using fallback path');
  }
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

// ── Provide bypass data ─────────────────────────────────────────────
ipcMain.handle('get-bypass-data', async () => {
  return await loadBypassData();
});

ipcMain.handle('save-key', async (event, key) => {
  saveKeyToFile(key);
  return true;
});

ipcMain.handle('get-saved-key', async () => {
  return getSavedKey();
});

// ── Validate access key ────────────────────────────────────────────
ipcMain.handle('validate-access-key', async (event, key) => {
  return new Promise((resolve) => {
    const url = `https://onajlikezz.xyz/api/keycheck.php?key=${encodeURIComponent(key)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.success === true);
        } catch (e) {
          resolve(false);
        }
      });
    }).on('error', () => resolve(false));
  });
});

// ── Fetch game list ─────────────────────────────────────────────────
ipcMain.handle('get-game-list', async () => {
  const key = getSavedKey();
  const url = `https://onajlikezz.xyz/api/gamelist.php?key=${encodeURIComponent(key)}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
});

// ── Report invalid account to server ────────────────────────────────
ipcMain.handle('report-invalid-account', async (event, { username, key }) => {
  if (!key) return { success: false, error: 'No key provided' };
  return new Promise((resolve) => {
    const url = `https://onajlikezz.xyz/api/clientreport.php?username=${encodeURIComponent(username)}&key=${encodeURIComponent(key)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ success: false, error: 'Invalid response from report server' });
        }
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
});

// ── Open folder in file explorer ───────────────────────────────────
ipcMain.handle('open-folder', async (event, folderPath) => {
  await shell.openPath(folderPath);
});

// ── Get random Steam credentials for a game ─────────────────────────
ipcMain.handle('get-game-credentials', async (event, gameId) => {
  const key = getSavedKey();
  const url = `https://onajlikezz.xyz/api/sentgame.php?gameid=${encodeURIComponent(gameId)}&key=${encodeURIComponent(key)}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.Username && json.Password) {
            resolve({ username: json.Username, password: json.Password });
          } else {
            reject(new Error('Invalid credentials response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
});

// ── Test Steam credentials ──────────────────────────────────────────
ipcMain.handle('test-steam-login', async (event, username, password) => {
  return new Promise((resolve) => {
    const client = new SteamUser();
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        client.logOff();
        resolve({ success: false, error: 'Timeout after 15 seconds', shouldReport: true });
      }
    }, 15000);

    client.on('loggedOn', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        client.logOff();
        resolve({ success: true, shouldReport: true });
      }
    });
    client.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        client.logOff();
        let errorMsg = err.message || 'Unknown error';
        let shouldReport = true;

        if (errorMsg.includes('InvalidPassword')) {
          errorMsg = 'Invalid password';
        } else if (errorMsg.includes('AccountLoginDeniedNoMail')) {
          errorMsg = 'Steam Guard required (cannot bypass)';
        } else if (errorMsg.includes('AlreadyLoggedInElsewhere') || errorMsg.toLowerCase().includes('already_logged_in')) {
          errorMsg = 'Already logged in elsewhere (valid account)';
          shouldReport = false;   // ← don't delete this account
        }
        resolve({ success: false, error: errorMsg, shouldReport });
      }
    });
    client.logOn({ accountName: username, password: password });
  });
});

// ── Launch Steam client with credentials (fire‑and‑forget) ────────
ipcMain.handle('steam-login', async (event, username, password) => {
  // Use the Steam protocol – works whether Steam is already running or not
  const steamUrl = `steam://login/${encodeURIComponent(username)}/${encodeURIComponent(password)}`;
  try {
    await shell.openExternal(steamUrl);
    // openExternal returns Promise<void>; if it doesn't throw, the OS was able to handle the protocol
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── Account Checker handler (hidden but kept) ────────────────────────
ipcMain.handle('check-account', async (event, username, password) => {
  return new Promise((resolve) => {
    const client = new SteamUser();
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { client.logOff(); } catch(e) {}
        resolve(false);
      }
    }, 5000);

    client.on('loggedOn', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        try { client.logOff(); } catch(e) {}
        resolve(true);
      }
    });
    client.on('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        try { client.logOff(); } catch(e) {}
        resolve(false);
      }
    });
    client.logOn({ accountName: username, password: password });
  });
});

// ── Custom path management ──────────────────────────────────────────
ipcMain.handle('get-custom-paths', () => loadCustomPaths());

ipcMain.handle('set-game-path', async (event, { gameName, customPath }) => {
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

// ── Folder selection dialog ─────────────────────────────────────────
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Game Folder'
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

// ── Launch game executable ─────────────────────────────────────────
ipcMain.handle('launch-game-exe', async (event, { gamePath, exeName, runAsAdmin }) => {
  const exePath = path.join(gamePath, exeName);
  if (!fs.existsSync(exePath)) {
    return { success: false, error: `Executable not found: ${exeName}` };
  }
  try {
    if (runAsAdmin) {
      const psCommand = `Start-Process -FilePath '${exePath}' -Verb RunAs`;
      exec(`powershell -Command "${psCommand}"`, (error) => {
        if (error) return { success: false, error: error.message };
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

// ── Helper: read installdir from appmanifest_<id>.acf across all libraries ─
function getInstallDirFromManifests(steamAppId, libraries) {
  const manifestName = `appmanifest_${steamAppId}.acf`;
  for (const lib of libraries) {
    const manifestPath = path.join(lib, 'steamapps', manifestName);
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const content = fs.readFileSync(manifestPath, 'utf8');
      const match = content.match(/"installdir"\s+"([^"]+)"/);
      if (match && match[1]) {
        const dirName = match[1].trim();
        const fullPath = path.join(lib, 'steamapps', 'common', dirName);
        if (fs.existsSync(fullPath)) return fullPath;
      }
    } catch (e) {
      console.error(`Failed to read manifest ${manifestName}:`, e);
    }
  }
  return null;
}

// ── Auto‑detect game paths for bypass (using manifests) ──────────────
ipcMain.handle('get-auto-game-paths', async () => {
  const games = await loadBypassData();
  if (!games.length) return {};
  if (!detectedSteamPath) return {};

  const libraries = getSteamLibraryFolders(detectedSteamPath);
  const autoPaths = {};

  for (const game of games) {
    const id = game.steamAppId;
    if (!id) continue;

    const manifestPath = getInstallDirFromManifests(id, libraries);
    if (manifestPath) {
      autoPaths[id] = manifestPath;
      continue;
    }

    const folderName = game.folderName || game.name;
    if (!folderName) continue;
    for (const lib of libraries) {
      const commonPath = path.join(lib, 'steamapps', 'common', folderName);
      if (fs.existsSync(commonPath)) {
        autoPaths[id] = commonPath;
        break;
      }
    }
  }

  return autoPaths;
});

// ── Bypass Injection (no backup, no revert) ─────────────────────────
ipcMain.handle('start-bypass', async (event, { steamAppId, gamePath }) => {
  const zipUrl = getBypassDownloadUrl(steamAppId);
  if (!zipUrl) return { success: false, error: 'No access key available' };

  const tempDir = path.join(os.tmpdir(), `nightlight-bypass-${Date.now()}`);
  const zipPath = path.join(tempDir, `${steamAppId}.zip`);

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    event.sender.send('bypass-progress', { percent: 0, message: 'Downloading bypass...' });
    await downloadFile(zipUrl, zipPath, (pct) => {
      event.sender.send('bypass-progress', { percent: Math.floor(pct * 0.5), message: `Downloading (${pct}%)` });
    });

    event.sender.send('bypass-progress', { percent: 50, message: 'Extracting...' });
    extractZip(zipPath, tempDir);

    const extractedFiles = [];
    function walk(dir, base = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        const rel = path.join(base, entry.name);
        if (entry.isDirectory()) walk(full, rel);
        else if (full !== zipPath) extractedFiles.push({ fullPath: full, relativePath: rel });
      }
    }
    walk(tempDir);

    const totalFiles = extractedFiles.length;
    for (let i = 0; i < totalFiles; i++) {
      const { fullPath: src, relativePath: rel } = extractedFiles[i];
      const dest = path.join(gamePath, rel);
      const percent = 50 + Math.floor((i / totalFiles) * 50);
      event.sender.send('bypass-progress', { percent, message: `Installing ${rel} (${i+1}/${totalFiles})` });

      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }

    fs.writeFileSync(path.join(gamePath, 'bypass_applied.txt'), 'true');

    fs.rmSync(tempDir, { recursive: true, force: true });
    event.sender.send('bypass-progress', { percent: 100, message: 'Bypass applied.' });
    return { success: true };
  } catch (err) {
    event.sender.send('bypass-progress', { percent: 100, message: `Error: ${err.message}` });
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    return { success: false, error: err.message };
  }
});

// ── Verify bypass (re‑downloads and reapplies files) ────────────────
ipcMain.handle('verify-bypass', async (event, { steamAppId, gamePath }) => {
  const zipUrl = getBypassDownloadUrl(steamAppId);
  if (!zipUrl) return { success: false, error: 'No access key available' };

  const tempDir = path.join(os.tmpdir(), `nightlight-verify-${Date.now()}`);
  const zipPath = path.join(tempDir, `${steamAppId}.zip`);
  try {
    fs.mkdirSync(tempDir, { recursive: true });
    event.sender.send('bypass-progress', { percent: 0, message: 'Downloading for verification...' });
    await downloadFile(zipUrl, zipPath, (pct) => {
      event.sender.send('bypass-progress', { percent: Math.floor(pct * 0.5), message: `Downloading (${pct}%)` });
    });
    event.sender.send('bypass-progress', { percent: 50, message: 'Extracting...' });
    extractZip(zipPath, tempDir);
    const walk = (dir, base = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        const rel = path.join(base, entry.name);
        if (entry.isDirectory()) walk(full, rel);
        else if (full !== zipPath) {
          const dest = path.join(gamePath, rel);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(full, dest);
        }
      }
    };
    walk(tempDir);
    fs.rmSync(tempDir, { recursive: true, force: true });
    event.sender.send('bypass-progress', { percent: 100, message: 'Verification complete.' });
    return { success: true };
  } catch (err) {
    event.sender.send('bypass-progress', { percent: 100, message: `Error: ${err.message}` });
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    return { success: false, error: err.message };
  }
});