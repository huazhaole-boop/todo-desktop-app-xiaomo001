// 预加载脚本：把主进程能力安全地暴露给渲染进程
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readTodos: () => ipcRenderer.invoke('todos:read'),
  writeTodos: (data) => ipcRenderer.invoke('todos:write', data),
  hideWindow: () => ipcRenderer.invoke('window:hide'),
  showWindow: () => ipcRenderer.invoke('window:show'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  toggleTop: () => ipcRenderer.invoke('window:toggle-top'),
  quitApp: () => ipcRenderer.invoke('window:quit'),
});
