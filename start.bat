@echo off
setlocal
title TravelHub - Khoi dong he thong
color 0A

echo ============================================
echo    TRAVELBOOKING - Web Ban Tour Du Lich
echo ============================================
echo.

:: Tat cac tien trinh cu chiem port 3000 va 5200
echo [1/3] Dang don dep cac tien trinh cu...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /c:":3000 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /c:":5200 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)
:: Thay the timeout bang ping de tranh loi "Input redirection is not supported" khi chay ngam
ping 127.0.0.1 -n 3 >nul

:: Khoi dong Backend (ASP.NET Core API)
echo [2/3] Dang khoi dong Backend API (cong 5200)...
start "TravelHub Backend API" cmd /k "cd /d ""%~dp0backend"" && dotnet run --urls ""http://127.0.0.1:5200"""

:: Doi Backend khoi dong xong
echo      Dang cho Backend san sang...
set retry_count_be=0
:wait_backend
netstat -ano | findstr /c:":5200 " | findstr "LISTENING" >nul
if %errorlevel% equ 0 goto start_frontend

set /a retry_count_be+=1
if %retry_count_be% gtr 20 goto start_frontend
ping 127.0.0.1 -n 3 >nul
goto wait_backend

:start_frontend

:: Khoi dong Frontend (Next.js)
echo [3/3] Dang khoi dong Frontend Next.js (cong 3000)...
start "TravelHub Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev || echo Lỗi khởi động Frontend! && pause"

:: Doi Frontend khoi dong xong
echo      Dang cho Frontend san sang...
set retry_count_fe=0
:wait_frontend
netstat -ano | findstr /c:":3000 " | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo      Frontend da mo cong, dang doi Next.js tai trang...
    ping 127.0.0.1 -n 5 >nul
    goto open_browser
)

set /a retry_count_fe+=1
if %retry_count_fe% gtr 40 (
    echo      [Canh bao] Frontend khoi dong qua lau, se thu mo trinh duyet...
    goto open_browser
)
ping 127.0.0.1 -n 3 >nul
goto wait_frontend

:open_browser

:: Mo trinh duyet
echo.
echo ============================================
echo    Mo trinh duyet tai: http://localhost:3000
echo ============================================
set "APP_URL=http://localhost:3000"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Start-Process '%APP_URL%' -ErrorAction Stop } catch { try { Start-Process 'msedge.exe' '%APP_URL%' -ErrorAction Stop } catch { try { Start-Process 'chrome.exe' '%APP_URL%' -ErrorAction Stop } catch { Start-Process explorer.exe '%APP_URL%' } } }"

echo.
echo [OK] He thong da duoc khoi dong!
echo      Backend : http://127.0.0.1:5200
echo      Frontend: http://localhost:3000
echo.
echo Nhan phim bat ky de dong cua so nay...
:: Doi 5 giay roi tu dong thoat neu chay ngam
ping 127.0.0.1 -n 6 >nul

