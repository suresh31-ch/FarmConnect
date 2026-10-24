/**
 * Notification Center API Service (Firebase Firestore Integrated)
 */

import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';

export interface NotificationItem {
  id: string;
  category: 'Orders' | 'Payments' | 'Weather' | 'Disease' | 'Schemes' | 'Market' | 'Worker' | 'Delivery';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionPath?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    category: 'Weather',
    title: '⚠️ Heavy Coastal Rainfall Warning',
    message: 'Heavy rain (40-60mm) expected in Guntur & Krishna districts on Friday. Clear field drainage lines.',
    timestamp: '10 mins ago',
    read: false,
    priority: 'high',
    actionPath: 'weather'
  },
  {
    id: 'n2',
    category: 'Market',
    title: '📈 Tomato Mandi Surge (+18%)',
    message: 'Guntur Mandi tomato modal price rose to ₹38/kg. Demand expected to remain high over weekend.',
    timestamp: '1 hour ago',
    read: false,
    priority: 'medium',
    actionPath: 'ai_assistant'
  },
  {
    id: 'n3',
    category: 'Schemes',
    title: '💰 YSR Rythu Bharosa / PM-KISAN Credited',
    message: 'Installment of ₹7,500 has been credited to your Aadhaar-linked Bank account ****4892.',
    timestamp: 'Yesterday',
    read: true,
    priority: 'high',
    actionPath: 'govt_schemes'
  },
  {
    id: 'n4',
    category: 'Orders',
    title: '🚚 Order #FC-ORD-98214 Out for Delivery',
    message: 'Bolero Pickup driver Venkat is en route to Vijayawada. ETA: 4:30 PM.',
    timestamp: '2 hours ago',
    read: true,
    priority: 'medium',
    actionPath: 'orders'
  },
  {
    id: 'n5',
    category: 'Worker',
    title: '👨‍🌾 Harvest Worker Team Confirmed',
    message: 'Subba Rao accepted your request for 10 harvest workers for Friday, July 26.',
    timestamp: '3 hours ago',
    read: true,
    priority: 'medium',
    actionPath: 'worker_marketplace'
  }
];

export async function fetchNotifications(): Promise<NotificationItem[]> {
  try {
    const notifsRef = collection(db, 'notifications');
    const snapshot = await getDocs(notifsRef);

    if (snapshot.empty) {
      for (const n of DEFAULT_NOTIFICATIONS) {
        await addDoc(notifsRef, { ...n });
      }
      return DEFAULT_NOTIFICATIONS;
    }

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        category: data.category || 'Market',
        title: data.title || 'System Alert',
        message: data.message || '',
        timestamp: data.timestamp || 'Just now',
        read: Boolean(data.read),
        priority: data.priority || 'medium',
        actionPath: data.actionPath || ''
      };
    });
  } catch (error) {
    console.warn('Firestore fetchNotifications fallback:', error);
    return DEFAULT_NOTIFICATIONS;
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const notifDoc = doc(db, 'notifications', id);
    await updateDoc(notifDoc, { read: true });
  } catch (error) {
    console.warn('Could not update notification in Firestore:', error);
  }
}

export async function createNotification(notif: Partial<NotificationItem>): Promise<void> {
  try {
    const notifsRef = collection(db, 'notifications');
    await addDoc(notifsRef, {
      category: notif.category || 'Market',
      title: notif.title || 'Notification',
      message: notif.message || '',
      timestamp: 'Just now',
      read: false,
      priority: notif.priority || 'medium',
      actionPath: notif.actionPath || ''
    });
  } catch (error) {
    console.warn('Error creating notification in Firestore:', error);
  }
}
