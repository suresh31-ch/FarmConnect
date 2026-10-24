/**
 * FarmConnect Agricultural Equipment Marketplace
 * Complete Enterprise UI with Supabase Database, Storage & Realtime.
 * Buy, Sell, and Rent heavy farm machinery (Tractors, Harvesters, Drones, Tillers, Pumps, Transplanters, etc.)
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { calculateLogistics } from '../../services/logisticsService';
import {
  EquipmentCategory,
  EquipmentCondition,
  FuelType,
  DBEquipmentListing,
  DBEquipmentBooking,
  DBEquipmentChat,
  DBEquipmentRating,
  DBEquipmentNotification,
  fetchEquipmentListings,
  postEquipmentListing,
  updateEquipmentListing,
  deleteEquipmentListing,
  fetchEquipmentBookings,
  createEquipmentBooking,
  updateEquipmentBookingStatus,
  fetchEquipmentChats,
  sendEquipmentChatMessage,
  submitEquipmentRating,
  getSavedEquipmentIds,
  toggleSavedEquipment,
  getEquipmentNotifications,
  subscribeToEquipmentRealtime,
} from '../../services/supabaseEquipmentService';

export const EquipmentMarketplace: React.FC = () => {
  const { user } = useAuth();

  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState<'browse' | 'post' | 'seller_hub' | 'buyer_hub' | 'saved' | 'chat' | 'notifications'>('browse');

  // Filter States
  const [activeListingMode, setActiveListingMode] = useState<'All' | 'Rent' | 'Buy/Sell'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [conditionFilter, setConditionFilter] = useState<string>('All');
  const [brandFilter, setBrandFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest');

  // Data Collections from Supabase
  const [equipmentList, setEquipmentList] = useState<DBEquipmentListing[]>([]);
  const [bookings, setBookings] = useState<DBEquipmentBooking[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<DBEquipmentNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & Selection
  const [selectedEquipment, setSelectedEquipment] = useState<DBEquipmentListing | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<DBEquipmentListing | null>(null);
  const [bookingEquipment, setBookingEquipment] = useState<DBEquipmentListing | null>(null);
  const [activeChatEquipment, setActiveChatEquipment] = useState<DBEquipmentListing | null>(null);
  const [activeChatBooking, setActiveChatBooking] = useState<DBEquipmentBooking | null>(null);
  const [ratingTargetBooking, setRatingTargetBooking] = useState<DBEquipmentBooking | null>(null);
  const [razorpayBooking, setRazorpayBooking] = useState<DBEquipmentBooking | null>(null);
  const [invoiceBooking, setInvoiceBooking] = useState<DBEquipmentBooking | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Booking Form State
  const [bookingStartDate, setBookingStartDate] = useState('2026-07-28');
  const [bookingEndDate, setBookingEndDate] = useState('2026-07-29');
  const [bookingDurationDays, setBookingDurationDays] = useState('1');
  const [bookingDurationHours, setBookingDurationHours] = useState('8');
  const [bookingDeliveryRequired, setBookingDeliveryRequired] = useState(true);
  const [bookingPickupRequired, setBookingPickupRequired] = useState(true);
  const [bookingOperatorRequired, setBookingOperatorRequired] = useState(true);
  const [bookingSpecialInstructions, setBookingSpecialInstructions] = useState('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // Post / Sell Equipment Form State
  const [postForm, setPostForm] = useState<{
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
    serial_number: string;
    description: string;
    accessories_included: string;
    warranty_available: boolean;
    original_bill_available: boolean;
    village: string;
    district: string;
    state: string;
    gps_location: string;
    owner_name: string;
    mobile_number: string;
    whatsapp_number: string;
    email: string;
    selling_price: string;
    negotiable: boolean;
    rental_price_per_hour: string;
    rental_price_per_day: string;
    rental_price_per_week: string;
    security_deposit: string;
    listing_type: 'Buy/Sell' | 'Rent' | 'Both';
    availability_calendar: string;
    images: string[];
    videos: string[];
  }>({
    equipment_name: '',
    equipment_category: 'Tractor',
    brand: 'Mahindra',
    model: '575 DI',
    year_of_purchase: 2024,
    condition: 'Excellent',
    horse_power: '50 HP',
    engine_type: 'Diesel Turbo Engine',
    fuel_type: 'Diesel',
    usage_hours: 350,
    serial_number: '',
    description: '',
    accessories_included: 'Rotavator, Bumper, Canopy, Trailer Hook',
    warranty_available: true,
    original_bill_available: true,
    village: 'Tenali Rural',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    gps_location: '16.2430° N, 80.6400° E',
    owner_name: user?.name || 'Subba Rao',
    mobile_number: '+91 98480 12345',
    whatsapp_number: '+91 98480 12345',
    email: user?.emailOrPhone || 'farmer@farmconnect.in',
    selling_price: '550000',
    negotiable: true,
    rental_price_per_hour: '800',
    rental_price_per_day: '5000',
    rental_price_per_week: '30000',
    security_deposit: '2500',
    listing_type: 'Both',
    availability_calendar: '2026-07-28, 2026-07-29, 2026-07-30, 2026-07-31',
    images: ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'],
    videos: [],
  });

  // Chat State
  const [chatMessages, setChatMessages] = useState<DBEquipmentChat[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatImageInput, setChatImageInput] = useState<string | null>(null);

  // Rating State
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');

  // Media preview state
  const [newMediaUrl, setNewMediaUrl] = useState('');

  // Categories list
  const CATEGORIES: EquipmentCategory[] = [
    'Tractor',
    'Mini Tractor',
    'Harvester',
    'Rotavator',
    'Power Tiller',
    'Drone',
    'Sprayer',
    'Seed Drill',
    'Cultivator',
    'Plough',
    'Water Pump',
    'Pipe',
    'Generator',
    'Rice Transplanter',
    'Thresher',
    'Others',
  ];

  // Load Initial Data from Supabase
  const loadSupabaseData = async () => {
    setLoading(true);
    const [eqData, bkData] = await Promise.all([
      fetchEquipmentListings(),
      fetchEquipmentBookings(),
    ]);
    setEquipmentList(eqData);
    setBookings(bkData);
    setSavedIds(getSavedEquipmentIds());
    setNotifications(getEquipmentNotifications('all'));
    setLoading(false);
  };

  useEffect(() => {
    loadSupabaseData();

    // Subscribe to Realtime Supabase Updates
    const unsubscribe = subscribeToEquipmentRealtime(() => {
      loadSupabaseData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle Wishlist / Save
  const handleToggleSave = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = toggleSavedEquipment(id);
    setSavedIds(updated);
    if (updated.includes(id)) {
      showToast('Equipment saved to your favorites ❤️');
    } else {
      showToast('Equipment removed from saved items');
    }
  };

  // Handle Post Equipment Submission
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.equipment_name.trim()) {
      showToast('Please enter equipment name');
      return;
    }

    const accessoriesList = postForm.accessories_included
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const datesList = postForm.availability_calendar
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newListingData: Partial<DBEquipmentListing> = {
      equipment_name: postForm.equipment_name,
      equipment_category: postForm.equipment_category,
      brand: postForm.brand,
      model: postForm.model,
      year_of_purchase: Number(postForm.year_of_purchase) || 2024,
      condition: postForm.condition,
      horse_power: postForm.horse_power,
      engine_type: postForm.engine_type,
      fuel_type: postForm.fuel_type,
      usage_hours: Number(postForm.usage_hours) || 0,
      serial_number: postForm.serial_number,
      description: postForm.description || 'Verified farm equipment in excellent working condition.',
      accessories_included: accessoriesList,
      warranty_available: postForm.warranty_available,
      original_bill_available: postForm.original_bill_available,
      village: postForm.village,
      district: postForm.district,
      state: postForm.state,
      gps_location: postForm.gps_location,
      owner_id: user?.name ? `usr-${user.name.toLowerCase().replace(/\s+/g, '')}` : 'usr-subbarao',
      owner_name: postForm.owner_name,
      mobile_number: postForm.mobile_number,
      whatsapp_number: postForm.whatsapp_number,
      email: postForm.email,
      selling_price: Number(postForm.selling_price) || 0,
      negotiable: postForm.negotiable,
      rental_price_per_hour: Number(postForm.rental_price_per_hour) || 0,
      rental_price_per_day: Number(postForm.rental_price_per_day) || 0,
      rental_price_per_week: Number(postForm.rental_price_per_week) || 0,
      security_deposit: Number(postForm.security_deposit) || 1000,
      availability_calendar: datesList.length > 0 ? datesList : ['Available Daily'],
      images: postForm.images.length > 0 ? postForm.images : ['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'],
      videos: postForm.videos,
      listing_type: postForm.listing_type,
    };

    if (editingEquipment) {
      await updateEquipmentListing(editingEquipment.id, newListingData);
      showToast('Equipment listing updated successfully in Supabase! 🚜');
      setEditingEquipment(null);
    } else {
      await postEquipmentListing(newListingData);
      showToast('New Equipment listed successfully in Supabase! 🚜');
    }

    // Refresh
    const fresh = await fetchEquipmentListings();
    setEquipmentList(fresh);
    setActiveTab('browse');
  };

  // Add Image via Camera/URL trigger
  const handleAddImage = (url: string) => {
    if (!url) return;
    setPostForm((prev) => ({
      ...prev,
      images: [...prev.images, url],
    }));
    setNewMediaUrl('');
    showToast('Image added to listing preview 📸');
  };

  // Image Upload File Handler / Base64 Compression Simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          setPostForm((prev) => ({
            ...prev,
            images: [...prev.images, base64],
          }));
          showToast('Image compressed & attached 📷');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Booking
  const handleConfirmBooking = async () => {
    if (!bookingEquipment) return;
    setIsBookingSubmitting(true);

    const hoursNeeded = Number(bookingDurationHours) || 8;
    const baseRentalCost = (bookingEquipment.rental_price_per_hour || 500) * hoursNeeded;
    const logistics = calculateLogistics(2200, 12);
    const transportCost = bookingDeliveryRequired ? logistics.totalDeliveryCost : 0;
    const totalAmount = baseRentalCost + transportCost;

    const newBooking = await createEquipmentBooking({
      equipment_id: bookingEquipment.id,
      equipment_name: bookingEquipment.equipment_name,
      equipment_category: bookingEquipment.equipment_category,
      equipment_image: bookingEquipment.images[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      buyer_id: user?.name ? `usr-${user.name.toLowerCase().replace(/\s+/g, '')}` : 'usr-farmer1',
      buyer_name: user?.name || 'Farmer Buyer',
      buyer_phone: user?.phone || '+91 98480 12345',
      seller_id: bookingEquipment.owner_id,
      seller_name: bookingEquipment.owner_name,
      seller_phone: bookingEquipment.mobile_number,
      booking_type: 'Rent',
      start_date: bookingStartDate,
      end_date: bookingEndDate,
      delivery_required: bookingDeliveryRequired,
      pickup_required: bookingPickupRequired,
      operator_required: bookingOperatorRequired,
      special_instructions: bookingSpecialInstructions,
      total_amount: totalAmount,
      security_deposit: bookingEquipment.security_deposit || 1000,
    });

    setIsBookingSubmitting(false);
    setRazorpayBooking(newBooking);
    setBookingEquipment(null);
    showToast('Booking Request Saved in Supabase! Proceeding to Payment 💳');

    const freshBookings = await fetchEquipmentBookings();
    setBookings(freshBookings);
  };

  // Payment Success
  const handleRazorpaySuccess = async () => {
    if (!razorpayBooking) return;
    await updateEquipmentBookingStatus(razorpayBooking.id, 'Accepted');
    showToast('Payment Successful via Razorpay! Owner notified in Realtime ⚡');
    setRazorpayBooking(null);
    const freshBookings = await fetchEquipmentBookings();
    setBookings(freshBookings);
    setActiveTab('buyer_hub');
  };

  // Open Chat
  const handleOpenChat = async (eq: DBEquipmentListing, bk?: DBEquipmentBooking) => {
    setActiveChatEquipment(eq);
    if (bk) setActiveChatBooking(bk);
    const msgs = await fetchEquipmentChats(eq.id);
    setChatMessages(msgs);
  };

  // Send Chat Message
  const handleSendChatMessage = async () => {
    if (!activeChatEquipment || (!chatInput.trim() && !chatImageInput)) return;

    const newMsg = await sendEquipmentChatMessage({
      equipment_id: activeChatEquipment.id,
      booking_id: activeChatBooking?.id,
      sender_id: user?.name ? `usr-${user.name.toLowerCase().replace(/\s+/g, '')}` : 'usr-me',
      sender_name: user?.name || 'Farmer',
      receiver_id: activeChatEquipment.owner_id,
      message_text: chatInput,
      image_url: chatImageInput || undefined,
    });

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setChatImageInput(null);
  };

  // Submit Rating
  const handleSubmitRating = async () => {
    if (!ratingTargetBooking) return;

    await submitEquipmentRating({
      equipment_id: ratingTargetBooking.equipment_id,
      booking_id: ratingTargetBooking.id,
      rater_id: user?.name ? `usr-${user.name.toLowerCase().replace(/\s+/g, '')}` : 'usr-1',
      rater_name: user?.name || 'Farmer Reviewer',
      rater_role: 'buyer',
      ratee_id: ratingTargetBooking.seller_id,
      rating_score: ratingScore,
      feedback_text: ratingFeedback || 'Excellent machine performance and cooperative owner.',
    });

    await updateEquipmentBookingStatus(ratingTargetBooking.id, 'Completed');
    showToast('Rating & Review saved permanently in Supabase! ⭐');
    setRatingTargetBooking(null);
    const freshBookings = await fetchEquipmentBookings();
    setBookings(freshBookings);
  };

  // Filter listings logic
  const filteredListings = equipmentList.filter((eq) => {
    // Listing Mode
    if (activeListingMode === 'Rent' && eq.rental_price_per_hour === 0 && eq.rental_price_per_day === 0) return false;
    if (activeListingMode === 'Buy/Sell' && eq.selling_price === 0) return false;

    // Category
    if (selectedCategory !== 'All' && eq.equipment_category !== selectedCategory) return false;

    // District
    if (districtFilter !== 'All' && eq.district !== districtFilter) return false;

    // Condition
    if (conditionFilter !== 'All' && eq.condition !== conditionFilter) return false;

    // Brand
    if (brandFilter !== 'All' && eq.brand !== brandFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = eq.equipment_name.toLowerCase().includes(q);
      const matchBrand = eq.brand.toLowerCase().includes(q);
      const matchCategory = eq.equipment_category.toLowerCase().includes(q);
      const matchLocation = `${eq.village} ${eq.district} ${eq.state}`.toLowerCase().includes(q);
      const matchHP = eq.horse_power.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCategory && !matchLocation && !matchHP) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price_low') {
      const priceA = a.rental_price_per_hour || a.selling_price;
      const priceB = b.rental_price_per_hour || b.selling_price;
      return priceA - priceB;
    }
    if (sortBy === 'price_high') {
      const priceA = a.rental_price_per_hour || a.selling_price;
      const priceB = b.rental_price_per_hour || b.selling_price;
      return priceB - priceA;
    }
    if (sortBy === 'rating') {
      return (b.owner_rating || 5) - (a.owner_rating || 5);
    }
    // newest default
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Calculate Owner Dashboard Metrics
  const myListings = equipmentList; // owner sees listings
  const totalEquipmentCount = myListings.length;
  const activeListingsCount = myListings.filter((e) => e.status === 'Active').length;
  const rentedCount = bookings.filter((b) => b.status === 'In Use' || b.status === 'Accepted').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed' || b.status === 'Returned').length;
  const totalSellerIncome = bookings
    .filter((b) => b.status === 'Completed' || b.status === 'In Use' || b.status === 'Accepted')
    .reduce((sum, b) => sum + b.total_amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-bounce text-sm font-bold">
          <Icon name="verified" className="text-emerald-400" size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO HEADER */}
      <Card
        variant="gradient"
        className="p-6 md:p-8 relative overflow-hidden bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-950 border border-emerald-500/30 shadow-2xl rounded-[32px]"
      >
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="emerald" size="md" icon="agriculture">
                SUPABASE POWERED MARKETPLACE
              </Badge>
              <span className="text-xs text-emerald-300 font-extrabold bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 rounded-full backdrop-blur-md">
                Realtime Synchronization
              </span>
              <span className="text-xs text-amber-300 font-extrabold bg-amber-500/20 border border-amber-500/30 px-3.5 py-1 rounded-full backdrop-blur-md">
                Zero Middlemen Fee
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Farm Equipment Marketplace 🚜
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Buy, sell, or rent high-capacity tractors, combine harvesters, drone sprayers, rotavators, and rice transplanters with live GPS tracking and instant booking.
            </p>

            <div className="pt-2 flex flex-wrap gap-3 text-xs font-bold text-emerald-200">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow">
                <Icon name="verified" size={16} className="text-emerald-400" /> Inspected Machinery
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow">
                <Icon name="local_shipping" size={16} className="text-blue-400" /> Doorstep Logistics
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 shadow">
                <Icon name="verified_user" size={16} className="text-amber-400" /> Security Deposit Release
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Button
              variant="accent"
              size="lg"
              leftIcon="add_circle"
              onClick={() => {
                setEditingEquipment(null);
                setActiveTab('post');
              }}
              className="shadow-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold px-6"
            >
              Post / Sell Equipment
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon="analytics"
              onClick={() => setActiveTab('seller_hub')}
              className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30"
            >
              Seller Dashboard
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. MAIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-emerald-800/40 no-scrollbar">
        {[
          { id: 'browse', label: 'Browse Machinery', icon: 'search' },
          { id: 'post', label: 'Post Equipment', icon: 'add' },
          { id: 'seller_hub', label: 'Seller Dashboard', icon: 'storefront', badge: totalEquipmentCount },
          { id: 'buyer_hub', label: 'My Rental Bookings', icon: 'calendar_month', badge: bookings.length },
          { id: 'saved', label: 'Saved Equipment', icon: 'favorite', badge: savedIds.length },
          { id: 'notifications', label: 'Notifications', icon: 'notifications', badge: notifications.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#2E7D32] text-white shadow-lg scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800/40 hover:bg-slate-50'
            }`}
          >
            <Icon name={tab.icon} size={18} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === tab.id ? 'bg-white text-[#2E7D32]' : 'bg-emerald-100 text-[#2E7D32]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* =========================================================================
          TAB 1: BROWSE MACHINERY (BUYER MARKETPLACE)
          ========================================================================= */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* SEARCH & MULTI-FILTERS BAR */}
          <Card variant="glass" className="p-4 space-y-4 border-emerald-500/20">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Mode Toggle: All vs Rent vs Buy/Sell */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-full lg:w-auto">
                {(['All', 'Rent', 'Buy/Sell'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveListingMode(m)}
                    className={`flex-1 lg:flex-initial px-5 py-2 rounded-xl text-xs font-black transition-all ${
                      activeListingMode === m
                        ? 'bg-[#2E7D32] text-white shadow'
                        : 'text-slate-600 dark:text-emerald-200 hover:text-slate-900'
                    }`}
                  >
                    {m === 'All' ? 'All Machinery' : m === 'Rent' ? '🔑 Rent Only' : '🏷️ Buy / Sell'}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-80">
                <input
                  type="text"
                  placeholder="Search Mahindra tractor, harvester, drone, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 text-xs py-3 pl-10 pr-4 rounded-2xl border border-slate-200 dark:border-emerald-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
                <Icon
                  name="search"
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {/* Sorting & Filters */}
              <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white dark:bg-slate-900 text-xs font-bold border border-slate-200 dark:border-emerald-800/60 rounded-2xl px-3 py-2.5 text-slate-800 dark:text-emerald-200"
                >
                  <option value="newest">Sort: Newest First</option>
                  <option value="price_low">Sort: Price Low to High</option>
                  <option value="price_high">Sort: Price High to Low</option>
                  <option value="rating">Sort: Top Rated Owners</option>
                </select>

                <select
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-xs font-bold border border-slate-200 dark:border-emerald-800/60 rounded-2xl px-3 py-2.5 text-slate-800 dark:text-emerald-200"
                >
                  <option value="All">Condition: All</option>
                  <option value="New">New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                </select>

                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 text-xs font-bold border border-slate-200 dark:border-emerald-800/60 rounded-2xl px-3 py-2.5 text-slate-800 dark:text-emerald-200"
                >
                  <option value="All">District: All</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Krishna">Krishna</option>
                  <option value="Prakasam">Prakasam</option>
                  <option value="Godavari">Godavari</option>
                </select>
              </div>
            </div>

            {/* CATEGORIES HORIZONTAL PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-[#2E7D32] text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-emerald-200 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#2E7D32] text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-emerald-200 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Card>

          {/* MACHINERY CARDS GRID */}
          {loading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-slate-500">Loading equipment listings from Supabase...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <Card variant="glass" className="p-12 text-center space-y-4">
              <Icon name="search_off" size={48} className="text-slate-400 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                No equipment matching your filter criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try resetting your search query, location, or condition filter to view available tractors & machinery.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setDistrictFilter('All');
                  setConditionFilter('All');
                  setActiveListingMode('All');
                }}
              >
                Clear All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((equipment) => {
                const isSaved = savedIds.includes(equipment.id);
                return (
                  <Card
                    key={equipment.id}
                    variant="glass"
                    className="p-0 overflow-hidden border-slate-200/80 dark:border-emerald-800/40 flex flex-col justify-between group hover:shadow-2xl transition-all duration-300 rounded-[28px]"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative h-52 overflow-hidden bg-slate-900">
                      <img
                        src={equipment.images[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'}
                        alt={equipment.equipment_name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
                        <Badge variant="emerald" size="sm">
                          {equipment.equipment_category}
                        </Badge>
                        <span className="text-[10px] font-black bg-black/70 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                          ⚡ {equipment.horse_power}
                        </span>
                        <span className="text-[10px] font-black bg-blue-900/80 backdrop-blur-md text-blue-200 px-2.5 py-1 rounded-full border border-blue-400/30">
                          {equipment.condition}
                        </span>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={(e) => handleToggleSave(equipment.id, e)}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-slate-900/90 text-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Icon name={isSaved ? 'favorite' : 'favorite_border'} size={20} filled={isSaved} />
                      </button>

                      {/* Price Badge */}
                      <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xl border border-emerald-500/30">
                        {equipment.rental_price_per_hour > 0 && (
                          <div className="text-right">
                            <span className="text-base font-black text-[#2E7D32] dark:text-emerald-400">
                              ₹{equipment.rental_price_per_hour.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-extrabold text-slate-500 block">
                              / hr (Rent)
                            </span>
                          </div>
                        )}
                        {equipment.selling_price > 0 && (
                          <div className="text-right">
                            <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                              ₹{equipment.selling_price.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 block">
                              Buy Price {equipment.negotiable ? '(Negotiable)' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                            {equipment.brand} • {equipment.model} ({equipment.year_of_purchase})
                          </span>
                          <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                            ⭐ {equipment.owner_rating} ({equipment.reviews_count})
                          </span>
                        </div>

                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#2E7D32] transition-colors">
                          {equipment.equipment_name}
                        </h3>

                        <p className="text-xs text-slate-600 dark:text-emerald-200/90 leading-relaxed line-clamp-2">
                          {equipment.description}
                        </p>

                        {/* Accessories chips */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {equipment.accessories_included.slice(0, 3).map((acc, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-emerald-300 px-2 py-0.5 rounded-md"
                            >
                              ✓ {acc}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Location & Owner Footer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/40 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-emerald-200">
                            <Icon name="person" size={15} /> {equipment.owner_name}
                          </span>
                          <span className="font-semibold">
                            📍 {equipment.village}, {equipment.district}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon="info"
                            onClick={() => setSelectedEquipment(equipment)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={equipment.rental_price_per_hour > 0 ? 'key' : 'shopping_bag'}
                            onClick={() => {
                              setSelectedEquipment(equipment);
                            }}
                          >
                            {equipment.rental_price_per_hour > 0 ? 'Book Rental' : 'Contact Seller'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: POST / SELL EQUIPMENT PAGE
          ========================================================================= */}
      {activeTab === 'post' && (
        <Card variant="glass" className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto border-emerald-500/30 rounded-[32px]">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center font-bold">
                <Icon name="agriculture" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {editingEquipment ? 'Edit Equipment Listing' : 'Post Machinery For Rent or Sale'}
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in machinery specifications. Saved directly into Supabase database & storage.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePostSubmit} className="space-y-6">
            {/* SECTION 1: BASIC DETAILS */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-[#2E7D32] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Icon name="tune" size={18} /> 1. Basic Machinery Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Category *
                  </label>
                  <select
                    value={postForm.equipment_category}
                    onChange={(e) =>
                      setPostForm({ ...postForm, equipment_category: e.target.value as any })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Listing Type *
                  </label>
                  <select
                    value={postForm.listing_type}
                    onChange={(e) =>
                      setPostForm({ ...postForm, listing_type: e.target.value as any })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    <option value="Both">Rent & Sell Both</option>
                    <option value="Rent">Rent Only</option>
                    <option value="Buy/Sell">Sell Only</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahindra 575 DI SP Plus Tractor"
                    value={postForm.equipment_name}
                    onChange={(e) => setPostForm({ ...postForm, equipment_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Brand / Manufacturer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahindra / Kubota / John Deere"
                    value={postForm.brand}
                    onChange={(e) => setPostForm({ ...postForm, brand: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 575 DI SP Plus"
                    value={postForm.model}
                    onChange={(e) => setPostForm({ ...postForm, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Year of Purchase
                  </label>
                  <input
                    type="number"
                    value={postForm.year_of_purchase}
                    onChange={(e) =>
                      setPostForm({ ...postForm, year_of_purchase: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: SPECIFICATIONS */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-emerald-800/60">
              <h3 className="text-sm font-extrabold text-[#2E7D32] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Icon name="build" size={18} /> 2. Technical Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Condition *
                  </label>
                  <select
                    value={postForm.condition}
                    onChange={(e) =>
                      setPostForm({ ...postForm, condition: e.target.value as any })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    <option value="New">New</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Horse Power (HP)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50 HP"
                    value={postForm.horse_power}
                    onChange={(e) => setPostForm({ ...postForm, horse_power: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Fuel Type
                  </label>
                  <select
                    value={postForm.fuel_type}
                    onChange={(e) =>
                      setPostForm({ ...postForm, fuel_type: e.target.value as any })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Hybrid / Solar">Hybrid / Solar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Usage Hours Run
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 420"
                    value={postForm.usage_hours}
                    onChange={(e) =>
                      setPostForm({ ...postForm, usage_hours: Number(e.target.value) })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Engine Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4-Cylinder Water Cooled Direct Injection"
                    value={postForm.engine_type}
                    onChange={(e) => setPostForm({ ...postForm, engine_type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Serial / Chassis Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MAH-575-88291"
                    value={postForm.serial_number}
                    onChange={(e) => setPostForm({ ...postForm, serial_number: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Accessories Included (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 36-Blade Rotavator, Bumper, Canopy, Cage Wheels"
                    value={postForm.accessories_included}
                    onChange={(e) =>
                      setPostForm({ ...postForm, accessories_included: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-emerald-200">
                    <input
                      type="checkbox"
                      checked={postForm.warranty_available}
                      onChange={(e) =>
                        setPostForm({ ...postForm, warranty_available: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#2E7D32]"
                    />
                    Warranty Active
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-emerald-200">
                    <input
                      type="checkbox"
                      checked={postForm.original_bill_available}
                      onChange={(e) =>
                        setPostForm({ ...postForm, original_bill_available: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#2E7D32]"
                    />
                    Original Invoice Available
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                  Full Description & Capabilities
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your machinery, performance on different soil types, attachments provided..."
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl p-3 text-xs font-bold"
                />
              </div>
            </div>

            {/* SECTION 3: PRICING & RENTAL RATES */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-emerald-800/60">
              <h3 className="text-sm font-extrabold text-[#2E7D32] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Icon name="payments" size={18} /> 3. Pricing & Rental Rates
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Rental Rate / Hour (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="850"
                    value={postForm.rental_price_per_hour}
                    onChange={(e) =>
                      setPostForm({ ...postForm, rental_price_per_hour: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Rental Rate / Day (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="5500"
                    value={postForm.rental_price_per_day}
                    onChange={(e) =>
                      setPostForm({ ...postForm, rental_price_per_day: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Rental Rate / Week (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="32000"
                    value={postForm.rental_price_per_week}
                    onChange={(e) =>
                      setPostForm({ ...postForm, rental_price_per_week: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={postForm.security_deposit}
                    onChange={(e) =>
                      setPostForm({ ...postForm, security_deposit: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Selling Price (if selling pre-owned) ₹
                  </label>
                  <input
                    type="number"
                    placeholder="580000"
                    value={postForm.selling_price}
                    onChange={(e) => setPostForm({ ...postForm, selling_price: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="flex items-center pt-5 sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-emerald-200">
                    <input
                      type="checkbox"
                      checked={postForm.negotiable}
                      onChange={(e) => setPostForm({ ...postForm, negotiable: e.target.checked })}
                      className="w-4 h-4 rounded text-[#2E7D32]"
                    />
                    Price is Negotiable
                  </label>
                </div>
              </div>
            </div>

            {/* SECTION 4: LOCATION & OWNER CONTACT */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-emerald-800/60">
              <h3 className="text-sm font-extrabold text-[#2E7D32] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Icon name="location_on" size={18} /> 4. Location & Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Village
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.village}
                    onChange={(e) => setPostForm({ ...postForm, village: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.district}
                    onChange={(e) => setPostForm({ ...postForm, district: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.state}
                    onChange={(e) => setPostForm({ ...postForm, state: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    GPS Location
                  </label>
                  <input
                    type="text"
                    value={postForm.gps_location}
                    onChange={(e) => setPostForm({ ...postForm, gps_location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.owner_name}
                    onChange={(e) => setPostForm({ ...postForm, owner_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={postForm.mobile_number}
                    onChange={(e) => setPostForm({ ...postForm, mobile_number: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={postForm.whatsapp_number}
                    onChange={(e) => setPostForm({ ...postForm, whatsapp_number: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={postForm.email}
                    onChange={(e) => setPostForm({ ...postForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-emerald-800 rounded-xl px-3.5 py-2.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: MEDIA UPLOAD & PREVIEW */}
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-emerald-800/60">
              <h3 className="text-sm font-extrabold text-[#2E7D32] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Icon name="add_a_photo" size={18} /> 5. Media Upload (Photos & Videos)
              </h3>

              {/* Upload Controls */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl space-y-3 border border-dashed border-emerald-500/40">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <label className="cursor-pointer bg-[#2E7D32] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow hover:bg-emerald-700 transition-colors">
                    <Icon name="photo_camera" size={18} />
                    <span>Open Camera / Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Paste Image URL..."
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="bg-white dark:bg-slate-800 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-emerald-800 flex-1 sm:w-60"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddImage(newMediaUrl)}
                    >
                      Add URL
                    </Button>
                  </div>
                </div>

                {/* Previews */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-500">
                    Uploaded Media Preview ({postForm.images.length} images):
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {postForm.images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setPostForm((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }))
                          }
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                        >
                          <Icon name="close" size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-emerald-800">
              <Button variant="outline" type="button" onClick={() => setActiveTab('browse')}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" leftIcon="check" size="lg">
                {editingEquipment ? 'Save Changes' : 'Publish Listing to Supabase'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* =========================================================================
          TAB 3: SELLER DASHBOARD & ANALYTICS
          ========================================================================= */}
      {activeTab === 'seller_hub' && (
        <div className="space-y-6">
          {/* ANALYTICS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card variant="glass" className="p-4 space-y-1 text-center border-emerald-500/20">
              <span className="text-xs font-bold text-slate-500 block">Total Equipment</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totalEquipmentCount}
              </span>
            </Card>

            <Card variant="glass" className="p-4 space-y-1 text-center border-emerald-500/20">
              <span className="text-xs font-bold text-slate-500 block">Active Listings</span>
              <span className="text-2xl font-black text-[#2E7D32] dark:text-emerald-400">
                {activeListingsCount}
              </span>
            </Card>

            <Card variant="glass" className="p-4 space-y-1 text-center border-emerald-500/20">
              <span className="text-xs font-bold text-slate-500 block">Currently Rented</span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {rentedCount}
              </span>
            </Card>

            <Card variant="glass" className="p-4 space-y-1 text-center border-emerald-500/20">
              <span className="text-xs font-bold text-slate-500 block">Completed Trips</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {completedCount}
              </span>
            </Card>

            <Card variant="glass" className="p-4 space-y-1 text-center border-emerald-500/20">
              <span className="text-xs font-bold text-slate-500 block">Total Income</span>
              <span className="text-xl font-black text-[#2E7D32]">
                ₹{totalSellerIncome.toLocaleString()}
              </span>
            </Card>

            <Card variant="glass" className="p-4 space-y-1 text-center border-emerald-500/20">
              <span className="text-xs font-bold text-slate-500 block">Owner Rating</span>
              <span className="text-2xl font-black text-amber-500 flex items-center justify-center gap-1">
                ⭐ 4.9
              </span>
            </Card>
          </div>

          {/* BOOKING REQUESTS RECEIVED SECTION */}
          <Card variant="glass" className="p-6 space-y-4 border-emerald-500/20">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="inbox" size={20} className="text-[#2E7D32]" />
                <span>Booking Requests Received ({bookings.length})</span>
              </h3>
              <Badge variant="emerald" size="sm">Realtime Notifications Active</Badge>
            </div>

            {bookings.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No rental requests received yet.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={bk.equipment_image}
                        alt={bk.equipment_name}
                        className="w-16 h-16 rounded-xl object-cover border"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {bk.equipment_name}
                          </h4>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-[#2E7D32]">
                            {bk.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-emerald-200">
                          Customer: <strong>{bk.buyer_name}</strong> ({bk.buyer_phone})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Dates: {bk.start_date} to {bk.end_date} • Delivery: {bk.delivery_required ? 'Yes' : 'No'} • Operator: {bk.operator_required ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      <div className="text-right">
                        <span className="text-base font-black text-[#2E7D32]">
                          ₹{bk.total_amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Total Rental Fee</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {bk.status === 'Pending' && (
                          <>
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={async () => {
                                await updateEquipmentBookingStatus(bk.id, 'Accepted');
                                showToast('Booking Accepted in Supabase! Realtime update sent ⚡');
                                setBookings(await fetchEquipmentBookings());
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await updateEquipmentBookingStatus(bk.id, 'Rejected');
                                showToast('Booking Rejected');
                                setBookings(await fetchEquipmentBookings());
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon="call"
                          onClick={() => window.open(`tel:${bk.buyer_phone}`)}
                        >
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* SELLER LISTINGS MANAGEMENT */}
          <Card variant="glass" className="p-6 space-y-4 border-emerald-500/20">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Icon name="list" size={20} className="text-[#2E7D32]" />
                <span>Your Listed Equipment ({equipmentList.length})</span>
              </h3>
              <Button
                variant="primary"
                size="sm"
                leftIcon="add"
                onClick={() => {
                  setEditingEquipment(null);
                  setActiveTab('post');
                }}
              >
                Add New Listing
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipmentList.map((eq) => (
                <div
                  key={eq.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-emerald-800/60 flex items-start gap-4"
                >
                  <img
                    src={eq.images[0]}
                    alt={eq.equipment_name}
                    className="w-20 h-20 rounded-xl object-cover border"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#2E7D32]">{eq.equipment_category}</span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        eq.status === 'Active' ? 'bg-emerald-100 text-[#2E7D32]' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {eq.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {eq.equipment_name}
                    </h4>

                    <p className="text-xs text-slate-500">
                      Rate: ₹{eq.rental_price_per_hour}/hr • Price: ₹{eq.selling_price.toLocaleString()}
                    </p>

                    <div className="pt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingEquipment(eq);
                          setPostForm({
                            equipment_name: eq.equipment_name,
                            equipment_category: eq.equipment_category,
                            brand: eq.brand,
                            model: eq.model,
                            year_of_purchase: eq.year_of_purchase,
                            condition: eq.condition,
                            horse_power: eq.horse_power,
                            engine_type: eq.engine_type,
                            fuel_type: eq.fuel_type,
                            usage_hours: eq.usage_hours,
                            serial_number: eq.serial_number || '',
                            description: eq.description,
                            accessories_included: eq.accessories_included.join(', '),
                            warranty_available: eq.warranty_available,
                            original_bill_available: eq.original_bill_available,
                            village: eq.village,
                            district: eq.district,
                            state: eq.state,
                            gps_location: eq.gps_location,
                            owner_name: eq.owner_name,
                            mobile_number: eq.mobile_number,
                            whatsapp_number: eq.whatsapp_number,
                            email: eq.email,
                            selling_price: String(eq.selling_price),
                            negotiable: eq.negotiable,
                            rental_price_per_hour: String(eq.rental_price_per_hour),
                            rental_price_per_day: String(eq.rental_price_per_day),
                            rental_price_per_week: String(eq.rental_price_per_week),
                            security_deposit: String(eq.security_deposit),
                            listing_type: eq.listing_type,
                            availability_calendar: eq.availability_calendar.join(', '),
                            images: eq.images,
                            videos: eq.videos,
                          });
                          setActiveTab('post');
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const newStatus = eq.status === 'Active' ? 'Paused' : 'Active';
                          await updateEquipmentListing(eq.id, { status: newStatus });
                          showToast(`Listing ${newStatus}`);
                          setEquipmentList(await fetchEquipmentListings());
                        }}
                      >
                        {eq.status === 'Active' ? 'Pause' : 'Resume'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await deleteEquipmentListing(eq.id);
                          showToast('Listing deleted from Supabase');
                          setEquipmentList(await fetchEquipmentListings());
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MY RENTAL BOOKINGS & ORDERS (BUYER DASHBOARD)
          ========================================================================= */}
      {activeTab === 'buyer_hub' && (
        <Card variant="glass" className="p-6 space-y-4 border-emerald-500/20">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Icon name="calendar_month" size={20} className="text-[#2E7D32]" />
              <span>Your Equipment Bookings & History ({bookings.length})</span>
            </h3>
          </div>

          {bookings.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No equipment booked yet. Browse machinery to book rentals!</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((bk) => (
                <div
                  key={bk.id}
                  className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-emerald-800/60 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-emerald-800 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={bk.equipment_image}
                        alt={bk.equipment_name}
                        className="w-14 h-14 rounded-xl object-cover border"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {bk.equipment_name}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Owner: {bk.seller_name} ({bk.seller_phone})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-100 text-[#2E7D32]">
                        Status: {bk.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-bold">Booking Dates</span>
                      <span className="font-extrabold text-slate-800 dark:text-emerald-200">
                        {bk.start_date} → {bk.end_date}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">Total Payable</span>
                      <span className="font-extrabold text-[#2E7D32]">
                        ₹{bk.total_amount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">Security Deposit</span>
                      <span className="font-extrabold text-slate-800 dark:text-emerald-200">
                        ₹{bk.security_deposit} (Refundable)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-bold">Payment</span>
                      <span className="font-extrabold text-emerald-600">
                        ✓ {bk.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-emerald-800">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon="receipt"
                      onClick={() => setInvoiceBooking(bk)}
                    >
                      Download Invoice
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon="star"
                      onClick={() => setRatingTargetBooking(bk)}
                    >
                      Rate Owner
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* =========================================================================
          TAB 5: SAVED EQUIPMENT
          ========================================================================= */}
      {activeTab === 'saved' && (
        <Card variant="glass" className="p-6 space-y-4 border-emerald-500/20">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="favorite" size={20} className="text-red-500" />
            <span>Saved Equipment ({savedIds.length})</span>
          </h3>

          {savedIds.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No saved equipment yet. Click the heart icon on any listing to save it!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {equipmentList
                .filter((eq) => savedIds.includes(eq.id))
                .map((eq) => (
                  <Card key={eq.id} variant="glass" className="p-4 space-y-3 border-emerald-500/20">
                    <img src={eq.images[0]} alt={eq.equipment_name} className="w-full h-40 object-cover rounded-xl" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{eq.equipment_name}</h4>
                    <p className="text-xs text-[#2E7D32] font-bold">₹{eq.rental_price_per_hour}/hr</p>
                    <Button variant="primary" size="sm" fullWidth onClick={() => setSelectedEquipment(eq)}>
                      View Details
                    </Button>
                  </Card>
                ))}
            </div>
          )}
        </Card>
      )}

      {/* =========================================================================
          TAB 6: NOTIFICATIONS
          ========================================================================= */}
      {activeTab === 'notifications' && (
        <Card variant="glass" className="p-6 space-y-4 border-emerald-500/20">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="notifications" size={20} className="text-amber-500" />
            <span>Realtime Notifications ({notifications.length})</span>
          </h3>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-emerald-800/60 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-[#2E7D32]">
                  <Icon name="notifications_active" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-emerald-200">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =========================================================================
          MODAL: FULL EQUIPMENT DETAILS PAGE
          ========================================================================= */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-3xl w-full p-6 space-y-6 border border-emerald-500/40 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="emerald" size="sm">{selectedEquipment.equipment_category}</Badge>
                <span className="text-xs font-bold text-slate-500">{selectedEquipment.brand} {selectedEquipment.model}</span>
              </div>
              <button onClick={() => setSelectedEquipment(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <Icon name="close" size={24} />
              </button>
            </div>

            {/* Media Gallery */}
            <div className="space-y-2">
              <div className="h-64 rounded-2xl overflow-hidden bg-slate-900 border">
                <img src={selectedEquipment.images[0]} alt={selectedEquipment.equipment_name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Title & Specifications Grid */}
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedEquipment.equipment_name}</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">Horse Power</span>
                  <span className="font-extrabold text-slate-800 dark:text-emerald-200">⚡ {selectedEquipment.horse_power}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Fuel Type</span>
                  <span className="font-extrabold text-slate-800 dark:text-emerald-200">{selectedEquipment.fuel_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Usage Run</span>
                  <span className="font-extrabold text-slate-800 dark:text-emerald-200">{selectedEquipment.usage_hours} Hours</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Condition</span>
                  <span className="font-extrabold text-slate-800 dark:text-emerald-200">{selectedEquipment.condition}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-emerald-200 leading-relaxed">{selectedEquipment.description}</p>
            </div>

            {/* Owner & Location Map */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Owner: {selectedEquipment.owner_name}</h4>
                <p className="text-xs text-slate-600 dark:text-emerald-200">📍 {selectedEquipment.village}, {selectedEquipment.district}, {selectedEquipment.state}</p>
              </div>
              <Button variant="outline" size="sm" leftIcon="call" onClick={() => window.open(`tel:${selectedEquipment.mobile_number}`)}>
                Call Owner
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-emerald-800">
              <Button variant="outline" onClick={() => setSelectedEquipment(null)}>Close</Button>
              <Button
                variant="primary"
                leftIcon="calendar_month"
                onClick={() => {
                  setBookingEquipment(selectedEquipment);
                  setSelectedEquipment(null);
                }}
              >
                Proceed to Book Rental
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: BOOK RENTAL FORM
          ========================================================================= */}
      {bookingEquipment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-xl w-full p-6 space-y-4 border border-emerald-500/40 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Book Equipment Rental</h3>
              <button onClick={() => setBookingEquipment(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">Start Date</label>
                  <input
                    type="date"
                    value={bookingStartDate}
                    onChange={(e) => setBookingStartDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-800 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">End Date</label>
                  <input
                    type="date"
                    value={bookingEndDate}
                    onChange={(e) => setBookingEndDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-800 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-emerald-800">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingDeliveryRequired}
                    onChange={(e) => setBookingDeliveryRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2E7D32]"
                  />
                  Require Doorstep Delivery & Transport Dispatch
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingOperatorRequired}
                    onChange={(e) => setBookingOperatorRequired(e.target.checked)}
                    className="w-4 h-4 rounded text-[#2E7D32]"
                  />
                  Include Experienced Operator / Driver
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-emerald-200">Special Instructions for Owner</label>
                <textarea
                  rows={2}
                  placeholder="Field location details, soil condition..."
                  value={bookingSpecialInstructions}
                  onChange={(e) => setBookingSpecialInstructions(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-emerald-800 rounded-xl p-3 text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-emerald-800">
                <Button variant="outline" onClick={() => setBookingEquipment(null)}>Cancel</Button>
                <Button variant="primary" onClick={handleConfirmBooking} disabled={isBookingSubmitting}>
                  {isBookingSubmitting ? 'Saving in Supabase...' : 'Confirm & Proceed to Pay'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RAZORPAY PAYMENT SIMULATION
          ========================================================================= */}
      {razorpayBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[32px] max-w-md w-full p-6 space-y-5 border border-emerald-500/50 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Badge variant="emerald" size="sm">RAZORPAY SECURE</Badge>
                <span className="text-xs text-slate-400 font-bold">UPI / Netbanking</span>
              </div>
              <button onClick={() => setRazorpayBooking(null)} className="text-slate-400 hover:text-white">
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="text-center space-y-2 py-2">
              <span className="text-xs text-slate-400 block font-bold">Total Amount Payable</span>
              <h2 className="text-3xl font-black text-emerald-400">₹{razorpayBooking.total_amount.toLocaleString()}</h2>
              <p className="text-xs text-slate-300">Equipment: {razorpayBooking.equipment_name}</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleRazorpaySuccess}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl text-xs font-black text-white hover:brightness-110 shadow-xl transition-all"
              >
                Pay via PhonePe / GooglePay / UPI ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INVOICE PRINT & DOWNLOAD
          ========================================================================= */}
      {invoiceBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-[28px] max-w-lg w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-[#2E7D32]">FARMCONNECT TAX INVOICE</h3>
                <p className="text-[10px] text-slate-500">Invoice #{invoiceBooking.id}</p>
              </div>
              <button onClick={() => setInvoiceBooking(null)} className="text-slate-400 hover:text-slate-600">
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Equipment Name:</span>
                <span className="font-bold">{invoiceBooking.equipment_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer Name:</span>
                <span className="font-bold">{invoiceBooking.buyer_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Owner Name:</span>
                <span className="font-bold">{invoiceBooking.seller_name}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-black text-sm text-[#2E7D32]">
                <span>Total Amount Paid:</span>
                <span>₹{invoiceBooking.total_amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => window.print()}>Print Receipt 🖨️</Button>
              <Button variant="primary" onClick={() => setInvoiceBooking(null)}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RATING & REVIEW
          ========================================================================= */}
      {ratingTargetBooking && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-md w-full p-6 space-y-4 border border-emerald-500 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Rate Equipment & Owner</h3>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRatingScore(s)} className="text-3xl text-amber-400">
                  {s <= ratingScore ? '★' : '☆'}
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Share feedback on machine condition and owner service..."
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl p-3 text-xs font-bold"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRatingTargetBooking(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSubmitRating}>Submit Rating</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
