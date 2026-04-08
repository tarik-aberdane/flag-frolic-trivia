const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true // Aseguramos que estén habilitadas
    }
  });

  // ESTA LÍNEA ABRIRÁ LA CONSOLA AUTOMÁTICAMENTE
  win.webContents.openDevTools();

  const indexPath = path.join(__dirname, 'dist', 'index.html');
  win.loadFile(indexPath).catch(err => console.error(err));
}

app.whenReady().then(createWindow);
// ... resto del código igual
