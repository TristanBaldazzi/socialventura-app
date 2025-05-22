const { contextBridge, ipcRenderer } = require('electron');
const { app } = require('@electron/remote');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => app.getVersion(),
  getShortcuts: () => ipcRenderer.invoke('get-shortcuts'),
  addShortcut: (shortcut) => ipcRenderer.invoke('add-shortcut', shortcut)
});

window.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'add-shortcut') {
    await ipcRenderer.invoke('add-shortcut', event.data.shortcut);
    window.postMessage({ type: 'shortcuts-updated' }, '*');
  }
});