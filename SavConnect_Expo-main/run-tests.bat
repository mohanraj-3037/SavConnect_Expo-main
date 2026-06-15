@echo off
echo ===================================================
echo           SavConnect Selenium E2E Test Runner
echo ===================================================
echo.
echo This script will install testing dependencies and run the E2E test suite
echo against the localhost deployment.
echo.
echo Make sure that you have run the website using "run.bat" first!
echo.

:: 1. Navigate to testing folder
cd testing

:: 2. Install testing packages if node_modules doesn't exist
if not exist node_modules (
    echo [1/2] Installing testing framework dependencies (mocha, selenium-webdriver, exceljs)...
    call npm install
) else (
    echo [1/2] Testing dependencies already installed. Skipping install...
)
echo.

:: 3. Run E2E Selenium + API Tests
echo [2/2] Running Selenium + API Testing Suite...
echo.

call node run-tests.js

echo.
echo ===================================================
echo                 Testing Session Finished
echo ===================================================
pause
