/**
 * FarmConnect Core Data Context
 * Manages products, orders, cart, wishlist, mandi prices, and weather data.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchProductsFromSupabase,
  addProductToSupabase,
  deleteProductFromSupabase,
  subscribeToProductsRealtime,
  DBProduct,
} from '../services/supabaseProductService';
import {
  fetchOrdersFromSupabase,
  createOrderInSupabase,
  updateOrderInSupabase,
  subscribeToOrdersRealtime,
  DBOrder,
} from '../services/supabaseOrderService';
import { AiSmartPriceDetails } from '../services/aiPricingService';

export interface ProductItem {
  id: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Grains' | 'Spices' | 'Pulses' | 'Flowers' | 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Farm Equipment' | 'Tractors' | 'Harvest Machines' | 'Livestock' | 'Dairy Products' | string;
  farmerId: string;
  farmerName: string;
  farmerAvatar?: string;
  farmerLocation: string;
  location?: string;
  district?: string;
  village?: string;
  gpsLocation?: string;
  distance: string;
  rating: number;
  reviewsCount: number;
  price: number;
  marketPrice?: number;
  aiRecommendedPrice?: number;
  unit: 'kg' | 'quintal' | 'ton' | 'dozen' | 'bundle' | string;
  stockQty: number;
  harvestDate: string;
  expiryDate?: string;
  isOrganic: boolean;
  availableForDelivery?: boolean;
  description: string;
  image: string;
  createdAt: string;
  badges?: string[];
  aiPriceDetails?: AiSmartPriceDetails;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface TrackingStep {
  label: string;
  time: string;
  completed: boolean;
  active?: boolean;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  consumerName: string;
  consumerPhone: string;
  consumerEmail?: string;
  consumerAddress: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  gpsLocation?: string;
  deliveryNotes?: string;
  deliveryTimePreference?: string;
  farmerName: string;
  farmerPhone?: string;
  farmerAddress?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    unit: string;
    image: string;
  }>;
  totalAmount: number;
  deliveryFee?: number;
  status: OrderStatus;
  paymentMethod: 'UPI' | 'Card' | 'COD' | 'Wallet' | 'Net Banking' | 'Google Pay' | 'PhonePe' | 'Paytm' | string;
  paymentStatus: 'paid' | 'pending';
  paymentId?: string;
  distanceKm?: number;
  createdAt: string;
  estimatedDelivery: string;
  trackingSteps: TrackingStep[];
  verificationToken?: string;
  isQrVerified?: boolean;
  qrScannedAt?: string;
  qrScannedBy?: string;
  rating?: {
    farmerRating?: number;
    deliveryRating?: number;
    productRating?: number;
    farmerDeliveryRating?: number;
    feedback?: string;
  };
}

export interface NearbyFarmer {
  id: string;
  name: string;
  avatar: string;
  farmName: string;
  location: string;
  distance: string;
  landSize: string;
  mainCrops: string[];
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  phone: string;
  bio: string;
}

export interface MandiPrice {
  id: string;
  crop: string;
  market: string;
  price: number;
  unit: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

export interface WeatherInfo {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  advisory: string;
  forecast: Array<{ day: string; temp: string; icon: string }>;
}

interface FarmDataContextType {
  products: ProductItem[];
  addProduct: (newProd: Omit<ProductItem, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>) => void;
  deleteProduct: (id: string) => void;
  orders: OrderItem[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  completeDelivery: (orderId: string, token: string, driverInfo?: { driverId?: string; driverName?: string }) => Promise<void>;
  createOrder: (orderData: {
    consumerName: string;
    consumerPhone: string;
    consumerAddress: string;
    paymentMethod: 'UPI' | 'Card' | 'COD' | 'Wallet';
  }) => OrderItem;
  cart: CartItem[];
  addToCart: (product: ProductItem, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  nearbyFarmers: NearbyFarmer[];
  mandiPrices: MandiPrice[];
  weather: WeatherInfo;
}

const initialProducts: ProductItem[] = [
  {
    id: 'p1',
    name: 'Organic Hybrid Tomato',
    category: 'Vegetables',
    farmerId: 'f1',
    farmerName: 'Venkat Rao',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    farmerLocation: 'Tenali, Guntur',
    distance: '3.2 km',
    rating: 4.9,
    reviewsCount: 38,
    price: 38,
    unit: 'kg',
    stockQty: 450,
    harvestDate: 'Today (Fresh)',
    isOrganic: true,
    description: 'Pesticide-free red juicy tomatoes harvested early morning from black alluvial soil.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-07-23',
    badges: ['Fresh Today', '100% Organic'],
  },
  {
    id: 'p2',
    name: 'Traditional Basmati Rice (A-Grade)',
    category: 'Grains',
    farmerId: 'f2',
    farmerName: 'Srinivas Reddy',
    farmerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    farmerLocation: 'Vijayawada Rural',
    distance: '8.5 km',
    rating: 4.8,
    reviewsCount: 52,
    price: 72,
    unit: 'kg',
    stockQty: 1200,
    harvestDate: 'Last Week',
    isOrganic: true,
    description: 'Long grain naturally aged fragrant Basmati paddy processed without chemical polish.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-07-20',
    badges: ['Naturally Aged', 'Export Quality'],
  },
  {
    id: 'p3',
    name: 'Fresh Hot Green Chili (Guntur)',
    category: 'Spices',
    farmerId: 'f1',
    farmerName: 'Venkat Rao',
    farmerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    farmerLocation: 'Tenali, Guntur',
    distance: '3.2 km',
    rating: 4.7,
    reviewsCount: 24,
    price: 45,
    unit: 'kg',
    stockQty: 250,
    harvestDate: 'Yesterday',
    isOrganic: false,
    description: 'Famous Guntur spicy green chili, crisp texture, ideal for commercial spice mixes or fresh culinary use.',
    image: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-07-22',
    badges: ['Guntur Famous', 'High Spice'],
  },
  {
    id: 'p4',
    name: 'Farm Fresh Alphonso Mangoes',
    category: 'Fruits',
    farmerId: 'f3',
    farmerName: 'Lakshmi Devi',
    farmerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    farmerLocation: 'Nuzvid, AP',
    distance: '12.0 km',
    rating: 5.0,
    reviewsCount: 64,
    price: 180,
    unit: 'dozen',
    stockQty: 80,
    harvestDate: '2 Days Ago',
    isOrganic: true,
    description: 'Tree-ripened sweet golden Nuzvid mangoes with rich aroma and no artificial carbide ripening.',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-07-21',
    badges: ['Tree Ripened', 'Zero Carbide'],
  },
  {
    id: 'p5',
    name: 'Organic Red Toor Dal',
    category: 'Pulses',
    farmerId: 'f2',
    farmerName: 'Srinivas Reddy',
    farmerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    farmerLocation: 'Vijayawada Rural',
    distance: '8.5 km',
    rating: 4.9,
    reviewsCount: 19,
    price: 135,
    unit: 'kg',
    stockQty: 600,
    harvestDate: 'This Month',
    isOrganic: true,
    description: 'Unpolished protein-dense organic pulse grown using Zero-Budget Natural Farming techniques.',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-07-18',
    badges: ['Unpolished', 'High Protein'],
  },
  {
    id: 'p6',
    name: 'Organic Sweet Ridge Gourd',
    category: 'Vegetables',
    farmerId: 'f4',
    farmerName: 'Anand Kumar',
    farmerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    farmerLocation: 'Mangalagiri, AP',
    distance: '5.1 km',
    rating: 4.6,
    reviewsCount: 15,
    price: 32,
    unit: 'kg',
    stockQty: 180,
    harvestDate: 'Today',
    isOrganic: true,
    description: 'Tender high-fiber ridge gourd grown with organic compost.',
    image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=500&q=80',
    createdAt: '2026-07-23',
    badges: ['Tender Harvest'],
  },
];

const initialOrders: OrderItem[] = [
  {
    id: 'ord-101',
    orderNumber: 'FC-8902',
    consumerName: 'Rajesh Sharma',
    consumerPhone: '+91 98480 12345',
    consumerAddress: 'Flat 402, Green Towers, Guntur Main Rd, AP',
    farmerName: 'Venkat Rao',
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
    totalAmount: 470,
    status: 'out_for_delivery',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    createdAt: 'Today, 8:30 AM',
    estimatedDelivery: 'Today, 4:30 PM',
    trackingSteps: [
      { label: 'Order Placed & Paid', time: '8:30 AM', completed: true },
      { label: 'Farmer Harvested & Packed', time: '10:15 AM', completed: true },
      { label: 'Logistics Partner Picked Up', time: '1:45 PM', completed: true },
      { label: 'Out for Doorstep Delivery', time: '2:30 PM', completed: true, active: true },
      { label: 'Delivered to Consumer', time: 'Est 4:30 PM', completed: false },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: 'FC-8903',
    consumerName: 'Priya Verma',
    consumerPhone: '+91 99123 45678',
    consumerAddress: 'Door 12-4-1, Benz Circle, Vijayawada',
    farmerName: 'Venkat Rao',
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
    totalAmount: 1800,
    status: 'pending',
    paymentMethod: 'UPI',
    paymentStatus: 'paid',
    createdAt: 'Today, 11:10 AM',
    estimatedDelivery: 'Tomorrow, 10:00 AM',
    trackingSteps: [
      { label: 'Order Placed & Paid', time: '11:10 AM', completed: true, active: true },
      { label: 'Farmer Harvested & Packed', time: 'Pending', completed: false },
      { label: 'Logistics Partner Picked Up', time: 'Pending', completed: false },
      { label: 'Out for Doorstep Delivery', time: 'Pending', completed: false },
      { label: 'Delivered to Consumer', time: 'Est Tomorrow', completed: false },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: 'FC-8898',
    consumerName: 'Anil Kumar',
    consumerPhone: '+91 94401 88990',
    consumerAddress: 'House 88, Kothapet, Tenali',
    farmerName: 'Venkat Rao',
    items: [
      {
        productId: 'p1',
        productName: 'Organic Hybrid Tomato',
        quantity: 50,
        price: 38,
        unit: 'kg',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
      },
    ],
    totalAmount: 1900,
    status: 'delivered',
    paymentMethod: 'COD',
    paymentStatus: 'paid',
    createdAt: 'Yesterday, 3:20 PM',
    estimatedDelivery: 'Delivered Yesterday',
    trackingSteps: [
      { label: 'Order Placed & Paid', time: 'Yesterday', completed: true },
      { label: 'Farmer Harvested & Packed', time: 'Yesterday', completed: true },
      { label: 'Logistics Partner Picked Up', time: 'Yesterday', completed: true },
      { label: 'Out for Doorstep Delivery', time: 'Yesterday', completed: true },
      { label: 'Delivered to Consumer', time: 'Yesterday 6:00 PM', completed: true },
    ],
  },
];

const mockFarmers: NearbyFarmer[] = [
  {
    id: 'f1',
    name: 'Venkat Rao',
    farmName: 'Sri Venkateswara Organic Farm',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    location: 'Tenali, Guntur District, AP',
    distance: '3.2 km',
    landSize: '4.5 Acres',
    mainCrops: ['Hybrid Tomatoes', 'Green Chili', 'Brinjal'],
    rating: 4.9,
    reviewsCount: 124,
    isVerified: true,
    phone: '+91 98490 54321',
    bio: 'Practicing 100% Zero Budget Natural Farming for 8 years. Specializes in disease-resistant high yield crops.',
  },
  {
    id: 'f2',
    name: 'Srinivas Reddy',
    farmName: 'Krishna Valley Grain Estate',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    location: 'Vijayawada Rural, AP',
    distance: '8.5 km',
    landSize: '12.0 Acres',
    mainCrops: ['Basmati Rice', 'Toor Dal', 'Groundnut'],
    rating: 4.8,
    reviewsCount: 98,
    isVerified: true,
    phone: '+91 99887 11223',
    bio: 'Pioneer in organic paddy cultivation and drip-irrigated pulse fields along Krishna river bank.',
  },
  {
    id: 'f3',
    name: 'Lakshmi Devi',
    farmName: 'Nuzvid Organic Mango Orchards',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    location: 'Nuzvid, Krishna District',
    distance: '12.0 km',
    landSize: '8.0 Acres',
    mainCrops: ['Alphonso Mango', 'Banginapalli', 'Guava'],
    rating: 5.0,
    reviewsCount: 156,
    isVerified: true,
    phone: '+91 94412 99001',
    bio: 'Award-winning female organic fruit cultivator. Direct dispatch of tree-ripened pesticide free fruits.',
  },
];

const mockMandiPrices: MandiPrice[] = [
  { id: 'm1', crop: 'Hybrid Tomato', market: 'Guntur Mandi', price: 38, unit: 'kg', change: '+18%', trend: 'up' },
  { id: 'm2', crop: 'Basmati Rice', market: 'Vijayawada', price: 72, unit: 'kg', change: '+5%', trend: 'up' },
  { id: 'm3', crop: 'Guntur Green Chili', market: 'Tenali Yard', price: 45, unit: 'kg', change: '-2%', trend: 'down' },
  { id: 'm4', crop: 'Raw Cotton (Kapas)', market: 'Adoni Market', price: 6800, unit: 'quintal', change: '+12%', trend: 'up' },
  { id: 'm5', crop: 'Yellow Maize', market: 'Prakasam Yard', price: 2150, unit: 'quintal', change: '0%', trend: 'stable' },
];

const mockWeather: WeatherInfo = {
  temperature: 29,
  condition: 'Partly Cloudy with Light Showers',
  icon: 'partly_cloudy_day',
  location: 'Guntur, Andhra Pradesh',
  humidity: 68,
  windSpeed: 14,
  rainChance: 35,
  advisory: 'Favorable morning spraying window until 10:30 AM. Soil moisture optimal for paddy top-dressing.',
  forecast: [
    { day: 'Today', temp: '29°C', icon: 'partly_cloudy_day' },
    { day: 'Thu', temp: '31°C', icon: 'sunny' },
    { day: 'Fri', temp: '27°C', icon: 'rainy' },
    { day: 'Sat', temp: '28°C', icon: 'thunderstorm' },
    { day: 'Sun', temp: '30°C', icon: 'partly_cloudy_day' },
  ],
};

const FarmDataContext = createContext<FarmDataContextType | undefined>(undefined);

export const FarmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(['p1', 'p4']);

  const mapDBProduct = (p: DBProduct): ProductItem => ({
    id: p.id,
    name: p.name,
    category: (p.category as any) || 'Vegetables',
    farmerId: p.farmer_id || 'f1',
    farmerName: p.farmer_name || 'Verified Farmer',
    farmerAvatar: p.farmer_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    farmerLocation: p.location || 'Tenali, Guntur District',
    location: p.location || 'Tenali, Guntur District',
    district: p.district || 'Guntur',
    village: p.village || 'Tenali',
    gpsLocation: p.gps_location || '16.243, 80.640',
    distance: '3.2 km',
    rating: p.rating || 4.9,
    reviewsCount: p.reviews_count || 15,
    price: p.farmer_price,
    marketPrice: p.market_price || Math.round(p.farmer_price * 1.15),
    aiRecommendedPrice: p.ai_recommended_price,
    unit: p.unit || 'kg',
    stockQty: p.stock_qty,
    harvestDate: p.harvest_date,
    expiryDate: p.expiry_date || 'N/A (Fresh)',
    isOrganic: p.is_organic,
    availableForDelivery: p.available_for_delivery ?? true,
    description: p.description,
    image: p.image_url,
    createdAt: p.created_at || new Date().toISOString(),
    badges: p.is_organic ? ['100% Organic', 'Fresh Harvest'] : ['Direct Harvest'],
    aiPriceDetails: p.ai_price_details ? (typeof p.ai_price_details === 'string' ? JSON.parse(p.ai_price_details) : p.ai_price_details) : undefined,
  });

  const mapDBOrder = (o: DBOrder): OrderItem => ({
    id: o.id,
    orderNumber: o.order_number,
    consumerName: o.consumer_name,
    consumerPhone: o.consumer_phone,
    consumerEmail: o.consumer_email,
    consumerAddress: o.consumer_address,
    village: o.village,
    district: o.district,
    state: o.state,
    pincode: o.pincode,
    landmark: o.landmark,
    gpsLocation: o.gps_location,
    deliveryNotes: o.delivery_notes,
    deliveryTimePreference: o.delivery_time_preference,
    farmerName: o.farmer_name || 'Venkat Rao',
    farmerPhone: o.farmer_phone || '+91 98490 55112',
    farmerAddress: o.farmer_address || 'Tenali Farm Cluster, AP',
    driverId: o.driver_id,
    driverName: o.driver_name,
    driverPhone: o.driver_phone,
    vehicleType: o.vehicle_type,
    vehicleNumber: o.vehicle_number,
    items: o.items || [],
    totalAmount: o.total_amount,
    deliveryFee: o.delivery_fee,
    status: o.status,
    paymentMethod: (o.payment_method as any) || 'UPI',
    paymentStatus: (o.payment_status as any) || 'paid',
    paymentId: o.payment_id,
    distanceKm: o.distance_km || 12.5,
    createdAt: o.created_at ? new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    estimatedDelivery: o.estimated_delivery || 'Today, 5:30 PM',
    trackingSteps: o.tracking_steps || [
      { label: 'Order Placed & Paid', time: 'Just now', completed: true, active: true },
      { label: 'Farmer Accepted', time: 'Pending', completed: false },
      { label: 'Delivery Driver Assigned', time: 'Pending', completed: false },
      { label: 'Out for Doorstep Delivery', time: 'Pending', completed: false },
      { label: 'Delivered', time: 'Est Today 5:30 PM', completed: false },
    ],
    verificationToken: o.verification_token,
    isQrVerified: o.is_qr_verified,
    qrScannedAt: o.qr_scanned_at,
    qrScannedBy: o.qr_scanned_by,
    rating: o.rating,
  });

  const loadProducts = useCallback(async () => {
    try {
      const dbProds = await fetchProductsFromSupabase();
      setProducts(dbProds.map(mapDBProduct));
    } catch (err) {
      console.error('Error loading Supabase products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const dbOrds = await fetchOrdersFromSupabase();
      setOrders(dbOrds.map(mapDBOrder));
    } catch (err) {
      console.error('Error loading Supabase orders:', err);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();

    // Subscribe to Supabase Realtime changes on products & orders
    const unsubscribeProducts = subscribeToProductsRealtime(() => {
      console.log('Realtime product change detected from Supabase!');
      loadProducts();
    });

    const unsubscribeOrders = subscribeToOrdersRealtime(() => {
      console.log('Realtime order change detected from Supabase!');
      loadOrders();
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [loadProducts, loadOrders]);

  // Add Product (Farmer Action - Saves to Supabase)
  const addProduct = async (
    newProd: Omit<ProductItem, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>
  ) => {
    const recordToInsert = {
      name: newProd.name,
      category: newProd.category,
      location: newProd.location || newProd.farmerLocation || 'Guntur, AP',
      district: newProd.district || 'Guntur',
      village: newProd.village || 'Tenali',
      gps_location: newProd.gpsLocation || '16.243, 80.640',
      ai_recommended_price: newProd.aiRecommendedPrice || newProd.price,
      farmer_price: newProd.price,
      market_price: newProd.marketPrice || Math.round(newProd.price * 1.15),
      unit: newProd.unit,
      stock_qty: newProd.stockQty,
      harvest_date: newProd.harvestDate,
      expiry_date: newProd.expiryDate || 'N/A (Fresh)',
      description: newProd.description,
      image_url: newProd.image,
      farmer_id: newProd.farmerId || 'f1',
      farmer_name: newProd.farmerName || 'Verified Farmer',
      farmer_avatar: newProd.farmerAvatar,
      is_organic: newProd.isOrganic,
      available_for_delivery: newProd.availableForDelivery ?? true,
      ai_price_details: newProd.aiPriceDetails,
    };

    const savedDBProduct = await addProductToSupabase(recordToInsert);
    const mapped = mapDBProduct(savedDBProduct);

    setProducts((prev) => [mapped, ...prev.filter((p) => p.id !== mapped.id)]);
  };

  // Delete Product from Supabase
  const deleteProduct = async (id: string) => {
    await deleteProductFromSupabase(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Update Order Status (Farmer, Consumer or Delivery Action)
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    // Determine updated tracking steps
    const currentOrder = orders.find((o) => o.id === orderId);
    let updatedSteps = currentOrder?.trackingSteps || [];

    if (currentOrder) {
      updatedSteps = currentOrder.trackingSteps.map((step) => {
        if (status === 'accepted' && (step.label.includes('Farmer') || step.label.includes('Harvested'))) {
          return { ...step, completed: true, active: false };
        }
        if (status === 'accepted' && (step.label.includes('Driver') || step.label.includes('Logistics'))) {
          return { ...step, active: true };
        }
        if (status === 'packed' && (step.label.includes('Picked Up') || step.label.includes('Driver'))) {
          return { ...step, completed: true, active: false };
        }
        if (status === 'out_for_delivery' && (step.label.includes('Out for') || step.label.includes('Doorstep'))) {
          return { ...step, completed: true, active: true };
        }
        if (status === 'delivered' && step.label.includes('Delivered')) {
          return { ...step, completed: true, active: false };
        }
        return step;
      });
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status,
          trackingSteps: updatedSteps,
        };
      })
    );

    // Save to Supabase
    await updateOrderInSupabase(orderId, {
      status,
      tracking_steps: updatedSteps,
    });
  };

  // Complete Delivery Action (Triggered after QR Verification)
  const completeDelivery = async (
    orderId: string,
    token: string,
    driverInfo?: { driverId?: string; driverName?: string }
  ) => {
    const currentOrder = orders.find((o) => o.id === orderId);
    if (!currentOrder) return;

    const updatedSteps = (currentOrder.trackingSteps || []).map((step) => ({
      ...step,
      completed: true,
      active: false,
    }));

    const scanTime = new Date().toISOString();
    const scannedBy = driverInfo?.driverName || currentOrder.driverName || 'Delivery Driver';

    // Update state locally
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'delivered',
          paymentStatus: 'paid',
          isQrVerified: true,
          verificationToken: token,
          qrScannedAt: scanTime,
          qrScannedBy: scannedBy,
          trackingSteps: updatedSteps,
        };
      })
    );

    // Reduce product inventory
    if (currentOrder.items && currentOrder.items.length > 0) {
      setProducts((prev) =>
        prev.map((prod) => {
          const itemMatch = currentOrder.items.find((i) => i.productId === prod.id);
          if (itemMatch) {
            return {
              ...prod,
              stockQty: Math.max(0, prod.stockQty - itemMatch.quantity),
            };
          }
          return prod;
        })
      );
    }

    // Update Farmer Wallet in localStorage
    try {
      const currentFarmerWallet = parseFloat(localStorage.getItem('farmconnect_farmer_wallet') || '48250');
      const updatedFarmerWallet = currentFarmerWallet + currentOrder.totalAmount;
      localStorage.setItem('farmconnect_farmer_wallet', updatedFarmerWallet.toString());
    } catch (e) {
      console.warn('Farmer wallet update warning:', e);
    }

    // Update Driver Earnings in localStorage
    try {
      const currentDriverEarnings = parseFloat(localStorage.getItem('farmconnect_driver_earnings') || '1850');
      const fee = currentOrder.deliveryFee || 140;
      localStorage.setItem('farmconnect_driver_earnings', (currentDriverEarnings + fee).toString());
    } catch (e) {
      console.warn('Driver earnings update warning:', e);
    }

    // Persist changes to Supabase
    await updateOrderInSupabase(orderId, {
      status: 'delivered',
      payment_status: 'paid',
      is_qr_verified: true,
      verification_token: token,
      qr_scanned_at: scanTime,
      qr_scanned_by: scannedBy,
      tracking_steps: updatedSteps,
    });
  };

  // Cart operations
  const addToCart = (product: ProductItem, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Toggle Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Create Order (Consumer Checkout)
  const createOrder = async (orderData: {
    consumerName: string;
    consumerPhone: string;
    consumerEmail?: string;
    consumerAddress: string;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
    gpsLocation?: string;
    deliveryNotes?: string;
    deliveryTimePreference?: string;
    paymentMethod: 'UPI' | 'Card' | 'COD' | 'Wallet' | 'Net Banking' | 'Google Pay' | 'PhonePe' | 'Paytm' | string;
    paymentStatus?: 'paid' | 'pending';
    paymentId?: string;
  }) => {
    const randomSerial = Math.floor(100000 + Math.random() * 900000);
    const newOrdNumber = `FC2026-${randomSerial}`;
    const farmerName = cart.length > 0 ? cart[0].product.farmerName : 'Venkat Rao';
    const farmerId = cart.length > 0 ? cart[0].product.farmerId : 'f1';
    const totalWeight = cart.reduce((sum, item) => sum + item.quantity * 5, 20);

    const itemsToInsert = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      unit: item.product.unit,
      image: item.product.image,
    }));

    const savedDBOrder = await createOrderInSupabase({
      order_number: newOrdNumber,
      consumer_name: orderData.consumerName,
      consumer_phone: orderData.consumerPhone,
      consumer_email: orderData.consumerEmail,
      consumer_address: orderData.consumerAddress,
      village: orderData.village,
      district: orderData.district,
      state: orderData.state,
      pincode: orderData.pincode,
      landmark: orderData.landmark,
      gps_location: orderData.gpsLocation,
      delivery_notes: orderData.deliveryNotes,
      delivery_time_preference: orderData.deliveryTimePreference,
      farmer_id: farmerId,
      farmer_name: farmerName,
      items: itemsToInsert,
      total_amount: cartTotal,
      payment_method: orderData.paymentMethod,
      payment_status: orderData.paymentStatus || (orderData.paymentMethod === 'COD' ? 'pending' : 'paid'),
      payment_id: orderData.paymentId,
      total_weight_kg: totalWeight,
    });

    const newOrder: OrderItem = mapDBOrder(savedDBOrder);

    // Auto reduce inventory for ordered items
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatch = cart.find((c) => c.product.id === prod.id);
        if (cartMatch) {
          return {
            ...prod,
            stockQty: Math.max(0, prod.stockQty - cartMatch.quantity),
          };
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    clearCart();
    return newOrder;
  };

  return (
    <FarmDataContext.Provider
      value={{
        products,
        addProduct,
        deleteProduct,
        orders,
        updateOrderStatus,
        completeDelivery,
        createOrder,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal,
        wishlist,
        toggleWishlist,
        nearbyFarmers: mockFarmers,
        mandiPrices: mockMandiPrices,
        weather: mockWeather,
      }}
    >
      {children}
    </FarmDataContext.Provider>
  );
};

export const useFarmData = (): FarmDataContextType => {
  const context = useContext(FarmDataContext);
  if (!context) throw new Error('useFarmData must be used within FarmDataProvider');
  return context;
};
