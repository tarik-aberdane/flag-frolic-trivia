const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Usamos path.join para que funcione igual en Windows y Linux
  win.loadFile(path.join(__dirname, 'dist/index.html'));

  // OPCIONAL: Descomenta la línea de abajo para que se abran las herramientas 
  // de desarrollador automáticamente y ver si hay errores ocultos
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
