/**
 * FarmConnect Supabase Equipment Service
 * Full database, storage and realtime support for Buying, Selling & Renting agricultural equipment.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type EquipmentCategory =
  | 'Tractor'
  | 'Mini Tractor'
  | 'Harvester'
  | 'Rotavator'
  | 'Power Tiller'
  | 'Drone'
  | 'Sprayer'
  | 'Seed Drill'
  | 'Cultivator'
  | 'Plough'
  | 'Water Pump'
  | 'Pipe'
  | 'Generator'
  | 'Rice Transplanter'
  | 'Thresher'
  | 'Others';

export type EquipmentCondition = 'New' | 'Excellent' | 'Good' | 'Average' | 'Needs Repair';
export type FuelType = 'Electric' | 'Diesel' | 'Petrol' | 'Hybrid / Solar';

export interface DBEquipmentListing {
  id: string;
  equipment_name: string;
  equipment_category: EquipmentCategory;
  brand: string;
  model: string;
  year_of_purchase: number;
  condition: EquipmentCondition;
  horse_power: string;
  engine_type: string;
  fuel_type: FuelType;
  usage_hours: number;
  serial_number?: string;
  description: string;
  accessories_included: string[];
  warranty_available: boolean;
  original_bill_available: boolean;
  village: string;
  district: string;
  state: string;
  gps_location: string;
  owner_id: string;
  owner_name: string;
  mobile_number: string;
  whatsapp_number: string;
  email: string;
  selling_price: number;
  negotiable: boolean;
  rental_price_per_hour: number;
  rental_price_per_day: number;
  rental_price_per_week: number;
  security_deposit: number;
  availability_calendar: string[]; // e.g. ['2026-07-28', '2026-07-29']
  images: string[];
  videos: string[];
  status: 'Active' | 'Paused' | 'Sold' | 'Rented';
  listing_type: 'Buy/Sell' | 'Rent' | 'Both';
  owner_rating: number;
  reviews_count: number;
  created_at: string;
}

export interface DBEquipmentBooking {
  id: string;
  equipment_id: string;
  equipment_name: string;
  equipment_category: EquipmentCategory;
  equipment_image: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  booking_type: 'Rent' | 'Buy';
  start_date: string;
  end_date: string;
  delivery_required: boolean;
  pickup_required: boolean;
  operator_required: boolean;
  special_instructions: string;
  total_amount: number;
  security_deposit: number;
  payment_status: 'Pending' | 'Paid' | 'Refunded';
  status: 'Pending' | 'Accepted' | 'Ready' | 'In Use' | 'Returned' | 'Completed' | 'Rejected' | 'Cancelled';
  created_at: string;
}

export interface DBEquipmentChat {
  id: string;
  equipment_id: string;
  booking_id?: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  message_text: string;
  image_url?: string;
  voice_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface DBEquipmentRating {
  id: string;
  equipment_id: string;
  booking_id: string;
  rater_id: string;
  rater_name: string;
  rater_role: 'buyer' | 'seller';
  ratee_id: string;
  rating_score: number;
  feedback_text: string;
  created_at: string;
}

export interface DBEquipmentNotification {
  id: string;
  user_id: string;
  type: 'New Listing' | 'Booking Request' | 'Booking Accepted' | 'Booking Rejected' | 'Equipment Returned' | 'Payment Received';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

// Storage keys
const STORAGE_EQUIPMENT_KEY = 'farmconnect_supabase_equipment_listings';
const STORAGE_BOOKINGS_KEY = 'farmconnect_supabase_equipment_bookings';
const STORAGE_CHATS_KEY = 'farmconnect_supabase_equipment_chats';
const STORAGE_RATINGS_KEY = 'farmconnect_supabase_equipment_ratings';
const STORAGE_SAVED_KEY = 'farmconnect_supabase_equipment_saved';
const STORAGE_NOTIFICATIONS_KEY = 'farmconnect_supabase_equipment_notifications';

// Initial Seed Listings
const SEED_EQUIPMENT: DBEquipmentListing[] = [
  {
    id: 'eq-101',
    equipment_name: 'Mahindra 575 DI SP Plus Tractor',
    equipment_category: 'Tractor',
    brand: 'Mahindra',
    model: '575 DI SP Plus',
    year_of_purchase: 2023,
    condition: 'Excellent',
    horse_power: '50 HP',
    engine_type: '4-Cylinder mBoost Engine',
    fuel_type: 'Diesel',
    usage_hours: 420,
    serial_number: 'MAH-575-88291',
    description: 'Powerful 50 HP tractor suitable for heavy plowing, rotavator, and deep puddling in paddy fields. Comes with dual clutch and power steering.',
    accessories_included: ['36-Blade Heavy Rotavator', 'Bumper', 'Hook Hitch', 'Sun Canopy'],
    warranty_available: true,
    original_bill_available: true,
    village: 'Tenali Rural',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    gps_location: '16.2430° N, 80.6400° E',
    owner_id: 'usr-seller1',
    owner_name: 'Venkat Subba Rao',
    mobile_number: '+91 98481 99201',
    whatsapp_number: '+91 98481 99201',
    email: 'subbarao.farm@farmconnect.in',
    selling_price: 580000,
    negotiable: true,
    rental_price_per_hour: 850,
    rental_price_per_day: 5500,
    rental_price_per_week: 32000,
    security_deposit: 3000,
    availability_calendar: ['2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31'],
    images: [
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
    ],
    videos: [],
    status: 'Active',
    listing_type: 'Both',
    owner_rating: 4.9,
    reviews_count: 34,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'eq-102',
    equipment_name: 'Kubota DC-68G Combined Paddy Harvester',
    equipment_category: 'Harvester',
    brand: 'Kubota',
    model: 'DC-68G',
    year_of_purchase: 2024,
    condition: 'New',
    horse_power: '68 HP Diesel Engine',
    engine_type: 'Kubota V2403 Direct Injection',
    fuel_type: 'Diesel',
    usage_hours: 180,
    serial_number: 'KUB-DC68-11029',
    description: 'High efficiency paddy harvester. Track type rubber crawler works smoothly in muddy fields with grain loss < 1%.',
    accessories_included: ['1.5 Ton Grain Tank', 'Auto Grain Unloader', 'Extra Cutter Blades'],
    warranty_available: true,
    original_bill_available: true,
    village: 'Vijayawada Rural',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    gps_location: '16.5062° N, 80.6480° E',
    owner_id: 'usr-seller2',
    owner_name: 'Reddy Agro Machinery Co.',
    mobile_number: '+91 94400 11223',
    whatsapp_number: '+91 94400 11223',
    email: 'reddy.machinery@farmconnect.in',
    selling_price: 2450000,
    negotiable: false,
    rental_price_per_hour: 2400,
    rental_price_per_day: 18000,
    rental_price_per_week: 110000,
    security_deposit: 10000,
    availability_calendar: ['2026-07-28', '2026-07-29', '2026-07-30'],
    images: [
      'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80'
    ],
    videos: [],
    status: 'Active',
    listing_type: 'Both',
    owner_rating: 4.95,
    reviews_count: 52,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'eq-103',
    equipment_name: 'AgriFly 16L Spraying Drone with RTK GPS',
    equipment_category: 'Drone',
    brand: 'AgriFly Precision',
    model: 'T16 Pro',
    year_of_purchase: 2025,
    condition: 'New',
    horse_power: '16 Litre Tank / 12kW Power',
    engine_type: 'Brushless High Torque Electric Motors',
    fuel_type: 'Electric',
    usage_hours: 65,
    serial_number: 'AF-DRN-9021',
    description: 'Precision pesticide and nano-fertilizer drone spraying system. Sprays 10 acres per hour with millimeter obstacle avoidance.',
    accessories_included: ['4 Smart Batteries', 'Fast Charging Station', 'Certified Pilot Support', 'RTK Base Station'],
    warranty_available: true,
    original_bill_available: true,
    village: 'Mangalagiri',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    gps_location: '16.4300° N, 80.5500° E',
    owner_id: 'usr-seller3',
    owner_name: 'SmartAgri Tech Services',
    mobile_number: '+91 97001 88334',
    whatsapp_number: '+91 97001 88334',
    email: 'drones@smartagritech.in',
    selling_price: 650000,
    negotiable: true,
    rental_price_per_hour: 500,
    rental_price_per_day: 3500,
    rental_price_per_week: 20000,
    security_deposit: 2000,
    availability_calendar: ['2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31'],
    images: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
    ],
    videos: [],
    status: 'Active',
    listing_type: 'Both',
    owner_rating: 4.88,
    reviews_count: 19,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'eq-104',
    equipment_name: 'VST Shakti 130 DI Power Tiller (13 HP)',
    equipment_category: 'Power Tiller',
    brand: 'VST Shakti',
    model: '130 DI',
    year_of_purchase: 2022,
    condition: 'Good',
    horse_power: '13 HP',
    engine_type: 'Single Cylinder Water Cooled Diesel',
    fuel_type: 'Diesel',
    usage_hours: 610,
    description: 'Compact rotary tiller for chili, cotton, and vegetable inter-crop cultivation. Highly fuel efficient.',
    accessories_included: ['Rotary Rotavator Unit', 'Steel Cage Wheels', 'Plough Attachment'],
    warranty_available: false,
    original_bill_available: true,
    village: 'Prathipadu',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    gps_location: '16.1800° N, 80.3200° E',
    owner_id: 'usr-seller4',
    owner_name: 'Koteswara Rao',
    mobile_number: '+91 98662 44110',
    whatsapp_number: '+91 98662 44110',
    email: 'koteswara@farmconnect.in',
    selling_price: 135000,
    negotiable: true,
    rental_price_per_hour: 450,
    rental_price_per_day: 2800,
    rental_price_per_week: 16000,
    security_deposit: 1500,
    availability_calendar: ['2026-07-28', '2026-07-29'],
    images: [
      'https://images.unsplash.com/photo-1530267981601-071323c4b121?auto=format&fit=crop&w=800&q=80'
    ],
    videos: [],
    status: 'Active',
    listing_type: 'Both',
    owner_rating: 4.75,
    reviews_count: 12,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  }
];

// Initial Seed Bookings
const SEED_BOOKINGS: DBEquipmentBooking[] = [
  {
    id: 'bk-1001',
    equipment_id: 'eq-101',
    equipment_name: 'Mahindra 575 DI SP Plus Tractor',
    equipment_category: 'Tractor',
    equipment_image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    buyer_id: 'usr-farmer1',
    buyer_name: 'Suresh Kumar',
    buyer_phone: '+91 98480 12345',
    seller_id: 'usr-seller1',
    seller_name: 'Venkat Subba Rao',
    seller_phone: '+91 98481 99201',
    booking_type: 'Rent',
    start_date: '2026-07-28',
    end_date: '2026-07-29',
    delivery_required: true,
    pickup_required: true,
    operator_required: true,
    special_instructions: 'Need deep plowing on 4 acres paddy field near Tenali canal.',
    total_amount: 11000,
    security_deposit: 3000,
    payment_status: 'Paid',
    status: 'Accepted',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  }
];

// Initial Seed Chats
const SEED_CHATS: DBEquipmentChat[] = [
  {
    id: 'eq-msg-1',
    equipment_id: 'eq-101',
    booking_id: 'bk-1001',
    sender_id: 'usr-farmer1',
    sender_name: 'Suresh Kumar',
    receiver_id: 'usr-seller1',
    message_text: 'Namaste Subba Rao garu, is the tractor ready with driver for tomorrow morning 6 AM?',
    is_read: true,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'eq-msg-2',
    equipment_id: 'eq-101',
    booking_id: 'bk-1001',
    sender_id: 'usr-seller1',
    sender_name: 'Venkat Subba Rao',
    receiver_id: 'usr-farmer1',
    message_text: 'Yes Suresh garu, driver Ramesh will reach your field with trailer at 5:45 AM.',
    is_read: true,
    created_at: new Date(Date.now() - 900000).toISOString(),
  }
];

// Helper to push notification
export function addEquipmentNotification(
  userId: string,
  type: DBEquipmentNotification['type'],
  title: string,
  message: string
) {
  const notifs: DBEquipmentNotification[] = JSON.parse(
    localStorage.getItem(STORAGE_NOTIFICATIONS_KEY) || '[]'
  );
  const newNotif: DBEquipmentNotification = {
    id: `notif-${Date.now()}`,
    user_id: userId,
    type,
    title,
    message,
    read: false,
    created_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify([newNotif, ...notifs]));
}

export function getEquipmentNotifications(userId: string): DBEquipmentNotification[] {
  const notifs: DBEquipmentNotification[] = JSON.parse(
    localStorage.getItem(STORAGE_NOTIFICATIONS_KEY) || '[]'
  );
  return notifs.filter((n) => n.user_id === userId || n.user_id === 'all');
}

/**
 * FETCH ALL EQUIPMENT LISTINGS FROM SUPABASE
 */
export async function fetchEquipmentListings(): Promise<DBEquipmentListing[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(STORAGE_EQUIPMENT_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return SEED_EQUIPMENT;
  }

  try {
    const { data, error } = await supabase
      .from('equipment_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (data && data.length === 0) {
        // Seed initial equipment to Supabase
        for (const item of SEED_EQUIPMENT) {
          await supabase.from('equipment_listings').insert([item]);
        }
        const { data: fresh } = await supabase
          .from('equipment_listings')
          .select('*')
          .order('created_at', { ascending: false });
        if (fresh && fresh.length > 0) return fresh;
      }
      const stored = localStorage.getItem(STORAGE_EQUIPMENT_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
      return SEED_EQUIPMENT;
    }

    localStorage.setItem(STORAGE_EQUIPMENT_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Fetch equipment exception, returning cached or seed:', err);
    const stored = localStorage.getItem(STORAGE_EQUIPMENT_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return SEED_EQUIPMENT;
  }
}

/**
 * CREATE / POST EQUIPMENT LISTING IN SUPABASE
 */
export async function postEquipmentListing(
  listing: Partial<DBEquipmentListing>
): Promise<DBEquipmentListing> {
  const newListing: DBEquipmentListing = {
    id: `eq-${Date.now()}`,
    equipment_name: listing.equipment_name || 'Farm Equipment',
    equipment_category: listing.equipment_category || 'Tractor',
    brand: listing.brand || 'Generic',
    model: listing.model || 'Standard',
    year_of_purchase: listing.year_of_purchase || 2024,
    condition: listing.condition || 'Excellent',
    horse_power: listing.horse_power || '45 HP',
    engine_type: listing.engine_type || 'Diesel Engine',
    fuel_type: listing.fuel_type || 'Diesel',
    usage_hours: listing.usage_hours || 100,
    serial_number: listing.serial_number || '',
    description: listing.description || 'Quality agricultural machinery ready for use.',
    accessories_included: listing.accessories_included || [],
    warranty_available: listing.warranty_available ?? true,
    original_bill_available: listing.original_bill_available ?? true,
    village: listing.village || 'Tenali',
    district: listing.district || 'Guntur',
    state: listing.state || 'Andhra Pradesh',
    gps_location: listing.gps_location || '16.2430° N, 80.6400° E',
    owner_id: listing.owner_id || 'usr-me',
    owner_name: listing.owner_name || 'Farmer Owner',
    mobile_number: listing.mobile_number || '+91 98480 12345',
    whatsapp_number: listing.whatsapp_number || listing.mobile_number || '+91 98480 12345',
    email: listing.email || 'farmer@farmconnect.in',
    selling_price: listing.selling_price || 0,
    negotiable: listing.negotiable ?? true,
    rental_price_per_hour: listing.rental_price_per_hour || 0,
    rental_price_per_day: listing.rental_price_per_day || 0,
    rental_price_per_week: listing.rental_price_per_week || 0,
    security_deposit: listing.security_deposit || 1000,
    availability_calendar: listing.availability_calendar || ['Available Daily'],
    images:
      listing.images && listing.images.length > 0
        ? listing.images
        : ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'],
    videos: listing.videos || [],
    status: 'Active',
    listing_type: listing.listing_type || 'Both',
    owner_rating: 5.0,
    reviews_count: 1,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const list: DBEquipmentListing[] = JSON.parse(
      localStorage.getItem(STORAGE_EQUIPMENT_KEY) || '[]'
    );
    const updated = [newListing, ...list];
    localStorage.setItem(STORAGE_EQUIPMENT_KEY, JSON.stringify(updated));

    addEquipmentNotification(
      'all',
      'New Listing',
      `New Equipment Listed: ${newListing.equipment_name}`,
      `${newListing.brand} ${newListing.model} available in ${newListing.village}, ${newListing.district}`
    );

    return newListing;
  }

  try {
    const { data, error } = await supabase
      .from('equipment_listings')
      .insert([newListing])
      .select()
      .single();

    if (error) {
      console.warn('Insert equipment listing notice:', error.message);
      const list: DBEquipmentListing[] = JSON.parse(
        localStorage.getItem(STORAGE_EQUIPMENT_KEY) || '[]'
      );
      const updated = [newListing, ...list];
      localStorage.setItem(STORAGE_EQUIPMENT_KEY, JSON.stringify(updated));
      return newListing;
    }

    addEquipmentNotification(
      'all',
      'New Listing',
      `New Equipment Listed: ${newListing.equipment_name}`,
      `${newListing.brand} ${newListing.model} available in ${newListing.village}`
    );

    return data;
  } catch (err) {
    console.error('Post equipment listing error:', err);
    const list: DBEquipmentListing[] = JSON.parse(
      localStorage.getItem(STORAGE_EQUIPMENT_KEY) || '[]'
    );
    const updated = [newListing, ...list];
    localStorage.setItem(STORAGE_EQUIPMENT_KEY, JSON.stringify(updated));
    return newListing;
  }
}

/**
 * UPDATE EQUIPMENT LISTING
 */
export async function updateEquipmentListing(
  equipmentId: string,
  updates: Partial<DBEquipmentListing>
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('equipment_listings').update(updates).eq('id', equipmentId);
    } catch (e) {
      console.warn('Update equipment listing warning:', e);
    }
  }

  const list: DBEquipmentListing[] = JSON.parse(
    localStorage.getItem(STORAGE_EQUIPMENT_KEY) || '[]'
  );
  const updated = list.map((item) => (item.id === equipmentId ? { ...item, ...updates } : item));
  localStorage.setItem(STORAGE_EQUIPMENT_KEY, JSON.stringify(updated));
  return true;
}

/**
 * DELETE EQUIPMENT LISTING
 */
export async function deleteEquipmentListing(equipmentId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('equipment_listings').delete().eq('id', equipmentId);
    } catch (e) {
      console.warn('Delete equipment listing warning:', e);
    }
  }

  const list: DBEquipmentListing[] = JSON.parse(
    localStorage.getItem(STORAGE_EQUIPMENT_KEY) || '[]'
  );
  const updated = list.filter((item) => item.id !== equipmentId);
  localStorage.setItem(STORAGE_EQUIPMENT_KEY, JSON.stringify(updated));
  return true;
}

/**
 * FETCH BOOKINGS FROM SUPABASE
 */
export async function fetchEquipmentBookings(): Promise<DBEquipmentBooking[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return SEED_BOOKINGS;
  }

  try {
    const { data, error } = await supabase
      .from('equipment_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      const stored = localStorage.getItem(STORAGE_BOOKINGS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
      return SEED_BOOKINGS;
    }

    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(data));
    return data;
  } catch {
    const stored = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
    return SEED_BOOKINGS;
  }
}

/**
 * CREATE BOOKING IN SUPABASE
 */
export async function createEquipmentBooking(
  bookingData: Partial<DBEquipmentBooking>
): Promise<DBEquipmentBooking> {
  const newBooking: DBEquipmentBooking = {
    id: `bk-${Date.now()}`,
    equipment_id: bookingData.equipment_id || 'eq-101',
    equipment_name: bookingData.equipment_name || 'Tractor',
    equipment_category: bookingData.equipment_category || 'Tractor',
    equipment_image:
      bookingData.equipment_image ||
      'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    buyer_id: bookingData.buyer_id || 'usr-buyer',
    buyer_name: bookingData.buyer_name || 'Farmer Buyer',
    buyer_phone: bookingData.buyer_phone || '+91 98480 12345',
    seller_id: bookingData.seller_id || 'usr-seller',
    seller_name: bookingData.seller_name || 'Equipment Owner',
    seller_phone: bookingData.seller_phone || '+91 98481 99201',
    booking_type: bookingData.booking_type || 'Rent',
    start_date: bookingData.start_date || 'Tomorrow',
    end_date: bookingData.end_date || 'In 2 Days',
    delivery_required: bookingData.delivery_required ?? true,
    pickup_required: bookingData.pickup_required ?? true,
    operator_required: bookingData.operator_required ?? true,
    special_instructions: bookingData.special_instructions || '',
    total_amount: bookingData.total_amount || 2500,
    security_deposit: bookingData.security_deposit || 1000,
    payment_status: 'Paid',
    status: 'Pending',
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const list: DBEquipmentBooking[] = JSON.parse(
      localStorage.getItem(STORAGE_BOOKINGS_KEY) || '[]'
    );
    const updated = [newBooking, ...list];
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));

    addEquipmentNotification(
      newBooking.seller_id,
      'Booking Request',
      `New Rental Request for ${newBooking.equipment_name}`,
      `${newBooking.buyer_name} requested booking from ${newBooking.start_date} to ${newBooking.end_date}.`
    );

    return newBooking;
  }

  try {
    const { data, error } = await supabase
      .from('equipment_bookings')
      .insert([newBooking])
      .select()
      .single();

    if (error) {
      const list: DBEquipmentBooking[] = JSON.parse(
        localStorage.getItem(STORAGE_BOOKINGS_KEY) || '[]'
      );
      const updated = [newBooking, ...list];
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
      return newBooking;
    }

    addEquipmentNotification(
      newBooking.seller_id,
      'Booking Request',
      `New Rental Request for ${newBooking.equipment_name}`,
      `${newBooking.buyer_name} requested booking from ${newBooking.start_date} to ${newBooking.end_date}.`
    );

    return data;
  } catch {
    const list: DBEquipmentBooking[] = JSON.parse(
      localStorage.getItem(STORAGE_BOOKINGS_KEY) || '[]'
    );
    const updated = [newBooking, ...list];
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
    return newBooking;
  }
}

/**
 * UPDATE BOOKING STATUS (Accepted, Rejected, Ready, In Use, Returned, Completed, Cancelled)
 */
export async function updateEquipmentBookingStatus(
  bookingId: string,
  status: DBEquipmentBooking['status']
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('equipment_bookings').update({ status }).eq('id', bookingId);
    } catch (e) {
      console.warn('Update booking status warning:', e);
    }
  }

  const list: DBEquipmentBooking[] = JSON.parse(
    localStorage.getItem(STORAGE_BOOKINGS_KEY) || '[]'
  );
  let updatedBooking: DBEquipmentBooking | undefined;

  const updated = list.map((bk) => {
    if (bk.id === bookingId) {
      updatedBooking = { ...bk, status };
      return updatedBooking;
    }
    return bk;
  });

  localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));

  if (updatedBooking) {
    if (status === 'Accepted') {
      addEquipmentNotification(
        updatedBooking.buyer_id,
        'Booking Accepted',
        `Booking Approved for ${updatedBooking.equipment_name}`,
        `Owner ${updatedBooking.seller_name} accepted your request. Dispatch is ready!`
      );
    } else if (status === 'Rejected') {
      addEquipmentNotification(
        updatedBooking.buyer_id,
        'Booking Rejected',
        `Booking Declined for ${updatedBooking.equipment_name}`,
        `Owner ${updatedBooking.seller_name} declined the request for dates ${updatedBooking.start_date}.`
      );
    } else if (status === 'Returned' || status === 'Completed') {
      addEquipmentNotification(
        updatedBooking.buyer_id,
        'Equipment Returned',
        `Equipment ${updatedBooking.equipment_name} Marked Completed`,
        `Thank you! Security deposit of ₹${updatedBooking.security_deposit} has been released.`
      );
    }
  }

  return true;
}

/**
 * CHAT MESSAGES IN SUPABASE
 */
export async function fetchEquipmentChats(equipmentId: string): Promise<DBEquipmentChat[]> {
  if (!isSupabaseConfigured()) {
    const stored: DBEquipmentChat[] = JSON.parse(
      localStorage.getItem(STORAGE_CHATS_KEY) || '[]'
    );
    const filtered = stored.filter((m) => m.equipment_id === equipmentId);
    if (filtered.length > 0) return filtered;
    return SEED_CHATS.filter((m) => m.equipment_id === equipmentId);
  }

  try {
    const { data, error } = await supabase
      .from('equipment_chats')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      const stored: DBEquipmentChat[] = JSON.parse(
        localStorage.getItem(STORAGE_CHATS_KEY) || '[]'
      );
      return stored.filter((m) => m.equipment_id === equipmentId);
    }

    return data;
  } catch {
    const stored: DBEquipmentChat[] = JSON.parse(
      localStorage.getItem(STORAGE_CHATS_KEY) || '[]'
    );
    return stored.filter((m) => m.equipment_id === equipmentId);
  }
}

export async function sendEquipmentChatMessage(
  msg: Partial<DBEquipmentChat>
): Promise<DBEquipmentChat> {
  const newMsg: DBEquipmentChat = {
    id: `eq-msg-${Date.now()}`,
    equipment_id: msg.equipment_id || 'eq-101',
    booking_id: msg.booking_id,
    sender_id: msg.sender_id || 'usr-1',
    sender_name: msg.sender_name || 'User',
    receiver_id: msg.receiver_id || 'usr-2',
    message_text: msg.message_text || '',
    image_url: msg.image_url,
    voice_url: msg.voice_url,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const list: DBEquipmentChat[] = JSON.parse(
      localStorage.getItem(STORAGE_CHATS_KEY) || '[]'
    );
    const updated = [...list, newMsg];
    localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(updated));
    return newMsg;
  }

  try {
    const { data, error } = await supabase
      .from('equipment_chats')
      .insert([newMsg])
      .select()
      .single();

    if (error) {
      const list: DBEquipmentChat[] = JSON.parse(
        localStorage.getItem(STORAGE_CHATS_KEY) || '[]'
      );
      const updated = [...list, newMsg];
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(updated));
      return newMsg;
    }

    return data;
  } catch {
    const list: DBEquipmentChat[] = JSON.parse(
      localStorage.getItem(STORAGE_CHATS_KEY) || '[]'
    );
    const updated = [...list, newMsg];
    localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(updated));
    return newMsg;
  }
}

/**
 * RATINGS IN SUPABASE
 */
export async function submitEquipmentRating(
  rating: Partial<DBEquipmentRating>
): Promise<DBEquipmentRating> {
  const newRating: DBEquipmentRating = {
    id: `rate-${Date.now()}`,
    equipment_id: rating.equipment_id || 'eq-101',
    booking_id: rating.booking_id || 'bk-1001',
    rater_id: rating.rater_id || 'usr-1',
    rater_name: rating.rater_name || 'Reviewer',
    rater_role: rating.rater_role || 'buyer',
    ratee_id: rating.ratee_id || 'usr-2',
    rating_score: rating.rating_score || 5,
    feedback_text: rating.feedback_text || 'Very satisfied with the equipment performance!',
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const list: DBEquipmentRating[] = JSON.parse(
      localStorage.getItem(STORAGE_RATINGS_KEY) || '[]'
    );
    const updated = [newRating, ...list];
    localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(updated));
    return newRating;
  }

  try {
    const { data, error } = await supabase
      .from('equipment_ratings')
      .insert([newRating])
      .select()
      .single();

    if (error) {
      const list: DBEquipmentRating[] = JSON.parse(
        localStorage.getItem(STORAGE_RATINGS_KEY) || '[]'
      );
      const updated = [newRating, ...list];
      localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(updated));
      return newRating;
    }

    return data;
  } catch {
    const list: DBEquipmentRating[] = JSON.parse(
      localStorage.getItem(STORAGE_RATINGS_KEY) || '[]'
    );
    const updated = [newRating, ...list];
    localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(updated));
    return newRating;
  }
}

/**
 * SAVED EQUIPMENT IN LOCAL STORAGE
 */
export function getSavedEquipmentIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SAVED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleSavedEquipment(equipmentId: string): string[] {
  const saved = getSavedEquipmentIds();
  const exists = saved.includes(equipmentId);
  let updated: string[];
  if (exists) {
    updated = saved.filter((id) => id !== equipmentId);
  } else {
    updated = [...saved, equipmentId];
  }
  localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * SUPABASE REALTIME SUBSCRIPTION FOR EQUIPMENT MARKETPLACE
 */
export function subscribeToEquipmentRealtime(onChange: () => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('realtime_equipment_marketplace')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_listings' }, () =>
      onChange()
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_bookings' }, () =>
      onChange()
    )
    .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment_chats' }, () =>
      onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
