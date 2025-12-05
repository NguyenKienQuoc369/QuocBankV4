'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface NotificationInfo {
  id: string
  type: string
  title: string
  message: string
  data: any
  isRead: boolean
  createdAt: Date
}

// Lấy danh sách thông báo
export async function getNotifications(
  limit: number = 50,
  unreadOnly: boolean = false
): Promise<NotificationInfo[]> {
  try {
    const session = await getSession()
    if (!session) return []

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.id,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return notifications.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data ? JSON.parse(n.data) : null,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }))
  } catch (error) {
    console.error('Get notifications error:', error)
    return []
  }
}

// Đếm số thông báo chưa đọc
export async function getUnreadCount(): Promise<number> {
  try {
    const session = await getSession()
    if (!session) return 0

    const count = await prisma.notification.count({
      where: {
        userId: session.id,
        isRead: false,
      },
    })

    return count
  } catch (error) {
    console.error('Get unread count error:', error)
    return 0
  }
}

// Đánh dấu đã đọc
export async function markAsRead(notificationId: string): Promise<boolean> {
  try {
    const session = await getSession()
    if (!session) return false

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification || notification.userId !== session.id) {
      return false
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return true
  } catch (error) {
    console.error('Mark as read error:', error)
    return false
  }
}

// Đánh dấu tất cả đã đọc
export async function markAllAsRead(): Promise<boolean> {
  try {
    const session = await getSession()
    if (!session) return false

    await prisma.notification.updateMany({
      where: {
        userId: session.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return true
  } catch (error) {
    console.error('Mark all as read error:', error)
    return false
  }
}

// Xóa thông báo
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    const session = await getSession()
    if (!session) return false

    // Verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification || notification.userId !== session.id) {
      return false
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    })

    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return true
  } catch (error) {
    console.error('Delete notification error:', error)
    return false
  }
}

// Xóa tất cả thông báo đã đọc
export async function deleteAllRead(): Promise<boolean> {
  try {
    const session = await getSession()
    if (!session) return false

    await prisma.notification.deleteMany({
      where: {
        userId: session.id,
        isRead: true,
      },
    })

    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return true
  } catch (error) {
    console.error('Delete all read error:', error)
    return false
  }
}

// Tạo thông báo (internal use)
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any
): Promise<boolean> {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
      },
    })

    revalidatePath('/notifications')
    revalidatePath('/dashboard')

    return true
  } catch (error) {
    console.error('Create notification error:', error)
    return false
  }
}
