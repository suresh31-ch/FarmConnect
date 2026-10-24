/**
 * FarmConnect Complete Livestock & Aquaculture Marketplace
 * Supports: Buy, Sell, Rent for Cows, Buffaloes, Goats, Sheep, Poultry, Hens, Ducks, Fish Farming, Pigs, Horses, Rabbits, Pet Animals.
 * Integrated with Supabase Database, Storage, Realtime, Chat & Invoice Generation.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { calculateLogistics } from '../../services/logisticsService';
import { ChatModal } from '../../components/chat/ChatModal';
import { InvoiceGeneratorModal } from '../../components/payments/InvoiceGeneratorModal';
import {
  DBLivestockListing,
  DBLivestockBooking,
  DBLivestockRating,
  LivestockCategory,
  LivestockGender,
  ListingPurpose,
  HealthStatus,
  fetchLivestockListings,
  createLivestockListing,
  updateLivestockListingStatus,
  uploadLivestockMediaToSupabase,
  createLivestockBooking,
  fetchLivestockBookings,
  updateLivestockBookingStatus,
  submitLivestockRating,
  fetchLivestockRatings,
} from '../../services/supabaseLivestockService';

export const LivestockMarketplace: React.FC = () => {
  const { user } = useAuth();

  // Primary State
  const [activeTab, setActiveTab] = useState<'explore' | 'my_bookings' | 'saved' | 'admin'>('explore');
  const [listings, setListings] = useState<DBLivestockListing[]>([]);
  const [bookings, setBookings] = useState<DBLivestockBooking[]>([]);
  const [ratings, setRatings] = useState<DBLivestockRating[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('farmconnect_saved_livestock') || '[]');
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [purposeFilter, setPurposeFilter] = useState<'All' | 'Buy' | 'Rent'>('All');
  const [healthFilter, setHealthFilter] = useState<'All' | 'Healthy' | 'Vaccinated'>('All');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female' | 'Pair' | 'Flock'>('All');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [minMilkYield, setMinMilkYield] = useState<number>(0);

  // Modals
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedListingDetail, setSelectedListingDetail] = useState<DBLivestockListing | null>(null);
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState<DBLivestockListing | null>(null);
  const [invoiceOrderData, setInvoiceOrderData] = useState<DBLivestockBooking | null>(null);

  // Chat Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<{
    orderNumber: string;
    name: string;
    phone?: string;
  } | null>(null);

  // Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingTargetBooking, setRatingTargetBooking] = useState<DBLivestockBooking | null>(null);
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');

  // Media upload refs
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);

  // Sell Form State
  const [sellForm, setSellForm] = useState({
    animal_name: '',
    animal_type: 'Cow' as LivestockCategory,
    breed: 'Ongole Native',
    age_years: '3',
    gender: 'Female' as LivestockGender,
    weight_kg: '400',
    height_cm: '140',
    milk_yield_liters_per_day: '12',
    health_status: 'Vet Certified & Vaccinated' as HealthStatus,
    vaccination_history: 'FMD & HS Vaccinated',
    medical_records: 'Certified by District Vet Officer',
    pregnancy_status: 'Lactating',
    feed_details: 'Green Fodder & Silage',
    purpose: 'Sale' as ListingPurpose,
    price: '65000',
    rental_price_per_day: '800',
    negotiable: true,
    village: 'Tenali Rural',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    phone: user?.phone || '+91 98480 12345',
    whatsapp: user?.phone || '+91 98480 12345',
    email: user?.emailOrPhone || 'farmer@farmconnect.org',
    description: '',
  });

  // Booking Form State inside Payment/Booking Modal
  const [bookingForm, setBookingForm] = useState({
    booking_type: 'Buy' as 'Buy' | 'Rent',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    delivery_required: true,
    special_notes: '',
    payment_method: 'Online UPI (Escrow)',
  });

  const categories: string[] = [
    'All',
    'Cow',
    'Buffalo',
    'Goat',
    'Sheep',
    'Poultry',
    'Hen',
    'Duck',
    'Fish Farming',
    'Pig',
    'Horse',
    'Rabbit',
    'Pet Animal',
  ];

  // Load Data on Mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [fetchedListings, fetchedBookings, fetchedRatings] = await Promise.all([
      fetchLivestockListings(),
      fetchLivestockBookings(user?.id),
      fetchLivestockRatings(),
    ]);
    setListings(fetchedListings);
    setBookings(fetchedBookings);
    setRatings(fetchedRatings);
    setIsLoading(false);
  };

  // Toggle Saved Favorite
  const toggleSaveListing = (id: string) => {
    let updated: string[];
    if (savedIds.includes(id)) {
      updated = savedIds.filter((item) => item !== id);
    } else {
      updated = [...savedIds, id];
    }
    setSavedIds(updated);
    localStorage.setItem('farmconnect_saved_livestock', JSON.stringify(updated));
  };

  // Media Upload Handlers
  const handleMediaUpload = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files || files.length === 0) return;
    setIsUploadingMedia(true);

    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedUrl = await uploadLivestockMediaToSupabase(file);
        urls.push(uploadedUrl);
      }

      if (type === 'image') {
        setUploadedImages((prev) => [...prev, ...urls]);
      } else {
        setUploadedVideos((prev) => [...prev, ...urls]);
      }
    } catch (err) {
      console.error('Livestock media upload error:', err);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Submit Sell Livestock Listing Form
  const handleCreateListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imagesToUse =
      uploadedImages.length > 0
        ? uploadedImages
        : ['https://images.unsplash.com/photo-1570042707223-28f09b23b1bf?auto=format&fit=crop&w=800&q=80'];

    const newCreated = await createLivestockListing({
      animal_name: sellForm.animal_name || `${sellForm.breed} ${sellForm.animal_type}`,
      animal_type: sellForm.animal_type,
      breed: sellForm.breed,
      age_years: parseFloat(sellForm.age_years) || 2,
      gender: sellForm.gender,
      weight_kg: parseFloat(sellForm.weight_kg) || 200,
      height_cm: sellForm.height_cm ? parseFloat(sellForm.height_cm) : undefined,
      milk_yield_liters_per_day: sellForm.milk_yield_liters_per_day
        ? parseFloat(sellForm.milk_yield_liters_per_day)
        : undefined,
      health_status: sellForm.health_status,
      vaccination_history: sellForm.vaccination_history,
      medical_records: sellForm.medical_records,
      pregnancy_status: sellForm.pregnancy_status,
      feed_details: sellForm.feed_details,
      purpose: sellForm.purpose,
      price: parseFloat(sellForm.price) || 25000,
      rental_price_per_day: sellForm.rental_price_per_day ? parseFloat(sellForm.rental_price_per_day) : undefined,
      negotiable: sellForm.negotiable,
      village: sellForm.village,
      district: sellForm.district,
      state: sellForm.state,
      owner_id: user?.id || 'f1',
      owner_name: user?.name || 'Farmer Seller',
      phone: sellForm.phone,
      whatsapp: sellForm.whatsapp,
      email: sellForm.email,
      description: sellForm.description || 'Verified healthy livestock with complete veterinary papers.',
      images: imagesToUse,
      videos: uploadedVideos,
      status: 'Active',
    });

    setListings((prev) => [newCreated, ...prev]);
    setIsSellModalOpen(false);
    setUploadedImages([]);
    setUploadedVideos([]);
    alert('🎉 Livestock listing published successfully to Supabase Marketplace!');
  };

  // Submit Livestock Booking / Purchase Request
  const handleCreateBookingSubmit = async () => {
    if (!selectedBookingForPayment) return;

    const totalAmount =
      bookingForm.booking_type === 'Buy'
        ? selectedBookingForPayment.price
        : (selectedBookingForPayment.rental_price_per_day || 800) * 3;

    const newBooking = await createLivestockBooking({
      livestock_id: selectedBookingForPayment.id,
      animal_name: selectedBookingForPayment.animal_name,
      animal_type: selectedBookingForPayment.animal_type,
      animal_image: selectedBookingForPayment.images[0] || '',
      buyer_id: user?.id || 'consumer-1',
      buyer_name: user?.name || 'Suresh Kumar',
      buyer_phone: user?.phone || '+91 98480 12345',
      seller_id: selectedBookingForPayment.owner_id,
      seller_name: selectedBookingForPayment.owner_name,
      seller_phone: selectedBookingForPayment.phone,
      booking_type: bookingForm.booking_type,
      start_date: bookingForm.start_date,
      end_date: bookingForm.end_date,
      total_amount: totalAmount,
      delivery_required: bookingForm.delivery_required,
      special_notes: bookingForm.special_notes,
    });

    setBookings((prev) => [newBooking, ...prev]);
    setSelectedBookingForPayment(null);
    setInvoiceOrderData(newBooking);
  };

  // Accept/Reject Booking
  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: DBLivestockBooking['status']
  ) => {
    await updateLivestockBookingStatus(bookingId, newStatus);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  // Submit Rating
  const handleRatingSubmit = async () => {
    if (!ratingTargetBooking) return;

    const newRating = await submitLivestockRating({
      booking_id: ratingTargetBooking.id,
      livestock_id: ratingTargetBooking.livestock_id,
      from_user_id: user?.id || 'u1',
      from_user_name: user?.name || 'Buyer',
      to_user_id: ratingTargetBooking.seller_id,
      to_user_name: ratingTargetBooking.seller_name,
      rating_role: 'buyer_to_seller',
      stars: ratingStars,
      comment: ratingComment || 'Excellent livestock health, clear vet records and prompt handover!',
    });

    setRatings((prev) => [newRating, ...prev]);
    setRatingModalOpen(false);
    setRatingTargetBooking(null);
    setRatingComment('');
    alert('Thank you! Your feedback has been saved.');
  };

  // Admin Approve / Remove
  const handleAdminAction = async (id: string, action: 'approve' | 'report' | 'delete') => {
    if (action === 'approve') {
      await updateLivestockListingStatus(id, { is_approved: true, is_reported: false });
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_approved: true, is_reported: false } : item))
      );
    } else if (action === 'report') {
      await updateLivestockListingStatus(id, { is_reported: true });
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_reported: true } : item))
      );
    } else if (action === 'delete') {
      await updateLivestockListingStatus(id, { status: 'Paused' });
      setListings((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Filtered Listings Calculation
  const filteredListings = listings.filter((item) => {
    // Tab Filter
    if (activeTab === 'saved' && !savedIds.includes(item.id)) return false;

    // Category Filter
    if (selectedCategory !== 'All' && item.animal_type !== selectedCategory) return false;

    // Purpose Filter
    if (purposeFilter === 'Buy' && item.purpose === 'Rent') return false;
    if (purposeFilter === 'Rent' && item.purpose === 'Sale') return false;

    // Health Filter
    if (healthFilter === 'Vaccinated' && !item.health_status.includes('Vaccinated')) return false;

    // Gender Filter
    if (genderFilter !== 'All' && item.gender !== genderFilter) return false;

    // District Filter
    if (districtFilter !== 'All' && item.district.toLowerCase() !== districtFilter.toLowerCase())
      return false;

    // Price Filter
    if (item.price > maxPrice) return false;

    // Milk Yield Filter
    if (minMilkYield > 0 && (item.milk_yield_liters_per_day || 0) < minMilkYield) return false;

    // Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.animal_name.toLowerCase().includes(q);
      const matchBreed = item.breed.toLowerCase().includes(q);
      const matchType = item.animal_type.toLowerCase().includes(q);
      const matchDistrict = item.district.toLowerCase().includes(q);
      const matchVillage = item.village.toLowerCase().includes(q);
      const matchOwner = item.owner_name.toLowerCase().includes(q);
      if (!matchName && !matchBreed && !matchType && !matchDistrict && !matchVillage && !matchOwner) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HERO BANNER */}
      <Card
        variant="gradient"
        className="p-6 relative overflow-hidden bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border border-amber-500/30 shadow-2xl rounded-3xl text-white"
      >
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="amber" size="sm" icon="pets">
                SUPABASE VERIFIED LIVESTOCK POOL
              </Badge>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 rounded-full backdrop-blur-md">
                100% District Vet Certified
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Livestock & Aquaculture Marketplace 🐄
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Buy, sell, and rent high-yield dairy cows, Murrah buffaloes, goats, sheep, poultry, fish seed, pigs, horses & pet animals with verified veterinary health passes and live pickup transport.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-amber-300">
              <span className="flex items-center gap-1">
                <Icon name="verified_user" size={16} className="text-emerald-400" />
                Vet Health Pass Recorded
              </span>
              <span className="flex items-center gap-1">
                <Icon name="local_shipping" size={16} className="text-amber-400" />
                Live Animal GPS Transport
              </span>
              <span className="flex items-center gap-1">
                <Icon name="lock" size={16} className="text-emerald-400" />
                Escrow Protected Payment
              </span>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Button
              variant="accent"
              size="lg"
              leftIcon="add_a_photo"
              onClick={() => setIsSellModalOpen(true)}
              className="shadow-xl"
            >
              Sell / Rent Livestock
            </Button>
            <Button
              variant="outline"
              size="lg"
              leftIcon="receipt_long"
              onClick={() => setActiveTab('my_bookings')}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              My Bookings ({bookings.length})
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-emerald-900/40 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'explore'
                ? 'bg-emerald-700 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
            }`}
          >
            <Icon name="grid_view" size={16} />
            Explore Livestock ({listings.length})
          </button>

          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'my_bookings'
                ? 'bg-emerald-700 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
            }`}
          >
            <Icon name="shopping_bag" size={16} />
            My Requests ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-emerald-700 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
            }`}
          >
            <Icon name="bookmark" size={16} />
            Saved Animals ({savedIds.length})
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-emerald-700 text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
            }`}
          >
            <Icon name="admin_panel_settings" size={16} />
            Admin Approval
          </button>
        </div>
      </div>

      {/* 3. EXPLORE / MAIN VIEW */}
      {activeTab === 'explore' || activeTab === 'saved' ? (
        <div className="space-y-5">
          {/* SEARCH & CATEGORY FILTER BAR */}
          <Card variant="glass" className="p-4 space-y-4 border border-slate-200 dark:border-emerald-800">
            {/* Search Input */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Icon
                  name="search"
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by animal, breed, district, village, seller..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <Icon name="close" size={16} />
                  </button>
                )}
              </div>

              {/* Purpose Filter Pills */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
                {(['All', 'Buy', 'Rent'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPurposeFilter(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      purposeFilter === p
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {p === 'All' ? 'Buy & Rent' : p === 'Buy' ? 'For Sale' : 'For Rent'}
                  </button>
                ))}
              </div>
            </div>

            {/* Animal Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60'
                  }`}
                >
                  {cat === 'All'
                    ? '🐾 All Animals'
                    : cat === 'Cow'
                    ? '🐄 Cow'
                    : cat === 'Buffalo'
                    ? '🐃 Buffalo'
                    : cat === 'Goat'
                    ? '🐐 Goat'
                    : cat === 'Sheep'
                    ? '🐑 Sheep'
                    : cat === 'Poultry'
                    ? '🐓 Poultry'
                    : cat === 'Hen'
                    ? '🐔 Hen'
                    : cat === 'Duck'
                    ? '🦆 Duck'
                    : cat === 'Fish Farming'
                    ? '🐟 Fish Seed'
                    : cat === 'Pig'
                    ? '🐖 Pig'
                    : cat === 'Horse'
                    ? '🐎 Horse'
                    : cat === 'Rabbit'
                    ? '🐇 Rabbit'
                    : '🐕 Pet Animal'}
                </button>
              ))}
            </div>

            {/* Advanced Filters Drawer/Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Health & Vet
                </label>
                <select
                  value={healthFilter}
                  onChange={(e) => setHealthFilter(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="All">All Health Status</option>
                  <option value="Vaccinated">Vaccinated & Vet Certified</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="All">All Genders</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Pair">Pair</option>
                  <option value="Flock">Flock / Batch</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  District
                </label>
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="All">All Districts</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Vijayawada">Vijayawada / Krishna</option>
                  <option value="Prakasam">Prakasam</option>
                  <option value="West Godavari">West Godavari</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Min Milk Yield (L/Day): {minMilkYield}L
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={minMilkYield}
                  onChange={(e) => setMinMilkYield(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </Card>

          {/* LISTINGS GRID */}
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Icon name="sync" size={32} className="animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Syncing Supabase Livestock Database...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <Card variant="glass" className="p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                <Icon name="pets" size={36} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                No Livestock Listings Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No animals match your selected filters. Try broadening your category or district search, or list a new animal!
              </p>
              <Button variant="accent" size="sm" onClick={() => setIsSellModalOpen(true)} leftIcon="add">
                Sell / Rent Livestock
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((item) => {
                const isSaved = savedIds.includes(item.id);

                return (
                  <Card
                    key={item.id}
                    variant="glass"
                    className="p-0 overflow-hidden border border-slate-200 dark:border-emerald-800/80 flex flex-col hover:border-emerald-500 transition-all duration-200 group shadow-lg"
                  >
                    {/* Media Thumbnail Header */}
                    <div className="relative h-48 bg-slate-950 overflow-hidden shrink-0">
                      <img
                        src={
                          item.images[0] ||
                          'https://images.unsplash.com/photo-1570042707223-28f09b23b1bf?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={item.animal_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <Badge variant="emerald" size="sm" icon="pets">
                          {item.animal_type} • {item.breed}
                        </Badge>

                        <button
                          onClick={() => toggleSaveListing(item.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                            isSaved
                              ? 'bg-rose-500 text-white'
                              : 'bg-black/40 text-white hover:bg-rose-500'
                          }`}
                          title="Bookmark Animal"
                        >
                          <Icon name={isSaved ? 'bookmark' : 'bookmark_border'} size={18} />
                        </button>
                      </div>

                      {/* Bottom Info Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold">
                          <Icon name="location_on" size={13} className="text-amber-400" />
                          <span>
                            {item.village}, {item.district}
                          </span>
                        </div>

                        {item.milk_yield_liters_per_day && (
                          <div className="bg-emerald-600/90 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                            <Icon name="water_drop" size={12} />
                            {item.milk_yield_liters_per_day} L/Day Milk
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#2E7D32] transition-colors">
                          {item.animal_name}
                        </h3>

                        {/* Health & Vet Status */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-[#2E7D32] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <Icon name="verified" size={12} />
                            {item.health_status}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            Age: {item.age_years} Yrs • {item.gender}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Specs Mini-Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl text-[11px] border border-slate-200 dark:border-slate-700">
                        <div>
                          <span className="text-slate-400 text-[10px] block font-semibold">WEIGHT</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {item.weight_kg} kg
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] block font-semibold">FEED ROUTINE</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                            {item.feed_details || 'Organic Feed'}
                          </span>
                        </div>
                      </div>

                      {/* Price & Seller Info Row */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            {item.purpose === 'Rent' ? 'RENTAL RATE' : 'BUYING PRICE'}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-black text-[#2E7D32] dark:text-emerald-400">
                              ₹{item.purpose === 'Rent' ? item.rental_price_per_day : item.price}
                            </span>
                            {item.purpose === 'Rent' && (
                              <span className="text-[10px] text-slate-400 font-bold">/Day</span>
                            )}
                            {item.negotiable && (
                              <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 rounded">
                                Negotiable
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block">OWNER</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                            {item.owner_name}
                          </span>
                          <div className="flex items-center justify-end gap-1 text-[10px] text-amber-500 font-bold">
                            <Icon name="star" size={12} />
                            <span>{item.owner_rating} ({item.reviews_count})</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-2 flex items-center gap-1.5">
                        <Button
                          variant="accent"
                          size="sm"
                          fullWidth
                          leftIcon="shopping_cart"
                          onClick={() => setSelectedBookingForPayment(item)}
                        >
                          {item.purpose === 'Rent' ? 'Rent Animal' : 'Buy Animal'}
                        </Button>

                        <button
                          onClick={() => setSelectedListingDetail(item)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 transition-colors text-xs font-bold"
                          title="View Full Veterinary Pass Details"
                        >
                          <Icon name="visibility" size={16} />
                        </button>

                        <button
                          onClick={() => {
                            setChatTarget({
                              orderNumber: `LS-${item.id}`,
                              name: item.owner_name,
                              phone: item.phone,
                            });
                            setChatModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 transition-colors text-xs font-bold"
                          title="Chat with Owner"
                        >
                          <Icon name="chat" size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'my_bookings' ? (
        /* 4. MY BOOKINGS / REQUESTS VIEW */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              My Livestock Purchase & Rental Requests ({bookings.length})
            </h2>
            <Button variant="outline" size="sm" leftIcon="refresh" onClick={loadData}>
              Sync Realtime
            </Button>
          </div>

          {bookings.length === 0 ? (
            <Card variant="glass" className="p-12 text-center space-y-3">
              <Icon name="shopping_bag" size={40} className="text-slate-400 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                No Active Requests
              </h3>
              <p className="text-xs text-slate-500">
                You haven't requested any livestock purchases or rentals yet.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((bk) => (
                <Card
                  key={bk.id}
                  variant="glass"
                  className="p-4 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                        <img
                          src={
                            bk.animal_image ||
                            'https://images.unsplash.com/photo-1570042707223-28f09b23b1bf?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={bk.animal_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {bk.animal_name}
                          </span>
                          <Badge
                            variant={
                              bk.status === 'Accepted' || bk.status === 'Completed'
                                ? 'emerald'
                                : bk.status === 'Rejected'
                                ? 'rose'
                                : 'amber'
                            }
                            size="sm"
                          >
                            {bk.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Booking ID #{bk.id} • Type: {bk.booking_type} • Date: {new Date(bk.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-[#2E7D32] dark:text-emerald-400 block">
                        ₹{bk.total_amount}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        {bk.payment_status === 'Paid' ? '✅ Escrow Paid' : 'Payment Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">SELLER</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {bk.seller_name} ({bk.seller_phone})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">BUYER</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {bk.buyer_name} ({bk.buyer_phone})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">LOGISTICS</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {bk.delivery_required ? '🚚 Doorstep Animal Pickup Assigned' : 'Self Collection'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon="chat"
                        onClick={() => {
                          setChatTarget({
                            orderNumber: bk.id,
                            name: bk.seller_name,
                            phone: bk.seller_phone,
                          });
                          setChatModalOpen(true);
                        }}
                      >
                        Chat Seller
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon="receipt"
                        onClick={() => setInvoiceOrderData(bk)}
                      >
                        Download Invoice
                      </Button>
                    </div>

                    {/* Owner Accept / Reject or Rating */}
                    <div className="flex items-center gap-2">
                      {bk.status === 'Pending' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon="check"
                            onClick={() => handleUpdateBookingStatus(bk.id, 'Accepted')}
                          >
                            Accept Request
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon="close"
                            onClick={() => handleUpdateBookingStatus(bk.id, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {(bk.status === 'Accepted' || bk.status === 'Completed') && (
                        <Button
                          variant="accent"
                          size="sm"
                          leftIcon="star"
                          onClick={() => {
                            setRatingTargetBooking(bk);
                            setRatingModalOpen(true);
                          }}
                        >
                          Rate Transaction
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 5. ADMIN APPROVAL PANEL VIEW */
        <div className="space-y-4">
          <Card variant="glass" className="p-4 space-y-3 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="admin_panel_settings" size={24} className="text-amber-500" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Livestock Marketplace Admin & Verification Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Approve verified listings, flag fake/fraudulent seller accounts, or remove reported entries.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((item) => (
              <Card key={item.id} variant="glass" className="p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.images[0] || 'https://images.unsplash.com/photo-1570042707223-28f09b23b1bf?auto=format&fit=crop&w=300&q=80'}
                      alt={item.animal_name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                        {item.animal_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {item.animal_type} • ₹{item.price} • Owner: {item.owner_name} ({item.phone})
                      </p>
                      <div className="flex gap-1.5 mt-1">
                        <Badge variant={item.is_approved ? 'emerald' : 'amber'} size="sm">
                          {item.is_approved ? 'Approved' : 'Pending Verification'}
                        </Badge>
                        {item.is_reported && <Badge variant="rose" size="sm">Reported</Badge>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {!item.is_approved && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon="check"
                      onClick={() => handleAdminAction(item.id, 'approve')}
                    >
                      Approve Listing
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon="flag"
                    onClick={() => handleAdminAction(item.id, 'report')}
                  >
                    Flag Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon="delete"
                    onClick={() => handleAdminAction(item.id, 'delete')}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: SELL / RENT LIVESTOCK MODAL */}
      {isSellModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-2xl w-full border border-emerald-500 shadow-2xl overflow-hidden my-6">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-amber-950 to-emerald-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="pets" size={24} className="text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base">List Animal for Sale or Rent</h3>
                  <p className="text-xs text-amber-300">Saved directly into Supabase Database & Storage</p>
                </div>
              </div>
              <button onClick={() => setIsSellModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                <Icon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateListingSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Row 1: Type & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Animal Type / Category *
                  </label>
                  <select
                    value={sellForm.animal_type}
                    onChange={(e) => setSellForm({ ...sellForm, animal_type: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Animal Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.animal_name}
                    onChange={(e) => setSellForm({ ...sellForm, animal_name: e.target.value })}
                    placeholder="e.g. Ongole Pure Native Dairy Cow (2nd Calving)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 2: Breed, Age, Gender, Weight */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Breed *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.breed}
                    onChange={(e) => setSellForm({ ...sellForm, breed: e.target.value })}
                    placeholder="e.g. Ongole / Murrah / Boer"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Age (Years/Months)
                  </label>
                  <input
                    type="text"
                    value={sellForm.age_years}
                    onChange={(e) => setSellForm({ ...sellForm, age_years: e.target.value })}
                    placeholder="3.5"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Gender
                  </label>
                  <select
                    value={sellForm.gender}
                    onChange={(e) => setSellForm({ ...sellForm, gender: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Pair">Pair</option>
                    <option value="Flock / Batch">Flock / Batch</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={sellForm.weight_kg}
                    onChange={(e) => setSellForm({ ...sellForm, weight_kg: e.target.value })}
                    placeholder="420"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 3: Milk Yield, Health, Vaccination, Pregnancy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Milk Yield (Liters/Day - if applicable)
                  </label>
                  <input
                    type="number"
                    value={sellForm.milk_yield_liters_per_day}
                    onChange={(e) => setSellForm({ ...sellForm, milk_yield_liters_per_day: e.target.value })}
                    placeholder="14"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Health Status & Vet Pass
                  </label>
                  <select
                    value={sellForm.health_status}
                    onChange={(e) => setSellForm({ ...sellForm, health_status: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Vet Certified & Vaccinated">Vet Certified & Vaccinated</option>
                    <option value="Healthy & Active">Healthy & Active</option>
                    <option value="Under Treatment / Care">Under Care</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Vaccination History
                  </label>
                  <input
                    type="text"
                    value={sellForm.vaccination_history}
                    onChange={(e) => setSellForm({ ...sellForm, vaccination_history: e.target.value })}
                    placeholder="e.g. FMD, HS & Black Quarter Vaccinated"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Pregnancy Status (if female)
                  </label>
                  <input
                    type="text"
                    value={sellForm.pregnancy_status}
                    onChange={(e) => setSellForm({ ...sellForm, pregnancy_status: e.target.value })}
                    placeholder="e.g. 3 Months Pregnant / Lactating"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 4: Pricing & Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-300 dark:border-amber-800">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-amber-200 block mb-1">
                    Listing Purpose
                  </label>
                  <select
                    value={sellForm.purpose}
                    onChange={(e) => setSellForm({ ...sellForm, purpose: e.target.value as any })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Sale">Sale Only</option>
                    <option value="Rent">Rent Only</option>
                    <option value="Both">Both Sale & Rent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-amber-200 block mb-1">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    value={sellForm.price}
                    onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                    placeholder="65000"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-amber-200 block mb-1">
                    Rental Rate (₹/Day)
                  </label>
                  <input
                    type="number"
                    value={sellForm.rental_price_per_day}
                    onChange={(e) => setSellForm({ ...sellForm, rental_price_per_day: e.target.value })}
                    placeholder="800"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Location & Owner Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Village / Mandal
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.village}
                    onChange={(e) => setSellForm({ ...sellForm, village: e.target.value })}
                    placeholder="Tenali Rural"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.district}
                    onChange={(e) => setSellForm({ ...sellForm, district: e.target.value })}
                    placeholder="Guntur"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.phone}
                    onChange={(e) => setSellForm({ ...sellForm, phone: e.target.value })}
                    placeholder="+91 98480 12345"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Media Upload Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Media Upload (Camera / Gallery Images & Video)
                </label>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon="photo_camera"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    Camera
                  </Button>
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleMediaUpload(e.target.files, 'image')}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon="photo_library"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    Gallery Images
                  </Button>
                  <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleMediaUpload(e.target.files, 'image')}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon="videocam"
                    onClick={() => videoInputRef.current?.click()}
                  >
                    Upload Video
                  </Button>
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleMediaUpload(e.target.files, 'video')}
                  />
                </div>

                {isUploadingMedia && (
                  <p className="text-xs text-amber-500 font-bold animate-pulse">
                    Uploading media to Supabase Storage...
                  </p>
                )}

                {uploadedImages.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-2">
                    {uploadedImages.map((img, idx) => (
                      <img key={idx} src={img} alt="Uploaded" className="w-14 h-14 rounded-lg object-cover border border-emerald-500" />
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex gap-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setIsSellModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="accent" fullWidth leftIcon="cloud_upload">
                  Publish to Supabase
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VETERINARY & ANIMAL FULL DETAILS MODAL */}
      {selectedListingDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-xl w-full border border-emerald-500 shadow-2xl overflow-hidden my-6">
            <div className="relative h-60 bg-slate-950">
              <img
                src={selectedListingDetail.images[0] || ''}
                alt={selectedListingDetail.animal_name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedListingDetail(null)}
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-black"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              <div>
                <Badge variant="emerald" size="sm">
                  {selectedListingDetail.animal_type} • {selectedListingDetail.breed}
                </Badge>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {selectedListingDetail.animal_name}
                </h3>
                <p className="text-slate-500">
                  Location: {selectedListingDetail.village}, {selectedListingDetail.district},{' '}
                  {selectedListingDetail.state}
                </p>
              </div>

              {/* Vet Health Breakdown */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/80 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-2">
                <h4 className="font-black text-[#2E7D32] dark:text-emerald-300 flex items-center gap-1.5 text-sm">
                  <Icon name="verified_user" size={18} />
                  Veterinary Doctor Pass & Medical Records
                </h4>
                <p className="text-slate-700 dark:text-slate-200">
                  <strong>Health Status:</strong> {selectedListingDetail.health_status}
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  <strong>Vaccination History:</strong> {selectedListingDetail.vaccination_history}
                </p>
                <p className="text-slate-700 dark:text-slate-200">
                  <strong>Medical Record:</strong> {selectedListingDetail.medical_records}
                </p>
                {selectedListingDetail.pregnancy_status && (
                  <p className="text-slate-700 dark:text-slate-200">
                    <strong>Pregnancy Status:</strong> {selectedListingDetail.pregnancy_status}
                  </p>
                )}
              </div>

              {/* Transportation Pickup Estimate */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                  <Icon name="local_shipping" size={16} className="text-amber-500" />
                  Live Animal Transport Logistics
                </span>
                <p className="text-slate-500 text-[11px]">
                  Estimated Transport: Mahindra Bolero Pickup (Livestock Cage Enabled) • Fare ~₹1,250
                  within 30 km radius.
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  variant="accent"
                  fullWidth
                  leftIcon="shopping_cart"
                  onClick={() => {
                    setSelectedBookingForPayment(selectedListingDetail);
                    setSelectedListingDetail(null);
                  }}
                >
                  Proceed to Buy / Rent
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BOOKING & ESCROW CHECKOUT MODAL */}
      {selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-lg w-full border border-emerald-500 shadow-2xl overflow-hidden my-6">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="shopping_cart" size={22} className="text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base">Livestock Escrow Booking</h3>
                  <p className="text-xs text-emerald-300">
                    Animal: {selectedBookingForPayment.animal_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForPayment(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">TOTAL ESCROW AMOUNT</span>
                  <span className="text-xl font-black text-[#2E7D32] dark:text-emerald-400">
                    ₹
                    {bookingForm.booking_type === 'Buy'
                      ? selectedBookingForPayment.price
                      : (selectedBookingForPayment.rental_price_per_day || 800) * 3}
                  </span>
                </div>
                <Badge variant="amber" size="sm">
                  {selectedBookingForPayment.owner_name}
                </Badge>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Transaction Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingForm({ ...bookingForm, booking_type: 'Buy' })}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs ${
                      bookingForm.booking_type === 'Buy'
                        ? 'bg-emerald-700 text-white border-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Purchase Animal
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingForm({ ...bookingForm, booking_type: 'Rent' })}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs ${
                      bookingForm.booking_type === 'Rent'
                        ? 'bg-emerald-700 text-white border-emerald-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Rent Animal
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Logistics & Delivery Option
                </label>
                <select
                  value={bookingForm.delivery_required ? 'yes' : 'no'}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, delivery_required: e.target.value === 'yes' })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white"
                >
                  <option value="yes">Assign Mahindra Bolero Livestock Pickup Transport (+₹1,250)</option>
                  <option value="no">Self Pickup at Farmer Barn</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Payment Gateway
                </label>
                <select
                  value={bookingForm.payment_method}
                  onChange={(e) => setBookingForm({ ...bookingForm, payment_method: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Online UPI (Escrow)">Online PhonePe / Google Pay UPI (Farm Escrow)</option>
                  <option value="Cash on Handover">Cash on Handover / Delivery</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setSelectedBookingForPayment(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  fullWidth
                  leftIcon="check_circle"
                  onClick={handleCreateBookingSubmit}
                >
                  Confirm Escrow Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MUTUAL RATING MODAL */}
      {ratingModalOpen && ratingTargetBooking && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-sm w-full p-6 space-y-4 border border-amber-500 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow">
              <Icon name="star" size={28} />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white">
              Rate Livestock Transaction
            </h3>
            <p className="text-xs text-slate-500">
              Rate your experience with seller {ratingTargetBooking.seller_name} for{' '}
              {ratingTargetBooking.animal_name}.
            </p>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRatingStars(s)}
                  className={`p-2 rounded-xl text-xl transition-transform ${
                    ratingStars >= s ? 'text-amber-400 scale-110' : 'text-slate-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Write a review about animal health, delivery & papers..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              rows={3}
            />

            <div className="flex gap-2">
              <Button variant="outline" fullWidth onClick={() => setRatingModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" fullWidth onClick={handleRatingSubmit}>
                Submit Rating
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: REALTIME CHAT MODAL */}
      {chatModalOpen && chatTarget && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          orderNumber={chatTarget.orderNumber}
          myRole="consumer"
          myName={user?.name || 'Buyer'}
          otherPartyName={chatTarget.name}
          otherPartyRole="farmer"
          otherPartyPhone={chatTarget.phone}
        />
      )}

      {/* MODAL 6: INVOICE GENERATOR MODAL */}
      {invoiceOrderData && (
        <InvoiceGeneratorModal
          orderNumber={invoiceOrderData.id}
          consumerName={invoiceOrderData.buyer_name}
          consumerPhone={invoiceOrderData.buyer_phone}
          consumerAddress="Tenali Rural, Guntur District, AP"
          farmerName={invoiceOrderData.seller_name}
          items={[
            {
              productName: `${invoiceOrderData.animal_name} (${invoiceOrderData.booking_type})`,
              quantity: 1,
              price: invoiceOrderData.total_amount,
              unit: 'animal',
            },
          ]}
          totalAmount={invoiceOrderData.total_amount}
          deliveryFee={invoiceOrderData.delivery_required ? 1250 : 0}
          paymentMethod="UPI Escrow"
          onClose={() => setInvoiceOrderData(null)}
        />
      )}
    </div>
  );
};
