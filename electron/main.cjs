const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'Flag Frolic Trivia',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenuBarVisibility(false);

  // En desarrollo vs producción
  if (isDev) {
    // En desarrollo, usar el servidor de Vite
    win.loadURL('http://localhost:5173');
  } else {
    // En producción, construir la ruta correctamente
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    const fileUrl = `file://${path.resolve(indexPath)}`;
    
    console.log('Loading from:', fileUrl);
    
    win.loadURL(fileUrl).catch(err => {
      console.error('Failed to load index.html:', err);
      // Si falla, intentar cargar desde una ruta alternativa
      const alternativePath = path.join(app.getAppPath(), 'dist', 'index.html');
      const alternativeUrl = `file://${path.resolve(alternativePath)}`;
      console.log('Trying alternative path:', alternativeUrl);
      
      win.loadURL(alternativeUrl).catch(err2 => {
        console.error('Failed to load alternative path:', err2);
      });
    });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
