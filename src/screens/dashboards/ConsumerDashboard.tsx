/**
 * FarmConnect Consumer Dashboard & Direct Produce Marketplace
 * Premium farm-to-table shopping experience featuring AI smart search, category filters,
 * reusable product cards, nearby farmers directory, live order tracking, cart & checkout modal.
 */

import React, { useState } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import {
  useFarmData,
  ProductItem,
  NearbyFarmer,
  OrderItem,
} from '../../context/FarmDataContext';
import { LiveTrackingMap } from '../../components/tracking/LiveTrackingMap';
import { InvoiceGeneratorModal } from '../../components/payments/InvoiceGeneratorModal';
import { CheckoutModal } from '../../components/payments/CheckoutModal';
import { ChatModal } from '../../components/chat/ChatModal';
import { OrderRatingModal } from '../../components/ratings/OrderRatingModal';
import { OrderQRCard } from '../../components/tracking/OrderQRCard';

export const ConsumerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab, setVoiceModalOpen } = useAppState();
  const {
    products,
    nearbyFarmers,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    cartTotal,
    wishlist,
    toggleWishlist,
    orders,
    createOrder,
  } = useFarmData();

  // Active Filters & Sort State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [sortByPrice, setSortByPrice] = useState<'none' | 'low_to_high' | 'high_to_low'>('none');
  const [organicOnly, setOrganicOnly] = useState<boolean>(false);

  // Modals & Active Selected Product for Details View
  const [selectedProductDetails, setSelectedProductDetails] = useState<ProductItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<OrderItem | null>(
    orders[0] || null
  );
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<OrderItem | null>(null);

  // Chat & Rating Modals State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatOtherParty, setChatOtherParty] = useState<{
    name: string;
    role: 'farmer' | 'delivery';
    phone?: string;
  }>({ name: 'Venkat Rao', role: 'farmer', phone: '+91 98490 55112' });

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingOrder, setRatingOrder] = useState<OrderItem | null>(null);

  // Categories
  const categories = [
    { id: 'All', label: 'All Harvests', icon: 'storefront' },
    { id: 'Vegetables', label: 'Vegetables', icon: 'eco' },
    { id: 'Fruits', label: 'Fruits', icon: 'nutrition' },
    { id: 'Grains', label: 'Grains & Rice', icon: 'grain' },
    { id: 'Spices', label: 'Guntur Spices', icon: 'local_fire_department' },
    { id: 'Pulses', label: 'Pulses & Dal', icon: 'set_meal' },
  ];

  // Filter and sort products directly from Supabase
  const filteredProducts = products
    .filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation =
        locationFilter === 'All' ||
        (p.location && p.location.toLowerCase().includes(locationFilter.toLowerCase())) ||
        (p.farmerLocation && p.farmerLocation.toLowerCase().includes(locationFilter.toLowerCase()));
      const matchesOrganic = !organicOnly || p.isOrganic;
      return matchesCategory && matchesSearch && matchesLocation && matchesOrganic;
    })
    .sort((a, b) => {
      if (sortByPrice === 'low_to_high') return a.price - b.price;
      if (sortByPrice === 'high_to_low') return b.price - a.price;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* 1. TOP SEASONAL BANNER & SEARCH HERO */}
      <Card
        variant="gradient"
        className="p-6 relative overflow-hidden bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#FF9800]"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm" icon="local_offer">
                DIRECT FARM HARVEST • 100% TRACEABLE
              </Badge>
              <span className="text-xs text-white font-bold bg-emerald-950/40 px-2.5 py-0.5 rounded-full">
                Zero Middlemen Commission
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Fresh Local Produce, Delivered From Nearby Farmers 🌾
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Order organic hybrid tomatoes, Basmati rice, Guntur green chilis, and tree-ripened Alphonso mangoes directly from verified local growers.
            </p>

            {/* Smart Search Field */}
            <div className="pt-2 relative max-w-xl">
              <input
                type="text"
                placeholder="Search crops, organic vegetables, or nearby farmers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm py-3 pl-11 pr-24 rounded-full shadow-xl border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <Icon
                name="search"
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs px-3 py-1.5 rounded-full font-bold shadow flex items-center gap-1 transition-all"
              >
                <Icon name="mic" size={14} /> Suri
              </button>
            </div>
          </div>

          {/* Cart Floating Button Header Trigger */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Button
              variant="accent"
              size="lg"
              leftIcon="shopping_cart"
              onClick={() => setIsCartOpen(true)}
              className="shadow-2xl relative"
            >
              My Farm Cart ({cart.length})
              {cart.length > 0 && (
                <span className="ml-2 bg-emerald-950 text-amber-300 px-2 py-0.5 rounded-full text-xs font-black">
                  ₹{cartTotal}
                </span>
              )}
            </Button>
            <Button
              variant="glass"
              size="md"
              leftIcon="location_on"
              onClick={() => setActiveTab('weather')}
              className="bg-white/10 text-white border-white/30"
            >
              Deliver to Guntur
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. SEARCH, CATEGORY FILTERS, LOCATION & SORT CONTROLS */}
      <div className="space-y-3">
        {/* Search & Location/Sort Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Crop Name Search */}
          <div className="relative">
            <Icon
              name="search"
              size={20}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search crops by name (e.g. Tomato, Rice, Chili)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-800/60 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D32] shadow-sm"
            />
          </div>

          {/* Location Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-800/60 rounded-2xl px-3 py-1.5 shadow-sm">
            <Icon name="location_on" size={18} className="text-[#2E7D32]" />
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Location:</span>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full bg-transparent text-xs font-extrabold text-slate-800 dark:text-emerald-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Locations</option>
              <option value="Tenali">Tenali</option>
              <option value="Guntur">Guntur</option>
              <option value="Vijayawada">Vijayawada</option>
              <option value="Krishna">Krishna</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>
          </div>

          {/* Sort By Price */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-800/60 rounded-2xl px-3 py-1.5 shadow-sm">
            <Icon name="sort" size={18} className="text-[#2E7D32]" />
            <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Sort Price:</span>
            <select
              value={sortByPrice}
              onChange={(e) => setSortByPrice(e.target.value as any)}
              className="w-full bg-transparent text-xs font-extrabold text-slate-800 dark:text-emerald-200 focus:outline-none cursor-pointer"
            >
              <option value="none">Default / Recommended</option>
              <option value="low_to_high">Price: Low to High</option>
              <option value="high_to_low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pill Tabs & Organic Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#2E7D32] text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-emerald-200 border border-slate-200 dark:border-emerald-800/40 hover:bg-slate-50'
                }`}
              >
                <Icon name={cat.icon} size={16} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setOrganicOnly((prev) => !prev)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border shrink-0 ${
              organicOnly
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-500'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-emerald-300 border-slate-200 dark:border-emerald-800/40'
            }`}
          >
            <Icon name="eco" size={18} className={organicOnly ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Organic Only ({products.filter((p) => p.isOrganic).length})</span>
          </button>
        </div>
      </div>

      {/* 3. DIRECT PRODUCE PRODUCT GRID (REUSABLE CARDS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            Direct Farm Produce ({filteredProducts.length})
          </h2>
          <span className="text-xs text-slate-500 dark:text-emerald-300">
            Sorted by Distance & Harvest Freshness
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {filteredProducts.map((prod) => {
            const inCart = cart.find((item) => item.product.id === prod.id);
            const isWishlisted = wishlist.includes(prod.id);

            return (
              <Card
                key={prod.id}
                variant="glass"
                className="overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all border-slate-200/80 dark:border-emerald-800/40"
              >
                <div
                  onClick={() => setSelectedProductDetails(prod)}
                  className="cursor-pointer"
                >
                  {/* Image & Badges Overlay */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                      {prod.isOrganic && (
                        <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                          <Icon name="eco" size={12} /> 100% Organic
                        </span>
                      )}
                      <span className="bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        📍 {prod.location || prod.farmerLocation}
                      </span>
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-rose-500 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                      title="Add to Wishlist"
                    >
                      <Icon name={isWishlisted ? 'favorite' : 'favorite_border'} size={18} />
                    </button>

                    {/* Harvest Date Badge */}
                    <div className="absolute bottom-2 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-lg">
                      Harvested: {prod.harvestDate}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    {/* Farmer Avatar & Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            prod.farmerAvatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={prod.farmerName}
                          className="w-6 h-6 rounded-full object-cover border border-emerald-500"
                        />
                        <span className="text-xs font-bold text-slate-700 dark:text-emerald-200 truncate max-w-[110px]">
                          {prod.farmerName}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                        ★ {prod.rating} ({prod.reviewsCount})
                      </span>
                    </div>

                    {/* Crop Title */}
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                      {prod.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-emerald-300/80 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Stock & AI Price Row */}
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        Stock: {prod.stockQty} {prod.unit}
                      </span>
                      {prod.aiRecommendedPrice && (
                        <span className="text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Icon name="psychology" size={12} /> AI Rec: ₹{prod.aiRecommendedPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Price & Actions */}
                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-emerald-900/40 mt-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Farmer Price</span>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-300">
                      ₹{prod.price}{' '}
                      <span className="text-xs font-normal text-slate-500">/ {prod.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Buy Now Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod);
                        setIsCartOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
                    >
                      Buy Now
                    </button>

                    {inCart ? (
                      <div className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950 p-1 rounded-xl border border-emerald-400">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQty(prod.id, inCart.quantity - 1);
                          }}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 text-emerald-900 dark:text-white font-bold flex items-center justify-center shadow-sm"
                        >
                          -
                        </button>
                        <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 px-1">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQty(prod.id, inCart.quantity + 1);
                          }}
                          className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center shadow-sm"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(prod);
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-slate-700 dark:text-emerald-300 rounded-xl transition-all"
                        title="Add to Cart"
                      >
                        <Icon name="add_shopping_cart" size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. NEARBY VERIFIED FARMERS DIRECTORY */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Nearby Verified Local Farmers
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-300">
              Connect directly or schedule farm visits
            </p>
          </div>
          <Badge variant="emerald" size="sm">Guntur Region</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nearbyFarmers.map((f) => (
            <Card
              key={f.id}
              variant="glass"
              className="p-4 space-y-3 border-slate-200/80 dark:border-emerald-800/40"
            >
              <div className="flex items-start gap-3">
                <img
                  src={f.avatar}
                  alt={f.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {f.name}
                    </h3>
                    {f.isVerified && (
                      <Icon name="verified" size={16} className="text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[#2E7D32] dark:text-emerald-300 truncate">
                    {f.farmName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">📍 {f.location} ({f.distance})</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-emerald-300/80 line-clamp-2 leading-relaxed">
                {f.bio}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-emerald-900/40 text-xs">
                <span className="text-amber-600 font-bold">
                  ★ {f.rating} ({f.reviewsCount} reviews)
                </span>
                <span className="text-slate-500 font-medium">{f.landSize}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. LIVE ORDER TRACKING SECTION */}
      {activeTrackingOrder && (
        <div className="space-y-4">
          <Card variant="glass" className="p-5 space-y-4 border-2 border-emerald-500/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-md">
                  <Icon name="local_shipping" size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      Live Order Tracker • #{activeTrackingOrder.orderNumber}
                    </h3>
                    <Badge variant="amber" size="sm">
                      {activeTrackingOrder.status.toUpperCase().replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-emerald-300">
                    Est Arrival: {activeTrackingOrder.estimatedDelivery} • Merchant: {activeTrackingOrder.farmerName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon="chat"
                  onClick={() => {
                    setChatOtherParty({
                      name: activeTrackingOrder.farmerName,
                      role: 'farmer',
                      phone: activeTrackingOrder.farmerPhone || '+91 98490 55112',
                    });
                    setChatModalOpen(true);
                  }}
                >
                  Chat Farmer
                </Button>

                {activeTrackingOrder.driverName && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon="directions_car"
                    onClick={() => {
                      setChatOtherParty({
                        name: activeTrackingOrder.driverName || 'Driver',
                        role: 'delivery',
                        phone: activeTrackingOrder.driverPhone || '+91 98663 44102',
                      });
                      setChatModalOpen(true);
                    }}
                  >
                    Chat Driver
                  </Button>
                )}

                <Button
                  variant="accent"
                  size="sm"
                  leftIcon="star"
                  onClick={() => {
                    setRatingOrder(activeTrackingOrder);
                    setRatingModalOpen(true);
                  }}
                >
                  Rate Order
                </Button>

                <Button
                  variant="accent"
                  size="sm"
                  leftIcon="download"
                  onClick={() => setInvoiceModalOrder(activeTrackingOrder)}
                >
                  Invoice (PDF)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon="receipt"
                  onClick={() => setActiveTab('orders')}
                >
                  All ({orders.length})
                </Button>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
              {activeTrackingOrder.trackingSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                    step.completed
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-400'
                      : step.active
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-400 animate-pulse'
                      : 'bg-slate-50 dark:bg-slate-900/40 text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="text-xs font-black">{idx + 1}. {step.label}</div>
                  <div className="text-[10px] opacity-80">{step.time}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Order Verification QR Code Card */}
          <OrderQRCard order={activeTrackingOrder} />

          {/* Google Maps Interactive Live GPS Delivery Map */}
          {(activeTrackingOrder.status === 'out_for_delivery' ||
            activeTrackingOrder.status === 'accepted' ||
            activeTrackingOrder.status === 'packed') && (
            <LiveTrackingMap
              orderNumber={activeTrackingOrder.orderNumber}
              farmerName={activeTrackingOrder.farmerName}
              farmerAddress="Tenali Farm Cluster, Guntur"
              consumerName={activeTrackingOrder.consumerName}
              consumerAddress={activeTrackingOrder.consumerAddress}
              driverName="Venkat Subbaiah"
              driverPhone="+91 98663 44102"
              vehicleType="Bolero Pickup"
              vehicleNumber="AP 07 TJ 8821"
            />
          )}
        </div>
      )}

      {/* Invoice Generator Modal */}
      {invoiceModalOrder && (
        <InvoiceGeneratorModal
          orderNumber={invoiceModalOrder.orderNumber}
          consumerName={invoiceModalOrder.consumerName}
          consumerPhone={invoiceModalOrder.consumerPhone}
          consumerAddress={invoiceModalOrder.consumerAddress}
          farmerName={invoiceModalOrder.farmerName}
          items={invoiceModalOrder.items}
          totalAmount={invoiceModalOrder.totalAmount}
          deliveryFee={invoiceModalOrder.deliveryFee || 140}
          paymentMethod={invoiceModalOrder.paymentMethod}
          onClose={() => setInvoiceModalOrder(null)}
        />
      )}

      {/* 6. SHOPPING CART DRAWER / MODAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl border-l border-slate-200 dark:border-emerald-800 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900 pb-3">
                <div className="flex items-center gap-2">
                  <Icon name="shopping_bag" size={24} className="text-[#2E7D32]" />
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Farm Basket ({cart.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Icon name="remove_shopping_cart" size={48} className="text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-500">Your farm basket is empty.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-emerald-800/40 flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.product.name}
                        </h4>
                        <div className="text-xs font-extrabold text-[#2E7D32] dark:text-emerald-300">
                          ₹{item.product.price} / {item.product.unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-[#2E7D32] text-white font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-emerald-900">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Total Payable</span>
                  <span className="text-xl font-black text-[#2E7D32] dark:text-emerald-300">
                    ₹{cartTotal}
                  </span>
                </div>
                <Button
                  variant="accent"
                  size="lg"
                  fullWidth
                  leftIcon="lock"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                >
                  Proceed to Secure Checkout
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. CHECKOUT MODAL (FULL PRODUCTION RAZORPAY FLOW) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        cartTotal={cartTotal}
        onPlaceOrder={createOrder}
        onSuccessOrderCreated={(newOrd) => {
          setActiveTrackingOrder(newOrd);
          setIsCheckoutOpen(false);
        }}
      />

      {/* Realtime Chat Modal */}
      {chatModalOpen && activeTrackingOrder && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          orderNumber={activeTrackingOrder.orderNumber}
          myRole="consumer"
          myName={user?.name || 'Suresh Kumar'}
          otherPartyName={chatOtherParty.name}
          otherPartyRole={chatOtherParty.role}
          otherPartyPhone={chatOtherParty.phone}
        />
      )}

      {/* Order Rating & Review Modal */}
      {ratingModalOpen && ratingOrder && (
        <OrderRatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          orderNumber={ratingOrder.orderNumber}
          userRole="consumer"
          farmerName={ratingOrder.farmerName}
          driverName={ratingOrder.driverName || 'Subbaiah Delivery Partner'}
          productName={ratingOrder.items[0]?.productName || 'Harvest Items'}
          onSubmitRating={(ratings) => {
            console.log('Submitted rating for order:', ratingOrder.orderNumber, ratings);
          }}
        />
      )}
      {/* 9. PRODUCT DETAILS MODAL */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-lg w-full overflow-hidden border border-slate-200 dark:border-emerald-800 shadow-2xl my-8">
            {/* Header Image */}
            <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800">
              <img
                src={selectedProductDetails.image}
                alt={selectedProductDetails.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/80 transition-all"
              >
                <Icon name="close" size={20} />
              </button>

              <div className="absolute top-3 left-3 flex gap-2">
                {selectedProductDetails.isOrganic && (
                  <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Icon name="eco" size={14} /> 100% Organic
                  </span>
                )}
                <span className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full shadow-md">
                  In Stock ({selectedProductDetails.stockQty} {selectedProductDetails.unit})
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-emerald-300">
                    Category: {selectedProductDetails.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Icon name="calendar_today" size={14} /> Harvested: {selectedProductDetails.harvestDate}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedProductDetails.name}
                </h3>
              </div>

              {/* Farmer Profile & Location Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedProductDetails.farmerAvatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={selectedProductDetails.farmerName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                      {selectedProductDetails.farmerName}
                      <Icon name="verified" size={16} className="text-[#2E7D32]" />
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-emerald-300 flex items-center gap-1">
                      <Icon name="location_on" size={14} /> {selectedProductDetails.location || selectedProductDetails.farmerLocation}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-amber-600 flex items-center gap-0.5 justify-end">
                    ★ {selectedProductDetails.rating}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {selectedProductDetails.reviewsCount} reviews
                  </span>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-600 dark:text-emerald-300">
                      Farmer Listing Price:
                    </span>
                    <div className="text-2xl font-black text-[#2E7D32] dark:text-emerald-300">
                      ₹{selectedProductDetails.price} <span className="text-xs font-normal">/ {selectedProductDetails.unit}</span>
                    </div>
                  </div>

                  {selectedProductDetails.aiRecommendedPrice && (
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1 justify-end">
                        <Icon name="psychology" size={16} /> AI Benchmark Price:
                      </span>
                      <div className="text-lg font-extrabold text-slate-700 dark:text-amber-300">
                        ₹{selectedProductDetails.aiRecommendedPrice} / {selectedProductDetails.unit}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-600 dark:text-emerald-200/90 pt-1 border-t border-emerald-200 dark:border-emerald-800/80">
                  <span className="font-bold">Availability:</span>{' '}
                  {selectedProductDetails.stockQty > 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">
                      Ready for direct shipment ({selectedProductDetails.stockQty} {selectedProductDetails.unit} remaining)
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold">Out of stock</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-slate-700 dark:text-emerald-200">
                  Crop Description & Quality Standard:
                </h5>
                <p className="text-xs text-slate-600 dark:text-emerald-300/80 leading-relaxed">
                  {selectedProductDetails.description}
                </p>
              </div>

              {/* Add to Cart Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-emerald-900/60 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProductDetails(null)}
                  className="w-1/3"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  leftIcon="add_shopping_cart"
                  onClick={() => {
                    addToCart(selectedProductDetails);
                    setSelectedProductDetails(null);
                  }}
                  className="w-2/3"
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
