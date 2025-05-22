const { app, BrowserWindow, shell, ipcMain } = require('electron');
const Store = require('electron-store');
const path = require('path');

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Charger la page de démarrage stylée
  mainWindow.loadFile('startup.html');

  // Gérer la redirection de la page principale vers login
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url === 'https://socialventura.com/') {
      event.preventDefault();
      mainWindow.loadURL('https://socialventura.com/login');
    }
  });

  // Remplacer le lien "Back to home" immédiatement
  mainWindow.webContents.on('did-start-loading', () => {
    const currentUrl = mainWindow.webContents.getURL();
    if (currentUrl.includes('socialventura.com/login')) {
      mainWindow.webContents.executeJavaScript(`
        // Remplacer le lien par un texte non cliquable
        const observer = new MutationObserver((mutations) => {
          const backToHomeLink = document.querySelector('a[href="https://socialventura.com"]');
          if (backToHomeLink) {
            const parent = backToHomeLink.parentElement;
            parent.innerHTML = '<span class="text-gray-500">Version application</span>';
            observer.disconnect();
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      `);
    }
  });

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

// Gérer la désinstallation
ipcMain.on('uninstall-app', () => {
  app.quit();
});

// Gérer l'ouverture dans le navigateur
ipcMain.on('open-in-browser', () => {
  shell.openExternal('https://socialventura.com');
});

// Gérer l'accès à l'application
ipcMain.on('access-app', () => {
  mainWindow.loadURL('https://socialventura.com/login');
}); 