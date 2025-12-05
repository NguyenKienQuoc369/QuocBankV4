import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Bắt đầu seed database...')

  // Xóa dữ liệu cũ
  await prisma.scheduledTransfer.deleteMany()
  await prisma.billPayment.deleteMany()
  await prisma.billProvider.deleteMany()
  await prisma.savingsAccount.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.transactionLimit.deleteMany()
  await prisma.fee.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.card.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  // Hash password mặc định
  const defaultPassword = await bcrypt.hash('123456', 10)

  // 1. Tạo Admin User
  const admin = await prisma.user.create({
    data: {
      username: 'quocadmin',
      password_hash: defaultPassword,
      fullName: 'Quốc Admin',
      avatarUrl: '/avatars/admin.png',
    },
  })

  const adminAccount = await prisma.account.create({
    data: {
      userId: admin.id,
      accountNumber: '0000000001',
      balance: 99000000000, // 99 tỷ VND
      type: 'PAYMENT',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Đã tạo Admin:', admin.username)

  // 2. Tạo 5 Dummy Users với tên Việt Nam
  const users = [
    { username: 'nguyenmai', fullName: 'Nguyễn Thị Mai', balance: 15000000 },
    { username: 'tranvanb', fullName: 'Trần Văn B', balance: 8500000 },
    { username: 'lethic', fullName: 'Lê Thị C', balance: 22000000 },
    { username: 'phamvand', fullName: 'Phạm Văn D', balance: 5000000 },
    { username: 'hoangthie', fullName: 'Hoàng Thị E', balance: 12000000 },
  ]

  const createdUsers = []
  const createdAccounts = []

  for (let i = 0; i < users.length; i++) {
    const user = await prisma.user.create({
      data: {
        username: users[i].username,
        password_hash: defaultPassword,
        fullName: users[i].fullName,
        avatarUrl: `/avatars/user${i + 1}.png`,
      },
    })

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber: `000000000${i + 2}`,
        balance: users[i].balance,
        type: 'PAYMENT',
        status: 'ACTIVE',
      },
    })

    // Tạo thẻ cho mỗi tài khoản
    await prisma.card.create({
      data: {
        accountId: account.id,
        cardNumber: `4532${Math.random().toString().slice(2, 14)}`,
        expiryDate: '12/28',
        cvv: Math.floor(100 + Math.random() * 900).toString(),
        isFrozen: false,
      },
    })

    createdUsers.push(user)
    createdAccounts.push(account)
    console.log(`✅ Đã tạo user: ${user.fullName}`)
  }

  // 3. Tạo 20 Mock Transactions
  const transactionMessages = [
    'Chuyển tiền mua sắm',
    'Trả nợ tháng này',
    'Tiền ăn trưa',
    'Mua quà sinh nhật',
    'Đóng tiền điện nước',
    'Tiền cafe',
    'Mua sách',
    'Tiền thuê nhà',
    'Đi chợ',
    'Mua đồ điện tử',
    'Tiền xăng xe',
    'Đi du lịch',
    'Mua quần áo',
    'Tiền học phí',
    'Đi ăn nhà hàng',
    'Mua hoa',
    'Sửa xe',
    'Mua thuốc',
    'Đi xem phim',
    'Tiền gym',
  ]

  const allAccounts = [adminAccount, ...createdAccounts]

  for (let i = 0; i < 20; i++) {
    const fromAccount = allAccounts[Math.floor(Math.random() * allAccounts.length)]
    let toAccount = allAccounts[Math.floor(Math.random() * allAccounts.length)]
    
    // Đảm bảo không tự chuyển cho chính mình
    while (toAccount.id === fromAccount.id) {
      toAccount = allAccounts[Math.floor(Math.random() * allAccounts.length)]
    }

    const amount = Math.floor(Math.random() * 5000000) + 100000 // 100k - 5M VND

    await prisma.transaction.create({
      data: {
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: amount,
        message: transactionMessages[i],
        status: 'SUCCESS',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random trong 30 ngày qua
      },
    })
  }

  console.log('✅ Đã tạo 20 giao dịch mock')

  // 4. Tạo Bill Providers
  const billProviders = [
    {
      name: 'EVN - Điện lực Việt Nam',
      category: 'ELECTRIC',
      logo: '/logos/evn.png',
      description: 'Thanh toán tiền điện',
    },
    {
      name: 'Cấp nước Sài Gòn',
      category: 'WATER',
      logo: '/logos/sawaco.png',
      description: 'Thanh toán tiền nước',
    },
    {
      name: 'VNPT',
      category: 'INTERNET',
      logo: '/logos/vnpt.png',
      description: 'Internet và truyền hình',
    },
    {
      name: 'Viettel',
      category: 'PHONE',
      logo: '/logos/viettel.png',
      description: 'Điện thoại di động',
    },
    {
      name: 'FPT Telecom',
      category: 'INTERNET',
      logo: '/logos/fpt.png',
      description: 'Internet cáp quang',
    },
  ]

  const createdProviders = []
  for (const provider of billProviders) {
    const created = await prisma.billProvider.create({
      data: provider,
    })
    createdProviders.push(created)
    console.log(`✅ Đã tạo nhà cung cấp: ${provider.name}`)
  }

  // 5. Tạo một số Savings Accounts mẫu
  for (let i = 0; i < 3; i++) {
    const account = createdAccounts[i]
    const savingsTypes = ['FLEXIBLE', 'FIXED_3M', 'FIXED_6M', 'FIXED_12M']
    const savingsType = savingsTypes[Math.floor(Math.random() * savingsTypes.length)]
    
    let interestRate = 0.5
    let maturityDate = null
    const startDate = new Date()
    
    switch (savingsType) {
      case 'FLEXIBLE':
        interestRate = 0.5
        break
      case 'FIXED_3M':
        interestRate = 4.5
        maturityDate = new Date(startDate)
        maturityDate.setMonth(maturityDate.getMonth() + 3)
        break
      case 'FIXED_6M':
        interestRate = 5.5
        maturityDate = new Date(startDate)
        maturityDate.setMonth(maturityDate.getMonth() + 6)
        break
      case 'FIXED_12M':
        interestRate = 6.5
        maturityDate = new Date(startDate)
        maturityDate.setFullYear(maturityDate.getFullYear() + 1)
        break
    }

    await prisma.savingsAccount.create({
      data: {
        accountId: account.id,
        savingsType,
        balance: Math.floor(Math.random() * 10000000) + 5000000, // 5M - 15M
        interestRate,
        startDate,
        maturityDate,
        status: 'ACTIVE',
        autoRenew: Math.random() > 0.5,
      },
    })
  }

  console.log('✅ Đã tạo tài khoản tiết kiệm mẫu')

  // 6. Tạo một số Bill Payments mẫu
  for (let i = 0; i < 5; i++) {
    const account = createdAccounts[i]
    const provider = createdProviders[i]
    
    await prisma.billPayment.create({
      data: {
        accountId: account.id,
        providerId: provider.id,
        customerCode: `KH${Math.floor(Math.random() * 1000000)}`,
        amount: Math.floor(Math.random() * 500000) + 100000,
        billMonth: '2024-01',
        description: `Hóa đơn tháng 1/2024`,
        status: 'SUCCESS',
        paidAt: new Date(),
      },
    })
  }

  console.log('✅ Đã tạo lịch sử thanh toán hóa đơn mẫu')

  // 7. Tạo Scheduled Transfers mẫu
  const scheduledTransfer = await prisma.scheduledTransfer.create({
    data: {
      fromAccountId: createdAccounts[0].id,
      toAccountNumber: createdAccounts[1].accountNumber,
      toAccountName: users[1].fullName,
      amount: 1000000,
      frequency: 'MONTHLY',
      startDate: new Date(),
      nextRunDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      message: 'Chuyển tiền định kỳ hàng tháng',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Đã tạo lịch chuyển tiền định kỳ mẫu')

  // 8. Tạo Notifications mẫu
  for (let i = 0; i < createdUsers.length; i++) {
    await prisma.notification.create({
      data: {
        userId: createdUsers[i].id,
        type: 'SYSTEM',
        title: 'Chào mừng đến với QuocBank',
        message: 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!',
        isRead: false,
      },
    })
  }

  console.log('✅ Đã tạo thông báo mẫu')

  // 9. Tạo Transaction Limits mẫu
  for (const account of createdAccounts) {
    await prisma.transactionLimit.create({
      data: {
        accountId: account.id,
        limitType: 'DAILY',
        transactionType: 'TRANSFER',
        maxAmount: 50000000, // 50M VND/ngày
        maxCount: 10,
        currentAmount: 0,
        currentCount: 0,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('✅ Đã tạo giới hạn giao dịch mẫu')

  // 10. Tạo Fee Structure
  const fees = [
    {
      name: 'Phí chuyển tiền nội bộ',
      transactionType: 'TRANSFER',
      feeType: 'FIXED',
      amount: 0, // Miễn phí
      isActive: true,
    },
    {
      name: 'Phí chuyển tiền liên ngân hàng',
      transactionType: 'TRANSFER',
      feeType: 'PERCENTAGE',
      amount: 0.1, // 0.1%
      minFee: 1000,
      maxFee: 50000,
      minTransaction: 100000,
      isActive: true,
    },
    {
      name: 'Phí thanh toán hóa đơn',
      transactionType: 'BILL',
      feeType: 'FIXED',
      amount: 1000, // 1,000 VND
      isActive: true,
    },
  ]

  for (const fee of fees) {
    await prisma.fee.create({
      data: fee,
    })
  }

  console.log('✅ Đã tạo cấu trúc phí giao dịch')

  console.log('\n🎉 Seed database hoàn tất!')
  console.log('\n📝 Thông tin đăng nhập:')
  console.log('   Username: quocadmin')
  console.log('   Password: 123456')
  console.log('   Số dư: 99,000,000,000 VND')
  console.log('\n   Hoặc dùng các user khác:')
  users.forEach(u => {
    console.log(`   - ${u.username} / 123456 (${u.fullName})`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
