@echo off
echo ==============================================
echo  Uni-Track Multi-Device USB Reverse Setup
echo ==============================================
set ADB="%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"

if not exist %ADB% (
    set ADB=adb
)

echo Checking connected devices...
for /f "tokens=1,2" %%i in ('%ADB% devices') do (
    if "%%j"=="device" (
        echo Configuring reverse port 5000 on device: %%i
        %ADB% -s %%i reverse tcp:5000 tcp:5000
    )
)

echo.
echo Active Reverse Mappings:
for /f "tokens=1,2" %%i in ('%ADB% devices') do (
    if "%%j"=="device" (
        echo [Device %%i]
        %ADB% -s %%i reverse --list
    )
)
echo ==============================================
echo Done! All connected phones can now reach backend at 127.0.0.1:5000
pause
