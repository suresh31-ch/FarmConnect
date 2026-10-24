/**
 * AI Analytics & Farm Productivity Dashboard
 * High-level visual metrics dashboard featuring recharts, risk gauges,
 * profit estimates, crop health scores, and AI recommendations.
 */

import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const productivityTrendData = [
  { month: 'Jan', yieldIndex: 62, profit: 120000 },
  { month: 'Feb', yieldIndex: 68, profit: 145000 },
  { month: 'Mar', yieldIndex: 75, profit: 180000 },
  { month: 'Apr', yieldIndex: 82, profit: 210000 },
  { month: 'May', yieldIndex: 88, profit: 235000 },
  { month: 'Jun', yieldIndex: 94, profit: 245000 }
];

const cropHealthBreakdown = [
  { name: 'Optimal Health', value: 75, color: '#10b981' },
  { name: 'Minor Nutrient Def', value: 18, color: '#f59e0b' },
  { name: 'Disease Susceptible', value: 7, color: '#f43f5e' }
];

export const AiAnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-green-950 text-white shadow-2xl border border-emerald-500/30">
        <div className="space-y-1">
          <Badge variant="emerald" size="md" icon="analytics">
            Farm Intelligence Analytics v2.8
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Analytics & Farm Health Scorecard
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80">
            Real-time biometric analytics, expected profit forecasts, and multi-factor risk gauges.
          </p>
        </div>
      </div>

      {/* KPI GAUGES GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Crop Health Score', score: '94 / 100', status: 'Excellent', icon: 'favorite', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20' },
          { label: 'Farm Productivity', score: '+28%', status: 'Vs Last Year', icon: 'trending_up', color: 'border-teal-500/40 text-teal-400 bg-teal-950/20' },
          { label: 'Expected Profit', score: '₹2,45,000', status: 'Next 60 Days', icon: 'payments', color: 'border-amber-500/40 text-amber-300 bg-amber-950/20' },
          { label: 'Disease Risk', score: 'Low Risk', status: '3% Probability', icon: 'verified_user', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20' },
          { label: 'Weather Risk', score: 'Moderate', status: 'Rain on Friday', icon: 'thunderstorm', color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
          { label: 'Market Opportunity', score: '88 / 100', status: 'Strong Demand', icon: 'storefront', color: 'border-teal-500/40 text-teal-300 bg-teal-950/20' },
        ].map((kpi, idx) => (
          <Card key={idx} variant="glass" className={`p-4 space-y-2 border ${kpi.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">{kpi.label}</span>
              <Icon name={kpi.icon} size={18} />
            </div>
            <div className="text-xl font-black text-white">{kpi.score}</div>
            <span className="text-[10px] font-bold text-slate-300 block">{kpi.status}</span>
          </Card>
        ))}
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Productivity & Profit Trend Chart */}
        <Card variant="glass" className="lg:col-span-8 p-6 space-y-4 border-emerald-500/20 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Icon name="show_chart" size={20} className="text-emerald-400" />
                6-Month Productivity & Net Earnings Growth
              </h3>
              <p className="text-xs text-slate-400">Integrated yield telemetry and direct sale income</p>
            </div>
            <Badge variant="emerald" size="sm">+28% YoY Growth</Badge>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={productivityTrendData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="Net Profit (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Crop Health Distribution Pie Chart */}
        <Card variant="glass" className="lg:col-span-4 p-6 space-y-4 border-emerald-500/20 bg-slate-950/40">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Icon name="pie_chart" size={20} className="text-teal-400" />
            Field Biomarker Health Index
          </h3>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropHealthBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cropHealthBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#14b8a6', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {cropHealthBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-white">{item.name}</span>
                </div>
                <span className="font-bold text-emerald-300">{item.value}% Land Area</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
