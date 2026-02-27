#!/bin/bash

echo "================================="
echo "ACE Portal - Admin Dashboard Setup"
echo "================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "Please create a .env file with your DATABASE_URL"
    echo ""
    echo "Example:"
    echo 'DATABASE_URL="postgresql://user:password@localhost:5432/aceportal"'
    echo ""
    read -p "Press Enter to continue when .env is ready..."
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Run migrations
echo "🗃️  Running database migrations..."
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

echo "✅ Database migrations completed"
echo ""

# Ask if user wants to create admin
read -p "Do you want to create a Super Admin user now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    node scripts/create-admin.js
fi

echo ""
echo "================================="
echo "✅ Setup Complete!"
echo "================================="
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Visit: http://localhost:3000/admin"
echo "3. Read SETUP_GUIDE.md for more information"
echo ""
echo "Important: Implement authentication before production!"
echo "See ADMIN_DASHBOARD_README.md for details"
echo ""

