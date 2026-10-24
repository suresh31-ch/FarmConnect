/**
 * FarmConnect Voice Assistant Simulation Modal
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from './Icon';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';

export const VoiceAssistantModal: React.FC = () => {
  const { voiceModalOpen, setVoiceModalOpen, setSearchOpen, setSearchQuery } = useAppState();
  const { t } = useLanguage();

  const handleVoiceCommand = (cmd: string) => {
    setVoiceModalOpen(false);
    setSearchQuery(cmd);
    setSearchOpen(true);
  };

  return (
    <AnimatePresence>
      {voiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md rounded-[32px] glass-card-light dark:glass-card-dark border border-emerald-300/80 dark:border-emerald-700/60 p-6 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Suri Voice Assistant
              </span>
              <button
                onClick={() => setVoiceModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-emerald-900/50 text-slate-500 dark:text-emerald-300"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Pulse Mic Icon */}
            <div className="relative my-8 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute w-28 h-28 rounded-full bg-emerald-500/30"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30"
              >
                <Icon name="mic" size={40} />
              </motion.div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-emerald-100">{t('listening')}</h3>
            <p className="text-xs text-slate-500 dark:text-emerald-400 mt-2 mb-6">{t('speakPrompt')}</p>

            {/* Sample Voice Prompts to test */}
            <div className="space-y-2 text-left">
              <p className="text-[11px] font-bold uppercase text-slate-400 dark:text-emerald-500/80 px-1">
                Tap to simulate voice command:
              </p>
              {[
                'Check tomato mandi prices in Guntur',
                'Find agricultural workers for harvesting',
                'Rent tractor nearby',
                'PM-KISAN scheme eligibility details'
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleVoiceCommand(prompt)}
                  className="w-full text-left px-3.5 py-2.5 rounded-2xl bg-white/70 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-800/60 text-xs font-medium text-slate-800 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-2 transition-all"
                >
                  <Icon name="graphic_eq" size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span>"{prompt}"</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
