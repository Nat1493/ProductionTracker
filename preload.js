const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronStore', {
  get: (key) => ipcRenderer.invoke('store-get', key),
  set: (key, value) => ipcRenderer.invoke('store-set', key, value),
  delete: (key) => ipcRenderer.invoke('store-delete', key),
  clear: () => ipcRenderer.invoke('store-clear')
});

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder')
});