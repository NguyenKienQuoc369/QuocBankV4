# 🚀 QuocBank Setup Guide

## Prerequisites Installation

### 1. Install Node.js

Node.js is required to run this application. Install it using one of these methods:

#### Option A: Using Package Manager (Recommended)
```bash
# For Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# For Arch Linux
sudo pacman -S nodejs npm

# For Fedora
sudo dnf install nodejs npm
```

#### Option B: Using NVM (Node Version Manager)
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
```

#### Verify Installation
```bash
node --version  # Should show v20.x.x or higher
npm --version   # Should show 10.x.x or higher
```

## 📦 Project Setup

Once Node.js is installed, follow these steps:

### 1. Install Dependencies
```bash
cd /home/sisiniki123/Downloads/QuocBankV4Final
npm install
```

This will install all required packages:
- Next.js 14
- React & React DOM
- Prisma & Prisma Client
- TypeScript
- Tailwind CSS
- React Three Fiber & Three.js
- Jose (JWT)
- Bcrypt
- TanStack Query
- Framer Motion
- And more...

### 2. Generate Prisma Client
```bash
npm run prisma:generate
```

This generates the TypeScript types for your database models.

### 3. Initialize Database
```bash
npm run prisma:push
```

This creates the SQLite database and tables based on your schema.

### 4. Seed Database with Demo Data
```bash
npm run prisma:seed
```

This populates the database with:
- 1 Admin user (quocadmin) with 99 billion VND
- 5 Demo users with Vietnamese names
- 20 Mock transactions

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at: http://localhost:3000

## 🎯 Quick Start (After Node.js Installation)

Run all setup commands at once:

```bash
cd /home/sisiniki123/Downloads/QuocBankV4Final
npm install && \
npm run prisma:generate && \
npm run prisma:push && \
npm run prisma:seed && \
npm run dev
```

## 🔐 Login Credentials

After seeding, use these credentials:

**Admin:**
- Username: `quocadmin`
- Password: `123456`
- Balance: 99,000,000,000 VND

**Demo Users:**
- `nguyenmai` / `123456` (Nguyễn Thị Mai - 15M VND)
- `tranvanb` / `123456` (Trần Văn B - 8.5M VND)
- `lethic` / `123456` (Lê Thị C - 22M VND)
- `phamvand` / `123456` (Phạm Văn D - 5M VND)
- `hoangthie` / `123456` (Hoàng Thị E - 12M VND)

## 📱 Using the Application

### Dashboard
1. Login with any account
2. View your 3D balance visualization
3. See recent transactions
4. Click "Chuyển tiền" to transfer money

### Transfer Money
1. Enter recipient's account number (10 digits)
2. Click "Tìm kiếm" to verify the account
3. Enter amount (max 1 billion VND)
4. Add optional message
5. Click "Xác nhận chuyển tiền"
6. Watch the success particle animation!

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Reset database (careful!)
npm run prisma:push -- --force-reset
npm run prisma:seed
```

## 🐛 Troubleshooting

### TypeScript Errors
**Problem**: Red squiggly lines everywhere
**Solution**: Run `npm install` - errors will disappear after dependencies are installed

### Database Errors
**Problem**: "PrismaClient is not configured"
**Solution**: 
```bash
npm run prisma:generate
npm run prisma:push
```

### Port Already in Use
**Problem**: "Port 3000 is already in use"
**Solution**: 
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### 3D Scene Not Rendering
**Problem**: Black screen where 3D should be
**Solution**: 
- Ensure you're using a modern browser (Chrome, Firefox, Edge)
- Check browser console for WebGL errors
- Update graphics drivers if needed

## 🔄 Resetting the Application

To start fresh:

```bash
# Remove database
rm prisma/dev.db

# Reinstall and setup
npm run prisma:push
npm run prisma:seed
npm run dev
```

## 📊 Database Schema

The application uses these models:

- **User**: Authentication and profile
- **Account**: Bank accounts with balance
- **Transaction**: Money transfer records
- **Card**: Virtual credit cards

All connected with proper relations and indexes for performance.

## 🎨 Customization

### Change Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  'quoc-black': '#0a0a0a',    // Background
  'quoc-neon': '#00ff88',      // Primary accent
  'quoc-purple': '#8b5cf6',    // Secondary
}
```

### Switch to PostgreSQL
Update `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/quocbank"
```

Then update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review the main README.md
3. Check browser console for errors
4. Verify Node.js version (20+)
5. Ensure all dependencies installed correctly

## ✅ Checklist

- [ ] Node.js installed (v20+)
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated
- [ ] Database created and seeded
- [ ] Development server running
- [ ] Can access http://localhost:3000
- [ ] Can login with demo credentials
- [ ] 3D scene renders correctly
- [ ] Can transfer money successfully

---

**Ready to bank in 3D!** 🚀🏦
