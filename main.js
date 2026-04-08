const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // Por si lo necesitas luego
    }
  });

  // Intentamos cargar el archivo con una ruta absoluta sólida
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  win.loadFile(indexPath);

  // Descomenta esto para ver errores si sigue sin abrir:
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
