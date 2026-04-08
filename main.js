const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Creamos la ventana del navegador
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    // Icono opcional si lo tienes, si no, Electron usa uno por defecto
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Esto ayuda a que no haya problemas de seguridad
      sandbox: true 
    }
  });

  // Intentamos cargar el archivo index.html que genera Vite
  // __dirname apunta a la raíz donde está este main.js
  const indexPath = path.join(__dirname, 'dist', 'index.html');

  win.loadFile(indexPath).catch(err => {
    console.error("Error al cargar el archivo HTML:", err);
  });

  // Opcional: Quita el menú superior (File, Edit, etc.) para que parezca un juego
  // win.setMenu(null);

  // Si quieres ver errores de consola dentro del juego mientras pruebas,
  // puedes descomentar la línea de abajo:
  // win.webContents.openDevTools();
}

// Este método se llama cuando Electron ha terminado de inicializarse
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS es común recrear una ventana cuando se hace clic en el icono del dock
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Finaliza la aplicación cuando todas las ventanas se cierran (excepto en macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
