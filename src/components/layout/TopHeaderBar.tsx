/**
 * FarmConnect Top Header Bar
 * Includes Logo, Search, Notifications, Language, Dark Mode, Font Size & Drawer Toggle.
 */

import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../common/Icon';
import { NotificationBell } from '../common/NotificationBell';
import { useAppState } from '../../context/AppStateContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../types';

export const TopHeaderBar: React.FC = () => {
  const { toggleDrawer, setSearchOpen, setVoiceModalOpen, isVoiceAutoFillEnabled, toggleVoiceAutoFill } = useAppState();
  const { isDarkMode, toggleDarkMode, isLargeFont, toggleLargeFont } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { role } = useAuth();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-emerald-950/80 border-b border-emerald-100 dark:border-emerald-800/40 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Drawer Toggle & Brand */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDrawer}
            className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-800/60 border border-emerald-200/50 dark:border-emerald-700/40"
            aria-label="Open menu"
          >
            <Icon name="menu" size={24} />
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-green-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/20">
              <Icon name="agriculture" size={22} />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-emerald-50 leading-none">
                FarmConnect
              </h1>
              {role && (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 capitalize tracking-wide">
                  {role} Portal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Global Search Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-2xl bg-slate-100/80 dark:bg-emerald-900/40 text-slate-700 dark:text-emerald-200 hover:bg-emerald-100/60 dark:hover:bg-emerald-800/60 border border-emerald-100 dark:border-emerald-800/40"
            title={t('search')}
          >
            <Icon name="search" size={20} />
          </motion.button>

          {/* Voice Search & Voice Auto Fill Toggle Button */}
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-2xl border border-amber-200/80 dark:border-amber-800/40">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVoiceModalOpen(true)}
              className="p-1 rounded-xl text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60"
              title={t('voiceAssistant')}
            >
              <Icon name="mic" size={18} />
            </motion.button>

            <button
              type="button"
              onClick={toggleVoiceAutoFill}
              className={`px-2 py-0.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                isVoiceAutoFillEnabled
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
              }`}
              title="Toggle Voice Auto Fill mode"
            >
              Auto Fill {isVoiceAutoFillEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Notifications Bell */}
          <NotificationBell />

          {/* Font Size Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleLargeFont}
            className={`px-2 py-1.5 rounded-2xl text-xs font-bold border transition-colors ${
              isLargeFont
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-100 dark:bg-emerald-900/40 text-slate-700 dark:text-emerald-200 border-emerald-100 dark:border-emerald-800/40'
            }`}
            title="Toggle Accessibility Large Text"
          >
            A+
          </motion.button>

          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleDarkMode}
            className="p-2 rounded-2xl bg-slate-100/80 dark:bg-emerald-900/40 text-slate-700 dark:text-emerald-200 hover:bg-emerald-100/60 dark:hover:bg-emerald-800/60 border border-emerald-100 dark:border-emerald-800/40"
            title={isDarkMode ? t('lightMode') : t('darkMode')}
          >
            <Icon name={isDarkMode ? 'light_mode' : 'dark_mode'} size={20} />
          </motion.button>

          {/* Language Selector */}
          <div className="relative hidden md:block">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="appearance-none pl-3 pr-7 py-1.5 rounded-2xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-700 focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिन्दी</option>
            </select>
            <Icon name="arrow_drop_down" size={18} className="absolute right-1.5 top-2 text-emerald-700 dark:text-emerald-300 pointer-events-none" />
          </div>
        </div>
      </div>
    </header>
  );
};
