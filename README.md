# 🏦 QUOCBANK - The Ultimate Full-Stack Spatial Banking System

A complete, production-ready banking application with a stunning 3D spatial interface built with Next.js 14, Prisma, and React Three Fiber.

## ✨ Features

### Core Banking
- 🔐 **Custom JWT Authentication** - Secure login/logout system with bcrypt
- 💰 **Real-time Balance Display** - 3D visualization of account balance
- 💸 **Money Transfer** - ACID-compliant transactions with Prisma
- 📊 **Transaction History** - View all your recent transactions
- 🎨 **3D Spatial UI** - Futuristic interface with React Three Fiber
- 🌐 **Vietnamese Language** - Full Vietnamese UI support
- 🔒 **Protected Routes** - Middleware-based route protection

### Advanced Features (NEW!)
- 💰 **Savings Accounts** - 5 types with interest rates (0.5% - 6.5%/year)
  - Flexible (no term)
  - Fixed 1, 3, 6, 12 months
  - Auto-renew support
  - Interest calculation
  - Early withdrawal penalty
  
- 📄 **Bill Payments** - Pay utility bills
  - Electric, Water, Internet, Phone, TV
  - Save bill templates
  - Payment history
  
- 🗓️ **Scheduled Transfers** - Recurring transfers
  - Daily, Weekly, Monthly frequencies
  - Pause/Resume functionality
  - Auto-execution ready
  
- 🔔 **Notifications System** - Real-time updates
  - Transaction notifications
  - Bill payment alerts
  - Savings updates
  - Security alerts
  - System messages
  
- 📱 **QR Code Payments** - Modern payment method
  - Static QR (user enters amount)
  - Dynamic QR (fixed amount)
  - 15-minute expiration
  - Secure validation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **3D Graphics**: React Three Fiber, Three.js, Drei
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL/SQLite via Prisma ORM
- **Authentication**: Jose (JWT), Bcrypt
- **State Management**: TanStack Query, Zustand
- **Animation**: Framer Motion

## 📦 Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and update the values if needed.

3. **Generate Prisma Client**:
```bash
npm run prisma:generate
```

4. **Push database schema**:
```bash
npm run prisma:push
```

5. **Seed the database**:
```bash
npm run prisma:seed
```

## 🚀 Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👤 Demo Accounts

After seeding, you can login with:

**Admin Account:**
- Username: `quocadmin`
- Password: `123456`
- Balance: 99,000,000,000 VND

**User Accounts:**
- Username: `nguyenmai` / Password: `123456` (Nguyễn Thị Mai)
- Username: `tranvanb` / Password: `123456` (Trần Văn B)
- Username: `lethic` / Password: `123456` (Lê Thị C)
- Username: `phamvand` / Password: `123456` (Phạm Văn D)
- Username: `hoangthie` / Password: `123456` (Hoàng Thị E)

## 📁 Project Structure

```
quocbank/
├── actions/              # Server Actions
│   ├── auth.ts          # Authentication actions
│   ├── banking.ts       # Banking operations
│   ├── savings.ts       # Savings account operations (NEW!)
│   ├── bills.ts         # Bill payment operations (NEW!)
│   ├── scheduled-transfers.ts  # Scheduled transfers (NEW!)
│   ├── notifications.ts # Notification system (NEW!)
│   └── qr-payment.ts    # QR code payments (NEW!)
├── app/                 # Next.js App Router
│   ├── dashboard/       # Dashboard page
│   ├── login/          # Login page
│   ├── transfer/       # Transfer page
│   ├── savings/        # Savings page (NEW!)
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/          # React components
│   ├── 3d/             # 3D components
│   │   ├── Scene.tsx
│   │   ├── DashboardScene.tsx
│   │   ├── CardHologram.tsx
│   │   └── ParticleExplosion.tsx
│   ├── NotificationBell.tsx      # Notification dropdown (NEW!)
│   ├── SavingsCard.tsx           # Savings display (NEW!)
│   ├── BillProviderCard.tsx      # Bill provider card (NEW!)
│   ├── ScheduledTransferCard.tsx # Transfer card (NEW!)
│   ├── QRCodeDisplay.tsx         # QR generator (NEW!)
│   └── providers/      # Context providers
├── lib/                # Utility libraries
│   ├── auth.ts         # Auth utilities
│   ├── prisma.ts       # Prisma client
│   └── utils.ts        # Helper functions
├── prisma/             # Database
│   ├── schema.prisma   # Database schema (14 models)
│   └── seed.ts         # Seed script (enhanced)
└── middleware.ts       # Route protection

```

## 🔑 Key Features Explained

### ACID Transactions
All money transfers use Prisma's `$transaction` to ensure atomicity:
- Money is deducted from sender
- Money is added to receiver
- Transaction record is created
- Notifications created for both parties
- All or nothing - no partial transfers

### Savings Accounts
- **5 Types**: Flexible, 1M, 3M, 6M, 12M with increasing interest rates
- **Interest Calculation**: Automatic calculation based on days and rate
- **Early Withdrawal**: Penalty applied (reduced to 0.5% rate)
- **Auto-Renew**: Optional automatic renewal at maturity
- **Progress Tracking**: Visual progress bar for fixed-term accounts

### Notifications System
- **Real-time Updates**: Auto-refresh every 30 seconds
- **5 Types**: Transaction, Bill, Savings, Security, System
- **Read/Unread Tracking**: Badge shows unread count
- **Auto-Creation**: Notifications created automatically for all actions

### QR Code Payments
- **Static QR**: Receiver generates QR, sender enters amount
- **Dynamic QR**: QR includes fixed amount and message
- **Security**: 15-minute expiration, account verification
- **Download**: Save QR code as image

### 3D Visualization
- **Balance Sun**: Your balance is visualized as a glowing 3D sphere
- **Floating Particles**: Ambient particles create a spatial atmosphere
- **Card Hologram**: 3D credit card with realistic lighting
- **Success Animation**: Particle explosion on successful transfer

### Security
- JWT tokens stored in HttpOnly cookies
- Password hashing with bcrypt (10 rounds)
- Protected routes via middleware
- Session verification on every request
- Transaction limits and fee structure

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:push` - Push schema to database
- `npm run prisma:seed` - Seed database with demo data
- `npm run prisma:studio` - Open Prisma Studio (view database)

## 🎨 Customization

### Colors
Edit `tailwind.config.ts` to customize the color scheme:
- `quoc-black`: Main background color
- `quoc-neon`: Primary accent color
- `quoc-purple`: Secondary accent

### Database
Switch from SQLite to PostgreSQL by updating `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/quocbank"
```

## 🎯 Quick Start Guide

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd QuocBankV4Final
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env if needed (default SQLite works out of the box)
```

### 3. Setup Database
```bash
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Login
- Open http://localhost:3000
- Username: `quocadmin`
- Password: `123456`

## 🧪 Testing Features

### Test Savings Account
1. Go to Dashboard → Click "Tiết kiệm"
2. Click "+ Tạo tài khoản tiết kiệm mới"
3. Select savings type (e.g., 6 months - 5.5%)
4. Enter amount (minimum 1,000,000 VND)
5. Click "Gửi tiết kiệm"
6. View your new savings account with interest calculation

### Test Notifications
1. Click the bell icon in header
2. View notifications dropdown
3. Click a notification to mark as read
4. Click "Đánh dấu tất cả đã đọc"

### Test Transfer with Notifications
1. Transfer money to another account
2. Check notification bell
3. Both sender and receiver get notifications

## 🐛 Troubleshooting

**TypeScript errors**: Run `npm install` to install all dependencies.

**Database errors**: Run `npm run prisma:generate` and `npm run prisma:push`.

**3D not rendering**: Ensure your browser supports WebGL. Try Chrome or Firefox.

**Port already in use**: The app will automatically try port 3001 if 3000 is busy.

**Seed data not showing**: Run `npm run prisma:seed` to populate the database.

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..." # Use PostgreSQL for production
JWT_SECRET="your-super-secret-key" # Generate a strong secret
NODE_ENV="production"
```

### Database Migration
For production, switch from SQLite to PostgreSQL:
1. Update `DATABASE_URL` in `.env`
2. Update `prisma/schema.prisma` datasource to `postgresql`
3. Run `npm run prisma:push`
4. Run `npm run prisma:seed`

## 📊 Database Schema

The app uses 14 Prisma models:
- **User** - User accounts
- **Account** - Banking accounts
- **Transaction** - Money transfers
- **Card** - Virtual cards
- **SavingsAccount** - Savings with interest
- **BillProvider** - Service providers
- **BillPayment** - Bill payment records
- **ScheduledTransfer** - Recurring transfers
- **Notification** - User notifications
- **TransactionLimit** - Daily/monthly limits
- **Fee** - Transaction fees

## 🔒 Security Features

- ✅ JWT authentication with HttpOnly cookies
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ ACID transactions for data integrity
- ✅ Protected routes with middleware
- ✅ Session verification on every request
- ✅ Transaction limits
- ✅ QR code expiration (15 minutes)
- ✅ Input validation on client and server

## 📈 Performance

- Server-side rendering with Next.js 14
- Optimized 3D rendering with React Three Fiber
- Efficient database queries with Prisma
- Real-time updates with polling (30s interval)
- Responsive design for all devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Credits

Built with ❤️ using:
- Next.js 14 (App Router)
- Prisma ORM
- React Three Fiber
- TypeScript
- Tailwind CSS
- Framer Motion

---

**QuocBank** - Ngân hàng không gian 3D của tương lai 🚀

**Features:** Savings • Bill Payments • Scheduled Transfers • QR Payments • Notifications • 3D UI
