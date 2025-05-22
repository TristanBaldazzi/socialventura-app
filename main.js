const { app, BrowserWindow, shell, ipcMain, dialog } = require('electron');
const Store = require('electron-store');
const path = require('path');

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Charger la page du navigateur
  mainWindow.loadFile('index.html');

  // Ouvrir les liens externes dans le navigateur par défaut
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Gestion des raccourcis utilisateur
ipcMain.handle('get-shortcuts', () => {
  return store.get('shortcuts', []);
});

ipcMain.handle('add-shortcut', (event, shortcut) => {
  const shortcuts = store.get('shortcuts', []);
  // Prevent duplicate URLs
  if (!shortcuts.some(s => s.url === shortcut.url)) {
    shortcuts.push(shortcut);
    store.set('shortcuts', shortcuts);
  }
  return shortcuts;
});

// Edit a shortcut
ipcMain.handle('update-shortcut', (event, { index, newName }) => {
  const shortcuts = store.get('shortcuts', []);
  if (shortcuts[index]) {
    shortcuts[index].name = newName;
    store.set('shortcuts', shortcuts);
  }
  return shortcuts;
});

// Delete a shortcut
ipcMain.handle('delete-shortcut', (event, index) => {
  const shortcuts = store.get('shortcuts', []);
  shortcuts.splice(index, 1);
  store.set('shortcuts', shortcuts);
  return shortcuts;
});

// Dialog to enter shortcut name
ipcMain.handle('show-input-dialog', async (event, options) => {
  try {
    const result = await dialog.showInputBox(mainWindow, {
      title: options.title || 'Input',
      label: options.message || 'Enter a value:',
      value: options.defaultValue || ''
    });
    return result.response;
  } catch (error) {
    // Fallback with a custom window
    return await showCustomInputDialog(options);
  }
});

// Function to create a custom input window
async function showCustomInputDialog(options) {
  return new Promise((resolve) => {
    const inputWindow = new BrowserWindow({
      parent: mainWindow,
      modal: true,
      width: 400,
      height: 180,
      resizable: false,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 0;
            margin: 0;
            background: #18144a;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .container {
            background: #18144a;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            width: 90%;
            max-width: 350px;
          }
          h3 {
            margin: 0 0 15px 0;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
          }
          input {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            font-size: 14px;
            margin: 10px 0 20px 0;
            background: rgba(255,255,255,0.1);
            color: #fff;
            box-sizing: border-box;
          }
          input:focus {
            outline: none;
            border-color: #fe2c55;
            background: rgba(255,255,255,0.15);
          }
          input::placeholder {
            color: rgba(255,255,255,0.6);
          }
          .buttons {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
          }
          button {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          }
          .ok { 
            background: linear-gradient(90deg, #fe2c55 0%, #ff5a7a 100%);
            color: white; 
          }
          .ok:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(254,44,85,0.3);
          }
          .cancel { 
            background: rgba(255,255,255,0.1); 
            color: #fff; 
            border: 1px solid rgba(255,255,255,0.2);
          }
          .cancel:hover {
            background: rgba(255,255,255,0.2);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h3>${options.title || 'Input'}</h3>
          <input type="text" id="input" value="${options.defaultValue || ''}" placeholder="Enter shortcut name" autofocus />
          <div class="buttons">
            <button class="cancel" onclick="cancel()">Cancel</button>
            <button class="ok" onclick="ok()">Add</button>
          </div>
        </div>
        <script>
          const { ipcRenderer } = require('electron');
          function ok() {
            const value = document.getElementById('input').value;
            ipcRenderer.send('input-result', value);
          }
          function cancel() {
            ipcRenderer.send('input-result', null);
          }
          document.getElementById('input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') ok();
            if (e.key === 'Escape') cancel();
          });
          document.getElementById('input').focus();
        </script>
      </body>
      </html>
    `;

    inputWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(html));

    ipcMain.once('input-result', (event, result) => {
      inputWindow.close();
      resolve(result);
    });

    inputWindow.on('closed', () => {
      resolve(null);
    });
  });
}

// Sauvegarde et chargement de la session d'onglets
ipcMain.handle('save-session-tabs', (event, tabs) => {
  store.set('sessionTabs', tabs);
});

ipcMain.handle('load-session-tabs', () => {
  return store.get('sessionTabs', []);
});

// Paramètres du navigateur (URL par défaut)
ipcMain.handle('save-browser-settings', (event, settings) => {
  store.set('browserSettings', settings);
});

ipcMain.handle('load-browser-settings', () => {
  return store.get('browserSettings', { defaultNewTabUrl: 'https://socialventura.com/user/profil' });
});

ipcMain.handle('save-shortcuts', (event, shortcuts) => {
  store.set('shortcuts', shortcuts);
});