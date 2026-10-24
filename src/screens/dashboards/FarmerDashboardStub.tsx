/**
 * FarmConnect Farmer Dashboard Stub (Part 1 Foundation)
 * Will be populated with full AI Disease scanner, crop listings & mandi analytics in Part 2+
 */

import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';

export const FarmerDashboardStub: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab } = useAppState();

  return (
    <div className="space-y-6">
      {/* Welcome Hero Card */}
      <Card variant="gradient" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="amber" size="sm" icon="eco">Farmer Portal • Active Session</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Namaste, {user?.name || 'Farmer'}! 🌾
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Welcome to your FarmConnect AI dashboard. Manage your crops, sell directly to consumers, scan plant diseases, and track daily mandi prices.
            </p>
          </div>
          <Button
            variant="accent"
            size="lg"
            leftIcon="add_a_photo"
            onClick={() => setActiveTab('ai_assistant')}
          >
            AI Disease Scan
          </Button>
        </div>
      </Card>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Crop Listings', value: '4 Crops', icon: 'inventory_2', change: '+2 this week', color: 'emerald' },
          { label: 'Direct Orders Recd.', value: '18 Orders', icon: 'shopping_cart', change: '₹24,500 Earned', color: 'amber' },
          { label: 'Tomato Mandi Rate', value: '₹38 / kg', icon: 'trending_up', change: '+18% Guntur', color: 'blue' },
          { label: 'Workers Booked', value: '6 Workers', icon: 'groups', change: 'Jul 26 Harvest', color: 'rose' },
        ].map((m, idx) => (
          <Card key={idx} variant="glass" className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300">{m.label}</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Icon name={m.icon} size={20} />
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{m.value}</div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{m.change}</div>
          </Card>
        ))}
      </div>

      {/* Feature Navigation Shortcuts */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-emerald-400">
          Core Farmer Tools (Part 1 Foundation Ready)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Sell Direct Farm Produce', desc: 'List fresh harvest for direct consumer purchase without middleman cuts.', icon: 'storefront', tab: 'marketplace' },
            { title: 'Hire Farm Workers', desc: 'Find local daily wage laborers & seasonal harvest contract teams.', icon: 'groups', tab: 'worker_marketplace' },
            { title: 'Rent Tractor & Implements', desc: 'Book heavy equipment hourly/daily from nearby machinery owners.', icon: 'precision_manufacturing', tab: 'equipment_marketplace' },
            { title: 'AI Krishi Mitra', desc: 'Get instant pest diagnosis, crop guidance & localized weather advice.', icon: 'psychology', tab: 'ai_assistant' },
            { title: 'Government Subsidies', desc: 'Apply for PM-KISAN, drip irrigation & seed subsidy schemes.', icon: 'account_balance', tab: 'govt_schemes' },
            { title: 'Livestock Trading', desc: 'Buy and sell certified breeds, cattle, and poultry safely.', icon: 'pets', tab: 'livestock_marketplace' },
          ].map((tool, idx) => (
            <Card
              key={idx}
              variant="glass"
              interactive
              onClick={() => setActiveTab(tool.tab as any)}
              className="space-y-2"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-md">
                <Icon name={tool.icon} size={22} />
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-emerald-100">{tool.title}</h4>
              <p className="text-xs text-slate-600 dark:text-emerald-300/80 leading-relaxed">{tool.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
