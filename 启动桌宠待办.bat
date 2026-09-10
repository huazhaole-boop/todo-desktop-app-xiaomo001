@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动桌宠待办...
start "" node_modules\electron\dist\electron.exe . --no-sandbox --disable-gpu --disable-software-rasterizer
exit
