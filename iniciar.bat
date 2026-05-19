@echo off
cd /d "%~dp0"
echo Iniciando YouTube Downloader...
start "" http://localhost:3000
node server.js
pause
