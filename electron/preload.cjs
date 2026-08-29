const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
  isElectron: true,

  // Player Display & Multi-Screen APIs
  playerDisplay: {
    getDisplays: () => ipcRenderer.invoke('display:getDisplays'),
    getLocalServerInfo: () => ipcRenderer.invoke('display:getLocalServerInfo'),
    isPlayerWindowOpen: () => ipcRenderer.invoke('display:isPlayerWindowOpen'),
    open: (options) => ipcRenderer.send('display:openPlayerWindow', options),
    close: () => ipcRenderer.send('display:closePlayerWindow'),
    toggleFullscreen: () => ipcRenderer.send('display:toggleFullscreen'),
    moveToDisplay: (displayId) => ipcRenderer.send('display:moveToDisplay', displayId),
    syncState: (state) => ipcRenderer.send('display:syncState', state),
    launchChromeCast: () => ipcRenderer.send('display:launchChromeCast'),
    onStateUpdate: (callback) => {
      const sub = (event, state) => callback(state);
      ipcRenderer.on('display:stateUpdate', sub);
      return () => ipcRenderer.removeListener('display:stateUpdate', sub);
    },
    onWindowOpened: (callback) => {
      const sub = () => callback();
      ipcRenderer.on('display:playerWindowOpened', sub);
      return () => ipcRenderer.removeListener('display:playerWindowOpened', sub);
    },
    onWindowClosed: (callback) => {
      const sub = () => callback();
      ipcRenderer.on('display:playerWindowClosed', sub);
      return () => ipcRenderer.removeListener('display:playerWindowClosed', sub);
    },
  },

  // Cloud Sync & Storage Location APIs
  cloudSync: {
    selectFolder: () => ipcRenderer.invoke('storage:selectSyncFolder'),
    getConfig: () => ipcRenderer.invoke('storage:getSyncConfig'),
    setConfig: (config) => ipcRenderer.invoke('storage:setSyncConfig', config),
    migrateLocalToDrive: (databaseJson) => ipcRenderer.invoke('storage:migrateLocalToDrive', databaseJson),
    readDatabase: () => ipcRenderer.invoke('storage:readSyncDatabase'),
    writeDatabase: (databaseJson) => ipcRenderer.invoke('storage:writeSyncDatabase', databaseJson),
    openFolder: (folderPath) => ipcRenderer.invoke('storage:openSyncFolder', folderPath),
    getLocalDatabase: () => ipcRenderer.invoke('storage:getLocalDatabase'),
    saveLocalDatabase: (databaseJson) => ipcRenderer.invoke('storage:saveLocalDatabase', databaseJson),
    onExternalChange: (callback) => {
      const sub = (event, data) => callback(data);
      ipcRenderer.on('storage:externalChange', sub);
      return () => ipcRenderer.removeListener('storage:externalChange', sub);
    },
  },

  // Application Auto-Update APIs
  updater: {
    getVersion: () => ipcRenderer.invoke('updater:getAppVersion'),
    getGitInfo: () => ipcRenderer.invoke('updater:getGitInfo'),
    checkForUpdates: (customFeed) => ipcRenderer.invoke('updater:checkForUpdates', customFeed),
    pullGitUpdate: () => ipcRenderer.invoke('updater:pullGitUpdate'),
    relaunch: () => ipcRenderer.invoke('updater:relaunch'),
    downloadUpdate: () => ipcRenderer.invoke('updater:downloadUpdate'),
    quitAndInstall: () => ipcRenderer.invoke('updater:quitAndInstall'),
    onStatusChange: (callback) => {
      const sub = (event, data) => callback(data);
      ipcRenderer.on('updater:status', sub);
      return () => ipcRenderer.removeListener('updater:status', sub);
    },
  },
});
