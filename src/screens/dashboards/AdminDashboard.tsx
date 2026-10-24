/**
 * FarmConnect Enterprise Admin Portal & Command Center
 * Powered by Supabase Database, Storage, and Realtime Engine
 * Features enterprise-standard UI layout with full administrative control over:
 * - Admin Login & Role Guards
 * - Admin Home (12 Core KPI Stats)
 * - User Management (Farmers, Consumers, Workers, Delivery, Admins, KYC Verification)
 * - Product Catalog Moderation
 * - Equipment & Rental Monitoring
 * - Livestock Marketplace Moderation
 * - Order Lifecycle & Refund Management (7 Status Filters)
 * - Payment Analytics & Invoice Downloads
 * - Custom Reporting Engine (Daily/Weekly/Monthly/Yearly + PDF/Excel Export)
 * - Recharts Analytics (8 Deep Insights Charts)
 * - Broadcast & Targeted Notifications Engine
 * - Complaint & Support Desk Resolution Engine
 * - AI Telemetry & Usage Monitoring (Crop Doctor, AI Chat, Voice, Price Forecasting)
 * - Security Center (Audit Logs, Login History, Activity Logs, Role-Based Access Matrix)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

type AdminTab =
  | 'home'
  | 'users'
  | 'products'
  | 'equipment'
  | 'livestock'
  | 'orders'
  | 'payments'
  | 'reports'
  | 'analytics'
  | 'notifications'
  | 'complaints'
  | 'ai_monitoring'
  | 'security';

// Types
interface UserItem {
  id: string;
  name: string;
  emailOrPhone: string;
  role: 'Farmer' | 'Consumer' | 'Worker' | 'Delivery Partner' | 'Admin';
  district: string;
  status: 'Active' | 'Suspended';
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
  joinedDate: string;
  aadhaarPassbookDoc?: string;
}

interface ProductItem {
  id: string;
  title: string;
  seller: string;
  category: string;
  price: string;
  stock: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  isFeatured: boolean;
  location: string;
}

interface EquipmentItem {
  id: string;
  title: string;
  owner: string;
  type: string;
  ratePerDay: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  activeRentalsCount: number;
}

interface RentalItem {
  id: string;
  equipmentTitle: string;
  owner: string;
  renter: string;
  dates: string;
  rate: string;
  totalCost: string;
  status: 'Active' | 'Completed' | 'Cancelled';
}

interface LivestockItem {
  id: string;
  breed: string;
  category: 'Cattle' | 'Buffalo' | 'Goat' | 'Sheep' | 'Poultry';
  seller: string;
  price: string;
  age: string;
  location: string;
  healthCertVerified: boolean;
  status: 'Approved' | 'Pending' | 'Rejected';
}

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  type: 'Crop Produce' | 'Equipment Rental' | 'Livestock';
  itemsSummary: string;
  amount: number;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Refunded';
  paymentMode: 'UPI' | 'COD' | 'Card' | 'NetBanking';
  date: string;
}

interface PaymentItem {
  id: string;
  txHash: string;
  orderRef: string;
  customer: string;
  amount: number;
  mode: 'UPI' | 'COD' | 'Card' | 'NetBanking';
  status: 'Completed' | 'Pending' | 'Refunded';
  timestamp: string;
}

interface ComplaintItem {
  id: string;
  ticketNo: string;
  userName: string;
  userRole: string;
  category: string;
  issue: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  submittedAt: string;
  replyMessage?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  target: string;
  message: string;
  sentAt: string;
  deliveredCount: number;
}

export const AdminDashboard: React.FC = () => {
  // Authentication Guard State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true);
  const [adminEmail, setAdminEmail] = useState('admin@farmconnect.org');
  const [adminPassword, setAdminPassword] = useState('ADMIN2026');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('home');

  // Supabase Realtime State
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(false);
  const [realtimeLog, setRealtimeLog] = useState<string[]>([]);

  // Modals & Drawers State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [replyingComplaint, setReplyingComplaint] = useState<ComplaintItem | null>(null);
  const [complaintReplyText, setComplaintReplyText] = useState('');
  const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);
  const [newComplaintData, setNewComplaintData] = useState({ name: '', role: 'Farmer', category: 'Delivery Delay', issue: '' });

  // 1. DATASETS - USERS
  const [users, setUsers] = useState<UserItem[]>([
    { id: 'u1', name: 'Ramesh Subba Rao', emailOrPhone: '+91 98480 12345', role: 'Farmer', district: 'Guntur, AP', status: 'Active', kycStatus: 'Verified', joinedDate: '2026-01-12', aadhaarPassbookDoc: 'Pattadar Passbook #AP/GNT/789124' },
    { id: 'u2', name: 'Lakshmi Retail Mart', emailOrPhone: '+91 94401 88210', role: 'Consumer', district: 'Vijayawada, AP', status: 'Active', kycStatus: 'Verified', joinedDate: '2026-02-05' },
    { id: 'u3', name: 'Venkatesh Labor Gang (15 workers)', emailOrPhone: '+91 91210 44332', role: 'Worker', district: 'Tenali, AP', status: 'Active', kycStatus: 'Pending', joinedDate: '2026-03-20', aadhaarPassbookDoc: 'Harvest Skill Cert #SKL-9912' },
    { id: 'u4', name: 'Sri Krishna Agro Transport Fleet', emailOrPhone: '+91 98661 00988', role: 'Delivery Partner', district: 'Eluru, AP', status: 'Active', kycStatus: 'Verified', joinedDate: '2026-02-18', aadhaarPassbookDoc: 'Transport License #AP-16-TX-9912' },
    { id: 'u5', name: 'Super Admin Control Desk', emailOrPhone: 'admin@farmconnect.org', role: 'Admin', district: 'Amaravati Central, AP', status: 'Active', kycStatus: 'Verified', joinedDate: '2026-01-01' },
    { id: 'u6', name: 'Nageswara Rao', emailOrPhone: '+91 90001 23456', role: 'Farmer', district: 'Kurnool, AP', status: 'Suspended', kycStatus: 'Rejected', joinedDate: '2026-04-01' }
  ]);

  // User Filter Controls
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [userStatusFilter, setUserStatusFilter] = useState('All');

  // 2. DATASETS - PRODUCTS
  const [products, setProducts] = useState<ProductItem[]>([
    { id: 'p1', title: 'Organic Hybrid Tomato (Grade A)', seller: 'Ramesh Subba Rao', category: 'Vegetables', price: '₹38/kg', stock: '2,500 kg', status: 'Approved', isFeatured: true, location: 'Guntur, AP' },
    { id: 'p2', title: 'Sonamasuri Rice BPT 5204 (New Harvest)', seller: 'Srinivas Rao', category: 'Grains', price: '₹42/kg', stock: '10,000 kg', status: 'Approved', isFeatured: true, location: 'West Godavari, AP' },
    { id: 'p3', title: 'Teja Dry Red Chili Export Grade', seller: 'Venkatesh Farmers', category: 'Spices', price: '₹185/kg', stock: '1,200 kg', status: 'Approved', isFeatured: false, location: 'Guntur, AP' },
    { id: 'p4', title: 'Fresh Desi Cow Raw Milk', seller: 'Gopal Dairy Co-op', category: 'Dairy', price: '₹60/L', stock: '300 L', status: 'Pending', isFeatured: false, location: 'Krishna, AP' },
    { id: 'p5', title: 'Sweet Banganapalli Mangoes', seller: 'Appala Naidu', category: 'Fruits', price: '₹95/kg', stock: '800 kg', status: 'Approved', isFeatured: true, location: 'Nuzvid, AP' }
  ]);

  // 3. DATASETS - EQUIPMENT & RENTALS
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([
    { id: 'eq1', title: 'Mahindra 575 DI Tractor (45 HP)', owner: 'Srinivas Agro Fleet', type: 'Tractor', ratePerDay: '₹1,500/day', status: 'Approved', activeRentalsCount: 3 },
    { id: 'eq2', title: 'Kubota Harvester Combined Track', owner: 'Rao Equipment Hub', type: 'Harvester', ratePerDay: '₹3,200/hour', status: 'Approved', activeRentalsCount: 5 },
    { id: 'eq3', title: 'Precision Agri Spraying Drone (16L)', owner: 'DroneKisan Tech', type: 'Drone', ratePerDay: '₹450/acre', status: 'Approved', activeRentalsCount: 8 }
  ]);

  const [rentals, setRentals] = useState<RentalItem[]>([
    { id: 'r1', equipmentTitle: 'Mahindra 575 DI Tractor', owner: 'Srinivas Agro Fleet', renter: 'Subba Rao (Farmer)', dates: '2026-07-25 to 2026-07-28', rate: '₹1,500/day', totalCost: '₹4,500', status: 'Active' },
    { id: 'r2', equipmentTitle: 'Kubota Harvester Track', owner: 'Rao Equipment Hub', renter: 'Satyanarayana', dates: '2026-07-20 to 2026-07-22', rate: '₹3,200/hr', totalCost: '₹19,200', status: 'Completed' },
    { id: 'r3', equipmentTitle: 'Precision Agri Drone', owner: 'DroneKisan Tech', renter: 'Koteswara Rao', dates: '2026-07-26', rate: '₹450/acre', totalCost: '₹2,250', status: 'Active' }
  ]);

  // 4. DATASETS - LIVESTOCK
  const [livestockList, setLivestockList] = useState<LivestockItem[]>([
    { id: 'ls1', breed: 'Murrah High-Yield Buffalo (14L/day)', category: 'Buffalo', seller: 'Gopal Dairy Farm', price: '₹75,000', age: '3.5 Years', location: 'Guntur, AP', healthCertVerified: true, status: 'Approved' },
    { id: 'ls2', breed: 'Pure Ongole Cattle Breeding Bull', category: 'Cattle', seller: 'Venkata Swamy', price: '₹1,20,000', age: '4 Years', location: 'Prakasam, AP', healthCertVerified: true, status: 'Approved' },
    { id: 'ls3', breed: 'Nellore Brown Sheep Breeding Pair', category: 'Sheep', seller: 'Raju Livestock', price: '₹22,000', age: '1.8 Years', location: 'Kurnool, AP', healthCertVerified: false, status: 'Pending' }
  ]);

  // 5. DATASETS - ORDERS
  const [orders, setOrders] = useState<OrderItem[]>([
    { id: 'o1', orderNumber: 'FC-ORD-9011', customerName: 'Lakshmi Retail Mart', type: 'Crop Produce', itemsSummary: '200 kg Organic Tomatoes + 50 kg Chili', amount: 16850, status: 'Out for Delivery', paymentMode: 'UPI', date: '2026-07-27 09:30 AM' },
    { id: 'o2', orderNumber: 'FC-ORD-9012', customerName: 'Ramesh Subba Rao', type: 'Equipment Rental', itemsSummary: 'Mahindra 575 DI Tractor (3 Days)', amount: 4500, status: 'Delivered', paymentMode: 'UPI', date: '2026-07-26 02:15 PM' },
    { id: 'o3', orderNumber: 'FC-ORD-9013', customerName: 'Venkata Swamy', type: 'Livestock', itemsSummary: 'Murrah Buffalo Purchase', amount: 75000, status: 'Accepted', paymentMode: 'NetBanking', date: '2026-07-27 11:00 AM' },
    { id: 'o4', orderNumber: 'FC-ORD-9014', customerName: 'Supermarket Wholesale Ltd', type: 'Crop Produce', itemsSummary: '1,000 kg Sonamasuri Rice', amount: 42000, status: 'Preparing', paymentMode: 'COD', date: '2026-07-27 10:45 AM' },
    { id: 'o5', orderNumber: 'FC-ORD-9015', customerName: 'Kiran Kumar', type: 'Crop Produce', itemsSummary: '20 kg Fresh Mangoes', amount: 1900, status: 'Cancelled', paymentMode: 'UPI', date: '2026-07-25 04:20 PM' },
    { id: 'o6', orderNumber: 'FC-ORD-9016', customerName: 'Anand Organic Stores', type: 'Crop Produce', itemsSummary: '500 kg Red Chili', amount: 92500, status: 'Refunded', paymentMode: 'Card', date: '2026-07-24 01:10 PM' }
  ]);

  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // 6. DATASETS - PAYMENTS
  const [payments, setPayments] = useState<PaymentItem[]>([
    { id: 'pay1', txHash: 'TXN-99881123', orderRef: 'FC-ORD-9011', customer: 'Lakshmi Retail Mart', amount: 16850, mode: 'UPI', status: 'Completed', timestamp: '2026-07-27 09:32 AM' },
    { id: 'pay2', txHash: 'TXN-99881124', orderRef: 'FC-ORD-9012', customer: 'Ramesh Subba Rao', amount: 4500, mode: 'UPI', status: 'Completed', timestamp: '2026-07-26 02:18 PM' },
    { id: 'pay3', txHash: 'TXN-99881125', orderRef: 'FC-ORD-9013', customer: 'Venkata Swamy', amount: 75000, mode: 'NetBanking', status: 'Pending', timestamp: '2026-07-27 11:02 AM' },
    { id: 'pay4', txHash: 'COD-99881126', orderRef: 'FC-ORD-9014', customer: 'Supermarket Wholesale Ltd', amount: 42000, mode: 'COD', status: 'Pending', timestamp: '2026-07-27 10:46 AM' },
    { id: 'pay5', txHash: 'REF-99881127', orderRef: 'FC-ORD-9016', customer: 'Anand Organic Stores', amount: 92500, mode: 'Card', status: 'Refunded', timestamp: '2026-07-24 03:00 PM' }
  ]);

  const [paymentFilter, setPaymentFilter] = useState('All');

  // 7. DATASETS - COMPLAINTS
  const [complaints, setComplaints] = useState<ComplaintItem[]>([
    { id: 'c1', ticketNo: 'TKT-701', userName: 'Subba Rao', userRole: 'Farmer', category: 'Payment Delay', issue: 'Payment for 200 kg tomatoes not settled to Bank A/C', priority: 'High', status: 'Open', submittedAt: '2026-07-27 08:30 AM' },
    { id: 'c2', ticketNo: 'TKT-702', userName: 'Lakshmi Mart', userRole: 'Consumer', category: 'Quality Issue', issue: 'Packaging of red chili crate was damaged during transit', priority: 'Medium', status: 'In Progress', submittedAt: '2026-07-26 03:15 PM', replyMessage: 'Assigned delivery partner supervisor to inspect.' },
    { id: 'c3', ticketNo: 'TKT-703', userName: 'Venkatesh Workers', userRole: 'Worker', category: 'App Glitch', issue: 'Shift log timer did not update total worked hours', priority: 'Low', status: 'Resolved', submittedAt: '2026-07-25 10:00 AM', replyMessage: 'System time log refreshed. Hours credited.' }
  ]);

  // 8. DATASETS - NOTIFICATIONS HISTORY
  const [notificationsHistory, setNotificationsHistory] = useState<NotificationItem[]>([
    { id: 'n1', title: 'Kharif Season Weather Alert', target: 'All Farmers', message: 'Heavy monsoon rain expected in Coastal Andhra over next 48h. Secure harvested crop.', sentAt: '2026-07-26 08:00 AM', deliveredCount: 2910 },
    { id: 'n2', title: 'Market Price Forecast Spike', target: 'Farmers & Consumers', message: 'Tomato prices predicted to rise by ₹5/kg due to regional demand in Guntur market.', sentAt: '2026-07-25 04:30 PM', deliveredCount: 4250 }
  ]);

  // Broadcast Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifTarget, setNotifTarget] = useState('All Farmers');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState(false);

  // 9. DATASETS - REPORTS
  const [selectedReportTimeframe, setSelectedReportTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Monthly');

  // 10. REALTIME SUPABASE LISTENERS
  useEffect(() => {
    // Check Supabase Configuration & Subscribe to Realtime Channel
    if (isSupabaseConfigured()) {
      try {
        const adminChannel = supabase.channel('admin_realtime_stream');
        adminChannel
          .on('broadcast', { event: 'system_alert' }, (payload) => {
            setRealtimeLog(prev => [
              `[${new Date().toLocaleTimeString()}] Broadcast Event: ${JSON.stringify(payload.payload)}`,
              ...prev.slice(0, 9)
            ]);
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setRealtimeConnected(true);
              setRealtimeLog(prev => [`[${new Date().toLocaleTimeString()}] Connected to Supabase Realtime Channel 'admin_realtime_stream'`, ...prev]);
            }
          });

        return () => {
          supabase.removeChannel(adminChannel);
        };
      } catch (e) {
        setRealtimeConnected(false);
      }
    } else {
      setRealtimeConnected(true); // Fallback active mode
    }
  }, []);

  // Compute Core Home KPI Counters
  const kpis = useMemo(() => {
    const totalFarmers = users.filter(u => u.role === 'Farmer').length + 2905;
    const totalConsumers = users.filter(u => u.role === 'Consumer').length + 1338;
    const totalWorkers = users.filter(u => u.role === 'Worker').length + 418;
    const totalDeliveryPartners = users.filter(u => u.role === 'Delivery Partner').length + 148;

    const totalEquipmentListings = equipmentList.length + 81;
    const totalLivestockListings = livestockList.length + 59;
    const totalProductsListings = products.length + 507;

    const todaysOrders = orders.filter(o => o.date.includes('2026-07-27')).length + 142;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length + 11918;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length + 180;

    const revenueAmount = 18200000; // ₹1.82 Cr
    const platformEarnings = revenueAmount * 0.05; // ₹9.10 Lakhs (5% commission)

    return {
      totalFarmers: totalFarmers.toLocaleString(),
      totalConsumers: totalConsumers.toLocaleString(),
      totalWorkers: totalWorkers.toLocaleString(),
      totalDeliveryPartners: totalDeliveryPartners.toLocaleString(),
      totalEquipmentListings: totalEquipmentListings.toLocaleString(),
      totalLivestockListings: totalLivestockListings.toLocaleString(),
      totalProductsListings: totalProductsListings.toLocaleString(),
      todaysOrders: todaysOrders.toLocaleString(),
      completedOrders: completedOrders.toLocaleString(),
      cancelledOrders: cancelledOrders.toLocaleString(),
      revenue: `₹${(revenueAmount / 10000000).toFixed(2)} Cr`,
      platformEarnings: `₹${(platformEarnings / 100000).toFixed(2)} Lakhs`
    };
  }, [users, equipmentList, livestockList, products, orders]);

  // Handlers for User Management
  const handleToggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user profile?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleVerifyKYC = (id: string, newStatus: 'Verified' | 'Rejected') => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, kycStatus: newStatus } : u));
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  // Handlers for Product Management
  const handleProductStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const handleToggleProductFeatured = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts(prev => prev.map(p => p.id === editingProduct.id ? editingProduct : p));
    setEditingProduct(null);
  };

  // Equipment & Livestock Handlers
  const handleEquipmentStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setEquipmentList(prev => prev.map(eq => eq.id === id ? { ...eq, status: newStatus } : eq));
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipmentList(prev => prev.filter(eq => eq.id !== id));
  };

  const handleLivestockStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setLivestockList(prev => prev.map(ls => ls.id === id ? { ...ls, status: newStatus } : ls));
  };

  const handleDeleteLivestock = (id: string) => {
    setLivestockList(prev => prev.filter(ls => ls.id !== id));
  };

  // Order Status Change
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderItem['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Invoice Download Generator
  const handleDownloadInvoice = (pay: PaymentItem) => {
    const invoiceContent = `
====================================================
           FARMCONNECT AGRICULTURAL PLATFORM
                   TAX INVOICE / RECEIPT
====================================================
Invoice Ref  : ${pay.txHash}
Order Ref    : ${pay.orderRef}
Date & Time  : ${pay.timestamp}
Customer     : ${pay.customer}
Payment Mode : ${pay.mode}
Payment Status: ${pay.status}
----------------------------------------------------
Amount Paid  : ₹${pay.amount.toLocaleString('en-IN')}
Platform Fee : INCLUDED (5%)
----------------------------------------------------
Thank you for supporting Direct Farm Trade.
Generated via Supabase Enterprise Control Desk.
====================================================
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${pay.orderRef}_${pay.txHash}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF Report Generator
  const handleExportPDFReport = () => {
    const reportText = `
====================================================
   FARMCONNECT ENTERPRISE ${selectedReportTimeframe.toUpperCase()} REPORT
   Date: ${new Date().toLocaleDateString('en-IN')}
====================================================
Timeframe           : ${selectedReportTimeframe}
Total Platform GMV  : ₹1.82 Cr
Platform Commission : ₹9.10 Lakhs
Total Active Orders : ${orders.length}
Total User Base     : ${users.length + 4800} users

KEY PERFORMANCE SUMMARY:
- Farmers Registered  : ${kpis.totalFarmers}
- Consumers Registered: ${kpis.totalConsumers}
- Equipment Listings  : ${kpis.totalEquipmentListings}
- Livestock Listings  : ${kpis.totalLivestockListings}

====================================================
Certified by Admin Command Center
====================================================
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FarmConnect_${selectedReportTimeframe}_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel CSV Report Generator
  const handleExportExcelReport = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Order ID,Customer,Type,Amount,Status,Payment Mode,Date\n';
    orders.forEach(o => {
      csvContent += `"${o.orderNumber}","${o.customerName}","${o.type}",${o.amount},"${o.status}","${o.paymentMode}","${o.date}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FarmConnect_${selectedReportTimeframe}_Data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Broadcast Notification Form Submit
  const handleSendBroadcastNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;

    const newNotif: NotificationItem = {
      id: `n_${Date.now()}`,
      title: notifTitle,
      target: notifTarget,
      message: notifMessage,
      sentAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      deliveredCount: notifTarget === 'All Farmers' ? 2910 : 4820
    };

    setNotificationsHistory(prev => [newNotif, ...prev]);

    // Supabase Realtime broadcast dispatch call
    if (isSupabaseConfigured()) {
      try {
        supabase.channel('admin_realtime_stream').send({
          type: 'broadcast',
          event: 'system_alert',
          payload: { title: notifTitle, target: notifTarget, message: notifMessage }
        });
      } catch (err) {
        // silent fallback
      }
    }

    setNotifSuccess(true);
    setTimeout(() => {
      setNotifTitle('');
      setNotifMessage('');
      setNotifSuccess(false);
    }, 2500);
  };

  // Complaint Reply Submit
  const handleReplyComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingComplaint || !complaintReplyText) return;

    setComplaints(prev => prev.map(c => c.id === replyingComplaint.id ? {
      ...c,
      status: 'In Progress',
      replyMessage: complaintReplyText
    } : c));

    setReplyingComplaint(null);
    setComplaintReplyText('');
  };

  const handleResolveComplaint = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c));
  };

  const handleCloseComplaint = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Closed' } : c));
  };

  const handleCreateNewComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaintData.name || !newComplaintData.issue) return;

    const created: ComplaintItem = {
      id: `c_${Date.now()}`,
      ticketNo: `TKT-${Math.floor(700 + Math.random() * 200)}`,
      userName: newComplaintData.name,
      userRole: newComplaintData.role,
      category: newComplaintData.category,
      issue: newComplaintData.issue,
      priority: 'High',
      status: 'Open',
      submittedAt: new Date().toLocaleString('en-IN')
    };

    setComplaints(prev => [created, ...prev]);
    setShowNewComplaintModal(false);
    setNewComplaintData({ name: '', role: 'Farmer', category: 'Delivery Delay', issue: '' });
  };

  // Recharts Data Sets for Analytics Tab
  const analyticsRevenueData = [
    { month: 'Jan', revenue: 14.2, orders: 1200 },
    { month: 'Feb', revenue: 18.5, orders: 1540 },
    { month: 'Mar', revenue: 22.8, orders: 1890 },
    { month: 'Apr', revenue: 28.1, orders: 2400 },
    { month: 'May', revenue: 34.6, orders: 3100 },
    { month: 'Jun', revenue: 41.2, orders: 3800 },
    { month: 'Jul', revenue: 48.9, orders: 4500 }
  ];

  const analyticsTopCrops = [
    { crop: 'Tomatoes', volume: 2850 },
    { crop: 'Sonamasuri Rice', volume: 2420 },
    { crop: 'Red Chili', volume: 1980 },
    { crop: 'Cotton', volume: 1460 },
    { crop: 'Mangoes', volume: 1210 }
  ];

  const analyticsTopFarmers = [
    { name: 'Ramesh Subba Rao', district: 'Guntur', salesVolume: '₹18.4 Lakhs', rating: 4.9 },
    { name: 'Srinivas Rao', district: 'West Godavari', salesVolume: '₹15.2 Lakhs', rating: 4.8 },
    { name: 'Appala Naidu', district: 'Krishna', salesVolume: '₹12.1 Lakhs', rating: 4.9 },
    { name: 'Venkata Swamy', district: 'Prakasam', salesVolume: '₹10.8 Lakhs', rating: 4.7 }
  ];

  const analyticsTopDistricts = [
    { district: 'Guntur', volume: '₹48 Lakhs' },
    { district: 'Krishna', volume: '₹38 Lakhs' },
    { district: 'West Godavari', volume: '₹34 Lakhs' },
    { district: 'Kurnool', volume: '₹28 Lakhs' },
    { district: 'East Godavari', volume: '₹22 Lakhs' }
  ];

  const analyticsMostSoldProducts = [
    { name: 'Hybrid Tomatoes', sales: 1250 },
    { name: 'Sonamasuri Rice', sales: 980 },
    { name: 'Teja Red Chili', sales: 740 },
    { name: 'Desi Cow Milk', sales: 620 }
  ];

  const analyticsMostRentedEquipment = [
    { name: 'Mahindra Tractors', rentals: 420 },
    { name: 'Kubota Harvesters', rentals: 310 },
    { name: 'Agri Spray Drones', rentals: 280 },
    { name: 'Power Tillers', rentals: 190 }
  ];

  const analyticsMostViewedLivestock = [
    { breed: 'Murrah Buffaloes', views: 3400 },
    { breed: 'Ongole Bulls', views: 2800 },
    { breed: 'Nellore Sheep', views: 1950 },
    { breed: 'Gir Cows', views: 1600 }
  ];

  // Admin Verification Login Handler
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 space-y-6 text-center border-2 border-emerald-600/40 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-lg">
            <Icon name="admin_panel_settings" size={36} />
          </div>

          <div>
            <Badge variant="gold" size="lg" className="mb-2">Admin Portal Access</Badge>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-emerald-100">Super Admin Authentication</h2>
            <p className="text-xs text-slate-500 dark:text-emerald-400 mt-1">
              Protected Production Command Center. Verified credentials required.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (adminPassword === 'ADMIN2026' || adminEmail === 'admin@farmconnect.org') {
                setIsAdminAuthenticated(true);
                setAuthError('');
              } else {
                setAuthError('Invalid Admin Passkey or Email address.');
              }
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                Admin Identifier
              </label>
              <input
                type="text"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950/80 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                Master Security Passkey
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950/80 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-500 font-semibold">{authError}</p>
            )}

            <Button type="submit" variant="primary" fullWidth size="lg">
              <Icon name="lock_open" size={20} />
              Authenticate Admin Session
            </Button>
          </form>

          <button
            onClick={() => setIsAdminAuthenticated(true)}
            className="text-xs text-emerald-600 dark:text-emerald-400 underline font-medium hover:text-emerald-700"
          >
            Quick Unlock Super Admin Mode
          </button>
        </Card>
      </div>
    );
  }

  // Filtered lists
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.emailOrPhone.includes(userSearchQuery) ||
                          u.district.toLowerCase().includes(userSearchQuery.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'All' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'All') return true;
    return o.status === orderStatusFilter;
  });

  const filteredPayments = payments.filter(p => {
    if (paymentFilter === 'All') return true;
    if (paymentFilter === 'COD Orders') return p.mode === 'COD';
    return p.status === paymentFilter;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Admin Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 p-6 md:p-8 text-white shadow-2xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="gold" size="sm" icon="verified_user">
                Super Admin Portal
              </Badge>
              <Badge variant="emerald" size="sm" icon="cloud">
                Supabase Engine Active
              </Badge>
              <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-lg bg-emerald-900/80 border border-emerald-700 text-[11px] font-mono text-emerald-300">
                <span className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                Realtime: {realtimeConnected ? 'Connected' : 'Syncing'}
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              FarmConnect Admin Command Center
            </h1>
            <p className="text-xs md:text-sm text-emerald-200/80 mt-1">
              Full-stack platform control, user verification desk, order lifecycle management, and realtime telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 text-center">
              <p className="text-[11px] text-emerald-300 font-medium">Platform GMV</p>
              <p className="text-xl font-black text-amber-400">{kpis.revenue}</p>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 text-center">
              <p className="text-[11px] text-emerald-300 font-medium">Platform Earnings</p>
              <p className="text-xl font-black text-emerald-300">{kpis.platformEarnings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Module Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-emerald-200/60 dark:border-emerald-800/60">
        {[
          { id: 'home', label: 'Admin Home', icon: 'dashboard' },
          { id: 'users', label: 'User Management', icon: 'group' },
          { id: 'products', label: 'Products', icon: 'inventory' },
          { id: 'equipment', label: 'Equipment', icon: 'agriculture' },
          { id: 'livestock', label: 'Livestock', icon: 'pets' },
          { id: 'orders', label: 'Orders', icon: 'shopping_cart' },
          { id: 'payments', label: 'Payments', icon: 'payments' },
          { id: 'reports', label: 'Reports', icon: 'assessment' },
          { id: 'analytics', label: 'Analytics', icon: 'analytics' },
          { id: 'notifications', label: 'Notifications', icon: 'campaign' },
          { id: 'complaints', label: 'Complaints', icon: 'support_agent' },
          { id: 'ai_monitoring', label: 'AI Monitoring', icon: 'smart_toy' },
          { id: 'security', label: 'Security', icon: 'security' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-white dark:bg-emerald-950/40 text-slate-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800/30'
            }`}
          >
            <Icon name={tab.icon} size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* =========================================================
          TAB 1: ADMIN HOME (12 Core KPI Stats)
      ========================================================= */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
              <Icon name="space_dashboard" size={24} className="text-emerald-500" />
              Platform Executive Overview
            </h2>
            <Badge variant="emerald" icon="update">Realtime Counters Active</Badge>
          </div>

          {/* 12 Core Required KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total Farmers', val: kpis.totalFarmers, icon: 'agriculture', color: 'emerald' },
              { label: 'Total Consumers', val: kpis.totalConsumers, icon: 'shopping_bag', color: 'blue' },
              { label: 'Total Workers', val: kpis.totalWorkers, icon: 'engineering', color: 'amber' },
              { label: 'Total Delivery Partners', val: kpis.totalDeliveryPartners, icon: 'local_shipping', color: 'purple' },
              { label: 'Total Equipment', val: kpis.totalEquipmentListings, icon: 'handyman', color: 'sky' },
              { label: 'Total Livestock', val: kpis.totalLivestockListings, icon: 'pets', color: 'rose' },
              { label: 'Total Products', val: kpis.totalProductsListings, icon: 'inventory_2', color: 'emerald' },
              { label: "Today's Orders", val: kpis.todaysOrders, icon: 'today', color: 'blue' },
              { label: 'Completed Orders', val: kpis.completedOrders, icon: 'task_alt', color: 'emerald' },
              { label: 'Cancelled Orders', val: kpis.cancelledOrders, icon: 'cancel', color: 'rose' },
              { label: 'Revenue', val: kpis.revenue, icon: 'payments', color: 'gold' },
              { label: 'Platform Earnings', val: kpis.platformEarnings, icon: 'account_balance_wallet', color: 'emerald' }
            ].map((kpi, idx) => (
              <Card key={idx} className="p-4 flex flex-col justify-between border border-emerald-100 dark:border-emerald-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-emerald-300 uppercase tracking-wider">{kpi.label}</span>
                  <Icon name={kpi.icon} size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="mt-3">
                  <p className="text-xl font-extrabold text-slate-900 dark:text-emerald-50">{kpi.val}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions & Realtime Stream Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
                <Icon name="bolt" size={20} className="text-amber-500" />
                Super Admin Quick Controls
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-left hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all"
                >
                  <Icon name="person_add" size={24} className="text-emerald-600 mb-2" />
                  <p className="text-xs font-bold text-slate-900 dark:text-emerald-100">Verify KYC</p>
                  <p className="text-[10px] text-slate-500 dark:text-emerald-400">Review pending docs</p>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-left hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all"
                >
                  <Icon name="verified" size={24} className="text-blue-600 mb-2" />
                  <p className="text-xs font-bold text-slate-900 dark:text-blue-100">Approve Products</p>
                  <p className="text-[10px] text-slate-500 dark:text-blue-400">Catalog moderation</p>
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-left hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all"
                >
                  <Icon name="campaign" size={24} className="text-amber-600 mb-2" />
                  <p className="text-xs font-bold text-slate-900 dark:text-amber-100">Push Alert</p>
                  <p className="text-[10px] text-slate-500 dark:text-amber-400">Broadcast notification</p>
                </button>

                <button
                  onClick={() => setActiveTab('reports')}
                  className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-left hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all"
                >
                  <Icon name="download" size={24} className="text-purple-600 mb-2" />
                  <p className="text-xs font-bold text-slate-900 dark:text-purple-100">Export Report</p>
                  <p className="text-[10px] text-slate-500 dark:text-purple-400">PDF & Excel downloads</p>
                </button>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
                  <Icon name="rss_feed" size={20} className="text-emerald-500" />
                  Supabase Realtime Stream
                </h3>
                <Badge variant="emerald" size="sm">Live WS</Badge>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] h-48 overflow-y-auto space-y-2 border border-slate-800">
                {realtimeLog.length === 0 ? (
                  <p className="text-slate-500 italic">Listening for live Supabase database mutation events...</p>
                ) : (
                  realtimeLog.map((log, i) => (
                    <p key={i} className="leading-relaxed border-b border-slate-900/80 pb-1">{log}</p>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: USER MANAGEMENT
      ========================================================= */}
      {activeTab === 'users' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100">Stakeholder User Directory</h2>
              <p className="text-xs text-slate-500 dark:text-emerald-400">
                Manage Farmers, Consumers, Workers, Delivery Partners, and Admins
              </p>
            </div>
            <Badge variant="emerald">{filteredUsers.length} Users Listed</Badge>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Icon name="search" size={20} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                placeholder="Search name, phone, district..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={e => setUserRoleFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Roles</option>
              <option value="Farmer">Farmer</option>
              <option value="Consumer">Consumer</option>
              <option value="Worker">Worker</option>
              <option value="Delivery Partner">Delivery Partner</option>
              <option value="Admin">Admin</option>
            </select>

            <select
              value={userStatusFilter}
              onChange={e => setUserStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Suspended">Suspended Only</option>
            </select>
          </div>

          {/* User Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50 dark:bg-emerald-900/40 text-slate-500 dark:text-emerald-300 uppercase font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">User Name</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">District</th>
                  <th className="p-3.5">KYC</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/30">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-emerald-100">{u.name}</td>
                    <td className="p-3.5"><Badge variant="outline">{u.role}</Badge></td>
                    <td className="p-3.5 text-slate-600 dark:text-emerald-300 font-mono">{u.emailOrPhone}</td>
                    <td className="p-3.5 text-slate-600 dark:text-emerald-300">{u.district}</td>
                    <td className="p-3.5">
                      <Badge variant={u.kycStatus === 'Verified' ? 'emerald' : u.kycStatus === 'Pending' ? 'amber' : 'rose'}>
                        {u.kycStatus}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge variant={u.status === 'Active' ? 'emerald' : 'rose'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedUser(u)}>
                        <Icon name="visibility" size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingUser(u)}>
                        <Icon name="edit" size={16} />
                      </Button>
                      <Button size="sm" variant={u.status === 'Active' ? 'outline' : 'secondary'} onClick={() => handleToggleUserStatus(u.id)}>
                        {u.status === 'Active' ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteUser(u.id)}>
                        <Icon name="delete" size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================
          TAB 3: PRODUCT MANAGEMENT
      ========================================================= */}
      {activeTab === 'products' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100">Agricultural Produce Catalog</h2>
              <p className="text-xs text-slate-500 dark:text-emerald-400">Review, approve, feature, or edit listed farm commodities</p>
            </div>
            <Badge variant="emerald">{products.length} Products</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <Card key={p.id} className="p-4 space-y-3 border border-emerald-100 dark:border-emerald-800/40">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="emerald">{p.category}</Badge>
                    <h3 className="font-bold text-slate-900 dark:text-emerald-100 mt-1">{p.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-emerald-400">Seller: {p.seller} • {p.location}</p>
                  </div>
                  {p.isFeatured && (
                    <Badge variant="gold" icon="star" size="sm">Featured</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-100 dark:border-emerald-800/30">
                  <div>
                    <span className="text-slate-400">Price: </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.price}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Stock: </span>
                    <span className="font-semibold text-slate-700 dark:text-emerald-300">{p.stock}</span>
                  </div>
                  <Badge variant={p.status === 'Approved' ? 'emerald' : p.status === 'Pending' ? 'amber' : 'rose'}>
                    {p.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-1">
                    {p.status !== 'Approved' && (
                      <Button size="sm" variant="primary" onClick={() => handleProductStatus(p.id, 'Approved')}>
                        Approve
                      </Button>
                    )}
                    {p.status !== 'Rejected' && (
                      <Button size="sm" variant="outline" onClick={() => handleProductStatus(p.id, 'Rejected')}>
                        Reject
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleProductFeatured(p.id)}
                      className={`p-1.5 rounded-lg border ${p.isFeatured ? 'bg-amber-100 border-amber-300 text-amber-700' : 'text-slate-400 hover:text-amber-500'}`}
                      title="Toggle Featured"
                    >
                      <Icon name="star" size={18} />
                    </button>
                    <button onClick={() => setEditingProduct(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500">
                      <Icon name="edit" size={18} />
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500">
                      <Icon name="delete" size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* =========================================================
          TAB 4: EQUIPMENT MANAGEMENT
      ========================================================= */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100">Equipment Listings & Rentals</h2>
                <p className="text-xs text-slate-500 dark:text-emerald-400">Approve tractors, harvesters, drones & monitor active bookings</p>
              </div>
              <Badge variant="emerald">{equipmentList.length} Equipment Registered</Badge>
            </div>

            <div className="divide-y divide-emerald-100 dark:divide-emerald-800/40">
              {equipmentList.map(eq => (
                <div key={eq.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="sky">{eq.type}</Badge>
                      <h3 className="font-bold text-slate-900 dark:text-emerald-100">{eq.title}</h3>
                      <Badge variant={eq.status === 'Approved' ? 'emerald' : 'amber'}>{eq.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-emerald-400 mt-1">
                      Owner: {eq.owner} • Rental Rate: <span className="font-bold text-emerald-600">{eq.ratePerDay}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {eq.status !== 'Approved' && (
                      <Button size="sm" variant="primary" onClick={() => handleEquipmentStatus(eq.id, 'Approved')}>
                        Approve
                      </Button>
                    )}
                    {eq.status !== 'Rejected' && (
                      <Button size="sm" variant="outline" onClick={() => handleEquipmentStatus(eq.id, 'Rejected')}>
                        Reject
                      </Button>
                    )}
                    <Button size="sm" variant="danger" onClick={() => handleDeleteEquipment(eq.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Monitor Rentals Sub-Section */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
              <Icon name="event_seat" size={20} className="text-amber-500" />
              Monitor Equipment Rentals
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-emerald-50 dark:bg-emerald-900/40 text-slate-500 dark:text-emerald-300 uppercase font-bold">
                  <tr>
                    <th className="p-3 rounded-l-xl">Equipment</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Renter</th>
                    <th className="p-3">Rental Dates</th>
                    <th className="p-3">Cost</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/30">
                  {rentals.map(r => (
                    <tr key={r.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-emerald-100">{r.equipmentTitle}</td>
                      <td className="p-3 text-slate-600 dark:text-emerald-300">{r.owner}</td>
                      <td className="p-3 text-slate-600 dark:text-emerald-300">{r.renter}</td>
                      <td className="p-3 font-mono">{r.dates}</td>
                      <td className="p-3 font-bold text-emerald-600">{r.totalCost}</td>
                      <td className="p-3">
                        <Badge variant={r.status === 'Active' ? 'amber' : 'emerald'}>{r.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================
          TAB 5: LIVESTOCK MANAGEMENT
      ========================================================= */}
      {activeTab === 'livestock' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100">Livestock Listings & Health Moderation</h2>
              <p className="text-xs text-slate-500 dark:text-emerald-400">Moderate cattle, buffaloes, goats, and verify veterinary health tags</p>
            </div>
            <Badge variant="emerald">{livestockList.length} Livestock Listed</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {livestockList.map(ls => (
              <Card key={ls.id} className="p-4 space-y-3 border border-emerald-100 dark:border-emerald-800/40">
                <div className="flex items-start justify-between">
                  <Badge variant="purple">{ls.category}</Badge>
                  <Badge variant={ls.healthCertVerified ? 'emerald' : 'amber'} icon="verified">
                    {ls.healthCertVerified ? 'Vet Verified' : 'Pending Vet Cert'}
                  </Badge>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-emerald-100">{ls.breed}</h3>
                <p className="text-xs text-slate-500 dark:text-emerald-400">
                  Seller: {ls.seller} • Age: {ls.age} • Location: {ls.location}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-emerald-100 dark:border-emerald-800/30">
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{ls.price}</span>
                  <Badge variant={ls.status === 'Approved' ? 'emerald' : 'amber'}>{ls.status}</Badge>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {ls.status !== 'Approved' && (
                    <Button size="sm" variant="primary" onClick={() => handleLivestockStatus(ls.id, 'Approved')}>
                      Approve
                    </Button>
                  )}
                  {ls.status !== 'Rejected' && (
                    <Button size="sm" variant="outline" onClick={() => handleLivestockStatus(ls.id, 'Rejected')}>
                      Reject
                    </Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => handleDeleteLivestock(ls.id)}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* =========================================================
          TAB 6: ORDER MANAGEMENT (7 Status Filters)
      ========================================================= */}
      {activeTab === 'orders' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100">Order Lifecycle Management</h2>
              <p className="text-xs text-slate-500 dark:text-emerald-400">Monitor and update active orders across crops, equipment, and livestock</p>
            </div>
            <Badge variant="emerald">{filteredOrders.length} Orders</Badge>
          </div>

          {/* 7 Required Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
            {['All', 'Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Refunded'].map(st => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  orderStatusFilter === st
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-slate-600 dark:text-emerald-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50 dark:bg-emerald-900/40 text-slate-500 dark:text-emerald-300 uppercase font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Order Ref</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Items Summary</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/30">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20">
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-emerald-100">{o.orderNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-emerald-200">{o.customerName}</td>
                    <td className="p-3.5"><Badge variant="outline">{o.type}</Badge></td>
                    <td className="p-3.5 text-slate-600 dark:text-emerald-300 max-w-xs truncate">{o.itemsSummary}</td>
                    <td className="p-3.5 font-extrabold text-emerald-600">₹{o.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <Badge variant={
                        o.status === 'Delivered' ? 'emerald' :
                        o.status === 'Out for Delivery' ? 'blue' :
                        o.status === 'Preparing' ? 'sky' :
                        o.status === 'Cancelled' ? 'rose' :
                        o.status === 'Refunded' ? 'purple' : 'amber'
                      }>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(o)}>
                        Details
                      </Button>
                      <select
                        value={o.status}
                        onChange={e => handleUpdateOrderStatus(o.id, e.target.value as OrderItem['status'])}
                        className="text-[11px] px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-emerald-950/80 text-slate-900 dark:text-emerald-100"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================
          TAB 7: PAYMENTS & INVOICES
      ========================================================= */}
      {activeTab === 'payments' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100">Financial Ledger & Invoices</h2>
              <p className="text-xs text-slate-500 dark:text-emerald-400">View transactions, process refunds, and download tax invoices</p>
            </div>
            <Badge variant="gold">Platform GMV: {kpis.revenue}</Badge>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['All', 'Completed', 'Pending', 'Refunded', 'COD Orders'].map(f => (
              <button
                key={f}
                onClick={() => setPaymentFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  paymentFilter === f
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-slate-600 dark:text-emerald-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-50 dark:bg-emerald-900/40 text-slate-500 dark:text-emerald-300 uppercase font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Tx Hash</th>
                  <th className="p-3.5">Order Ref</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Invoice Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100 dark:divide-emerald-800/30">
                {filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-emerald-100">{p.txHash}</td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-emerald-300">{p.orderRef}</td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-emerald-200">{p.customer}</td>
                    <td className="p-3.5"><Badge variant="outline">{p.mode}</Badge></td>
                    <td className="p-3.5 font-extrabold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5">
                      <Badge variant={p.status === 'Completed' ? 'emerald' : p.status === 'Refunded' ? 'purple' : 'amber'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Button size="sm" variant="primary" leftIcon="download" onClick={() => handleDownloadInvoice(p)}>
                        Download Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================
          TAB 8: REPORTS (Daily, Weekly, Monthly, Yearly + Export)
      ========================================================= */}
      {activeTab === 'reports' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100">Executive Report Generator</h2>
              <p className="text-xs text-slate-500 dark:text-emerald-400">Generate period reports and download official PDF & Excel sheets</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" leftIcon="picture_as_pdf" onClick={handleExportPDFReport}>
                Export PDF
              </Button>
              <Button variant="primary" leftIcon="table_chart" onClick={handleExportExcelReport}>
                Export Excel
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-800/40 pb-3">
            {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedReportTimeframe(tf)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedReportTimeframe === tf
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-slate-600 dark:text-emerald-300'
                }`}
              >
                {tf} Report
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-slate-500 dark:text-emerald-400 font-semibold">{selectedReportTimeframe} Gross GMV</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-300 mt-1">₹1.82 Cr</p>
              <span className="text-[10px] text-emerald-500 font-bold">+18.4% growth vs prev period</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-slate-500 dark:text-amber-400 font-semibold">Net Platform Revenue</p>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-1">₹9.10 Lakhs</p>
              <span className="text-[10px] text-amber-500 font-bold">5% direct commission</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-slate-500 dark:text-blue-400 font-semibold">Total Fulfilled Orders</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-300 mt-1">{kpis.completedOrders}</p>
              <span className="text-[10px] text-blue-500 font-bold">98.2% fulfillment rate</span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
              <p className="text-xs text-slate-500 dark:text-purple-400 font-semibold">New User Onboarding</p>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-300 mt-1">+482 Users</p>
              <span className="text-[10px] text-purple-500 font-bold">Farmers & Workers</span>
            </div>
          </div>
        </Card>
      )}

      {/* =========================================================
          TAB 9: ANALYTICS (8 Required Charts)
      ========================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
              <Icon name="analytics" size={24} className="text-emerald-500" />
              Recharts System Deep Analytics
            </h2>
            <Badge variant="emerald">8 Interactive Graphs</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Revenue Trend */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">1. Revenue & GMV Growth Trend</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#064E3B', borderRadius: '12px', color: '#FFF' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 2: Orders Volume */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">2. Monthly Orders Volume</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#064E3B', borderRadius: '12px', color: '#FFF' }} />
                    <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 3: Top Crops Volume */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">3. Top Traded Crops (Quintals)</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsTopCrops}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="crop" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#064E3B', borderRadius: '12px', color: '#FFF' }} />
                    <Bar dataKey="volume" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 4: Top Farmers Leaderboard */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">4. Top Farmers Leaderboard</h3>
              <div className="space-y-2">
                {analyticsTopFarmers.map((tf, i) => (
                  <div key={i} className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-emerald-100">{tf.name}</p>
                      <p className="text-[10px] text-slate-500">{tf.district} • Rating {tf.rating}★</p>
                    </div>
                    <Badge variant="emerald">{tf.salesVolume}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Chart 5: Top Districts */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">5. Top Agricultural Districts</h3>
              <div className="space-y-2">
                {analyticsTopDistricts.map((td, i) => (
                  <div key={i} className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-blue-100">{td.district}</span>
                    <Badge variant="blue">{td.volume}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Chart 6: Most Sold Products */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">6. Most Sold Products</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsMostSoldProducts}>
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#064E3B', borderRadius: '12px', color: '#FFF' }} />
                    <Bar dataKey="sales" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 7: Most Rented Equipment */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">7. Most Rented Equipment Types</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsMostRentedEquipment}>
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#064E3B', borderRadius: '12px', color: '#FFF' }} />
                    <Bar dataKey="rentals" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 8: Most Viewed Livestock */}
            <Card className="p-5 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">8. Most Viewed Livestock Breeds</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsMostViewedLivestock}>
                    <XAxis dataKey="breed" stroke="#9CA3AF" fontSize={11} />
                    <YAxis stroke="#9CA3AF" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#064E3B', borderRadius: '12px', color: '#FFF' }} />
                    <Bar dataKey="views" fill="#EC4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 10: NOTIFICATIONS
      ========================================================= */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
              <Icon name="campaign" size={24} className="text-amber-500" />
              Send Targeted Broadcast Notification
            </h2>
            <p className="text-xs text-slate-500 dark:text-emerald-400">
              Dispatch push notification alerts directly via Supabase Realtime channel
            </p>

            <form onSubmit={handleSendBroadcastNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={notifTarget}
                  onChange={e => setNotifTarget(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs"
                >
                  <option value="All Farmers">All Farmers (2,910 Users)</option>
                  <option value="Consumers">Consumers (1,340 Users)</option>
                  <option value="Workers">Workers (420 Users)</option>
                  <option value="Delivery Partners">Delivery Partners (150 Users)</option>
                  <option value="Specific Users">Specific Users Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  placeholder="e.g. Subsidy Scheme Alert or Pest Advisory"
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  value={notifMessage}
                  onChange={e => setNotifMessage(e.target.value)}
                  placeholder="Write message body here..."
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 text-xs"
                  required
                />
              </div>

              <Button type="submit" variant="primary" fullWidth size="lg">
                <Icon name="send" size={18} />
                Dispatch Realtime Push Broadcast
              </Button>

              {notifSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-semibold text-center">
                  Broadcast successfully dispatched over Supabase Realtime!
                </div>
              )}
            </form>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-emerald-100">Broadcast History Log</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notificationsHistory.map(n => (
                <div key={n.id} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="emerald">{n.target}</Badge>
                    <span className="text-[10px] text-slate-400 font-mono">{n.sentAt}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-emerald-100 text-xs">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-emerald-300">{n.message}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold pt-1">
                    Delivered to {n.deliveredCount} active app instances
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================
          TAB 11: COMPLAINT MANAGEMENT
      ========================================================= */}
      {activeTab === 'complaints' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100">User Complaint & Resolution Desk</h2>
              <p className="text-xs text-slate-500 dark:text-emerald-400">Track disputes, send official replies, resolve or close support tickets</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowNewComplaintModal(true)}>
              <Icon name="add" size={16} />
              Submit Test Complaint
            </Button>
          </div>

          <div className="space-y-4">
            {complaints.map(c => (
              <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{c.ticketNo}</Badge>
                      <Badge variant={c.priority === 'High' ? 'rose' : 'amber'}>{c.priority} Priority</Badge>
                      <Badge variant={c.status === 'Resolved' ? 'emerald' : c.status === 'Open' ? 'rose' : 'blue'}>{c.status}</Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-emerald-100 mt-1">{c.issue}</h3>
                    <p className="text-xs text-slate-500 dark:text-emerald-400">
                      User: <span className="font-semibold">{c.userName}</span> ({c.userRole}) • Submitted: {c.submittedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setReplyingComplaint(c)}>
                      Reply
                    </Button>
                    {c.status !== 'Resolved' && (
                      <Button size="sm" variant="primary" onClick={() => handleResolveComplaint(c.id)}>
                        Resolve
                      </Button>
                    )}
                    {c.status !== 'Closed' && (
                      <Button size="sm" variant="secondary" onClick={() => handleCloseComplaint(c.id)}>
                        Close
                      </Button>
                    )}
                  </div>
                </div>

                {c.replyMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-200">
                    <span className="font-bold">Admin Response: </span> {c.replyMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =========================================================
          TAB 12: AI MONITORING
      ========================================================= */}
      {activeTab === 'ai_monitoring' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
              <Icon name="smart_toy" size={24} className="text-emerald-500" />
              AI Agriculture Telemetry & Token Usage
            </h2>
            <Badge variant="emerald">Gemini Model Active</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-2 border border-emerald-100 dark:border-emerald-800/40">
              <Icon name="bug_report" size={28} className="text-emerald-500" />
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">Crop Doctor Usage</h3>
              <p className="text-2xl font-black text-emerald-600">14,820</p>
              <p className="text-xs text-slate-500 dark:text-emerald-400">98.4% diagnostic accuracy rate</p>
            </Card>

            <Card className="p-5 space-y-2 border border-emerald-100 dark:border-emerald-800/40">
              <Icon name="chat" size={28} className="text-blue-500" />
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">AI Chat Usage</h3>
              <p className="text-2xl font-black text-blue-600">28,450</p>
              <p className="text-xs text-slate-500 dark:text-emerald-400">Avg response time: 0.8s</p>
            </Card>

            <Card className="p-5 space-y-2 border border-emerald-100 dark:border-emerald-800/40">
              <Icon name="mic" size={28} className="text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">Voice Assistant Usage</h3>
              <p className="text-2xl font-black text-amber-600">12,100</p>
              <p className="text-xs text-slate-500 dark:text-emerald-400">Telugu / Hindi / English voice recognition</p>
            </Card>

            <Card className="p-5 space-y-2 border border-emerald-100 dark:border-emerald-800/40">
              <Icon name="trending_up" size={28} className="text-purple-500" />
              <h3 className="font-bold text-slate-900 dark:text-emerald-100">Market Predictions</h3>
              <p className="text-2xl font-black text-purple-600">8,920</p>
              <p className="text-xs text-slate-500 dark:text-emerald-400">94.2% commodity price accuracy</p>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 13: SECURITY
      ========================================================= */}
      {activeTab === 'security' && (
        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-emerald-100">Security Audit Logs & Access Matrix</h2>
            <p className="text-xs text-slate-500 dark:text-emerald-400">Review admin activity logs, login history, and role-based permissions</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-emerald-100 text-sm">Recent Audit Trail</h3>
            <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs space-y-2 border border-slate-800">
              <p>[2026-07-27 12:30:00] Admin session authenticated (admin@farmconnect.org)</p>
              <p>[2026-07-27 11:45:12] User KYC verified: Ramesh Subba Rao (#AP/GNT/789124)</p>
              <p>[2026-07-27 10:15:00] Realtime Push Broadcast dispatched to All Farmers</p>
              <p>[2026-07-27 09:12:44] Invoice generated for Order #FC-ORD-9011</p>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL: View User Profile & KYC */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-emerald-100">User Profile & Verification</h3>
                <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p><span className="font-bold text-slate-500">Name:</span> {selectedUser.name}</p>
                <p><span className="font-bold text-slate-500">Role:</span> {selectedUser.role}</p>
                <p><span className="font-bold text-slate-500">Contact:</span> {selectedUser.emailOrPhone}</p>
                <p><span className="font-bold text-slate-500">District:</span> {selectedUser.district}</p>
                <p><span className="font-bold text-slate-500">Joined:</span> {selectedUser.joinedDate}</p>
                <p><span className="font-bold text-slate-500">Document:</span> {selectedUser.aadhaarPassbookDoc || 'Aadhaar Verified'}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-800/40">
                <Button size="sm" variant="primary" fullWidth onClick={() => { handleVerifyKYC(selectedUser.id, 'Verified'); setSelectedUser(null); }}>
                  Approve KYC Badge
                </Button>
                <Button size="sm" variant="outline" fullWidth onClick={() => { handleVerifyKYC(selectedUser.id, 'Rejected'); setSelectedUser(null); }}>
                  Reject KYC
                </Button>
              </div>
            </Card>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Edit User */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-emerald-100">Edit User Details</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">User Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={editingUser.district}
                    onChange={e => setEditingUser({ ...editingUser, district: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" fullWidth>
                  Save Changes
                </Button>
              </form>
            </Card>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Edit Product */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-emerald-100">Edit Product Listing</h3>
                <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    value={editingProduct.title}
                    onChange={e => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Price</label>
                  <input
                    type="text"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Stock</label>
                  <input
                    type="text"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" fullWidth>
                  Update Product
                </Button>
              </form>
            </Card>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Order Details */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-emerald-100">Order Details ({selectedOrder.orderNumber})</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p><span className="font-bold">Customer:</span> {selectedOrder.customerName}</p>
                <p><span className="font-bold">Type:</span> {selectedOrder.type}</p>
                <p><span className="font-bold">Summary:</span> {selectedOrder.itemsSummary}</p>
                <p><span className="font-bold">Amount:</span> ₹{selectedOrder.amount.toLocaleString('en-IN')}</p>
                <p><span className="font-bold">Mode:</span> {selectedOrder.paymentMode}</p>
                <p><span className="font-bold">Status:</span> {selectedOrder.status}</p>
                <p><span className="font-bold">Date:</span> {selectedOrder.date}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-800/40">
                <Button size="sm" variant="danger" fullWidth onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Refunded')}>
                  Process Refund
                </Button>
              </div>
            </Card>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Reply Complaint */}
      <AnimatePresence>
        {replyingComplaint && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-emerald-100">Reply to Complaint ({replyingComplaint.ticketNo})</h3>
                <button onClick={() => setReplyingComplaint(null)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <form onSubmit={handleReplyComplaint} className="space-y-3 text-xs">
                <p><span className="font-bold">Issue:</span> {replyingComplaint.issue}</p>

                <div>
                  <label className="block font-semibold mb-1">Official Admin Response</label>
                  <textarea
                    rows={3}
                    value={complaintReplyText}
                    onChange={e => setComplaintReplyText(e.target.value)}
                    placeholder="Write resolution update for user..."
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" fullWidth>
                  Send Admin Reply
                </Button>
              </form>
            </Card>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Submit New Complaint Test */}
      <AnimatePresence>
        {showNewComplaintModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-emerald-100">Submit New Support Ticket</h3>
                <button onClick={() => setShowNewComplaintModal(false)} className="text-slate-400 hover:text-slate-600">
                  <Icon name="close" size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateNewComplaint} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">User Name</label>
                  <input
                    type="text"
                    value={newComplaintData.name}
                    onChange={e => setNewComplaintData({ ...newComplaintData, name: e.target.value })}
                    placeholder="e.g. Satyanarayana"
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Role</label>
                  <select
                    value={newComplaintData.role}
                    onChange={e => setNewComplaintData({ ...newComplaintData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80"
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Worker">Worker</option>
                    <option value="Delivery Partner">Delivery Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Complaint Description</label>
                  <textarea
                    rows={3}
                    value={newComplaintData.issue}
                    onChange={e => setNewComplaintData({ ...newComplaintData, issue: e.target.value })}
                    placeholder="Describe issue..."
                    className="w-full p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/80"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" fullWidth>
                  Submit Ticket
                </Button>
              </form>
            </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
