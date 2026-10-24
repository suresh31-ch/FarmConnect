/**
 * FarmConnect Role Selection Screen - Supabase Saved Roles
 * Presents the 6 primary ecosystem roles: Farmer, Consumer, Delivery Partner, Agricultural Worker, Equipment Owner, Livestock Seller.
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole, RoleInfo, ActiveTab } from '../../types';

export const rolesList: RoleInfo[] = [
  {
    id: 'farmer',
    title: 'Farmer',
    titleTe: 'రైతు',
    titleHi: 'किसान',
    subtitle: 'Grow, manage & sell direct to buyers',
    description: 'Sell crops directly without middlemen, access AI disease diagnosis, real-time mandi prices, weather forecasts & govt scheme subsidies.',
    badge: 'Producer',
    color: 'emerald',
    bgGradient: 'from-emerald-800 via-emerald-700 to-green-800',
    icon: 'agriculture',
    benefits: ['Zero Middlemen Commission', 'AI Leaf Disease Scanner', 'Live Mandi Price Tracker', 'Direct Govt Subsidies'],
  },
  {
    id: 'consumer',
    title: 'Consumer',
    titleTe: 'వినియోగదారుడు',
    titleHi: 'उपभोक्ता',
    subtitle: 'Buy fresh organic farm produce',
    description: 'Purchase fresh, chemical-free farm produce direct from local verified farmers at fair prices with transparent farm-to-door tracking.',
    badge: 'Direct Buyer',
    color: 'amber',
    bgGradient: 'from-amber-700 via-orange-600 to-yellow-700',
    icon: 'shopping_basket',
    benefits: ['100% Traceable Farm Fresh', 'Fair Direct Farmer Pricing', 'Scheduled Doorstep Delivery', 'Quality Certifications'],
  },
  {
    id: 'delivery',
    title: 'Delivery Partner',
    titleTe: 'డెలివరీ పార్ట్‌నర్',
    titleHi: 'डिलीवरी पार्टनर',
    subtitle: 'Logistics & farm-to-door transit',
    description: 'Pick up fresh produce from rural farms and deliver directly to urban consumers or wholesale hubs with AI route optimization.',
    badge: 'Logistics',
    color: 'rose',
    bgGradient: 'from-rose-800 via-pink-700 to-red-800',
    icon: 'local_shipping',
    benefits: ['Flexible Transit Hours', 'AI Route Optimization', 'Instant Delivery Payouts', 'Bulk Load Bonuses'],
  },
  {
    id: 'worker',
    title: 'Agricultural Worker',
    titleTe: 'వ్యవసాయ కార్మికుడు',
    titleHi: 'कृषि श्रमिक',
    subtitle: 'Find farm labor & seasonal contracts',
    description: 'Connect with farm owners for daily wage labor, harvesting jobs, tractor operations, and seasonal agricultural contract work.',
    badge: 'Work & Earn',
    color: 'blue',
    bgGradient: 'from-blue-800 via-indigo-700 to-sky-800',
    icon: 'engineering',
    benefits: ['Guaranteed Daily Wage Jobs', 'Direct SMS / App Job Alerts', 'Fair Wage Protection', 'Nearby Farm Contracts'],
  },
  {
    id: 'equipment_owner',
    title: 'Equipment Owner',
    titleTe: 'పరికరాల యజమాని',
    titleHi: 'उपकरण मालिक',
    subtitle: 'Rent tractors, harvesters & machinery',
    description: 'List your tractor, harvester, drone sprayer, or tiller for rental to nearby farmers and earn steady passive income.',
    badge: 'Machinery',
    color: 'amber',
    bgGradient: 'from-amber-800 via-yellow-700 to-amber-900',
    icon: 'precision_manufacturing',
    benefits: ['Hourly & Daily Rental Income', 'GPS Asset Tracking', 'Automated Maintenance Alerts', 'Verified Farmer Renters'],
  },
  {
    id: 'livestock_seller',
    title: 'Livestock Seller',
    titleTe: 'పశువుల విక్రేత',
    titleHi: 'पशुधन विक्रेता',
    subtitle: 'Trade cattle, dairy cows, poultry & livestock',
    description: 'List verified cattle, dairy cows, goats, poultry, and breeding stock with medical certificates for direct sale to farmers.',
    badge: 'Livestock',
    color: 'emerald',
    bgGradient: 'from-teal-800 via-emerald-800 to-green-900',
    icon: 'pets',
    benefits: ['Direct Cattle Trade', 'Verified Vet Health Certificates', 'Milk Yield Statistics', 'Fair Market Valuation'],
  },
];

export const RoleSelectionScreen: React.FC = () => {
  const { selectRole, role: currentRole } = useAuth();
  const { setScreenState, setActiveTab } = useAppState();
  const { language, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleTabMapping: Record<UserRole, ActiveTab> = {
    farmer: 'farmer_dashboard',
    consumer: 'consumer_dashboard',
    delivery: 'delivery_dashboard',
    worker: 'worker_dashboard',
    equipment_owner: 'equipment_marketplace',
    livestock_seller: 'livestock_marketplace',
    admin: 'admin_dashboard',
  };

  const handleChooseRole = async (selectedRole: UserRole) => {
    setIsSubmitting(true);
    await selectRole(selectedRole);
    setIsSubmitting(false);

    setScreenState('app_shell');
    const targetTab = roleTabMapping[selectedRole] || 'home';
    setActiveTab(targetTab);
  };

  const getRoleTitle = (r: RoleInfo) => {
    if (language === 'te') return r.titleTe;
    if (language === 'hi') return r.titleHi;
    return r.title;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10 py-6">
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <Badge variant="amber" size="md" icon="verified">
            FarmConnect Account Setup
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t('selectRoleTitle')}
          </h1>
          <p className="text-sm text-emerald-300/80">
            {t('selectRoleSubtitle')}
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rolesList.map(r => {
            const isSelected = currentRole === r.id;
            return (
              <motion.div
                key={r.id}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !isSubmitting && handleChooseRole(r.id)}
                className={`rounded-[28px] p-6 cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col justify-between border ${
                  isSelected
                    ? 'ring-4 ring-amber-400 border-amber-400 bg-emerald-950/90 shadow-2xl shadow-emerald-500/20'
                    : 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-700/50 shadow-xl'
                }`}
              >
                {/* Header Banner */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg">
                      <Icon name={r.icon} size={32} />
                    </div>
                    <Badge variant={isSelected ? 'amber' : 'emerald'} size="sm">
                      {r.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {getRoleTitle(r)}
                    </h3>
                    <p className="text-xs font-semibold text-amber-400 mt-0.5">{r.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {r.description}
                  </p>

                  {/* Bullet Benefits */}
                  <div className="pt-2 border-t border-emerald-800/60 space-y-1.5">
                    {r.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] text-emerald-200">
                        <Icon name="check_circle" size={14} className="text-emerald-400 shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selection Action Button */}
                <div className="mt-6 pt-3">
                  <Button
                    variant={isSelected ? 'accent' : 'primary'}
                    size="md"
                    fullWidth
                    isLoading={isSubmitting && isSelected}
                    rightIcon="arrow_forward"
                  >
                    {t('continueAsRole')} {r.title}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
