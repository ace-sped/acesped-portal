@echo off
echo =================================
echo ACE Portal - Admin Dashboard Setup
echo =================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

node --version
echo ✅ Node.js found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found
    echo Please create a .env file with your DATABASE_URL
    echo.
    echo Example:
    echo DATABASE_URL="postgresql://user:password@localhost:5432/aceportal"
    echo.
    pause
)

REM Generate Prisma Client
echo 🔧 Generating Prisma Client...
call npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to generate Prisma Client
    exit /b 1
)

echo ✅ Prisma Client generated
echo.

REM Run migrations
echo 🗃️  Running database migrations...
call npx prisma migrate dev --name init

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to run migrations
    echo Please check your DATABASE_URL in .env file
    exit /b 1
)

echo ✅ Database migrations completed
echo.

REM Ask if user wants to create admin
set /p CREATE_ADMIN="Do you want to create a Super Admin user now? (y/n) "

if /i "%CREATE_ADMIN%"=="y" (
    call node scripts/create-admin.js
)

echo.
echo =================================
echo ✅ Setup Complete!
echo =================================
echo.
echo Next steps:
echo 1. Start the development server: npm run dev
echo 2. Visit: http://localhost:3000/admin
echo 3. Read SETUP_GUIDE.md for more information
echo.
echo Important: Implement authentication before production!
echo See ADMIN_DASHBOARD_README.md for details
echo.
pause

