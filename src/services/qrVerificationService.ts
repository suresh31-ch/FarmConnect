/**
 * FarmConnect QR Verification & Logging Service
 * Manages unique order verification tokens and logs verification history to Supabase `qr_verification_logs`
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface QRVerificationData {
  orderId: string;
  orderNumber: string;
  productIds: string[];
  farmerId: string;
  consumerId: string;
  deliveryPartnerId: string;
  orderAmount: number;
  paymentStatus: string;
  orderTimestamp: string;
  verificationToken: string;
  deliveryStatus: string;
}

export interface QRVerificationLog {
  id: string;
  order_id: string;
  order_number: string;
  delivery_partner_id: string;
  delivery_partner_name: string;
  verification_time: string;
  location: string;
  result: 'success' | 'failed';
  error_message?: string;
  token_used: string;
}

const LOCAL_STORAGE_QR_LOGS_KEY = 'farmconnect_qr_verification_logs';

/**
 * Generates or retrieves a secure unique verification token for an order.
 */
export function generateVerificationToken(orderId: string, orderNumber: string): string {
  const cleanId = orderId.replace(/[^a-zA-Z0-9]/g, '');
  const cleanNum = orderNumber.replace(/[^a-zA-Z0-9]/g, '');
  const randomSalt = Math.floor(100000 + Math.random() * 900000);
  return `FC_VERIFY_VT_${cleanNum}_${cleanId}_${randomSalt}`;
}

/**
 * Stores a QR verification log in Supabase and localStorage
 */
export async function logQRVerification(log: Omit<QRVerificationLog, 'id'>): Promise<QRVerificationLog> {
  const newLog: QRVerificationLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...log,
  };

  // Local Storage save
  try {
    const existing: QRVerificationLog[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_QR_LOGS_KEY) || '[]'
    );
    localStorage.setItem(LOCAL_STORAGE_QR_LOGS_KEY, JSON.stringify([newLog, ...existing]));
  } catch (err) {
    console.warn('LocalStorage QR log write warning:', err);
  }

  // Supabase save
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('qr_verification_logs').insert([newLog]);
    } catch (err) {
      console.warn('Supabase QR log insert notice:', err);
    }
  }

  return newLog;
}

/**
 * Fetches all QR verification logs
 */
export async function getQRVerificationLogs(): Promise<QRVerificationLog[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('qr_verification_logs')
        .select('*')
        .order('verification_time', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as QRVerificationLog[];
      }
    } catch (err) {
      console.warn('Error fetching Supabase QR logs:', err);
    }
  }

  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_QR_LOGS_KEY) || '[]');
  } catch {
    return [];
  }
}
