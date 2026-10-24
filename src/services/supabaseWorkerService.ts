/**
 * Real Supabase Worker & Job Marketplace Service
 * Manages job posts, worker profiles, job applications, chat messages, and ratings in Supabase.
 * Integrates Supabase Realtime subscriptions for instant job notifications & live chat.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface DBJobPost {
  id: string;
  title: string;
  crop_type: string;
  work_category: string;
  description: string;
  workers_required: number;
  gender_preference: 'Male' | 'Female' | 'Any';
  min_age: number;
  max_age: number;
  experience_required: string;
  skills_required: string[];
  education_optional?: string;
  daily_wage: number;
  monthly_salary?: number;
  hourly_wage?: number;
  food_provided: boolean;
  accommodation_provided: boolean;
  transport_provided: boolean;
  working_hours: string;
  start_date: string;
  end_date: string;
  village: string;
  district: string;
  state: string;
  gps_location: string;
  contact_person: string;
  mobile_number: string;
  alt_number?: string;
  whatsapp_number: string;
  email?: string;
  farm_images: string[];
  work_images: string[];
  videos: string[];
  emergency_contact: string;
  status: 'Open' | 'Closed' | 'Filled' | 'Paused';
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  created_at?: string;
  applicants_count?: number;
}

export interface DBWorkerProfile {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  email?: string;
  avatar: string;
  aadhaar_verified: boolean;
  age: number;
  gender: string;
  address: string;
  village: string;
  district: string;
  languages: string[];
  skills: string[];
  experience_years: number;
  expected_daily_wage: number;
  expected_monthly_salary?: number;
  availability: 'Available' | 'On Job' | 'Busy';
  current_location: string;
  preferred_work_distance_km: number;
  certificates: string[];
  previous_employers: string;
  rating: number;
  reviews_count: number;
  completed_jobs_count: number;
  total_earnings: number;
  portfolio_images: string[];
  portfolio_videos: string[];
  bio: string;
}

export interface DBJobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  worker_name: string;
  worker_phone: string;
  worker_avatar: string;
  worker_rating: number;
  worker_skills: string[];
  expected_salary: number;
  status: 'Applied' | 'Shortlisted' | 'Accepted' | 'Working' | 'Completed' | 'Rejected' | 'Cancelled';
  applied_at: string;
  interview_scheduled_at?: string;
  notes?: string;
}

export interface DBChatMessage {
  id: string;
  job_id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  message_text: string;
  image_url?: string;
  voice_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface DBJobRating {
  id: string;
  job_id: string;
  rater_id: string;
  rater_role: 'farmer' | 'worker';
  ratee_id: string;
  rating_score: number;
  feedback_text: string;
  created_at: string;
}

// Local Storage Keys for offline / seamless state fallback
const STORAGE_JOBS_KEY = 'farmconnect_supabase_jobs';
const STORAGE_WORKERS_KEY = 'farmconnect_supabase_workers';
const STORAGE_APPLICATIONS_KEY = 'farmconnect_supabase_applications';
const STORAGE_CHATS_KEY = 'farmconnect_supabase_chats';
const STORAGE_RATINGS_KEY = 'farmconnect_supabase_ratings';

// Initial Seed Jobs
const SEED_JOBS: DBJobPost[] = [
  {
    id: 'job-101',
    title: 'Tomato Harvest Team Needed',
    crop_type: 'Tomato (Hybrid)',
    work_category: 'Tomato Picking',
    description: 'Urgent tomato picking required before seasonal heat. Clean picking without stem damage. Shaded rest area provided.',
    workers_required: 12,
    gender_preference: 'Any',
    min_age: 18,
    max_age: 55,
    experience_required: '1+ Year',
    skills_required: ['Harvesting', 'Sorting', 'Careful Handling'],
    education_optional: 'Not Required',
    daily_wage: 650,
    monthly_salary: 16250,
    hourly_wage: 80,
    food_provided: true,
    accommodation_provided: false,
    transport_provided: true,
    working_hours: '7:00 AM - 3:00 PM (8 Hours)',
    start_date: 'Tomorrow',
    end_date: 'In 5 Days',
    village: 'Tenali Rural',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    gps_location: '16.2430° N, 80.6400° E',
    contact_person: 'Venkat Rao',
    mobile_number: '+91 98480 12345',
    alt_number: '+91 98480 12346',
    whatsapp_number: '+91 98480 12345',
    email: 'venkat.rao@farmconnect.in',
    farm_images: [
      'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'
    ],
    work_images: [
      'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80'
    ],
    videos: [],
    emergency_contact: 'Tenali Primary Health Center: +91 8644 223344',
    status: 'Open',
    farmer_id: 'f1',
    farmer_name: 'Venkat Rao',
    farmer_phone: '+91 98480 12345',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    applicants_count: 5,
  },
  {
    id: 'job-102',
    title: 'Experienced Tractor Driver for Plowing',
    crop_type: 'Paddy Rice',
    work_category: 'Tractor Driver',
    description: '50 HP Mahindra tractor plowing & rotavator operation on 10-acre paddy field.',
    workers_required: 2,
    gender_preference: 'Male',
    min_age: 21,
    max_age: 50,
    experience_required: '3+ Years',
    skills_required: ['Tractor Driving', 'Rotavator Operation', 'Plowing'],
    education_optional: 'Basic Literacy',
    daily_wage: 850,
    monthly_salary: 22000,
    hourly_wage: 110,
    food_provided: true,
    accommodation_provided: true,
    transport_provided: true,
    working_hours: '6:00 AM - 2:00 PM',
    start_date: 'Jul 28, 2026',
    end_date: 'Jul 31, 2026',
    village: 'Vijayawada Rural',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    gps_location: '16.5062° N, 80.6480° E',
    contact_person: 'Murali Krishna',
    mobile_number: '+91 94401 22930',
    whatsapp_number: '+91 94401 22930',
    farm_images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
    ],
    work_images: [],
    videos: [],
    emergency_contact: 'Vijayawada Highway Patrol: 100',
    status: 'Open',
    farmer_id: 'f2',
    farmer_name: 'Murali Krishna',
    farmer_phone: '+91 94401 22930',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    applicants_count: 3,
  },
  {
    id: 'job-103',
    title: 'Paddy Cutting & Bundle Tying Team',
    crop_type: 'Basmati Paddy',
    work_category: 'Paddy Cutting',
    description: 'Systematic paddy cutting, sheaf bundling, and field stacking group requirement.',
    workers_required: 15,
    gender_preference: 'Any',
    min_age: 18,
    max_age: 60,
    experience_required: '2+ Years',
    skills_required: ['Sickle Cutting', 'Sheaf Tying', 'Paddy Harvesting'],
    daily_wage: 700,
    food_provided: true,
    accommodation_provided: false,
    transport_provided: true,
    working_hours: '6:30 AM - 2:30 PM',
    start_date: 'Jul 29, 2026',
    end_date: 'Aug 02, 2026',
    village: 'Mangalagiri',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    gps_location: '16.4300° N, 80.5500° E',
    contact_person: 'Sita Devi',
    mobile_number: '+91 98663 11200',
    whatsapp_number: '+91 98663 11200',
    farm_images: [],
    work_images: [],
    videos: [],
    emergency_contact: 'Mangalagiri Hospital: 108',
    status: 'Open',
    farmer_id: 'f3',
    farmer_name: 'Sita Devi',
    farmer_phone: '+91 98663 11200',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    applicants_count: 8,
  }
];

// Initial Seed Workers
const SEED_WORKERS: DBWorkerProfile[] = [
  {
    id: 'w-101',
    user_id: 'usr-w1',
    name: 'Ramu Naik',
    phone: '+91 98490 55432',
    email: 'ramu.naik@farmconnect.in',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    aadhaar_verified: true,
    age: 32,
    gender: 'Male',
    address: 'Door 4-12, Tenali Rural',
    village: 'Tenali Rural',
    district: 'Guntur',
    languages: ['Telugu', 'Hindi'],
    skills: ['Tractor Driving', 'Plow Specialist', 'Cotton Harvest Lead', 'Sprayer Operation'],
    experience_years: 8,
    expected_daily_wage: 650,
    expected_monthly_salary: 17000,
    availability: 'Available',
    current_location: 'Tenali, Guntur',
    preferred_work_distance_km: 25,
    certificates: ['Valid Commercial Driving License', 'Aadhaar Verified', 'Safety Training Pass'],
    previous_employers: 'Sri Venkateswara Farm, Krishna Rice Mills',
    rating: 4.9,
    reviews_count: 28,
    completed_jobs_count: 42,
    total_earnings: 32400,
    portfolio_images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80'
    ],
    portfolio_videos: [],
    bio: 'Experienced tractor driver and squad leader with 8+ years experience in tractor plowing and harvesting.',
  },
  {
    id: 'w-102',
    user_id: 'usr-w2',
    name: 'Lakshmi Kantham',
    phone: '+91 94412 88710',
    email: 'lakshmi.k@farmconnect.in',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    aadhaar_verified: true,
    age: 29,
    gender: 'Female',
    address: 'Main Street, Mangalagiri',
    village: 'Mangalagiri',
    district: 'Guntur',
    languages: ['Telugu'],
    skills: ['Paddy Cutting', 'Tomato Picking', 'Organic Weeding', 'Group Leader'],
    experience_years: 6,
    expected_daily_wage: 600,
    availability: 'Available',
    current_location: 'Mangalagiri, Guntur',
    preferred_work_distance_km: 15,
    certificates: ['Organic Farm Certified Worker', 'Group Leader Pass'],
    previous_employers: 'Lakshmi Bio Farm',
    rating: 4.85,
    reviews_count: 21,
    completed_jobs_count: 35,
    total_earnings: 24800,
    portfolio_images: [],
    portfolio_videos: [],
    bio: 'Paddy cutting and vegetable harvesting specialist leading a 10-member female worker group.',
  }
];

// Seed Applications
const SEED_APPLICATIONS: DBJobApplication[] = [
  {
    id: 'app-201',
    job_id: 'job-101',
    worker_id: 'w-101',
    worker_name: 'Ramu Naik',
    worker_phone: '+91 98490 55432',
    worker_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    worker_rating: 4.9,
    worker_skills: ['Tomato Picking', 'Harvesting', 'Squad Lead'],
    expected_salary: 650,
    status: 'Applied',
    applied_at: new Date(Date.now() - 1800000).toISOString(),
    notes: 'Ready with 5 team members for immediate start.',
  }
];

// Seed Chat Messages
const SEED_CHATS: DBChatMessage[] = [
  {
    id: 'msg-1',
    job_id: 'job-101',
    sender_id: 'w-101',
    sender_name: 'Ramu Naik',
    receiver_id: 'f1',
    message_text: 'Namaste Venkat Rao garu, I am ready with 5 workers for Tomato Picking tomorrow morning.',
    is_read: true,
    created_at: new Date(Date.now() - 1200000).toISOString(),
  }
];

/**
 * Fetch Job Posts from Supabase
 */
export async function fetchJobPostsFromSupabase(): Promise<DBJobPost[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(STORAGE_JOBS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return SEED_JOBS;
  }

  try {
    const { data, error } = await supabase
      .from('job_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (data && data.length === 0) {
        for (const j of SEED_JOBS) {
          await supabase.from('job_posts').insert([j]);
        }
        const { data: fresh } = await supabase.from('job_posts').select('*').order('created_at', { ascending: false });
        if (fresh && fresh.length > 0) return fresh;
      }
      const stored = localStorage.getItem(STORAGE_JOBS_KEY);
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      return SEED_JOBS;
    }

    localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Fetch job posts exception:', err);
    const stored = localStorage.getItem(STORAGE_JOBS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return SEED_JOBS;
  }
}

/**
 * Create a new Job Post in Supabase
 */
export async function createJobPostInSupabase(jobData: Partial<DBJobPost>): Promise<DBJobPost> {
  const newJob: DBJobPost = {
    id: `job-${Date.now()}`,
    title: jobData.title || 'Farm Labour Requirement',
    crop_type: jobData.crop_type || 'General Crops',
    work_category: jobData.work_category || 'Daily Wage',
    description: jobData.description || 'Agricultural field work required.',
    workers_required: jobData.workers_required || 5,
    gender_preference: jobData.gender_preference || 'Any',
    min_age: jobData.min_age || 18,
    max_age: jobData.max_age || 60,
    experience_required: jobData.experience_required || '1+ Year',
    skills_required: jobData.skills_required || ['Harvesting', 'Field Labour'],
    education_optional: jobData.education_optional || 'None',
    daily_wage: jobData.daily_wage || 650,
    monthly_salary: jobData.monthly_salary || (jobData.daily_wage || 650) * 25,
    hourly_wage: jobData.hourly_wage || 80,
    food_provided: jobData.food_provided ?? true,
    accommodation_provided: jobData.accommodation_provided ?? false,
    transport_provided: jobData.transport_provided ?? true,
    working_hours: jobData.working_hours || '7:00 AM - 3:00 PM',
    start_date: jobData.start_date || 'Tomorrow',
    end_date: jobData.end_date || 'Next Week',
    village: jobData.village || 'Tenali',
    district: jobData.district || 'Guntur',
    state: jobData.state || 'Andhra Pradesh',
    gps_location: jobData.gps_location || '16.2430° N, 80.6400° E',
    contact_person: jobData.contact_person || jobData.farmer_name || 'Farmer',
    mobile_number: jobData.mobile_number || '+91 98480 12345',
    alt_number: jobData.alt_number || '',
    whatsapp_number: jobData.whatsapp_number || jobData.mobile_number || '+91 98480 12345',
    email: jobData.email || '',
    farm_images: jobData.farm_images || [],
    work_images: jobData.work_images || [],
    videos: jobData.videos || [],
    emergency_contact: jobData.emergency_contact || 'Local Primary Health Center: 108',
    status: jobData.status || 'Open',
    farmer_id: jobData.farmer_id || 'f1',
    farmer_name: jobData.farmer_name || 'Venkat Rao',
    farmer_phone: jobData.farmer_phone || '+91 98480 12345',
    created_at: new Date().toISOString(),
    applicants_count: 0,
  };

  if (!isSupabaseConfigured()) {
    const list = JSON.parse(localStorage.getItem(STORAGE_JOBS_KEY) || '[]');
    const updated = [newJob, ...list];
    localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(updated));
    return newJob;
  }

  try {
    const { data, error } = await supabase
      .from('job_posts')
      .insert([newJob])
      .select()
      .single();

    if (error) {
      console.warn('Insert job post notice:', error.message);
      const list = JSON.parse(localStorage.getItem(STORAGE_JOBS_KEY) || '[]');
      const updated = [newJob, ...list];
      localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(updated));
      return newJob;
    }

    return data;
  } catch (err) {
    console.error('Create job post error:', err);
    const list = JSON.parse(localStorage.getItem(STORAGE_JOBS_KEY) || '[]');
    const updated = [newJob, ...list];
    localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(updated));
    return newJob;
  }
}

/**
 * Update Job Post Status or Details
 */
export async function updateJobPostInSupabase(jobId: string, updates: Partial<DBJobPost>): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('job_posts').update(updates).eq('id', jobId);
    } catch (e) {
      console.warn('Update job post warning:', e);
    }
  }

  const list: DBJobPost[] = JSON.parse(localStorage.getItem(STORAGE_JOBS_KEY) || '[]');
  const updated = list.map(j => (j.id === jobId ? { ...j, ...updates } : j));
  localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(updated));
  return true;
}

/**
 * Delete Job Post
 */
export async function deleteJobPostFromSupabase(jobId: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('job_posts').delete().eq('id', jobId);
    } catch (e) {
      console.warn('Delete job post warning:', e);
    }
  }

  const list: DBJobPost[] = JSON.parse(localStorage.getItem(STORAGE_JOBS_KEY) || '[]');
  const updated = list.filter(j => j.id !== jobId);
  localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(updated));
  return true;
}

/**
 * Fetch Worker Profiles from Supabase
 */
export async function fetchWorkerProfilesFromSupabase(): Promise<DBWorkerProfile[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(STORAGE_WORKERS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return SEED_WORKERS;
  }

  try {
    const { data, error } = await supabase
      .from('worker_profiles')
      .select('*');

    if (error || !data || data.length === 0) {
      if (data && data.length === 0) {
        for (const w of SEED_WORKERS) {
          await supabase.from('worker_profiles').insert([w]);
        }
        const { data: fresh } = await supabase.from('worker_profiles').select('*');
        if (fresh && fresh.length > 0) return fresh;
      }
      const stored = localStorage.getItem(STORAGE_WORKERS_KEY);
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      return SEED_WORKERS;
    }

    localStorage.setItem(STORAGE_WORKERS_KEY, JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Fetch workers exception:', err);
    const stored = localStorage.getItem(STORAGE_WORKERS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return SEED_WORKERS;
  }
}

/**
 * Save / Update Worker Profile in Supabase
 */
export async function saveWorkerProfileInSupabase(profile: DBWorkerProfile): Promise<DBWorkerProfile> {
  if (!isSupabaseConfigured()) {
    const list: DBWorkerProfile[] = JSON.parse(localStorage.getItem(STORAGE_WORKERS_KEY) || '[]');
    const idx = list.findIndex(w => w.id === profile.id);
    let updated: DBWorkerProfile[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = profile;
    } else {
      updated = [profile, ...list];
    }
    localStorage.setItem(STORAGE_WORKERS_KEY, JSON.stringify(updated));
    return profile;
  }

  try {
    const { data, error } = await supabase
      .from('worker_profiles')
      .upsert([profile])
      .select()
      .single();

    if (error) {
      console.warn('Upsert worker profile notice:', error.message);
      return profile;
    }
    return data;
  } catch (e) {
    console.error('Save worker profile error:', e);
    return profile;
  }
}

/**
 * Fetch Applications from Supabase
 */
export async function fetchJobApplicationsFromSupabase(): Promise<DBJobApplication[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem(STORAGE_APPLICATIONS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return SEED_APPLICATIONS;
  }

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (error || !data) {
      const stored = localStorage.getItem(STORAGE_APPLICATIONS_KEY);
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
      return SEED_APPLICATIONS;
    }

    localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(data));
    return data;
  } catch (e) {
    console.warn('Fetch applications exception:', e);
    const stored = localStorage.getItem(STORAGE_APPLICATIONS_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return SEED_APPLICATIONS;
  }
}

/**
 * Apply for a Job in Supabase
 */
export async function applyForJobInSupabase(appData: Partial<DBJobApplication>): Promise<DBJobApplication> {
  const newApp: DBJobApplication = {
    id: `app-${Date.now()}`,
    job_id: appData.job_id || 'job-101',
    worker_id: appData.worker_id || 'w-101',
    worker_name: appData.worker_name || 'Worker',
    worker_phone: appData.worker_phone || '+91 98490 55432',
    worker_avatar: appData.worker_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    worker_rating: appData.worker_rating || 4.9,
    worker_skills: appData.worker_skills || ['Agriculture'],
    expected_salary: appData.expected_salary || 650,
    status: 'Applied',
    applied_at: new Date().toISOString(),
    notes: appData.notes || 'Interested in this farm job opportunity.',
  };

  if (!isSupabaseConfigured()) {
    const list = JSON.parse(localStorage.getItem(STORAGE_APPLICATIONS_KEY) || '[]');
    const updated = [newApp, ...list];
    localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(updated));
    return newApp;
  }

  try {
    const { data, error } = await supabase
      .from('job_applications')
      .insert([newApp])
      .select()
      .single();

    if (error) {
      const list = JSON.parse(localStorage.getItem(STORAGE_APPLICATIONS_KEY) || '[]');
      const updated = [newApp, ...list];
      localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(updated));
      return newApp;
    }

    return data;
  } catch (e) {
    const list = JSON.parse(localStorage.getItem(STORAGE_APPLICATIONS_KEY) || '[]');
    const updated = [newApp, ...list];
    localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(updated));
    return newApp;
  }
}

/**
 * Update Application Status (Shortlist, Accept, Reject, Working, Completed)
 */
export async function updateJobApplicationStatusInSupabase(
  appId: string,
  status: DBJobApplication['status'],
  interviewTime?: string
): Promise<boolean> {
  const updates: Partial<DBJobApplication> = { status };
  if (interviewTime) {
    updates.interview_scheduled_at = interviewTime;
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('job_applications').update(updates).eq('id', appId);
    } catch (e) {
      console.warn('Update application warning:', e);
    }
  }

  const list: DBJobApplication[] = JSON.parse(localStorage.getItem(STORAGE_APPLICATIONS_KEY) || '[]');
  const updated = list.map(a => (a.id === appId ? { ...a, ...updates } : a));
  localStorage.setItem(STORAGE_APPLICATIONS_KEY, JSON.stringify(updated));
  return true;
}

/**
 * Fetch Chat Messages for a Job
 */
export async function fetchChatMessagesFromSupabase(jobId: string): Promise<DBChatMessage[]> {
  if (!isSupabaseConfigured()) {
    const stored: DBChatMessage[] = JSON.parse(localStorage.getItem(STORAGE_CHATS_KEY) || '[]');
    const filtered = stored.filter(m => m.job_id === jobId);
    if (filtered.length > 0) return filtered;
    return SEED_CHATS.filter(m => m.job_id === jobId);
  }

  try {
    const { data, error } = await supabase
      .from('job_chat_messages')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      const stored: DBChatMessage[] = JSON.parse(localStorage.getItem(STORAGE_CHATS_KEY) || '[]');
      return stored.filter(m => m.job_id === jobId);
    }

    return data;
  } catch {
    const stored: DBChatMessage[] = JSON.parse(localStorage.getItem(STORAGE_CHATS_KEY) || '[]');
    return stored.filter(m => m.job_id === jobId);
  }
}

/**
 * Send Chat Message
 */
export async function sendChatMessageToSupabase(msgData: Partial<DBChatMessage>): Promise<DBChatMessage> {
  const newMsg: DBChatMessage = {
    id: `msg-${Date.now()}`,
    job_id: msgData.job_id || 'job-101',
    sender_id: msgData.sender_id || 'usr-1',
    sender_name: msgData.sender_name || 'User',
    receiver_id: msgData.receiver_id || 'usr-2',
    message_text: msgData.message_text || '',
    image_url: msgData.image_url,
    voice_url: msgData.voice_url,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const list = JSON.parse(localStorage.getItem(STORAGE_CHATS_KEY) || '[]');
    const updated = [...list, newMsg];
    localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(updated));
    return newMsg;
  }

  try {
    const { data, error } = await supabase
      .from('job_chat_messages')
      .insert([newMsg])
      .select()
      .single();

    if (error) {
      const list = JSON.parse(localStorage.getItem(STORAGE_CHATS_KEY) || '[]');
      const updated = [...list, newMsg];
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(updated));
      return newMsg;
    }

    return data;
  } catch {
    const list = JSON.parse(localStorage.getItem(STORAGE_CHATS_KEY) || '[]');
    const updated = [...list, newMsg];
    localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(updated));
    return newMsg;
  }
}

/**
 * Submit Rating for Job / Worker / Farmer
 */
export async function submitRatingToSupabase(ratingData: Partial<DBJobRating>): Promise<DBJobRating> {
  const newRating: DBJobRating = {
    id: `rate-${Date.now()}`,
    job_id: ratingData.job_id || 'job-101',
    rater_id: ratingData.rater_id || 'usr-1',
    rater_role: ratingData.rater_role || 'farmer',
    ratee_id: ratingData.ratee_id || 'w-101',
    rating_score: ratingData.rating_score || 5,
    feedback_text: ratingData.feedback_text || 'Excellent work on the farm field!',
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const list = JSON.parse(localStorage.getItem(STORAGE_RATINGS_KEY) || '[]');
    const updated = [newRating, ...list];
    localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(updated));
    return newRating;
  }

  try {
    const { data, error } = await supabase
      .from('job_ratings')
      .insert([newRating])
      .select()
      .single();

    if (error) {
      const list = JSON.parse(localStorage.getItem(STORAGE_RATINGS_KEY) || '[]');
      const updated = [newRating, ...list];
      localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(updated));
      return newRating;
    }

    return data;
  } catch {
    const list = JSON.parse(localStorage.getItem(STORAGE_RATINGS_KEY) || '[]');
    const updated = [newRating, ...list];
    localStorage.setItem(STORAGE_RATINGS_KEY, JSON.stringify(updated));
    return newRating;
  }
}

/**
 * Subscribe to Job Realtime Changes
 */
export function subscribeToWorkerMarketplaceRealtime(onChange: () => void) {
  if (!isSupabaseConfigured()) return () => {};

  const channel = supabase
    .channel('realtime_worker_marketplace')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'job_posts' }, () => onChange())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => onChange())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'job_chat_messages' }, () => onChange())
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
