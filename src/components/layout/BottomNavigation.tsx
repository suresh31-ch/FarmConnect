/**
 * FarmConnect Bottom Navigation Bar (Mobile / Tablet)
 * Contains 5 primary destinations: Home, Marketplace, AI Assistant, Orders, Profile.
 */

import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../common/Icon';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveTab } from '../../types';

export const BottomNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useAppState();
  const { t } = useLanguage();

  const navItems: Array<{ id: ActiveTab; labelKey: string; icon: string; activeIcon: string }> = [
    { id: 'home', labelKey: 'home', icon: 'home', activeIcon: 'home' },
    { id: 'marketplace', labelKey: 'marketplace', icon: 'storefront', activeIcon: 'storefront' },
    { id: 'ai_assistant', labelKey: 'aiAssistant', icon: 'psychology', activeIcon: 'psychology' },
    { id: 'orders', labelKey: 'orders', icon: 'shopping_bag', activeIcon: 'shopping_bag' },
    { id: 'profile', labelKey: 'profile', icon: 'person', activeIcon: 'person' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto rounded-[28px] glass-card-light dark:glass-card-dark border border-emerald-200/80 dark:border-emerald-700/60 shadow-2xl p-1.5 flex items-center justify-around backdrop-blur-2xl">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl shadow-lg shadow-emerald-700/30 -z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className={`relative z-10 flex flex-col items-center gap-0.5 ${isActive ? 'text-white' : 'text-slate-600 dark:text-emerald-200/70 hover:text-emerald-700 dark:hover:text-emerald-100'}`}>
                <Icon name={item.icon} size={22} filled={isActive} />
                <span className={`text-[10px] font-bold tracking-tight line-clamp-1 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                  {t(item.labelKey)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
