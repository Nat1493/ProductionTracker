const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// ✅ FIXED: More reliable dev check
const isDev = !app.isPackaged;

let store;
let mainWindow;
let customDataPath = null;
let fileWatcher = null;
let lastWriteTime = Date.now();
const DEBOUNCE_DELAY = 1000;

// Dynamically import electron-store (ES module)
async function initStore() {
  const Store = (await import('electron-store')).default;
  
  const tempStore = new Store({ name: 'config' });
  customDataPath = tempStore.get('customDataPath');
  
  const storeOptions = customDataPath ? { cwd: customDataPath } : {};
  store = new Store(storeOptions);
  
  setupFileWatcher();
}

function setupFileWatcher() {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }

  if (!store) return;

  const storePath = store.path;
  
  try {
    fileWatcher = fs.watch(storePath, { persistent: false }, (eventType, filename) => {
      if (eventType !== 'change') return;
      
      const now = Date.now();
      if (now - lastWriteTime < DEBOUNCE_DELAY) return;
      
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('data-file-changed');
      }
    });
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

  // Show a startup message
  console.log('=================================');
  console.log('SS Mudyf Production Tracker');
  console.log('=================================');
  console.log('isDev:', isDev);
  console.log('app.isPackaged:', app.isPackaged);
  console.log('__dirname:', __dirname);
  console.log('=================================');

  if (isDev) {
    // Development mode - load from Vite dev server
    console.log('🔧 Loading from development server');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load from built files
    console.log('🚀 Loading from built files');
    
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    console.log('📂 Index path:', indexPath);
    console.log('📂 File exists:', fs.existsSync(indexPath));
    
    if (!fs.existsSync(indexPath)) {
      dialog.showErrorBox(
        'File Not Found',
        `Cannot find index.html at:\n${indexPath}\n\n` +
        `Please reinstall the application.`
      );
      app.quit();
      return;
    }
    
    // Load the file
    mainWindow.loadFile(indexPath).then(() => {
      console.log('✅ Successfully loaded application');
    }).catch((error) => {
      console.error('❌ Failed to load:', error);
      dialog.showErrorBox(
        'Load Error',
        `Failed to load the application:\n${error.message}`
      );
    });
  }

  // Error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Load failed:', errorCode, errorDescription);
    
    // Don't show error for dev server connection refused (expected when dev server isn't running)
    if (isDev && errorCode === -102) {
      dialog.showErrorBox(
        'Development Server Not Running',
        'Please start the Vite development server first:\n\nnpm run dev'
      );
    } else if (!isDev) {
      dialog.showErrorBox(
        'Load Error',
        `Error: ${errorDescription}\nCode: ${errorCode}\nURL: ${validatedURL}`
      );
    }
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page finished loading successfully');
  });

  mainWindow.on('closed', () => {
    if (fileWatcher) {
      fileWatcher.close();
      fileWatcher = null;
    }
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initStore();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
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
    
    const testFile = path.join(selectedPath, '.ss-mudyf-test');
    try {
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
    } catch (err) {
      throw new Error(`Cannot write to selected folder: ${err.message}`);
    }

    const Store = (await import('electron-store')).default;
    const configStore = new Store({ name: 'config' });
    configStore.set('customDataPath', selectedPath);
    
    return selectedPath;
  } catch (error) {
    console.error('Error in select-folder:', error);
    throw error;
  }
});

ipcMain.handle('store-get', (event, key) => {
  return store ? store.get(key) : null;
});

ipcMain.handle('store-set', (event, key, value) => {
  if (store) {
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