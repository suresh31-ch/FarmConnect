/**
 * Real Supabase Order & Delivery Service
 * Manages orders in Supabase `orders` table with Supabase Realtime subscriptions.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { OrderStatus, TrackingStep } from '../context/FarmDataContext';
import { calculateLogistics } from './logisticsService';

export interface DBOrder {
  id: string;
  order_number: string;
  consumer_name: string;
  consumer_phone: string;
  consumer_email?: string;
  consumer_address: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  gps_location?: string;
  delivery_notes?: string;
  delivery_time_preference?: string;
  farmer_id?: string;
  farmer_name: string;
  farmer_phone?: string;
  farmer_address?: string;
  driver_id?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_type?: string;
  vehicle_number?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    unit: string;
    image: string;
  }>;
  total_amount: number;
  delivery_fee: number;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  payment_id?: string;
  distance_km?: number;
  total_weight_kg?: number;
  created_at?: string;
  estimated_delivery?: string;
  tracking_steps?: TrackingStep[];
  verification_token?: string;
  is_qr_verified?: boolean;
  qr_scanned_at?: string;
  qr_scanned_by?: string;
  rating?: {
    farmerRating?: number;
    deliveryRating?: number;
    productRating?: number;
    farmerDeliveryRating?: number;
    feedback?: string;
  };
}

const LOCAL_STORAGE_ORDERS_KEY = 'farmconnect_supabase_orders';

const SEED_ORDERS: DBOrder[] = [
  {
    id: 'ord-101',
    order_number: 'FC-8902',
    consumer_name: 'Rajesh Sharma',
    consumer_phone: '+91 98480 12345',
    consumer_address: 'Flat 402, Green Towers, Guntur Main Rd, AP',
    delivery_time_preference: '4:00 PM - 6:00 PM',
    farmer_id: 'f1',
    farmer_name: 'Venkat Rao',
    farmer_address: 'Tenali Farm Cluster, Guntur District, AP',
    driver_id: 'd3',
    driver_name: 'Venkat Subbaiah',
    driver_phone: '+91 98663 44102',
    vehicle_type: 'Bolero Pickup',
    items: [
      {
        productId: 'p1',
        productName: 'Organic Hybrid Tomato',
        quantity: 10,
        price: 38,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
      },
      {
        productId: 'p3',
        productName: 'Fresh Hot Green Chili',
        quantity: 2,
        price: 45,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?auto=format&fit=crop&w=500&q=80',
      },
    ],
    total_amount: 470,
    delivery_fee: 140,
    status: 'out_for_delivery',
    payment_method: 'UPI',
    payment_status: 'paid',
    distance_km: 14.5,
    total_weight_kg: 60,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    estimated_delivery: 'Today, 4:30 PM',
    tracking_steps: [
      { label: 'Order Placed', time: '8:30 AM', completed: true },
      { label: 'Farmer Accepted', time: '8:45 AM', completed: true },
      { label: 'Delivery Driver Assigned', time: '9:15 AM', completed: true },
      { label: 'Out for Delivery', time: '1:30 PM', completed: true, active: true },
      { label: 'Delivered', time: 'Est 4:30 PM', completed: false },
    ],
  },
  {
    id: 'ord-102',
    order_number: 'FC-8903',
    consumer_name: 'Priya Verma',
    consumer_phone: '+91 99123 45678',
    consumer_address: 'Door 12-4-1, Benz Circle, Vijayawada',
    delivery_time_preference: 'Morning 10:00 AM',
    farmer_id: 'f1',
    farmer_name: 'Venkat Rao',
    farmer_address: 'Tenali Farm Cluster, Guntur District, AP',
    items: [
      {
        productId: 'p2',
        productName: 'Traditional Basmati Rice',
        quantity: 25,
        price: 72,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
      },
    ],
    total_amount: 1800,
    delivery_fee: 180,
    status: 'pending',
    payment_method: 'UPI',
    payment_status: 'paid',
    distance_km: 18.2,
    total_weight_kg: 125,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    estimated_delivery: 'Tomorrow, 10:00 AM',
    tracking_steps: [
      { label: 'Order Placed', time: '11:10 AM', completed: true, active: true },
      { label: 'Farmer Accepted', time: 'Pending', completed: false },
      { label: 'Delivery Driver Assigned', time: 'Pending', completed: false },
      { label: 'Out for Delivery', time: 'Pending', completed: false },
      { label: 'Delivered', time: 'Est Tomorrow', completed: false },
    ],
  },
];

/**
 * Fetch orders from Supabase `orders` table
 */
export async function fetchOrdersFromSupabase(): Promise<DBOrder[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return SEED_ORDERS;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (data && data.length === 0) {
        // Seed initial rows
        for (const ord of SEED_ORDERS) {
          await supabase.from('orders').insert([ord]);
        }
        const { data: fresh } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (fresh && fresh.length > 0) return fresh;
      }

      const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (stored) {
        try { return JSON.parse(stored); } catch { }
      }
      return SEED_ORDERS;
    }

    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Fetch orders exception:', err);
    const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { }
    }
    return SEED_ORDERS;
  }
}

/**
 * Insert a new Order into Supabase `orders` table
 */
export async function createOrderInSupabase(orderData: Partial<DBOrder>): Promise<DBOrder> {
  const localId = `ord-${Date.now()}`;
  const totalWeight = orderData.total_weight_kg || 50;
  const distance = orderData.distance_km || 12;
  const logistics = calculateLogistics(totalWeight, distance);
  const randomSerial = Math.floor(100000 + Math.random() * 900000);
  const formattedOrderNumber = `FC2026-${randomSerial}`;

  const newRecord: DBOrder = {
    id: localId,
    order_number: orderData.order_number || formattedOrderNumber,
    consumer_name: orderData.consumer_name || 'Consumer',
    consumer_phone: orderData.consumer_phone || '+91 98480 12345',
    consumer_email: orderData.consumer_email || 'consumer@farmconnect.org',
    consumer_address: orderData.consumer_address || 'Guntur, Andhra Pradesh',
    village: orderData.village || 'Tenali',
    district: orderData.district || 'Guntur',
    state: orderData.state || 'Andhra Pradesh',
    pincode: orderData.pincode || '522201',
    landmark: orderData.landmark || 'Main Road',
    gps_location: orderData.gps_location || '16.2434° N, 80.6401° E',
    delivery_notes: orderData.delivery_notes || 'Handle organic produce carefully',
    delivery_time_preference: orderData.delivery_time_preference || 'Evening (4:00 PM - 7:00 PM)',
    farmer_id: orderData.farmer_id || 'f1',
    farmer_name: orderData.farmer_name || 'Venkat Rao',
    farmer_phone: orderData.farmer_phone || '+91 98490 55112',
    farmer_address: orderData.farmer_address || 'Tenali Farm Cluster, Guntur',
    driver_id: orderData.driver_id || '',
    driver_name: orderData.driver_name || '',
    driver_phone: orderData.driver_phone || '',
    vehicle_type: orderData.vehicle_type || logistics.vehicle.type,
    vehicle_number: orderData.vehicle_number || '',
    items: orderData.items || [],
    total_amount: orderData.total_amount || 0,
    delivery_fee: orderData.delivery_fee ?? logistics.totalDeliveryCost,
    status: orderData.status || 'pending',
    payment_method: orderData.payment_method || 'UPI',
    payment_status: orderData.payment_status || (orderData.payment_method === 'COD' ? 'pending' : 'paid'),
    payment_id: orderData.payment_id || `pay_Rzp_${Math.floor(100000 + Math.random() * 900000)}`,
    distance_km: distance,
    total_weight_kg: totalWeight,
    created_at: new Date().toISOString(),
    estimated_delivery: 'Today, 5:30 PM',
    tracking_steps: [
      { label: 'Order Placed & Paid', time: 'Just now', completed: true, active: true },
      { label: 'Farmer Accepted', time: 'Pending', completed: false },
      { label: 'Delivery Driver Assigned', time: 'Pending', completed: false },
      { label: 'Out for Doorstep Delivery', time: 'Pending', completed: false },
      { label: 'Delivered', time: 'Est Today 5:30 PM', completed: false },
    ],
  };

  if (!isSupabaseConfigured()) {
    const list = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY) || '[]');
    const updated = [newRecord, ...list];
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
    return newRecord;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([newRecord])
      .select()
      .single();

    if (error) {
      console.warn('Insert order notice:', error.message);
      const list = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY) || '[]');
      const updated = [newRecord, ...list];
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
      return newRecord;
    }

    return data;
  } catch (err) {
    console.error('Create order error:', err);
    const list = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY) || '[]');
    const updated = [newRecord, ...list];
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
    return newRecord;
  }
}

/**
 * Update Order status or details in Supabase
 */
export async function updateOrderInSupabase(orderId: string, updates: Partial<DBOrder>): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('orders').update(updates).eq('id', orderId);
    } catch (e) {
      console.warn('Update order warning:', e);
    }
  }

  const list: DBOrder[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY) || '[]');
  const updated = list.map(o => (o.id === orderId ? { ...o, ...updates } : o));
  localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
  return true;
}

/**
 * Subscribe to Supabase Realtime changes on `orders` table
 */
export function subscribeToOrdersRealtime(onOrderChange: () => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('realtime_orders_channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      () => {
        onOrderChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
