@echo off
echo.
echo ========================================
echo   SudaStock - Historical Data Generator
echo ========================================
echo.
echo Step 1: Make sure you ran seed-products.sql in Neon first!
echo Step 2: This will generate 365 days of history
echo.
pause
echo.
echo Starting generation...
node scripts\seed-historical.js
pause
