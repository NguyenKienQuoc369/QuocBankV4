# 🚀 HƯỚNG DẪN DEPLOY LÊN GITHUB

## 📋 Chuẩn bị

✅ Git repository đã được khởi tạo
✅ Code đã được commit
✅ Sẵn sàng để push lên GitHub

---

## 🔧 BƯỚC 1: Tạo Repository trên GitHub

1. Truy cập https://github.com/new
2. Điền thông tin:
   - **Repository name:** `QuocBankV4` (hoặc tên bạn muốn)
   - **Description:** `🏦 Full-stack banking app with 3D UI, savings accounts, bill payments, scheduled transfers, QR payments & notifications`
   - **Visibility:** Public hoặc Private (tùy chọn)
   - **⚠️ KHÔNG** check "Initialize with README" (vì đã có sẵn)
3. Click **"Create repository"**

---

## 🔗 BƯỚC 2: Kết nối với GitHub

Sau khi tạo repository, GitHub sẽ hiển thị hướng dẫn. Chạy các lệnh sau:

### Option 1: HTTPS (Recommended)
```bash
git remote add origin https://github.com/YOUR_USERNAME/QuocBankV4.git
git branch -M main
git push -u origin main
```

### Option 2: SSH (Nếu đã setup SSH key)
```bash
git remote add origin git@github.com:YOUR_USERNAME/QuocBankV4.git
git branch -M main
git push -u origin main
```

**⚠️ Thay `YOUR_USERNAME` bằng username GitHub của bạn!**

---

## 📝 BƯỚC 3: Verify

1. Refresh trang GitHub repository
2. Kiểm tra các file đã được push:
   - ✅ README.md
   - ✅ package.json
   - ✅ prisma/schema.prisma
   - ✅ actions/ (7 files)
   - ✅ components/ (10 files)
   - ✅ app/ (pages)
   - ✅ .env.example
   - ✅ LICENSE

---

## 🌐 BƯỚC 4: Deploy lên Vercel (Optional)

### 4.1. Chuẩn bị
1. Truy cập https://vercel.com
2. Login bằng GitHub account
3. Click **"Add New Project"**

### 4.2. Import Repository
1. Chọn repository `QuocBankV4`
2. Click **"Import"**

### 4.3. Configure Project
```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 4.4. Environment Variables
Thêm các biến môi trường:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
```

**⚠️ Quan trọng:**
- Sử dụng PostgreSQL cho production (không dùng SQLite)
- JWT_SECRET phải là chuỗi ngẫu nhiên mạnh (>32 ký tự)

### 4.5. Deploy
1. Click **"Deploy"**
2. Đợi 2-3 phút
3. Vercel sẽ tự động:
   - Install dependencies
   - Build project
   - Deploy to production

### 4.6. Setup Database
Sau khi deploy, chạy migrations:

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm `DATABASE_URL` với PostgreSQL connection string
3. Vào Terminal trong Vercel hoặc local:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npx prisma db seed
```

---

## 🎯 BƯỚC 5: Test Production

1. Truy cập URL Vercel (ví dụ: `quocbank-v4.vercel.app`)
2. Test login với account:
   - Username: `quocadmin`
   - Password: `123456`
3. Test các tính năng:
   - ✅ Dashboard
   - ✅ Notifications
   - ✅ Savings
   - ✅ Transfer
   - ✅ 3D UI

---

## 📊 BƯỚC 6: Cập nhật README với Live Demo

Thêm vào đầu README.md:

```markdown
## 🌐 Live Demo

**Production:** https://your-app.vercel.app

**Test Account:**
- Username: `quocadmin`
- Password: `123456`
```

Commit và push:
```bash
git add README.md
git commit -m "docs: Add live demo link"
git push
```

---

## 🔒 BẢO MẬT

### Quan trọng cho Production:

1. **Đổi JWT_SECRET:**
   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Đổi mật khẩu admin:**
   - Login vào app
   - Đổi password từ `123456` sang password mạnh

3. **Setup PostgreSQL:**
   - Sử dụng Vercel Postgres, Supabase, hoặc Railway
   - Không dùng SQLite cho production

4. **Environment Variables:**
   - Không commit file `.env`
   - Chỉ commit `.env.example`

---

## 🐛 Troubleshooting

### Lỗi: "Permission denied"
```bash
# Setup SSH key hoặc dùng HTTPS với Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/QuocBankV4.git
```

### Lỗi: "Build failed" trên Vercel
1. Check logs trong Vercel Dashboard
2. Verify `package.json` có đầy đủ dependencies
3. Verify `DATABASE_URL` đúng format PostgreSQL

### Lỗi: "Database connection failed"
1. Verify `DATABASE_URL` trong Vercel Environment Variables
2. Check PostgreSQL server đang chạy
3. Run `npx prisma db push` để tạo tables

### Lỗi: "No data showing"
1. Run seed command:
   ```bash
   npx prisma db seed
   ```
2. Verify seed script chạy thành công

---

## 📚 Resources

- **GitHub Docs:** https://docs.github.com
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## ✅ Checklist

- [ ] Tạo GitHub repository
- [ ] Push code lên GitHub
- [ ] Verify files trên GitHub
- [ ] Deploy lên Vercel (optional)
- [ ] Setup environment variables
- [ ] Setup PostgreSQL database
- [ ] Run migrations & seed
- [ ] Test production app
- [ ] Update README with live demo
- [ ] Change default passwords
- [ ] Setup custom domain (optional)

---

## 🎉 Hoàn thành!

Chúc mừng! QuocBank V4 của bạn đã sẵn sàng trên GitHub và có thể deploy production!

**Next Steps:**
- Share repository với team
- Setup CI/CD với GitHub Actions
- Add more features
- Collect user feedback
