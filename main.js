const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

let store;
let mainWindow;
let customDataPath = null;
let fileWatcher = null;
let lastWriteTime = Date.now();
const DEBOUNCE_DELAY = 1000;

// Dynamically import electron-store (ES module)
async function initStore() {
  const Store = (await import('electron-store')).default;
  
  // Check if there's a custom data path saved
  const tempStore = new Store({ name: 'config' });
  customDataPath = tempStore.get('customDataPath');
  
  // Initialize main store with custom path if set
  const storeOptions = customDataPath 
    ? { cwd: customDataPath }
    : {};
  
  store = new Store(storeOptions);
  
  // Set up file watching for real-time sync
  setupFileWatcher();
}

function setupFileWatcher() {
  // Clean up existing watcher
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }

  if (!store) return;

  // Get the actual file path of the store
  const storePath = store.path;
  
  try {
    // Watch for changes to the data file
    fileWatcher = fs.watch(storePath, { persistent: false }, (eventType, filename) => {
      // Only process 'change' events
      if (eventType !== 'change') return;
      
      // Check if enough time has passed since our last write
      const now = Date.now();
      if (now - lastWriteTime < DEBOUNCE_DELAY) {
        // This is likely our own write, ignore it
        return;
      }
      
      // File was changed by another process/PC
      console.log('Data file changed externally, notifying renderer...');
      
      if (mainWindow && !mainWindow.isDestroyed()) {
        // Notify the renderer process to reload data
        mainWindow.webContents.send('data-file-changed');
      }
    });
    
    console.log(`Watching file: ${storePath}`);
  } catch (error) {
    console.error('Error setting up file watcher:', error);
  }
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

  // FIXED: Better path handling for packaged app
  let startUrl;
  
  if (isDev) {
    startUrl = 'http://localhost:5173';
    console.log('Development mode - loading from:', startUrl);
  } else {
    // In production, load from the packaged files
    startUrl = `file://${path.join(__dirname, '../dist/index.html')}`;
    console.log('Production mode - loading from:', startUrl);
    console.log('File exists:', fs.existsSync(path.join(__dirname, '../dist/index.html')));
  }
  
  mainWindow.loadURL(startUrl);

  // ALWAYS open DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Log any loading errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    // Clean up file watcher
    if (fileWatcher) {
      fileWatcher.close();
      fileWatcher = null;
    }
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
  // Clean up file watcher
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler for folder selection
ipcMain.handle('select-folder', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Data Storage Location',
      buttonLabel: 'Select Folder'
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const selectedPath = result.filePaths[0];
    
    // Test if we can write to this folder
    const testFile = path.join(selectedPath, '.ss-mudyf-test');
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (err) {
      throw new Error(`Cannot write to selected folder: ${err.message}`);
    }

    // Save the custom path to config store
    const Store = (await import('electron-store')).default;
    const configStore = new Store({ name: 'config' });
    configStore.set('customDataPath', selectedPath);
    
    return selectedPath;
  } catch (error) {
    console.error('Error in select-folder:', error);
    throw error;
  }
});

// IPC handlers for data persistence
ipcMain.handle('store-get', (event, key) => {
  return store ? store.get(key) : null;
});

ipcMain.handle('store-set', (event, key, value) => {
  if (store) {
    // Update last write time to prevent self-triggering
    lastWriteTime = Date.now();
    store.set(key, value);
    return true;
  }
  return false;
});

ipcMain.handle('store-delete', (event, key) => {
  if (store) {
    lastWriteTime = Date.now();
    store.delete(key);
    return true;
  }
  return false;
});

ipcMain.handle('store-clear', () => {
  if (store) {
    lastWriteTime = Date.now();
    store.clear();
    return true;
  }
  return false;
});