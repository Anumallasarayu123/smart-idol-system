@echo off
title Smart Idol Server Watchdog
:loop
echo 🚀 [WATCHDOG] Starting Smart Idol Server on Port 3001...
node server.cjs
echo ⚠️ Server stopped. Restarting in 2 seconds...
ping -n 3 127.0.0.1 > nul
goto loop
