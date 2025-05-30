import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { storageManager as storageManager } from './storage-service'
import type { StorageName, StorageSchemas } from '../common/storage'

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Start time_value1 updater
  // setInterval(() => {
  //   const current = storageManager.get('time').time_value1
  //   storageManager.set('time', {
  //     ...storageManager.get('time'),
  //     time_value1: current + 1
  //   })
  // }, 1000)

  ipcMain.handle('storage-get', (_, name: StorageName) => storageManager.get(name))

  ipcMain.handle(
    'storage-renderer-set',
    (
      _,
      {
        name,
        value,
        source
      }: {
        name: StorageName
        value: StorageSchemas[StorageName]
        source: 'store' | 'rune'
      }
    ) => {
      storageManager.rendererSet(name, value, source)
      return value
    }
  )

  const mainWindow = createWindow()
  // Notify all windows when storage changes
  storageManager.onStorageChange((name, value, source) => {
    // if (source === 'main') {Uncomment when you don't use store and rune at the same time
    mainWindow.webContents.send('storage-changed', { name, value, source })
    // }
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
