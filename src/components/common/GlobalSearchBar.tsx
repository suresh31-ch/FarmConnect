/**
 * FarmConnect Global Search Bar Overlay & Modal
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { Badge } from './Badge';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveTab } from '../../types';

export const GlobalSearchBar: React.FC = () => {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, searchResults, setActiveTab, setScreenState } = useAppState();
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const handleSelectResult = (path: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    setScreenState('app_shell');
    setActiveTab(path as ActiveTab);
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl rounded-[28px] glass-card-light dark:glass-card-dark border border-emerald-200/80 dark:border-emerald-700/60 shadow-2xl overflow-hidden"
          >
            {/* Input Bar */}
            <div className="p-4 flex items-center gap-3 border-b border-emerald-100 dark:border-emerald-800/50 bg-white/50 dark:bg-emerald-950/50">
              <Icon name="search" size={24} className="text-emerald-600 dark:text-emerald-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-transparent text-base font-medium text-slate-900 dark:text-emerald-100 placeholder-slate-400 dark:placeholder-emerald-500/70 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-emerald-200"
                >
                  <Icon name="cancel" size={20} />
                </button>
              )}
              <button
                onClick={() => setSearchOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-200/70 dark:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 hover:bg-slate-300 dark:hover:bg-emerald-800"
              >
                ESC
              </button>
            </div>

            {/* Quick Filter Tags */}
            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-emerald-100/50 dark:border-emerald-800/30">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-2">Filter:</span>
              {['All', 'Crop', 'Worker', 'Equipment', 'Scheme', 'Livestock'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSearchQuery(cat === 'All' ? '' : cat)}
                  className="px-3 py-1 text-xs rounded-xl font-medium whitespace-nowrap bg-white/80 dark:bg-emerald-900/40 text-slate-700 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-800/60 border border-emerald-200/50 dark:border-emerald-800/40"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto p-3 divide-y divide-emerald-100/50 dark:divide-emerald-800/30">
              {searchResults.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-emerald-400/60 text-sm">
                  <Icon name="search_off" size={40} className="mx-auto mb-2 opacity-50" />
                  <p>No results found for "{searchQuery}"</p>
                </div>
              ) : (
                searchResults.map(result => (
                  <div
                    key={result.id}
                    onClick={() => handleSelectResult(result.path)}
                    className="p-3 rounded-2xl transition-all cursor-pointer hover:bg-emerald-100/60 dark:hover:bg-emerald-900/60 flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="emerald" size="sm">{result.category}</Badge>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-emerald-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                          {result.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-emerald-300/80">{result.description}</p>
                    </div>
                    <Icon name="chevron_right" size={20} className="text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
