/**
 * FarmConnect Consumer Dashboard Stub
 */

import React from 'react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';

export const ConsumerDashboardStub: React.FC = () => {
  const { user } = useAuth();
  const { setActiveTab } = useAppState();

  return (
    <div className="space-y-6">
      <Card variant="gradient" className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="amber" size="sm" icon="shopping_basket">Consumer Portal</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name || 'Buyer'}! 🥗
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
              Buy 100% organic, farm-fresh produce direct from verified local farmers with farm-to-door delivery tracking.
            </p>
          </div>
          <Button variant="accent" size="lg" leftIcon="storefront" onClick={() => setActiveTab('marketplace')}>
            Browse Farm Produce
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Saved Farmers', value: '12 Verified', icon: 'verified', change: 'Near Guntur' },
          { label: 'Active Orders', value: '2 Orders', icon: 'local_shipping', change: 'Arriving Today' },
          { label: 'Saved Money', value: '₹1,240', icon: 'savings', change: 'VS Retail Stores' },
          { label: 'Organic Rating', value: '4.9 ★', icon: 'star', change: 'Freshness Guaranteed' },
        ].map((m, idx) => (
          <Card key={idx} variant="glass" className="space-y-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-emerald-300">{m.label}</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                <Icon name={m.icon} size={20} />
              </div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{m.value}</div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{m.change}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};
