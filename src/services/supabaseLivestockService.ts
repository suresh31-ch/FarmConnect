/**
 * FarmConnect Supabase Livestock Marketplace Service
 * Complete Buy / Sell / Rent database, storage and realtime support for livestock.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type LivestockCategory =
  | 'Cow'
  | 'Buffalo'
  | 'Goat'
  | 'Sheep'
  | 'Poultry'
  | 'Hen'
  | 'Duck'
  | 'Fish Farming'
  | 'Pig'
  | 'Horse'
  | 'Rabbit'
  | 'Pet Animal';

export type LivestockGender = 'Male' | 'Female' | 'Pair' | 'Flock / Batch';
export type ListingPurpose = 'Sale' | 'Rent' | 'Both';
export type HealthStatus = 'Healthy & Active' | 'Vet Certified & Vaccinated' | 'Under Treatment / Care';

export interface DBLivestockListing {
  id: string;
  animal_name: string;
  animal_type: LivestockCategory;
  breed: string;
  age_years: number;
  gender: LivestockGender;
  weight_kg: number;
  height_cm?: number;
  milk_yield_liters_per_day?: number;
  health_status: HealthStatus;
  vaccination_history: string;
  medical_records: string;
  pregnancy_status?: string;
  feed_details: string;
  purpose: ListingPurpose;
  price: number;
  rental_price_per_day?: number;
  negotiable: boolean;
  village: string;
  district: string;
  state: string;
  gps_location?: string;
  owner_id: string;
  owner_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  description: string;
  images: string[];
  videos: string[];
  is_approved: boolean;
  is_reported?: boolean;
  status: 'Active' | 'Sold' | 'Rented' | 'Paused';
  owner_rating: number;
  reviews_count: number;
  created_at: string;
}

export interface DBLivestockBooking {
  id: string;
  livestock_id: string;
  animal_name: string;
  animal_type: LivestockCategory;
  animal_image: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  booking_type: 'Buy' | 'Rent';
  start_date?: string;
  end_date?: string;
  total_amount: number;
  delivery_required: boolean;
  special_notes?: string;
  payment_status: 'Pending' | 'Paid' | 'Refunded';
  status: 'Pending' | 'Accepted' | 'In Transit' | 'Completed' | 'Rejected' | 'Cancelled';
  created_at: string;
}

export interface DBLivestockRating {
  id: string;
  booking_id: string;
  livestock_id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  rating_role: 'buyer_to_seller' | 'seller_to_buyer';
  stars: number;
  comment: string;
  created_at: string;
}

const LOCAL_STORAGE_LIVESTOCK_KEY = 'farmconnect_livestock_listings_v2';
const LOCAL_STORAGE_BOOKINGS_KEY = 'farmconnect_livestock_bookings_v2';
const LOCAL_STORAGE_RATINGS_KEY = 'farmconnect_livestock_ratings_v2';

export const INITIAL_MOCK_LIVESTOCK: DBLivestockListing[] = [
  {
    id: 'ls-101',
    animal_name: 'Ganga - Ongole Pure Native Breed Cow',
    animal_type: 'Cow',
    breed: 'Ongole Native',
    age_years: 3.5,
    gender: 'Female',
    weight_kg: 440,
    height_cm: 142,
    milk_yield_liters_per_day: 14,
    health_status: 'Vet Certified & Vaccinated',
    vaccination_history: 'FMD, Brucellosis & HS Vaccinated (Updated June 2026)',
    medical_records: 'District Vet Health Pass #AP-VET-9021. No genetic flaws.',
    pregnancy_status: 'Lactating (2nd Calving, 3 months ago)',
    feed_details: 'Green Napier grass, Maize silage, Mustard cake & Mineral mixture.',
    purpose: 'Sale',
    price: 68000,
    negotiable: true,
    village: 'Tenali Rural',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    gps_location: '16.2434° N, 80.6401° E',
    owner_id: 'f1',
    owner_name: 'Murali Krishna',
    phone: '+91 98481 22930',
    whatsapp: '+91 98481 22930',
    email: 'murali.guntur@farmconnect.org',
    description: 'A2 Milk fat 4.8%. Extremely docile temperament, grazing in organic riverbed pastures.',
    images: ['https://images.unsplash.com/photo-1570042707223-28f09b23b1bf?auto=format&fit=crop&w=800&q=80'],
    videos: [],
    is_approved: true,
    status: 'Active',
    owner_rating: 4.9,
    reviews_count: 18,
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 'ls-102',
    animal_name: 'Lakshmi - Murrah Grade High Yield Buffalo',
    animal_type: 'Buffalo',
    breed: 'Murrah Buffalo',
    age_years: 4.2,
    gender: 'Female',
    weight_kg: 580,
    height_cm: 150,
    milk_yield_liters_per_day: 18,
    health_status: 'Vet Certified & Vaccinated',
    vaccination_history: 'Annual Black Quarter & FMD Vaccinated',
    medical_records: 'Regular milk testing reports available. Fat content 7.2%.',
    pregnancy_status: '3 Months Pregnant (Artificially Inseminated)',
    feed_details: 'Cottonseed cake, Wheat bran & Fresh green fodder.',
    purpose: 'Both',
    price: 88000,
    rental_price_per_day: 1200,
    negotiable: true,
    village: 'Prathipadu',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    owner_id: 'f2',
    owner_name: 'Sri Ram Dairy Farm',
    phone: '+91 94401 88200',
    whatsapp: '+91 94401 88200',
    email: 'sriram.dairy@farmconnect.org',
    description: 'High commercial value buffalo for commercial dairies. Robust health with high fat milk.',
    images: ['https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80'],
    videos: [],
    is_approved: true,
    status: 'Active',
    owner_rating: 4.8,
    reviews_count: 24,
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'ls-103',
    animal_name: 'Nellore Brown Heavy Breeding Rams (Pair)',
    animal_type: 'Sheep',
    breed: 'Nellore Brown',
    age_years: 1.8,
    gender: 'Pair',
    weight_kg: 72,
    health_status: 'Healthy & Active',
    vaccination_history: 'PPR & Enterotoxemia Vaccinated',
    medical_records: 'Dewormed monthly. Fast meat gain ratio.',
    pregnancy_status: 'N/A',
    feed_details: 'Stall-fed Subabul leaves, Groundnut haulms and Concentrate feed.',
    purpose: 'Sale',
    price: 26000,
    negotiable: false,
    village: 'Mangalagiri',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    owner_id: 'f3',
    owner_name: 'Venkateswarlu',
    phone: '+91 98663 11882',
    whatsapp: '+91 98663 11882',
    email: 'venkat.sheep@farmconnect.org',
    description: 'Heavy muscle structure. Excellent for flock breeding expansion in dry zones.',
    images: ['https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80'],
    videos: [],
    is_approved: true,
    status: 'Active',
    owner_rating: 4.7,
    reviews_count: 12,
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: 'ls-104',
    animal_name: 'Kadaknath Pure Black Country Hen Flock (50 Birds)',
    animal_type: 'Hen',
    breed: 'Kadaknath Organic',
    age_years: 0.6,
    gender: 'Flock / Batch',
    weight_kg: 1.8,
    health_status: 'Vet Certified & Vaccinated',
    vaccination_history: 'Ranikhet & Marek Disease Vaccinated',
    medical_records: 'High protein, medicinal value black meat poultry flock.',
    pregnancy_status: 'Active Egg Laying Phase',
    feed_details: 'Free-range organic kitchen waste, broken maize & azolla.',
    purpose: 'Sale',
    price: 35000,
    negotiable: true,
    village: 'Pedakakani',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    owner_id: 'f4',
    owner_name: 'Krishna Poultry Farms',
    phone: '+91 97012 44901',
    whatsapp: '+91 97012 44901',
    email: 'krishna.poultry@farmconnect.org',
    description: '50 healthy 6-month-old Kadaknath birds ready for organic egg laying or meat distribution.',
    images: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80'],
    videos: [],
    is_approved: true,
    status: 'Active',
    owner_rating: 4.9,
    reviews_count: 30,
    created_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
  },
  {
    id: 'ls-105',
    animal_name: 'Telangana Jamunapari High Yield Milk Goat',
    animal_type: 'Goat',
    breed: 'Jamunapari',
    age_years: 2.1,
    gender: 'Female',
    weight_kg: 48,
    milk_yield_liters_per_day: 3.2,
    health_status: 'Vet Certified & Vaccinated',
    vaccination_history: 'PPR Vaccinated',
    medical_records: 'Dewormed quarterly.',
    pregnancy_status: 'Not Pregnant',
    feed_details: 'Tree fodder, neem leaves & dry fodder.',
    purpose: 'Both',
    price: 19500,
    rental_price_per_day: 350,
    negotiable: true,
    village: 'Amaravati',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    owner_id: 'f5',
    owner_name: 'Satyanarayana',
    phone: '+91 98492 11029',
    whatsapp: '+91 98492 11029',
    email: 'satya.goats@farmconnect.org',
    description: 'Tall, majestic Jamunapari doe yielding 3+ liters milk daily. Ideal for home dairy.',
    images: ['https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=800&q=80'],
    videos: [],
    is_approved: true,
    status: 'Active',
    owner_rating: 4.6,
    reviews_count: 9,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'ls-106',
    animal_name: 'Rohu & Catla High Density Fish Seed Fingerlings (10,000 Count)',
    animal_type: 'Fish Farming',
    breed: 'Rohu & Catla IMC',
    age_years: 0.2,
    gender: 'Flock / Batch',
    weight_kg: 0.05,
    health_status: 'Healthy & Active',
    vaccination_history: 'Probiotic treated & disease resistance bath given',
    medical_records: 'Guntur Aqua Labs Certified Fingerlings',
    pregnancy_status: 'N/A',
    feed_details: 'Floating nursery pelleted feed (32% Protein).',
    purpose: 'Sale',
    price: 42000,
    negotiable: true,
    village: 'Kolluru',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    owner_id: 'f6',
    owner_name: 'Andhra Inland Aqua Hatchery',
    phone: '+91 99890 33412',
    whatsapp: '+91 99890 33412',
    email: 'aqua.hatchery@farmconnect.org',
    description: '10,000 count 3-inch fingerlings. Fast growth rate in freshwater farm ponds.',
    images: ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=800&q=80'],
    videos: [],
    is_approved: true,
    status: 'Active',
    owner_rating: 5.0,
    reviews_count: 42,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

/**
 * Fetch all livestock listings from Supabase or Local Storage
 */
export async function fetchLivestockListings(): Promise<DBLivestockListing[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('livestock_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as DBLivestockListing[];
      }
    } catch (err) {
      console.warn('Supabase fetch livestock listings notice:', err);
    }
  }

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_LIVESTOCK_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn('LocalStorage livestock parse warning:', err);
  }

  localStorage.setItem(LOCAL_STORAGE_LIVESTOCK_KEY, JSON.stringify(INITIAL_MOCK_LIVESTOCK));
  return INITIAL_MOCK_LIVESTOCK;
}

/**
 * Create a new livestock listing in Supabase & LocalStorage
 */
export async function createLivestockListing(
  listing: Omit<DBLivestockListing, 'id' | 'created_at' | 'owner_rating' | 'reviews_count' | 'is_approved'>
): Promise<DBLivestockListing> {
  const newListing: DBLivestockListing = {
    ...listing,
    id: `ls-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
    owner_rating: 5.0,
    reviews_count: 1,
    is_approved: true,
  };

  // Local Storage
  try {
    const existing = await fetchLivestockListings();
    const updated = [newListing, ...existing];
    localStorage.setItem(LOCAL_STORAGE_LIVESTOCK_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage write warning:', err);
  }

  // Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('livestock_listings').insert([newListing]);
    } catch (err) {
      console.warn('Supabase create livestock notice:', err);
    }
  }

  return newListing;
}

/**
 * Update an existing livestock listing status or admin approval
 */
export async function updateLivestockListingStatus(
  id: string,
  updates: Partial<DBLivestockListing>
): Promise<void> {
  try {
    const existing = await fetchLivestockListings();
    const updated = existing.map((item) => (item.id === id ? { ...item, ...updates } : item));
    localStorage.setItem(LOCAL_STORAGE_LIVESTOCK_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage update warning:', err);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('livestock_listings').update(updates).eq('id', id);
    } catch (err) {
      console.warn('Supabase update livestock notice:', err);
    }
  }
}

/**
 * Upload image/video media to Supabase Storage or Base64 fallback
 */
export async function uploadLivestockMediaToSupabase(file: File): Promise<string> {
  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `livestock_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `livestock/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('livestock-media')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('livestock-media')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Supabase livestock media upload error, fallback to data URL:', err);
    }
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

/**
 * Create a Livestock Booking Request (Buy or Rent)
 */
export async function createLivestockBooking(
  booking: Omit<DBLivestockBooking, 'id' | 'created_at' | 'status' | 'payment_status'>
): Promise<DBLivestockBooking> {
  const newBooking: DBLivestockBooking = {
    ...booking,
    id: `ls-bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'Pending',
    payment_status: 'Paid',
    created_at: new Date().toISOString(),
  };

  // Local Storage
  try {
    const existing: DBLivestockBooking[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY) || '[]'
    );
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify([newBooking, ...existing]));
  } catch (err) {
    console.warn('LocalStorage booking save error:', err);
  }

  // Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('livestock_bookings').insert([newBooking]);
    } catch (err) {
      console.warn('Supabase booking insert notice:', err);
    }
  }

  return newBooking;
}

/**
 * Fetch livestock bookings for buyer or seller
 */
export async function fetchLivestockBookings(userId?: string): Promise<DBLivestockBooking[]> {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('livestock_bookings').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as DBLivestockBooking[];
      }
    } catch (err) {
      console.warn('Supabase fetch bookings error:', err);
    }
  }

  try {
    const cached: DBLivestockBooking[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_BOOKINGS_KEY) || '[]'
    );
    if (userId) {
      return cached.filter((b) => b.buyer_id === userId || b.seller_id === userId);
    }
    return cached;
  } catch {
    return [];
  }
}

/**
 * Update Booking Status (Accept / Reject / Complete)
 */
export async function updateLivestockBookingStatus(
  bookingId: string,
  status: DBLivestockBooking['status']
): Promise<void> {
  try {
    const bookings = await fetchLivestockBookings();
    const updated = bookings.map((b) => (b.id === bookingId ? { ...b, status } : b));
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('LocalStorage update booking status error:', err);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('livestock_bookings').update({ status }).eq('id', bookingId);
    } catch (err) {
      console.warn('Supabase update booking notice:', err);
    }
  }
}

/**
 * Submit Mutual Rating (Buyer <-> Seller)
 */
export async function submitLivestockRating(
  rating: Omit<DBLivestockRating, 'id' | 'created_at'>
): Promise<DBLivestockRating> {
  const newRating: DBLivestockRating = {
    ...rating,
    id: `ls-rt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    created_at: new Date().toISOString(),
  };

  try {
    const existing: DBLivestockRating[] = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_RATINGS_KEY) || '[]'
    );
    localStorage.setItem(LOCAL_STORAGE_RATINGS_KEY, JSON.stringify([newRating, ...existing]));
  } catch (err) {
    console.warn('LocalStorage rating save error:', err);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('livestock_ratings').insert([newRating]);
    } catch (err) {
      console.warn('Supabase rating insert notice:', err);
    }
  }

  return newRating;
}

/**
 * Fetch Ratings
 */
export async function fetchLivestockRatings(): Promise<DBLivestockRating[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('livestock_ratings').select('*');
      if (!error && data && data.length > 0) {
        return data as DBLivestockRating[];
      }
    } catch (err) {
      console.warn('Supabase fetch ratings notice:', err);
    }
  }

  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_RATINGS_KEY) || '[]');
  } catch {
    return [];
  }
}
