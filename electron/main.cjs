const { app, BrowserWindow, ipcMain, shell, dialog, screen } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const http = require('http');
const os = require('os');
const { exec } = require('child_process');

function getAppIconPath() {
  const possiblePaths = [
    path.join(__dirname, '../public/icon.ico'),
    path.join(__dirname, '../build/icon.ico'),
    path.join(__dirname, 'icon.ico'),
    path.join(process.resourcesPath || '', 'icon.ico'),
    path.join(process.resourcesPath || '', 'public/icon.ico'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(__dirname, '../public/icon.ico');
}

let mainWindow = null;
let playerWindow = null;
let localServer = null;
const serverSockets = new Set();
const HTTP_PORT = 5174;

// Cache latest state for SSE clients & initial state fetch
let latestPlayerState = null;
const sseClients = new Set();

function stopLocalStreamingServer() {
  for (const client of sseClients) {
    try {
      client.end();
    } catch (e) {}
  }
  sseClients.clear();

  for (const socket of serverSockets) {
    try {
      socket.destroy();
    } catch (e) {}
  }
  serverSockets.clear();

  if (localServer) {
    try {
      localServer.close();
    } catch (e) {}
    localServer = null;
  }
}

function isVirtualAdapter(name, addr, mac) {
  const lowerName = (name || '').toLowerCase();
  const lowerMac = (mac || '').toLowerCase();
  // VirtualBox MAC prefix 0a:00:27 or 08:00:27, Hyper-V 00:15:5d, VMware 00:50:56
  if (lowerMac.startsWith('0a:00:27') || lowerMac.startsWith('08:00:27') || lowerMac.startsWith('00:15:5d') || lowerMac.startsWith('00:50:56')) {
    return true;
  }
  // VirtualBox host-only subnet 192.168.56.x
  if (addr.startsWith('192.168.56.')) {
    return true;
  }
  // Names
  if (/vethernet|virtual|wsl|docker|loopback|bluetooth|hyper-v|vmware/i.test(lowerName)) {
    return true;
  }
  return false;
}

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const validIps = [];
  const virtualIps = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (!isVirtualAdapter(name, iface.address, iface.mac)) {
          validIps.push({ name, address: iface.address });
        } else {
          virtualIps.push({ name, address: iface.address });
        }
      }
    }
  }

  // Prefer physical/LAN IPs, fallback to others if none found
  return validIps.length > 0 ? validIps : virtualIps.length > 0 ? virtualIps : [{ name: 'Localhost', address: '127.0.0.1' }];
}

function getPrimaryLocalIp() {
  const ips = getLocalIpAddresses();
  // Prioritize standard home network subnets: 192.168.x.x, 10.x.x.x
  const homeIp = ips.find((i) => i.address.startsWith('192.168.') || i.address.startsWith('10.'));
  return homeIp ? homeIp.address : ips[0].address;
}

function broadcastToSseClients(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

function startLocalStreamingServer() {
  if (localServer) return;
  try {
    localServer = http.createServer((req, res) => {
      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const urlPath = req.url ? req.url.split('?')[0] : '/';

      // 1. SSE Stream endpoint for real-time Wi-Fi sync
      if (urlPath === '/api/stream') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        });
        res.write('\n');

        // Send current state immediately upon connection
        if (latestPlayerState) {
          res.write(`data: ${JSON.stringify(latestPlayerState)}\n\n`);
        }

        sseClients.add(res);

        // Keep-alive heartbeat every 15s
        const heartbeat = setInterval(() => {
          try {
            res.write(': heartbeat\n\n');
          } catch (e) {
            clearInterval(heartbeat);
          }
        }, 15000);

        req.on('close', () => {
          clearInterval(heartbeat);
          sseClients.delete(res);
        });
        return;
      }

      // 2. State endpoint (GET or POST)
      if (urlPath === '/api/state') {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const state = JSON.parse(body);
              latestPlayerState = { ...(latestPlayerState || {}), ...state };
              broadcastToSseClients(latestPlayerState);
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('display:stateUpdate', latestPlayerState);
              }
              if (playerWindow && !playerWindow.isDestroyed()) {
                playerWindow.webContents.send('display:stateUpdate', latestPlayerState);
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.writeHead(400);
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(latestPlayerState || {}));
        return;
      }

      // 3. IP discovery API
      if (urlPath === '/api/ip') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          primaryIp: getPrimaryLocalIp(),
          allIps: getLocalIpAddresses(),
          port: HTTP_PORT,
        }));
        return;
      }

      const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

      // 4. Dev Mode: Proxy requests to Vite dev server on 127.0.0.1:5173
      if (isDev) {
        const proxyReq = http.request(
          {
            host: '127.0.0.1',
            port: 5173,
            path: req.url,
            method: req.method,
            headers: {
              ...req.headers,
              host: '127.0.0.1:5173',
            },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
          }
        );

        proxyReq.on('error', (err) => {
          console.error('Proxy to Vite failed:', err.message);
          res.writeHead(502, { 'Content-Type': 'text/html' });
          res.end('<h1>Dev Server Starting... Please refresh in a moment.</h1>');
        });

        req.pipe(proxyReq, { end: true });
        return;
      }

      // 5. Production Mode: Serve built dist files
      const distPath = path.join(__dirname, '../dist');
      let filePath = path.join(distPath, urlPath === '/' || urlPath.startsWith('/player') ? 'index.html' : urlPath);

      if (!fs.existsSync(filePath)) {
        filePath = path.join(distPath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff2': 'font/woff2',
      };

      const contentType = contentTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });

    localServer.on('connection', (socket) => {
      serverSockets.add(socket);
      socket.on('close', () => {
        serverSockets.delete(socket);
      });
    });

    localServer.on('error', (err) => {
      console.warn('Local streaming server port error (non-fatal):', err.message);
    });

    localServer.listen(HTTP_PORT, '0.0.0.0', () => {
      console.log(`Local Wi-Fi Player Display Server running at http://${getPrimaryLocalIp()}:${HTTP_PORT}/?view=player`);
    });
  } catch (err) {
    console.error('Failed to start local streaming server:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    frame: false, // Frameless modern dark titlebar
    titleBarStyle: 'hidden',
    backgroundColor: '#090d12',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: getAppIconPath(),
    show: false,
  });

  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Enable F12 and Ctrl+Shift+I for developer tools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Window control IPCs
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.close());
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false);

  // File save/load IPCs
  ipcMain.handle('dialog:saveFile', async (event, { defaultPath, filters, data }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath,
      filters,
    });
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, data, 'utf-8');
      return { success: true, filePath: result.filePath };
    }
    return { success: false };
  });

  ipcMain.handle('dialog:openFile', async (event, { filters }) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters,
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const content = fs.readFileSync(result.filePaths[0], 'utf-8');
      return { success: true, filePath: result.filePaths[0], content };
    }
    return { success: false };
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // ==========================================
  // External Display / Player Window IPCs
  // ==========================================
  
  ipcMain.handle('display:getDisplays', () => {
    const primary = screen.getPrimaryDisplay();
    return screen.getAllDisplays().map((d, index) => ({
      id: d.id,
      label: `Display ${index + 1} (${d.bounds.width}x${d.bounds.height})${d.id === primary.id ? ' - Primary' : ' - External'}`,
      bounds: d.bounds,
      isPrimary: d.id === primary.id,
      scaleFactor: d.scaleFactor,
    }));
  });

  ipcMain.handle('display:getLocalServerInfo', () => {
    const ip = getPrimaryLocalIp();
    const allIps = getLocalIpAddresses();
    const url = `http://${ip}:${HTTP_PORT}/?view=player`;
    return {
      ip,
      allIps,
      port: HTTP_PORT,
      url,
      isStreamingActive: true,
    };
  });

  ipcMain.handle('display:isPlayerWindowOpen', () => {
    return playerWindow !== null && !playerWindow.isDestroyed();
  });

  ipcMain.on('display:openPlayerWindow', (event, { displayId, fullscreen = false } = {}) => {
    if (playerWindow && !playerWindow.isDestroyed()) {
      if (displayId) {
        const targetDisplay = screen.getAllDisplays().find((d) => d.id === displayId);
        if (targetDisplay) {
          playerWindow.setBounds(targetDisplay.bounds);
        }
      }
      playerWindow.focus();
      return;
    }

    const allDisplays = screen.getAllDisplays();
    let targetDisplay = allDisplays.find((d) => d.id === displayId);
    if (!targetDisplay) {
      // Default to external display if available, else primary
      const nonPrimary = allDisplays.find((d) => d.id !== screen.getPrimaryDisplay().id);
      targetDisplay = nonPrimary || screen.getPrimaryDisplay();
    }

    playerWindow = new BrowserWindow({
      x: targetDisplay.bounds.x + 50,
      y: targetDisplay.bounds.y + 50,
      width: Math.min(1920, targetDisplay.bounds.width - 100),
      height: Math.min(1080, targetDisplay.bounds.height - 100),
      frame: false,
      backgroundColor: '#090d12',
      title: 'Dungeon Daddy Player Display',
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      icon: getAppIconPath(),
    });

    const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;
    if (isDev) {
      playerWindow.loadURL('http://localhost:5173/?view=player');
    } else {
      playerWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { view: 'player' } });
    }

    if (fullscreen) {
      playerWindow.setFullScreen(true);
    }

    playerWindow.on('closed', () => {
      playerWindow = null;
      mainWindow?.webContents.send('display:playerWindowClosed');
    });

    mainWindow?.webContents.send('display:playerWindowOpened');
  });

  ipcMain.on('display:closePlayerWindow', () => {
    if (playerWindow && !playerWindow.isDestroyed()) {
      playerWindow.close();
      playerWindow = null;
    }
  });

  ipcMain.on('display:toggleFullscreen', () => {
    if (playerWindow && !playerWindow.isDestroyed()) {
      playerWindow.setFullScreen(!playerWindow.isFullScreen());
    }
  });

  ipcMain.on('display:moveToDisplay', (event, displayId) => {
    if (playerWindow && !playerWindow.isDestroyed()) {
      const targetDisplay = screen.getAllDisplays().find((d) => d.id === displayId);
      if (targetDisplay) {
        playerWindow.setBounds(targetDisplay.bounds);
      }
    }
  });

  ipcMain.on('display:syncState', (event, state) => {
    latestPlayerState = { ...(latestPlayerState || {}), ...state };
    broadcastToSseClients(latestPlayerState);

    if (playerWindow && !playerWindow.isDestroyed()) {
      playerWindow.webContents.send('display:stateUpdate', state);
    }
  });

  ipcMain.on('display:launchChromeCast', () => {
    const ip = getPrimaryLocalIp();
    const url = `http://${ip}:${HTTP_PORT}/?view=player`;

    // Try launch Chrome or Edge or default browser
    if (process.platform === 'win32') {
      exec(`start chrome "${url}" || start msedge "${url}" || start "" "${url}"`);
    } else if (process.platform === 'darwin') {
      exec(`open -a "Google Chrome" "${url}" || open "${url}"`);
    } else {
      exec(`google-chrome "${url}" || xdg-open "${url}"`);
    }
  });

  // ==========================================
  // Cloud Sync & Storage Location IPCs
  // ==========================================
  const SYNC_DB_FILENAME = 'dungeon_daddy_database.json';
  const SYNC_BACKUP_FILENAME = 'dungeon_daddy_database.bak';
  const LEGACY_SYNC_DB_FILENAME = 'encounter_plus_database.json';
  let syncWatcher = null;
  let lastInternalWriteTime = 0;

  function getSyncConfigPath() {
    return path.join(app.getPath('userData'), 'sync_config.json');
  }

  function readSyncConfigFile() {
    try {
      const cfgPath = getSyncConfigPath();
      if (fs.existsSync(cfgPath)) {
        return JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      }
    } catch (e) {
      console.error('Error reading sync config:', e);
    }
    return { folderPath: null, autoSync: false, lastSynced: null };
  }

  function writeSyncConfigFile(cfg) {
    try {
      const cfgPath = getSyncConfigPath();
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing sync config:', e);
    }
  }

  function setupSyncWatcher(folderPath) {
    if (syncWatcher) {
      try {
        syncWatcher.close();
      } catch (e) {}
      syncWatcher = null;
    }

    if (!folderPath || !fs.existsSync(folderPath)) return;

    const targetFile = path.join(folderPath, SYNC_DB_FILENAME);
    const legacyTargetFile = path.join(folderPath, LEGACY_SYNC_DB_FILENAME);
    let debounceTimer = null;

    try {
      syncWatcher = fs.watch(folderPath, (eventType, filename) => {
        if (filename === SYNC_DB_FILENAME || filename === LEGACY_SYNC_DB_FILENAME || !filename) {
          // Check if this was our own internal write
          const timeSinceWrite = Date.now() - lastInternalWriteTime;
          if (timeSinceWrite < 2000) {
            return;
          }

          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const checkFile = fs.existsSync(targetFile) ? targetFile : fs.existsSync(legacyTargetFile) ? legacyTargetFile : null;
            if (checkFile) {
              try {
                const stats = fs.statSync(checkFile);
                if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send('storage:externalChange', {
                    mtime: stats.mtime.toISOString(),
                    size: stats.size,
                  });
                }
              } catch (err) {
                console.error('Error checking external sync stats:', err);
              }
            }
          }, 800);
        }
      });
    } catch (err) {
      console.error('Failed to setup sync folder watcher:', err);
    }
  }

  // Initialize watcher if configured
  const currentConfig = readSyncConfigFile();
  if (currentConfig.folderPath) {
    setupSyncWatcher(currentConfig.folderPath);
  }

  ipcMain.handle('storage:selectSyncFolder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Google Drive or Synced Folder',
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Select Folder',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { canceled: true };
    }

    const folderPath = result.filePaths[0];
    const targetFile = path.join(folderPath, SYNC_DB_FILENAME);
    const legacyTargetFile = path.join(folderPath, LEGACY_SYNC_DB_FILENAME);
    let hasExistingDb = false;
    let existingDbMtime = null;
    let existingDbSize = null;

    const fileToInspect = fs.existsSync(targetFile) ? targetFile : fs.existsSync(legacyTargetFile) ? legacyTargetFile : null;
    if (fileToInspect) {
      try {
        const stats = fs.statSync(fileToInspect);
        hasExistingDb = true;
        existingDbMtime = stats.mtime.toISOString();
        existingDbSize = stats.size;
      } catch (e) {}
    }

    return {
      canceled: false,
      folderPath,
      hasExistingDb,
      existingDbMtime,
      existingDbSize,
    };
  });

  ipcMain.handle('storage:getSyncConfig', () => {
    const cfg = readSyncConfigFile();
    let fileExists = false;
    let fileMtime = null;
    let fileSize = null;

    if (cfg.folderPath) {
      const targetFile = path.join(cfg.folderPath, SYNC_DB_FILENAME);
      const legacyTargetFile = path.join(cfg.folderPath, LEGACY_SYNC_DB_FILENAME);
      const fileToInspect = fs.existsSync(targetFile) ? targetFile : fs.existsSync(legacyTargetFile) ? legacyTargetFile : null;
      if (fileToInspect) {
        try {
          const stats = fs.statSync(fileToInspect);
          fileExists = true;
          fileMtime = stats.mtime.toISOString();
          fileSize = stats.size;
        } catch (e) {}
      }
    }

    return {
      ...cfg,
      fileExists,
      fileMtime,
      fileSize,
    };
  });

  ipcMain.handle('storage:setSyncConfig', (event, newConfig) => {
    const prev = readSyncConfigFile();
    const merged = { ...prev, ...newConfig };
    writeSyncConfigFile(merged);

    if (newConfig.folderPath !== undefined && newConfig.folderPath !== prev.folderPath) {
      setupSyncWatcher(newConfig.folderPath);
    }
    return { success: true, config: merged };
  });

  ipcMain.handle('storage:migrateLocalToDrive', (event, databaseJson) => {
    const cfg = readSyncConfigFile();
    if (!cfg.folderPath) {
      return { success: false, error: 'No sync folder configured.' };
    }

    try {
      if (!fs.existsSync(cfg.folderPath)) {
        fs.mkdirSync(cfg.folderPath, { recursive: true });
      }

      const targetFile = path.join(cfg.folderPath, SYNC_DB_FILENAME);
      const backupFile = path.join(cfg.folderPath, SYNC_BACKUP_FILENAME);

      // Create backup if previous file existed
      if (fs.existsSync(targetFile)) {
        fs.copyFileSync(targetFile, backupFile);
      }

      lastInternalWriteTime = Date.now();
      const content = typeof databaseJson === 'string' ? databaseJson : JSON.stringify(databaseJson, null, 2);
      fs.writeFileSync(targetFile, content, 'utf-8');

      const now = new Date().toISOString();
      const updatedConfig = { ...cfg, autoSync: true, lastSynced: now };
      writeSyncConfigFile(updatedConfig);
      setupSyncWatcher(cfg.folderPath);

      const stats = fs.statSync(targetFile);
      return {
        success: true,
        filePath: targetFile,
        size: stats.size,
        lastSynced: now,
      };
    } catch (err) {
      console.error('Failed to migrate local DB to drive folder:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('storage:readSyncDatabase', () => {
    const cfg = readSyncConfigFile();
    if (!cfg.folderPath) {
      return { success: false, error: 'No sync folder configured.' };
    }

    const targetFile = path.join(cfg.folderPath, SYNC_DB_FILENAME);
    const legacyTargetFile = path.join(cfg.folderPath, LEGACY_SYNC_DB_FILENAME);
    const fileToRead = fs.existsSync(targetFile) ? targetFile : fs.existsSync(legacyTargetFile) ? legacyTargetFile : null;

    if (!fileToRead) {
      return { success: false, error: 'Database file not found in sync folder.' };
    }

    try {
      const content = fs.readFileSync(fileToRead, 'utf-8');
      const stats = fs.statSync(fileToRead);
      return {
        success: true,
        content,
        mtime: stats.mtime.toISOString(),
        size: stats.size,
      };
    } catch (err) {
      console.error('Failed to read database from sync folder:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('storage:writeSyncDatabase', async (event, databaseJson) => {
    const cfg = readSyncConfigFile();
    if (!cfg.folderPath || !cfg.autoSync) {
      return { success: false, error: 'Cloud sync is not active.' };
    }

    try {
      const targetFile = path.join(cfg.folderPath, SYNC_DB_FILENAME);
      const backupFile = path.join(cfg.folderPath, SYNC_BACKUP_FILENAME);

      if (fs.existsSync(targetFile)) {
        try {
          // Safety check: Prevent starter default database from wiping out a rich cloud database
          const existingContent = await fs.promises.readFile(targetFile, 'utf-8');
          const existingDb = JSON.parse(existingContent);
          const incomingDb = typeof databaseJson === 'string' ? JSON.parse(databaseJson) : databaseJson;
          
          const incomingMonsters = incomingDb.monsters?.length || 0;
          const incomingCampaigns = incomingDb.campaigns?.length || 0;
          const existingMonsters = existingDb.monsters?.length || 0;
          const existingCampaigns = existingDb.campaigns?.length || 0;

          if (
            (existingMonsters > 15 || existingCampaigns > 1 || (existingDb.maps && existingDb.maps.length > 1)) &&
            incomingMonsters <= 8 && incomingCampaigns <= 1 && (!incomingDb.maps || incomingDb.maps.length <= 1)
          ) {
            console.warn('Blocked attempt to overwrite rich cloud database with starter database.');
            return { success: false, blocked: true, error: 'Overwrite blocked: Cloud database has active campaigns/content while local is default starter.' };
          }

          await fs.promises.copyFile(targetFile, backupFile);
        } catch (e) {}
      }

      lastInternalWriteTime = Date.now();
      const content = typeof databaseJson === 'string' ? databaseJson : JSON.stringify(databaseJson, null, 2);
      await fs.promises.writeFile(targetFile, content, 'utf-8');

      // Also mirror to local database file in AppData
      try {
        const localDbPath = path.join(app.getPath('userData'), 'local_database.json');
        await fs.promises.writeFile(localDbPath, content, 'utf-8');
      } catch (e) {}

      const now = new Date().toISOString();
      writeSyncConfigFile({ ...cfg, lastSynced: now });

      const stats = await fs.promises.stat(targetFile);
      return { success: true, lastSynced: now, size: stats.size };
    } catch (err) {
      console.error('Failed to write database to sync folder:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('storage:getLocalDatabase', async () => {
    try {
      const localDbPath = path.join(app.getPath('userData'), 'local_database.json');
      if (fs.existsSync(localDbPath)) {
        const content = await fs.promises.readFile(localDbPath, 'utf-8');
        const stats = await fs.promises.stat(localDbPath);
        return { success: true, content, size: stats.size, mtime: stats.mtime.toISOString() };
      }
    } catch (err) {
      console.error('Failed to read local database from AppData:', err);
    }
    return { success: false };
  });

  ipcMain.handle('storage:saveLocalDatabase', async (event, databaseJson) => {
    try {
      const localDbPath = path.join(app.getPath('userData'), 'local_database.json');
      const content = typeof databaseJson === 'string' ? databaseJson : JSON.stringify(databaseJson, null, 2);
      await fs.promises.writeFile(localDbPath, content, 'utf-8');
      return { success: true };
    } catch (err) {
      console.error('Failed to save local database in AppData:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('storage:openSyncFolder', (event, folderPath) => {
    const target = folderPath || readSyncConfigFile().folderPath;
    if (target && fs.existsSync(target)) {
      shell.openPath(target);
      return { success: true };
    }
    return { success: false, error: 'Folder does not exist.' };
  });
}

function setupAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  function broadcastUpdateStatus(data) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater:status', data);
    }
  }

  autoUpdater.on('checking-for-update', () => {
    broadcastUpdateStatus({ status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    broadcastUpdateStatus({
      status: 'available',
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseDate: info.releaseDate,
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    broadcastUpdateStatus({
      status: 'not-available',
      version: info?.version || app.getVersion(),
    });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    broadcastUpdateStatus({
      status: 'downloading',
      percent: Math.round(progressObj.percent || 0),
      bytesPerSecond: progressObj.bytesPerSecond,
      transferred: progressObj.transferred,
      total: progressObj.total,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    broadcastUpdateStatus({
      status: 'downloaded',
      version: info.version,
      releaseNotes: info.releaseNotes,
    });
  });

  autoUpdater.on('error', (err) => {
    broadcastUpdateStatus({
      status: 'error',
      error: err ? err.message : 'Unknown updater error',
    });
  });

  ipcMain.handle('updater:getAppVersion', () => {
    return {
      version: app.getVersion(),
      isPackaged: app.isPackaged,
      platform: process.platform,
      arch: process.arch,
    };
  });

  ipcMain.handle('updater:checkForUpdates', async (event, customFeed) => {
    try {
      if (!app.isPackaged) {
        return {
          success: true,
          status: 'dev-mode',
          version: app.getVersion(),
          message: 'Running in development mode. Updates are checked in packaged builds.',
        };
      }
      if (customFeed) {
        autoUpdater.setFeedURL(customFeed);
      }
      const checkResult = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: checkResult?.updateInfo };
    } catch (err) {
      console.error('Check for updates error:', err);
      broadcastUpdateStatus({ status: 'error', error: err.message });
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('updater:downloadUpdate', async () => {
    try {
      if (!app.isPackaged) {
        return { success: false, error: 'Cannot download updates in dev mode.' };
      }
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (err) {
      console.error('Download update error:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('updater:quitAndInstall', () => {
    try {
      autoUpdater.quitAndInstall(false, true);
      return { success: true };
    } catch (err) {
      console.error('Quit and install error:', err);
      return { success: false, error: err.message };
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  startLocalStreamingServer();
  setupAutoUpdater();
});

app.on('window-all-closed', () => {
  stopLocalStreamingServer();
  if (process.platform !== 'darwin') {
    app.exit(0);
  }
});

app.on('before-quit', () => {
  stopLocalStreamingServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
