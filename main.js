// Electron 主进程
// 负责：创建置顶悬浮窗口、加载本地待办数据、关闭按钮隐藏到悬浮球

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

// 禁用硬件加速 + GPU，兼容无 GPU 环境（虚拟机/远程桌面/沙箱）
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-software-rasterizer');

// 数据存储路径：用户目录下的 .zhupeng-todo/todos.json
// 注意：app.getPath 必须在 app ready 之后调用，这里用惰性获取
let userDataDir = null;
let dataFile = null;

let mainWindow = null;
let floatingBall = null;

function getDataFile() {
  if (!dataFile) {
    userDataDir = path.join(app.getPath('userData'));
    dataFile = path.join(userDataDir, 'todos.json');
  }
  return dataFile;
}

function ensureDataFile() {
  const f = getDataFile();
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  if (!fs.existsSync(f)) {
    fs.writeFileSync(f, JSON.stringify({ todos: [] }, null, 2));
  }
}

function readTodos() {
  try {
    return JSON.parse(fs.readFileSync(getDataFile(), 'utf-8'));
  } catch (e) {
    return { todos: [] };
  }
}

function writeTodos(data) {
  fs.writeFileSync(getDataFile(), JSON.stringify(data, null, 2));
}

function createMainWindow() {
  const display = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = display.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    x: sw - 330,
    y: 60,
    frame: false,           // 无边框
    transparent: true,      // 透明背景
    alwaysOnTop: true,      // 默认置顶（可切换）
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  if (!app.isPackaged) mainWindow.webContents.openDevTools({ mode: 'detach' });

  // 关闭窗口 → 隐藏到悬浮球（不退出）
  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.hide();
    if (floatingBall) floatingBall.show();
  });
}

function createFloatingBall() {
  const display = screen.getPrimaryDisplay();
  const { width: sw, height: sh } = display.workAreaSize;

  floatingBall = new BrowserWindow({
    width: 64,
    height: 64,
    x: sw - 100,
    y: sh - 100,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  floatingBall.loadFile(path.join(__dirname, 'src', 'floating-ball.html'));
  floatingBall.hide();

  floatingBall.on('closed', () => { floatingBall = null; });
}

// IPC：渲染进程 → 主进程 读写数据
ipcMain.handle('todos:read', () => readTodos());
ipcMain.handle('todos:write', (_e, data) => { writeTodos(data); return true; });
ipcMain.handle('window:hide', () => { if (mainWindow) mainWindow.hide(); if (floatingBall) floatingBall.show(); });
ipcMain.handle('window:show', () => { if (floatingBall) floatingBall.hide(); if (mainWindow) mainWindow.show(); });
ipcMain.handle('window:minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.handle('window:toggle-top', () => {
  if (!mainWindow) return false;
  const now = !mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(now);
  return now;
});
ipcMain.handle('window:quit', () => app.quit());

app.whenReady().then(() => {
  ensureDataFile();
  createMainWindow();
  createFloatingBall();
});

app.on('window-all-closed', (e) => {
  // 不退出，保持托盘常驻
  e.preventDefault();
});
