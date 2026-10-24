/**
 * FarmConnect Farmer Dashboard
 * Comprehensive management portal for farmers featuring farm profile header,
 * crop listing management modal, order workflow (Kanban/Tabbed), quick actions, and analytics.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { useFarmData, ProductItem, OrderStatus, OrderItem } from '../../context/FarmDataContext';
import { fetchAgmarknetPrice, AgmarknetPriceInfo } from '../../services/aiPricingService';
import { uploadProductImageToSupabase } from '../../services/supabaseProductService';
import { ChatModal } from '../../components/chat/ChatModal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab, isVoiceAutoFillEnabled, toggleVoiceAutoFill } = useAppState();
  const { products, addProduct, deleteProduct, orders, updateOrderStatus } = useFarmData();

  // Modal State for "Add Product / Crop"
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState<OrderStatus>('pending');

  // Chat Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<{
    orderNumber: string;
    name: string;
    role: 'consumer' | 'delivery';
    phone?: string;
  } | null>(null);

  // Add Product Form State
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [cropForm, setCropForm] = useState({
    name: '',
    category: 'Vegetables' as ProductItem['category'],
    location: user?.location || 'Tenali, Guntur District',
    district: 'Guntur',
    village: 'Tenali',
    gpsLocation: '16.2434, 80.6401',
    price: '',
    marketPrice: '',
    aiRecommendedPrice: 0,
    unit: 'kg' as ProductItem['unit'],
    stockQty: '',
    harvestDate: 'Today (Fresh)',
    expiryDate: '7 Days',
    isOrganic: true,
    availableForDelivery: true,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
  });
  
  const [agmarknetInfo, setAgmarknetInfo] = useState<AgmarknetPriceInfo | null>(null);
  const [isFetchingAgmarknet, setIsFetchingAgmarknet] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
  ]);

  // Fetch AGMARKNET price recommendations whenever crop name changes
  useEffect(() => {
    if (!cropForm.name.trim()) {
      setAgmarknetInfo(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingAgmarknet(true);
      try {
        const info = await fetchAgmarknetPrice(
          cropForm.name,
          cropForm.location,
          cropForm.isOrganic
        );
        setAgmarknetInfo(info);
        setCropForm((prev) => ({
          ...prev,
          aiRecommendedPrice: info.aiRecommendedPrice,
          marketPrice: prev.marketPrice || String(info.maxPrice || Math.round(info.aiRecommendedPrice * 1.15)),
        }));
      } catch (e) {
        console.warn('AGMARKNET fetch error:', e);
      } finally {
        setIsFetchingAgmarknet(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cropForm.name, cropForm.location, cropForm.isOrganic]);

  // Explicit AI Price Fetch Action
  const handleGetAiPrice = async () => {
    if (!cropForm.name.trim()) {
      setFormError('Please enter a product name first to fetch AI price.');
      return;
    }
    setIsFetchingAgmarknet(true);
    setFormError('');
    try {
      const info = await fetchAgmarknetPrice(cropForm.name, cropForm.location, cropForm.isOrganic);
      setAgmarknetInfo(info);
      setCropForm((prev) => ({
        ...prev,
        price: String(info.aiRecommendedPrice),
        aiRecommendedPrice: info.aiRecommendedPrice,
        marketPrice: String(info.maxPrice || Math.round(info.aiRecommendedPrice * 1.15)),
      }));
    } catch (e) {
      console.warn(e);
    } finally {
      setIsFetchingAgmarknet(false);
    }
  };

  // Handle Real Product Image Upload to Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadProductImageToSupabase(file);
      setUploadedImages([publicUrl, ...uploadedImages]);
      setCropForm((prev) => ({ ...prev, imageUrl: publicUrl }));
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle Add Crop submit
  const handleAddProductSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!cropForm.name.trim() || !cropForm.price || !cropForm.stockQty) {
      setFormError('Please fill in crop name, price, and stock quantity.');
      return;
    }

    const finalPrice = parseFloat(cropForm.price);

    await addProduct({
      name: cropForm.name + (isDraft ? ' (Draft)' : ''),
      category: cropForm.category,
      farmerId: user?.id || 'f1',
      farmerName: user?.name || 'Venkat Rao',
      farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      farmerLocation: `${cropForm.village}, ${cropForm.district}`,
      location: `${cropForm.village}, ${cropForm.district}`,
      district: cropForm.district,
      village: cropForm.village,
      gpsLocation: cropForm.gpsLocation,
      distance: '0.0 km (Your Farm)',
      price: finalPrice,
      marketPrice: cropForm.marketPrice ? parseFloat(cropForm.marketPrice) : Math.round(finalPrice * 1.15),
      aiRecommendedPrice: cropForm.aiRecommendedPrice || finalPrice,
      unit: cropForm.unit,
      stockQty: parseInt(cropForm.stockQty, 10),
      harvestDate: cropForm.harvestDate,
      expiryDate: cropForm.expiryDate,
      isOrganic: cropForm.isOrganic,
      availableForDelivery: cropForm.availableForDelivery,
      description: cropForm.description || 'Farm-fresh harvest direct from verified farm.',
      image: uploadedImages[0] || cropForm.imageUrl,
      badges: cropForm.isOrganic ? ['100% Organic', 'Fresh Harvest'] : ['Direct Harvest'],
    });

    // Reset Form
    setCropForm({
      name: '',
      category: 'Vegetables',
      location: user?.location || 'Tenali, Guntur District',
      district: 'Guntur',
      village: 'Tenali',
      gpsLocation: '16.2434, 80.6401',
      price: '',
      marketPrice: '',
      aiRecommendedPrice: 0,
      unit: 'kg',
      stockQty: '',
      harvestDate: 'Today (Fresh)',
      expiryDate: '7 Days',
      isOrganic: true,
      availableForDelivery: true,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
    });
    setAgmarknetInfo(null);
    setFormError('');
    setIsAddModalOpen(false);
  };

  // Farmer Analytics Mock Data
  const weeklySalesData = [
    { day: 'Mon', revenue: 3400, kgSold: 90 },
    { day: 'Tue', revenue: 5200, kgSold: 140 },
    { day: 'Wed', revenue: 4100, kgSold: 110 },
    { day: 'Thu', revenue: 7800, kgSold: 210 },
    { day: 'Fri', revenue: 6500, kgSold: 175 },
    { day: 'Sat', revenue: 9800, kgSold: 260 },
    { day: 'Sun', revenue: 8400, kgSold: 220 },
  ];

  const topSellingCrops = [
    { name: 'Hybrid Tomatoes', value: 48, color: '#2E7D32' },
    { name: 'Green Chili', value: 28, color: '#66BB6A' },
    { name: 'Brinjal', value: 14, color: '#FFB300' },
    { name: 'Ridge Gourd', value: 10, color: '#43A047' },
  ];

  // Filter orders for active tab
  const filteredOrders = orders.filter((o) => o.status === activeOrderTab);

  return (
    <div className="space-y-6">
      {/* 1. TOP SECTION: FARMER PROFILE HERO CARD */}
      <Card
        variant="gradient"
        className="p-6 relative overflow-hidden bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#388E3C] border border-[#66BB6A]/30 shadow-xl shadow-[#1B5E20]/20"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Profile Avatar */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                alt="Farmer Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/20 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#FFB300] text-[#1B5E20] rounded-full flex items-center justify-center shadow-md font-bold">
                <Icon name="verified" size={18} />
              </span>
            </div>

            {/* Farm Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="amber" size="sm" icon="verified" className="bg-[#FFB300] text-[#1B5E20] border-none font-bold">
                  Verified Organic Farmer
                </Badge>
                <span className="text-xs text-[#FFB300] font-bold bg-black/25 px-2.5 py-0.5 rounded-full border border-[#FFB300]/30">
                  ★ 4.9 (124 Buyer Reviews)
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {user?.name || 'Venkat Rao'} • <span className="text-[#FFB300]">Sri Venkateswara Organic Farm</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100 font-semibold">
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                  <Icon name="location_on" size={16} className="text-[#FFB300]" /> Tenali, Guntur District, AP
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                  <Icon name="landscape" size={16} className="text-[#66BB6A]" /> Land Size: 4.5 Acres
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                  <Icon name="potted_plant" size={16} className="text-[#66BB6A]" /> Crops: Tomato, Chili, Paddy
                </span>
              </div>
            </div>
          </div>

          {/* Quick Primary Actions & Voice Auto Fill Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            {/* Voice Auto Fill Toggle */}
            <div className="flex items-center gap-3 bg-black/35 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-lg">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl transition-colors ${isVoiceAutoFillEnabled ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-slate-700 text-slate-300'}`}>
                  <Icon name={isVoiceAutoFillEnabled ? 'mic' : 'mic_off'} size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                    Voice Auto Fill
                  </span>
                  <span className={`text-xs font-black tracking-tight ${isVoiceAutoFillEnabled ? 'text-amber-300' : 'text-slate-300'}`}>
                    Voice Auto Fill {isVoiceAutoFillEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleVoiceAutoFill}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVoiceAutoFillEnabled ? 'bg-amber-500' : 'bg-slate-600'
                }`}
                aria-label="Toggle Voice Auto Fill"
                title={`Voice Auto Fill is currently ${isVoiceAutoFillEnabled ? 'ON' : 'OFF'}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isVoiceAutoFillEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <Button
              variant="accent"
              size="lg"
              leftIcon="add_circle"
              onClick={() => setIsAddModalOpen(true)}
              className="shadow-xl"
            >
              Add New Crop
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon="psychology"
              onClick={() => setActiveTab('ai_assistant')}
              className="bg-white/15 text-white border-white/40 hover:bg-white/25"
            >
              AI Crop Doctor
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. DASHBOARD METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Crops Listed',
            value: `${products.length} Items`,
            change: '+2 Added this week',
            icon: 'inventory_2',
            iconBg: 'bg-[#2E7D32]/10 text-[#2E7D32]',
            changeColor: 'text-[#43A047]',
          },
          {
            label: 'Active Direct Orders',
            value: `${orders.filter((o) => o.status !== 'delivered').length} Active`,
            change: '₹24,500 Total Value',
            icon: 'shopping_cart',
            iconBg: 'bg-[#FFB300]/20 text-[#1B5E20]',
            changeColor: 'text-[#1B5E20]',
          },
          {
            label: 'Monthly Net Earnings',
            value: '₹48,200',
            change: '+22% vs Last Month',
            icon: 'payments',
            iconBg: 'bg-[#43A047]/15 text-[#2E7D32]',
            changeColor: 'text-[#43A047]',
          },
          {
            label: 'Pending Deliveries',
            value: `${orders.filter((o) => o.status === 'out_for_delivery' || o.status === 'pending').length} Orders`,
            change: 'Logistics Assigned',
            icon: 'local_shipping',
            iconBg: 'bg-[#FB8C00]/15 text-[#FB8C00]',
            changeColor: 'text-[#FB8C00]',
          },
        ].map((m, idx) => (
          <Card key={idx} variant="solid" className="p-4 space-y-2.5 bg-white dark:bg-slate-900 border border-[#2E7D32]/15 shadow-[0_4px_20px_-2px_rgba(46,125,50,0.06)] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#37474F]/80 dark:text-emerald-300/80">
                {m.label}
              </span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${m.iconBg}`}>
                <Icon name={m.icon} size={22} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#1B5E20] dark:text-white tracking-tight">
              {m.value}
            </div>
            <div className={`text-xs font-extrabold ${m.changeColor}`}>
              {m.change}
            </div>
          </Card>
        ))}
      </div>

      {/* 3. QUICK ACTIONS GRID */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#1B5E20] dark:text-emerald-400">
          Farmer Ecosystem Workflows
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Add Crop', icon: 'add_box', action: () => setIsAddModalOpen(true), color: 'bg-[#2E7D32] text-white' },
            { label: 'View Orders', icon: 'receipt_long', action: () => setActiveTab('orders'), color: 'bg-[#FB8C00] text-white' },
            { label: 'Hire Workers', icon: 'groups', action: () => setActiveTab('worker_marketplace'), color: 'bg-[#1B5E20] text-white' },
            { label: 'Rent Tractor', icon: 'precision_manufacturing', action: () => setActiveTab('equipment_marketplace'), color: 'bg-[#66BB6A] text-slate-950 font-bold' },
            { label: 'Livestock', icon: 'pets', action: () => setActiveTab('livestock_marketplace'), color: 'bg-[#FFB300] text-slate-950 font-bold' },
            { label: 'Govt Schemes', icon: 'account_balance', action: () => setActiveTab('govt_schemes'), color: 'bg-[#43A047] text-white' },
            { label: 'AI Disease Scan', icon: 'camera_alt', action: () => setActiveTab('ai_assistant'), color: 'bg-[#D32F2F] text-white' },
            { label: 'Voice Assistant', icon: 'mic', action: () => setActiveTab('ai_assistant'), color: 'bg-[#37474F] text-white' },
          ].map((act, idx) => (
            <button
              key={idx}
              onClick={act.action}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-[#2E7D32]/15 hover:border-[#2E7D32] shadow-[0_2px_12px_rgba(46,125,50,0.05)] hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group active:scale-95 cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${act.color} group-hover:scale-110 transition-transform`}>
                <Icon name={act.icon} size={22} />
              </div>
              <span className="text-[11px] font-bold text-[#37474F] dark:text-emerald-200 leading-tight">
                {act.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. PRODUCT MANAGEMENT & ORDER WORKFLOW (TABBED / KANBAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Listed Products Catalog */}
        <Card variant="solid" className="p-5 space-y-4 lg:col-span-1 bg-white dark:bg-slate-900 border border-[#2E7D32]/15 shadow-[0_4px_20px_-2px_rgba(46,125,50,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#1B5E20] dark:text-white">
                My Farm Produce ({products.length})
              </h3>
              <p className="text-xs font-semibold text-[#37474F]/80 dark:text-emerald-300">Active market inventory</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon="add"
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Crop
            </Button>
          </div>

          {/* Listed Products List */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-[#2E7D32]/15 dark:border-emerald-800/40 flex items-center gap-3 group hover:border-[#2E7D32]/40 hover:shadow-md transition-all"
              >
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#2E7D32]/10"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-[#1B5E20] dark:text-emerald-100 truncate">
                      {prod.name}
                    </span>
                    {prod.isOrganic && (
                      <span className="text-[10px] bg-[#43A047]/15 text-[#1B5E20] dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md font-extrabold shrink-0">
                        Organic
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-black text-[#2E7D32] dark:text-emerald-300">
                    ₹{prod.price} / {prod.unit}
                  </div>
                  <div className="text-[11px] font-semibold text-[#37474F]/80 dark:text-emerald-400">
                    Stock: {prod.stockQty} {prod.unit} • {prod.harvestDate}
                  </div>
                </div>
                <button
                  onClick={() => deleteProduct(prod.id)}
                  className="text-slate-400 hover:text-[#D32F2F] p-1.5 rounded-lg hover:bg-[#D32F2F]/10 transition-colors cursor-pointer"
                  title="Remove Listing"
                >
                  <Icon name="delete_outline" size={18} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Order Management Workflow */}
        <Card variant="solid" className="p-5 space-y-4 lg:col-span-2 bg-white dark:bg-slate-900 border border-[#2E7D32]/15 shadow-[0_4px_20px_-2px_rgba(46,125,50,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-[#1B5E20] dark:text-white">
                Buyer Orders Management
              </h3>
              <p className="text-xs font-semibold text-[#37474F]/80 dark:text-emerald-300">
                Direct trade fulfillment & logistics pipeline
              </p>
            </div>
            <Badge variant="amber" size="sm" icon="sync" className="bg-[#FFB300]/20 text-[#1B5E20] border border-[#FFB300]/40 font-bold">
              Live Escrow Protected
            </Badge>
          </div>

          {/* Kanban / Order State Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar border-b border-slate-200 dark:border-emerald-800/40">
            {[
              { id: 'pending', label: 'Pending', count: orders.filter((o) => o.status === 'pending').length },
              { id: 'accepted', label: 'Accepted', count: orders.filter((o) => o.status === 'accepted').length },
              { id: 'packed', label: 'Packed', count: orders.filter((o) => o.status === 'packed').length },
              { id: 'out_for_delivery', label: 'In Transit', count: orders.filter((o) => o.status === 'out_for_delivery').length },
              { id: 'delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveOrderTab(tab.id as OrderStatus)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeOrderTab === tab.id
                    ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/25'
                    : 'bg-[#F7FAF5] text-[#37474F] dark:bg-slate-800 dark:text-emerald-200 hover:bg-[#2E7D32]/10'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
                    activeOrderTab === tab.id
                      ? 'bg-[#FFB300] text-[#1B5E20]'
                      : 'bg-slate-200 dark:bg-slate-700 text-[#37474F] dark:text-emerald-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Active Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-[#F7FAF5] dark:bg-slate-900/40 rounded-2xl border border-dashed border-[#2E7D32]/20 dark:border-emerald-800/40">
                <div className="w-12 h-12 rounded-full bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center mx-auto font-bold">
                  <Icon name="inbox" size={24} />
                </div>
                <p className="text-sm font-extrabold text-[#1B5E20] dark:text-emerald-300">
                  No orders in "{activeOrderTab}" stage right now.
                </p>
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 bg-white dark:bg-slate-900/80 rounded-2xl border border-[#2E7D32]/15 dark:border-emerald-800/40 space-y-3 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-emerald-900/40 pb-2.5">
                    <div>
                      <span className="text-xs font-black text-[#2E7D32] dark:text-emerald-300">
                        Order #{ord.orderNumber}
                      </span>
                      <h4 className="text-sm font-black text-[#1B5E20] dark:text-white">
                        {ord.consumerName} • <span className="text-xs font-medium text-[#37474F]">{ord.consumerPhone}</span>
                      </h4>
                      <p className="text-xs font-semibold text-[#37474F]/80 dark:text-emerald-300 truncate">
                        📍 {ord.consumerAddress}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-[#1B5E20] dark:text-white">
                        ₹{ord.totalAmount}
                      </div>
                      <Badge variant="emerald" size="sm" className="bg-[#43A047]/15 text-[#1B5E20] border-none font-bold">
                        {ord.paymentMethod} • {ord.paymentStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Purchased Items */}
                  <div className="space-y-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={it.image}
                            alt={it.productName}
                            className="w-8 h-8 rounded-lg object-cover border border-[#2E7D32]/10"
                          />
                          <span className="font-extrabold text-[#37474F] dark:text-emerald-100">
                            {it.productName} ({it.quantity} {it.unit})
                          </span>
                        </div>
                        <span className="font-black text-[#1B5E20] dark:text-emerald-300">
                          ₹{it.price * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status Advance Action */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-emerald-900/40">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon="chat"
                        onClick={() => {
                          setChatTarget({
                            orderNumber: ord.orderNumber,
                            name: ord.consumerName,
                            role: 'consumer',
                            phone: ord.consumerPhone,
                          });
                          setChatModalOpen(true);
                        }}
                      >
                        Chat Buyer
                      </Button>
                      {ord.driverName && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon="directions_car"
                          onClick={() => {
                            setChatTarget({
                              orderNumber: ord.orderNumber,
                              name: ord.driverName || 'Driver',
                              role: 'delivery',
                              phone: ord.driverPhone || '+91 98663 44102',
                            });
                            setChatModalOpen(true);
                          }}
                        >
                          Chat Driver
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {ord.status === 'pending' && (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon="cancel"
                            onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon="check_circle"
                            onClick={() => updateOrderStatus(ord.id, 'accepted')}
                          >
                            Accept Order
                          </Button>
                        </>
                      )}
                      {ord.status === 'accepted' && (
                        <Button
                          variant="accent"
                          size="sm"
                          leftIcon="inventory"
                          onClick={() => updateOrderStatus(ord.id, 'packed')}
                        >
                          Mark as Packed
                        </Button>
                      )}
                      {ord.status === 'packed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon="local_shipping"
                          onClick={() => updateOrderStatus(ord.id, 'out_for_delivery')}
                        >
                          Handover to Delivery
                        </Button>
                      )}
                      {ord.status === 'out_for_delivery' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon="done_all"
                          onClick={() => updateOrderStatus(ord.id, 'delivered')}
                          className="bg-[#43A047]/15 text-[#1B5E20] hover:bg-[#43A047]/25 font-bold"
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 5. FARMER ANALYTICS & REVENUE CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="solid" className="p-5 space-y-4 lg:col-span-2 bg-white dark:bg-slate-900 border border-[#2E7D32]/15 shadow-[0_4px_20px_-2px_rgba(46,125,50,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#1B5E20] dark:text-white">
                Weekly Farm Revenue & Sales (kg)
              </h3>
              <p className="text-xs font-semibold text-[#37474F]/80 dark:text-emerald-300">
                Direct consumer sales volume
              </p>
            </div>
            <Badge variant="emerald" size="sm" className="bg-[#2E7D32]/10 text-[#1B5E20] border border-[#2E7D32]/20 font-bold">
              ₹45,200 Total
            </Badge>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#37474F" fontSize={11} tickLine={false} fontWeight={600} />
                <YAxis stroke="#37474F" fontSize={11} tickLine={false} fontWeight={600} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B5E20',
                    borderRadius: '14px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  formatter={(val: any, name: any) => [
                    name === 'revenue' ? `₹${val}` : `${val} kg`,
                    name === 'revenue' ? 'Earnings' : 'Quantity Sold',
                  ]}
                />
                <Bar dataKey="revenue" fill="#2E7D32" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Selling Produce Pie Chart */}
        <Card variant="solid" className="p-5 space-y-4 lg:col-span-1 bg-white dark:bg-slate-900 border border-[#2E7D32]/15 shadow-[0_4px_20px_-2px_rgba(46,125,50,0.06)]">
          <div>
            <h3 className="text-base font-black text-[#1B5E20] dark:text-white">
              Top Selling Crops Share
            </h3>
            <p className="text-xs font-semibold text-[#37474F]/80 dark:text-emerald-300">By revenue contribution</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topSellingCrops}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {topSellingCrops.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B5E20',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {topSellingCrops.map((c, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-[#37474F] font-semibold dark:text-emerald-200 truncate">{c.name}:</span>
                <span className="font-black text-[#1B5E20] dark:text-white">{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 6. ADD PRODUCT FORM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-2xl w-full p-6 space-y-5 border border-[#2E7D32]/20 dark:border-emerald-800/80 shadow-2xl my-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-emerald-900/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] dark:text-emerald-400 flex items-center justify-center border border-[#2E7D32]/20 font-bold">
                  <Icon name="add_shopping_cart" size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1B5E20] dark:text-white">
                    Add Product to Marketplace
                  </h3>
                  <p className="text-xs font-semibold text-[#37474F]/80 dark:text-emerald-300">
                    Saves to Supabase Database & Realtime Sync
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#37474F]/60 hover:text-[#1B5E20] dark:hover:text-white p-2 rounded-xl transition-all cursor-pointer"
              >
                <Icon name="close" size={22} />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-[#D32F2F]/10 border border-[#D32F2F]/30 rounded-2xl text-xs font-bold text-[#D32F2F] flex items-center gap-2">
                <Icon name="error" size={18} />
                {formError}
              </div>
            )}

            <form onSubmit={(e) => handleAddProductSubmit(e, false)} className="space-y-4">
              {/* CROP NAME & CATEGORY ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Crop / Product Name */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Organic Tomato / Basmati Rice / Tractor"
                    value={cropForm.name}
                    onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                {/* Product Category */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    Product Category *
                  </label>
                  <select
                    value={cropForm.category}
                    onChange={(e) =>
                      setCropForm({ ...cropForm, category: e.target.value as any })
                    }
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    <option value="Vegetables">🥦 Vegetables</option>
                    <option value="Fruits">🍎 Fruits</option>
                    <option value="Grains">🌾 Grains</option>
                    <option value="Pulses">🫘 Pulses</option>
                    <option value="Spices">🌶 Spices</option>
                    <option value="Flowers">🌸 Flowers</option>
                    <option value="Seeds">🌱 Seeds</option>
                    <option value="Fertilizers">🧪 Fertilizers</option>
                    <option value="Pesticides">🛡 Pesticides</option>
                    <option value="Farm Equipment">🛠 Farm Equipment</option>
                    <option value="Tractors">🚜 Tractors</option>
                    <option value="Harvest Machines">⚙️ Harvest Machines</option>
                    <option value="Livestock">🐄 Livestock</option>
                    <option value="Dairy Products">🥛 Dairy Products</option>
                  </select>
                </div>
              </div>

              {/* UPLOAD PHOTO OPTION */}
              <div className="space-y-2.5 p-4 bg-[#F7FAF5] dark:bg-slate-800/60 rounded-2xl border border-[#2E7D32]/15 dark:border-emerald-900/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200 flex items-center gap-1.5">
                    <Icon name="photo_camera" size={16} className="text-[#2E7D32]" /> Upload Product Photo (Supabase Storage)
                  </label>
                  {isUploadingImage && (
                    <span className="text-[11px] text-[#2E7D32] dark:text-emerald-400 font-bold animate-pulse">
                      Uploading to Supabase Storage...
                    </span>
                  )}
                </div>

                {/* Hidden File Inputs */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileChange}
                />

                {/* 2 Choice Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-[#2E7D32]/20 hover:border-[#2E7D32] flex items-center justify-center gap-2 text-xs font-extrabold text-[#1B5E20] dark:text-emerald-200 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Icon name="photo_camera" size={18} className="text-[#2E7D32]" />
                    📷 Open Camera
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-[#2E7D32]/20 hover:border-[#2E7D32] flex items-center justify-center gap-2 text-xs font-extrabold text-[#1B5E20] dark:text-emerald-200 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Icon name="collections" size={18} className="text-[#2E7D32]" />
                    🖼 Upload Gallery
                  </button>
                </div>

                {/* Image Preview */}
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={cropForm.imageUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#2E7D32] shadow-md shrink-0"
                  />
                  <div className="text-[11px] text-[#37474F] dark:text-slate-400 space-y-1">
                    <p className="font-bold text-[#1B5E20] dark:text-emerald-300">Image Preview</p>
                    <p className="truncate max-w-[220px]">URL: {cropForm.imageUrl}</p>
                    <span className="inline-block bg-[#2E7D32]/10 text-[#1B5E20] dark:text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      ✓ Direct Supabase Cloud URL
                    </span>
                  </div>
                </div>
              </div>

              {/* AI SMART PRICING & GET AI PRICE BUTTON */}
              <div className="p-4 bg-[#F7FAF5] dark:bg-emerald-950/60 rounded-2xl border border-[#2E7D32]/25 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFB300] animate-ping" />
                    <span className="text-xs font-black text-[#1B5E20] dark:text-emerald-300 flex items-center gap-1.5">
                      <Icon name="psychology" size={18} className="text-[#FFB300]" /> Live AGMARKNET & AI Smart Pricing
                    </span>
                  </div>

                  {/* Button: Get AI Price */}
                  <button
                    type="button"
                    onClick={handleGetAiPrice}
                    className="px-3.5 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name="auto_awesome" size={14} /> Get AI Price
                  </button>
                </div>

                {agmarknetInfo && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-[#2E7D32]/20 dark:border-emerald-800/80 space-y-2">
                    <div className="text-xs text-[#37474F] dark:text-emerald-200 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold">📍 {agmarknetInfo.mandiName} Benchmark:</span>
                      <span className="font-black text-[#1B5E20] dark:text-white bg-[#F7FAF5] dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-[#2E7D32]/15">
                        ₹{agmarknetInfo.minPrice} - ₹{agmarknetInfo.maxPrice} / {agmarknetInfo.unit} (Modal: ₹{agmarknetInfo.modalPrice})
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[11px] text-[#37474F] font-bold">Recommended Listing Price:</span>
                        <div className="text-xl font-black text-[#2E7D32] dark:text-[#FFB300]">
                          ₹{agmarknetInfo.aiRecommendedPrice} / {cropForm.unit}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setCropForm((prev) => ({
                            ...prev,
                            price: String(agmarknetInfo.aiRecommendedPrice),
                          }))
                        }
                        className="px-3 py-1.5 bg-[#2E7D32] text-white text-xs font-black rounded-xl hover:bg-[#1B5E20] transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Icon name="check_circle" size={14} /> Apply AI Price
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PRICING & STOCK ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Farmer Price */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    Farmer Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 38"
                    value={cropForm.price}
                    onChange={(e) => setCropForm({ ...cropForm, price: e.target.value })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3 py-2 text-sm font-black text-[#2E7D32] dark:text-[#FFB300] focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                {/* Market Price */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    Retail Market Price (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    value={cropForm.marketPrice}
                    onChange={(e) => setCropForm({ ...cropForm, marketPrice: e.target.value })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3 py-2 text-sm font-bold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                {/* Unit */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    Unit *
                  </label>
                  <select
                    value={cropForm.unit}
                    onChange={(e) => setCropForm({ ...cropForm, unit: e.target.value as any })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3 py-2 text-sm font-bold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  >
                    <option value="kg">Per kg</option>
                    <option value="quintal">Per Quintal (100 kg)</option>
                    <option value="ton">Per Ton</option>
                    <option value="dozen">Per Dozen</option>
                    <option value="bundle">Per Bundle</option>
                    <option value="piece">Per Piece / Unit</option>
                    <option value="hour">Per Hour (Machinery)</option>
                  </select>
                </div>
              </div>

              {/* STOCK, HARVEST & EXPIRY ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    Quantity / Stock *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={cropForm.stockQty}
                    onChange={(e) => setCropForm({ ...cropForm, stockQty: e.target.value })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3 py-2 text-sm font-semibold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    Harvest Date
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Today (Fresh)"
                    value={cropForm.harvestDate}
                    onChange={(e) => setCropForm({ ...cropForm, harvestDate: e.target.value })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3 py-2 text-sm font-semibold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    Expiry / Shelf Life
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 7 Days"
                    value={cropForm.expiryDate}
                    onChange={(e) => setCropForm({ ...cropForm, expiryDate: e.target.value })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3 py-2 text-sm font-semibold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              {/* LOCATION FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Guntur"
                    value={cropForm.district}
                    onChange={(e) => setCropForm({ ...cropForm, district: e.target.value })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3 py-2 text-sm font-semibold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    Village / Town
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tenali"
                    value={cropForm.village}
                    onChange={(e) => setCropForm({ ...cropForm, village: e.target.value })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3 py-2 text-sm font-semibold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                    GPS Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 16.243, 80.640"
                    value={cropForm.gpsLocation}
                    onChange={(e) => setCropForm({ ...cropForm, gpsLocation: e.target.value })}
                    className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3 py-2 text-sm font-semibold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                  />
                </div>
              </div>

              {/* TOGGLES: ORGANIC & DELIVERY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-[#43A047]/10 rounded-xl border border-[#43A047]/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                      Certified Organic
                    </span>
                    <p className="text-[10px] text-[#37474F] font-semibold dark:text-emerald-300">
                      Chemical/pesticide free harvest
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cropForm.isOrganic}
                    onChange={(e) => setCropForm({ ...cropForm, isOrganic: e.target.checked })}
                    className="w-5 h-5 accent-[#2E7D32] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#2E7D32]/10 rounded-xl border border-[#2E7D32]/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-[#1B5E20] dark:text-blue-200">
                      Available for Delivery
                    </span>
                    <p className="text-[10px] text-[#37474F] font-semibold dark:text-blue-300">
                      Logistics partner pickup enabled
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cropForm.availableForDelivery}
                    onChange={(e) => setCropForm({ ...cropForm, availableForDelivery: e.target.checked })}
                    className="w-5 h-5 accent-[#2E7D32] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="text-xs font-black text-[#1B5E20] dark:text-emerald-200">
                  Product Description & Quality Standards
                </label>
                <textarea
                  rows={2}
                  placeholder="Harvested fresh early morning from fertile black soil..."
                  value={cropForm.description}
                  onChange={(e) => setCropForm({ ...cropForm, description: e.target.value })}
                  className="w-full bg-[#F7FAF5] dark:bg-slate-800 border border-[#2E7D32]/20 dark:border-emerald-800/80 rounded-xl px-3.5 py-2 text-sm font-semibold text-[#37474F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2E7D32]"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-emerald-900/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    leftIcon="save"
                    onClick={(e) => handleAddProductSubmit(e as any, true)}
                    className="border-[#2E7D32]/30 text-[#1B5E20]"
                  >
                    Save Draft
                  </Button>

                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon="publish"
                  >
                    Publish Product
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Realtime Chat Modal */}
      {chatModalOpen && chatTarget && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => setChatModalOpen(false)}
          orderNumber={chatTarget.orderNumber}
          myRole="farmer"
          myName={user?.name || 'Venkat Rao'}
          otherPartyName={chatTarget.name}
          otherPartyRole={chatTarget.role}
          otherPartyPhone={chatTarget.phone}
        />
      )}
    </div>
  );
};
