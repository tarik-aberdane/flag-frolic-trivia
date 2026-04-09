const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    const filePath = isDev ? 'http://localhost:3000' : `file://${__dirname}/path/to/your/index.html`;
    win.loadURL(filePath);

    // Fallback mechanism for production builds
    if (!isDev) {
        // Add your production fallback logic, e.g., using a Blob or static assets
    }
}

app.whenReady().then(createWindow);
