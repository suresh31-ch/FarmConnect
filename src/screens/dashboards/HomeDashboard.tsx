/**
 * FarmConnect Shared Home Dashboard
 * Unified multi-role entry point featuring personalized greeting, weather forecast,
 * market tickers, notifications, AI tips, role-aware quick actions, and analytics charts.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { useFarmData } from '../../context/FarmDataContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const HomeDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const { setActiveTab, setVoiceModalOpen } = useAppState();
  const { weather, mandiPrices, orders, products } = useFarmData();

  // Time-of-day greeting
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  // Analytics Chart Data
  const weeklyTradeData = [
    { day: 'Mon', sales: 12400, orders: 14 },
    { day: 'Tue', sales: 18200, orders: 22 },
    { day: 'Wed', sales: 15600, orders: 18 },
    { day: 'Thu', sales: 24800, orders: 29 },
    { day: 'Fri', sales: 21000, orders: 25 },
    { day: 'Sat', sales: 31500, orders: 38 },
    { day: 'Sun', sales: 28900, orders: 34 },
  ];

  const categoryBreakdownData = [
    { name: 'Vegetables', value: 45, color: '#2E7D32' },
    { name: 'Grains & Pulses', value: 30, color: '#FFC107' },
    { name: 'Fruits', value: 15, color: '#FF9800' },
    { name: 'Spices', value: 10, color: '#E91E63' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. TOP PERSONALIZED GREETING HERO */}
      <Card
        variant="gradient"
        className="p-6 relative overflow-hidden bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#43A047]"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="amber" size="sm" icon="verified">
                {role ? `${role.toUpperCase()} PORTAL` : 'GUEST SESSION'}
              </Badge>
              <span className="text-xs text-emerald-100 font-medium bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full">
                Production Build v2.8.0
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {timeGreeting}, {user?.name || 'Agri Leader'}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Welcome to the FarmConnect Ecosystem. Direct farm-to-table trade, AI plant health diagnostics, labor market, and real-time mandi prices at your fingertips.
            </p>

            {/* Role-Aware Quick Info */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-amber-300">
              <span className="flex items-center gap-1">
                <Icon name="location_on" size={16} /> Guntur District, AP
              </span>
              <span className="flex items-center gap-1">
                <Icon name="verified_user" size={16} /> Aadhaar & Land Record Verified
              </span>
              <span className="flex items-center gap-1">
                <Icon name="account_balance_wallet" size={16} /> Wallet: ₹14,250.00
              </span>
            </div>
          </div>

          {/* Action trigger */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Button
              variant="accent"
              size="lg"
              leftIcon="psychology"
              onClick={() => setActiveTab('ai_assistant')}
              className="shadow-xl"
            >
              Suri AI
            </Button>
            <Button
              variant="glass"
              size="md"
              leftIcon="mic"
              onClick={() => setVoiceModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              Voice Query
            </Button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      </Card>

      {/* 2. QUICK STATISTICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Ecosystem Sales',
            value: '₹1,84,500',
            change: '+14.2% vs last week',
            icon: 'payments',
            color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300',
          },
          {
            label: 'Active Orders',
            value: `${orders.filter((o) => o.status !== 'delivered').length} Live`,
            change: '3 Out for Delivery',
            icon: 'shopping_bag',
            color: 'text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300',
          },
          {
            label: 'Available Products',
            value: `${products.length} Items`,
            change: 'Fresh Local Harvest',
            icon: 'storefront',
            color: 'text-blue-700 bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300',
          },
          {
            label: 'AI Health Scans',
            value: '42 Done',
            change: '98.5% Accuracy',
            icon: 'health_and_safety',
            color: 'text-purple-700 bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300',
          },
        ].map((stat, idx) => (
          <Card key={idx} variant="glass" className="p-4 space-y-2 border-slate-200/80 dark:border-emerald-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300/80">
                {stat.label}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon name={stat.icon} size={20} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {stat.change}
            </div>
          </Card>
        ))}
      </div>

      {/* 3. WEATHER CARD & MANDI TICKER ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-1 border-emerald-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Icon name={weather.icon} size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hyperlocal Weather</h3>
                <p className="text-[11px] text-slate-500 dark:text-emerald-300">{weather.location}</p>
              </div>
            </div>
            <Badge variant="amber" size="sm">Live Feed</Badge>
          </div>

          {/* Temperature & Stats */}
          <div className="flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-2xl">
            <div>
              <div className="text-3xl font-extrabold text-[#2E7D32] dark:text-emerald-300">
                {weather.temperature}°C
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-emerald-200">
                {weather.condition}
              </div>
            </div>
            <div className="text-right space-y-1 text-xs text-slate-600 dark:text-emerald-300">
              <div>💧 Humidity: <span className="font-bold">{weather.humidity}%</span></div>
              <div>💨 Wind: <span className="font-bold">{weather.windSpeed} km/h</span></div>
              <div>🌧️ Rain: <span className="font-bold">{weather.rainChance}%</span></div>
            </div>
          </div>

          {/* Advisory & TODO note */}
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Icon name="lightbulb" size={16} /> Spray & Irrigation Advisory
            </div>
            <p className="text-xs text-slate-700 dark:text-emerald-200/90 leading-relaxed">
              {weather.advisory}
            </p>
            {/* TODO: Weather API integration code notice */}
            <p className="text-[10px] text-slate-400 font-mono pt-1">
              {/* TODO: Connect OpenWeatherMap / IMD API endpoint in Part 4 */}
              [API Status: Localized IMD Feed Active]
            </p>
          </div>
        </Card>

        {/* Mandi Market Price Ticker */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#2E7D32] flex items-center justify-center">
                <Icon name="trending_up" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Mandi Prices</h3>
                <p className="text-[11px] text-slate-500 dark:text-emerald-300">Direct AP Agricultural Market Yards</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon="refresh"
              onClick={() => setActiveTab('marketplace')}
            >
              View Market
            </Button>
          </div>

          {/* Prices Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mandiPrices.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-emerald-800/40 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-emerald-100 truncate">
                    {item.crop}
                  </span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      item.trend === 'up'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.trend === 'down'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.change}
                  </span>
                </div>
                <div className="text-lg font-extrabold text-[#2E7D32] dark:text-emerald-300">
                  ₹{item.price}{' '}
                  <span className="text-xs font-normal text-slate-500">/ {item.unit}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-emerald-400/80 truncate">
                  {item.market}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. ROLE-AWARE QUICK ACTIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-emerald-400">
            Quick Actions • {role?.toUpperCase() || 'GENERAL'}
          </h3>
          <span className="text-xs text-emerald-600 font-bold">Fast-Track Navigation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {role === 'farmer' && [
            { label: 'Add Crop Listing', icon: 'add_circle', tab: 'marketplace', color: 'bg-emerald-600 text-white' },
            { label: 'Hire Workers', icon: 'groups', tab: 'worker_marketplace', color: 'bg-blue-600 text-white' },
            { label: 'Rent Tractor', icon: 'precision_manufacturing', tab: 'equipment_marketplace', color: 'bg-amber-600 text-white' },
            { label: 'Scan Disease', icon: 'camera_alt', tab: 'ai_assistant', color: 'bg-purple-600 text-white' },
            { label: 'Govt Schemes', icon: 'account_balance', tab: 'govt_schemes', color: 'bg-teal-600 text-white' },
            { label: 'My Orders', icon: 'local_shipping', tab: 'orders', color: 'bg-indigo-600 text-white' },
          ].map((act, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(act.tab as any)}
              className="p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-emerald-800/40 hover:shadow-lg transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${act.color} group-hover:scale-110 transition-transform`}>
                <Icon name={act.icon} size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-emerald-200 leading-tight">
                {act.label}
              </span>
            </button>
          ))}

          {role === 'consumer' && [
            { label: 'Browse Produce', icon: 'shopping_cart', tab: 'marketplace', color: 'bg-emerald-600 text-white' },
            { label: 'Track Orders', icon: 'pin_drop', tab: 'orders', color: 'bg-amber-600 text-white' },
            { label: 'AI Krishi Search', icon: 'psychology', tab: 'ai_assistant', color: 'bg-purple-600 text-white' },
            { label: 'Organic Special', icon: 'eco', tab: 'marketplace', color: 'bg-teal-600 text-white' },
            { label: 'My Wallet', icon: 'account_balance_wallet', tab: 'payments', color: 'bg-blue-600 text-white' },
            { label: 'Support Desk', icon: 'contact_support', tab: 'help', color: 'bg-indigo-600 text-white' },
          ].map((act, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(act.tab as any)}
              className="p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-emerald-800/40 hover:shadow-lg transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${act.color} group-hover:scale-110 transition-transform`}>
                <Icon name={act.icon} size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-emerald-200 leading-tight">
                {act.label}
              </span>
            </button>
          ))}

          {(role === 'worker' || role === 'delivery' || role === 'admin' || !role) && [
            { label: 'Marketplace', icon: 'storefront', tab: 'marketplace', color: 'bg-emerald-600 text-white' },
            { label: 'Worker Portal', icon: 'groups', tab: 'worker_marketplace', color: 'bg-blue-600 text-white' },
            { label: 'Equipment Rental', icon: 'precision_manufacturing', tab: 'equipment_marketplace', color: 'bg-amber-600 text-white' },
            { label: 'Suri AI Assistant', icon: 'psychology', tab: 'ai_assistant', color: 'bg-purple-600 text-white' },
            { label: 'Govt Schemes', icon: 'account_balance', tab: 'govt_schemes', color: 'bg-teal-600 text-white' },
            { label: 'Help Desk', icon: 'help', tab: 'help', color: 'bg-indigo-600 text-white' },
          ].map((act, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(act.tab as any)}
              className="p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-emerald-800/40 hover:shadow-lg transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${act.color} group-hover:scale-110 transition-transform`}>
                <Icon name={act.icon} size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-emerald-200 leading-tight">
                {act.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. CHARTS & ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales / Trade Volume Trend Chart */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Trade Volume Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-emerald-300">
                Direct transactions across vegetables, grains & equipment rentals
              </p>
            </div>
            <Badge variant="emerald" size="sm">+24% vs Prev Week</Badge>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTradeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tradeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2E7D32" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1B5E20',
                    borderRadius: '16px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Trade Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#2E7D32"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#tradeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Share Chart */}
        <Card variant="glass" className="p-5 space-y-4 lg:col-span-1">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Produce Category Demand
            </h3>
            <p className="text-xs text-slate-500 dark:text-emerald-300">Share of local buyer orders</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {categoryBreakdownData.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-600 dark:text-emerald-200 truncate">{cat.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{cat.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 6. AI KRISHI MITRA TIP OF THE DAY */}
      <Card variant="solid" className="p-5 border-emerald-500/30 bg-gradient-to-r from-emerald-900 to-green-900 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shrink-0 shadow-lg">
              <Icon name="auto_awesome" size={26} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="amber" size="sm">Suri AI Advisory</Badge>
                <span className="text-xs text-amber-300 font-semibold">Updated Today</span>
              </div>
              <h4 className="text-base font-bold text-white">
                Prevent Tomato Leaf Curl Virus early this season
              </h4>
              <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
                Whitefly populations are increasing in Guntur. Spray yellow sticky traps or apply 5% Neem Seed Kernel Extract (NSKE) early morning to safeguard organic tomato crops.
              </p>
            </div>
          </div>

          <Button
            variant="accent"
            size="md"
            leftIcon="psychology"
            onClick={() => setActiveTab('ai_assistant')}
            className="shrink-0"
          >
            Ask Suri AI
          </Button>
        </div>
      </Card>
    </div>
  );
};
