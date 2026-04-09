const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Intentamos cargar el archivo local que genera Vite
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  win.loadFile(indexPath).catch((err) => {
    console.error("No se pudo cargar el archivo:", err);
    // Si falla el archivo local, intenta cargar la web como respaldo
    win.loadURL('https://flag-frolic-trivia.lovable.app');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
