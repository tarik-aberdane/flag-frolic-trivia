import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Esta es la forma más compatible de cargar el archivo en AppImage y Windows
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

  // Intentamos cargar la ruta absoluta de forma más segura
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  
  win.loadFile(indexPath).catch(err => {
    console.error("No se pudo cargar el archivo:", err);
    // Si falla, intentamos una ruta alternativa común en Linux
    win.loadURL(`file://${path.join(process.cwd(), 'resources/app/dist/index.html')}`);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
