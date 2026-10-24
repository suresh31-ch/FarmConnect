/**
 * AI Market Price Prediction & Mandi Intelligence Engine
 * Supports 50+ Crops across Vegetables, Fruits, Grains, Pulses, Spices, Oil Seeds, Millets, Cash Crops, and Organic.
 * Features 7-day and 30-day ML price forecasting, state-wise & district-wise price breakdowns,
 * nearby APMC Mandi comparisons, demand/supply forecasting, and AI Sell/Hold/Store advice.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CROP_MARKET_DATABASE, CropMarketItem } from '../../data/cropMarketData';

type CategoryFilter =
  | 'All'
  | 'Vegetables'
  | 'Fruits'
  | 'Grains'
  | 'Pulses'
  | 'Spices'
  | 'Oil Seeds'
  | 'Millets'
  | 'Cash Crops'
  | 'Organic';

const CATEGORIES: CategoryFilter[] = [
  'All',
  'Vegetables',
  'Fruits',
  'Grains',
  'Pulses',
  'Spices',
  'Oil Seeds',
  'Millets',
  'Cash Crops',
  'Organic'
];

export const MarketPricePrediction: React.FC = () => {
  const [selectedCropId, setSelectedCropId] = useState<string>('paddy');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [forecastHorizon, setForecastHorizon] = useState<'7days' | '30days'>('7days');

  // Find selected crop from database
  const selectedCrop: CropMarketItem = useMemo(() => {
    return CROP_MARKET_DATABASE.find((c) => c.id === selectedCropId) || CROP_MARKET_DATABASE[0];
  }, [selectedCropId]);

  // Filter crops list based on search and category
  const filteredCrops = useMemo(() => {
    return CROP_MARKET_DATABASE.filter((crop) => {
      // Category match
      const matchesCategory = activeCategory === 'All' || crop.category === activeCategory;

      // Search match across name, category, states, districts, mandis
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesName = crop.name.toLowerCase().includes(query);
      const matchesCat = crop.category.toLowerCase().includes(query);
      const matchesState = crop.statePrices.some((s) => s.state.toLowerCase().includes(query));
      const matchesDistrict = crop.districtPrices.some((d) => d.district.toLowerCase().includes(query));
      const matchesMandi = crop.nearbyMarkets.some((m) => m.mandi.toLowerCase().includes(query));

      return matchesCategory && (matchesName || matchesCat || matchesState || matchesDistrict || matchesMandi);
    });
  }, [activeCategory, searchQuery]);

  // Recommendation Badge style helper
  const getRecommendationConfig = (rec: CropMarketItem['aiRecommendation']) => {
    switch (rec) {
      case 'Sell Today':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          label: '🔥 SELL TODAY - Peak Demand',
          icon: 'trending_up',
          color: '#10b981'
        };
      case 'Hold':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: '⏳ HOLD - Price Rise Expected',
          icon: 'pause_circle',
          color: '#f59e0b'
        };
      case 'Store':
        return {
          bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          label: '🏬 STORE - Long-Term Gain',
          icon: 'inventory',
          color: '#3b82f6'
        };
    }
  };

  const recConfig = getRecommendationConfig(selectedCrop.aiRecommendation);
  const chartData = forecastHorizon === '7days' ? selectedCrop.trendHistory7Days : selectedCrop.trendHistory30Days;

  return (
    <div className="space-y-6">
      {/* HERO HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 text-white shadow-2xl border border-emerald-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="md" icon="auto_graph">
                AI Mandi Engine v4.0 • 50+ Crops Live
              </Badge>
              <Badge variant="amber" size="md" icon="verified">
                AGMARKNET Sync
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Market Price & ML Trend Forecasting
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-3xl">
              Real-time APMC Mandi price tracking, regional arrival volume analytics, district & state comparisons, and 7 to 30 day AI price prediction.
            </p>
          </div>

          {/* Search bar inside header */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search crop, state, district, mandi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 text-white placeholder-slate-400 text-xs sm:text-sm px-10 py-3 rounded-2xl border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <Icon name="search" size={18} className="absolute left-3.5 top-3 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-slate-900/60 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* CROP SELECTOR GRID / HORIZONTAL SCROLLER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span>Select Crop ({filteredCrops.length} available)</span>
          <span>Click any crop to view deep AI forecast</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 max-h-56 overflow-y-auto p-1 scrollbar-thin">
          {filteredCrops.map((crop) => {
            const isSelected = crop.id === selectedCropId;
            const isUp = crop.weeklyTrendPercent >= 0;

            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => setSelectedCropId(crop.id)}
                className={`p-3 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-900/60 to-slate-900 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  {crop.category}
                </span>
                <h4 className="text-xs font-black text-white truncate mt-0.5">{crop.name.split(' ')[0]}</h4>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-black text-emerald-300">₹{crop.todayPrice}</span>
                  <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? '+' : ''}{crop.weeklyTrendPercent}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE CROP DETAILED ANALYTICS DASHBOARD */}
      <div className="space-y-6">
        {/* TOP STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Today's Price */}
          <Card variant="glass" className="p-4 border-emerald-500/30 bg-emerald-950/20 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Today Mandi Price</span>
            <div className="text-xl sm:text-2xl font-black text-white">
              ₹{selectedCrop.todayPrice.toLocaleString()}
              <span className="text-xs font-normal text-slate-400"> / {selectedCrop.unit}</span>
            </div>
            <span className={`text-[11px] font-bold flex items-center gap-0.5 ${selectedCrop.weeklyTrendPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <Icon name={selectedCrop.weeklyTrendPercent >= 0 ? 'arrow_upward' : 'arrow_downward'} size={12} />
              {selectedCrop.weeklyTrendPercent >= 0 ? '+' : ''}{selectedCrop.weeklyTrendPercent}% vs Prev Week
            </span>
          </Card>

          {/* Yesterday's Price */}
          <Card variant="glass" className="p-4 border-slate-800 bg-slate-950/40 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Yesterday Price</span>
            <div className="text-xl sm:text-2xl font-black text-slate-200">
              ₹{selectedCrop.yesterdayPrice.toLocaleString()}
            </div>
            <span className="text-[11px] font-medium text-slate-400">Baseline Rate</span>
          </Card>

          {/* Range: High / Low / Avg */}
          <Card variant="glass" className="p-4 border-slate-800 bg-slate-950/40 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Season Range</span>
            <div className="text-xs font-bold text-white space-y-0.5">
              <div className="flex justify-between"><span className="text-emerald-400">High:</span> ₹{selectedCrop.highestPrice}</div>
              <div className="flex justify-between"><span className="text-rose-400">Low:</span> ₹{selectedCrop.lowestPrice}</div>
              <div className="flex justify-between"><span className="text-slate-400">Avg:</span> ₹{selectedCrop.averagePrice}</div>
            </div>
          </Card>

          {/* 7-Day Forecast */}
          <Card variant="glass" className="p-4 border-teal-500/30 bg-teal-950/20 space-y-1">
            <span className="text-[11px] font-semibold text-teal-300 block">7-Day AI Forecast</span>
            <div className="text-xl sm:text-2xl font-black text-teal-300">
              ₹{selectedCrop.forecastPrice7Days.toLocaleString()}
            </div>
            <span className="text-[11px] text-teal-200/80 font-medium">Confidence: {selectedCrop.confidencePercent}%</span>
          </Card>

          {/* 30-Day Forecast */}
          <Card variant="glass" className="p-4 border-blue-500/30 bg-blue-950/20 space-y-1">
            <span className="text-[11px] font-semibold text-blue-300 block">30-Day AI Forecast</span>
            <div className="text-xl sm:text-2xl font-black text-blue-300">
              ₹{selectedCrop.forecastPrice30Days.toLocaleString()}
            </div>
            <span className="text-[11px] text-blue-200/80 font-medium">Monthly Trend</span>
          </Card>

          {/* Risk Level */}
          <Card variant="glass" className="p-4 border-slate-800 bg-slate-950/40 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Market Volatility</span>
            <div className="text-base font-extrabold text-white">
              {selectedCrop.riskLevel} Risk
            </div>
            <span className="text-[11px] text-slate-400">Demand: {selectedCrop.demandLevel}</span>
          </Card>
        </div>

        {/* AI ACTION RECOMMENDATION BANNER */}
        <Card variant="glass" className="p-6 border-emerald-500/40 bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl border ${recConfig.bg}`}>
                <Icon name={recConfig.icon} size={28} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Selling Strategy</span>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  {recConfig.label}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Best Market</span>
                <span className="font-bold text-emerald-300">{selectedCrop.bestMarket}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Expected Profit</span>
                <span className="font-bold text-amber-300">{selectedCrop.expectedProfit}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Icon name="trending_up" size={14} /> Demand Forecast:
              </span>
              <p className="text-slate-300">{selectedCrop.demandForecast}</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-teal-400 flex items-center gap-1">
                <Icon name="inventory_2" size={14} /> Supply & Arrival Forecast:
              </span>
              <p className="text-slate-300">{selectedCrop.supplyForecast}</p>
            </div>
          </div>
        </Card>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Price Trend & AI Forecast Chart */}
          <Card variant="glass" className="lg:col-span-8 p-6 space-y-4 border-emerald-500/20 bg-slate-950/40">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Icon name="show_chart" size={20} className="text-emerald-400" />
                  Price Trend & Predictive Machine Learning Graph
                </h3>
                <p className="text-xs text-slate-400">{selectedCrop.name} • Dashed line indicates AI projection</p>
              </div>

              {/* Horizon Toggle */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setForecastHorizon('7days')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    forecastHorizon === '7days' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7-Day
                </button>
                <button
                  type="button"
                  onClick={() => setForecastHorizon('30days')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    forecastHorizon === '30days' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30-Day
                </button>
              </div>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                    name="Actual Mandi Price (₹)"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={0}
                    name="AI Forecast Price (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Nearby Mandi Comparison Bar Chart */}
          <Card variant="glass" className="lg:col-span-4 p-6 space-y-4 border-emerald-500/20 bg-slate-950/40">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Icon name="store" size={20} className="text-teal-400" />
              Nearby APMC Mandi Comparison
            </h3>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedCrop.nearbyMarkets} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                  <YAxis dataKey="mandi" type="category" stroke="#94a3b8" fontSize={9} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#14b8a6', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="price" fill="#14b8a6" radius={[0, 8, 8, 0]} name="Price (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {selectedCrop.nearbyMarkets.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-white truncate max-w-[150px]">{m.mandi}</span>
                  <span className="font-bold text-teal-300">₹{m.price} ({m.distance})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* REGIONAL BREAKDOWN TABLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* State-wise Prices */}
          <Card variant="glass" className="p-6 space-y-4 border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Icon name="map" size={20} className="text-emerald-400" />
                State-wise APMC Benchmark Rates
              </h3>
              <Badge variant="emerald" size="sm">National AGMARKNET</Badge>
            </div>

            <div className="divide-y divide-slate-800/80">
              {selectedCrop.statePrices.map((sp, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{sp.state}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-white">₹{sp.price.toLocaleString()} / {selectedCrop.unit}</span>
                    <span
                      className={`font-bold flex items-center gap-0.5 ${
                        sp.trend === 'up' ? 'text-emerald-400' : sp.trend === 'down' ? 'text-rose-400' : 'text-blue-400'
                      }`}
                    >
                      <Icon
                        name={sp.trend === 'up' ? 'north_east' : sp.trend === 'down' ? 'south_east' : 'east'}
                        size={14}
                      />
                      {sp.trend.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* District-wise Arrivals & Prices */}
          <Card variant="glass" className="p-6 space-y-4 border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Icon name="location_city" size={20} className="text-teal-400" />
                District Arrival & Price Volume
              </h3>
              <Badge variant="teal" size="sm">Mandi Inward Logs</Badge>
            </div>

            <div className="divide-y divide-slate-800/80">
              {selectedCrop.districtPrices.map((dp, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{dp.district} District</span>
                    <span className="text-[10px] text-slate-400">Inward Arrival: {dp.arrivalTons} Tons</span>
                  </div>
                  <span className="font-extrabold text-teal-300">₹{dp.price.toLocaleString()} / {selectedCrop.unit}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
