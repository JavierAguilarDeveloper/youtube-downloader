#!/bin/bash
cd "$(dirname "$0")"
echo "Iniciando YouTube Downloader..."
node server.js &
SERVER_PID=$!
sleep 2
# Abrir navegador según el entorno disponible
if command -v termux-open-url &> /dev/null; then
  termux-open-url http://localhost:3000
elif command -v xdg-open &> /dev/null; then
  xdg-open http://localhost:3000
else
  echo "Abre tu navegador en: http://localhost:3000"
fi
wait $SERVER_PID
