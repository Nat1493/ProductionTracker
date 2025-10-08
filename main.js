const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let store;
let mainWindow;

// Dynamically import electron-store (ES module)
async function initStore() {
  const Store = (await import('electron-store')).default;
  store = new Store();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/vite.svg'),
    titleBarStyle: 'default',
    frame: true
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle events
app.whenReady().then(async () => {
  await initStore(); // Initialize store first
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for data persistence
ipcMain.handle('store-get', (event, key) => {
  return store ? store.get(key) : null;
});

ipcMain.handle('store-set', (event, key, value) => {
  if (store) {
    store.set(key, value);
    return true;
  }
  return false;
});

ipcMain.handle('store-delete', (event, key) => {
  if (store) {
    store.delete(key);
    return true;
  }
  return false;
});

ipcMain.handle('store-clear', () => {
  if (store) {
    store.clear();
    return true;
  }
  return false;
});