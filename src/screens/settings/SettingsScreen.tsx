/**
 * System Settings & Kisan Helpline Support Screen
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppState } from '../../context/AppStateContext';

export const SettingsScreen: React.FC = () => {
  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { setScreenState } = useAppState();

  const [biometricLock, setBiometricLock] = useState(true);
  const [offlineCache, setOfflineCache] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;
    setFeedbackSuccess(true);
    setTimeout(() => {
      setFeedbackText('');
      setFeedbackSuccess(false);
      setShowFeedbackModal(false);
    }, 2000);
  };

  const handleLogout = () => {
    logout();
    setScreenState('login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-emerald-100 flex items-center gap-2">
          <Icon name="settings" size={28} className="text-emerald-600 dark:text-emerald-400" />
          System Settings & Support
        </h1>
        <p className="text-xs text-slate-500 dark:text-emerald-400 mt-0.5">
          Configure multi-language preferences, biometric security, dark mode, and Kisan helpline
        </p>
      </div>

      {/* Section 1: Language & Theme */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
          <Icon name="language" size={20} className="text-emerald-600" />
          Language & Display Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-2">
              App Language Context
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'te', label: 'తెలుగు' },
                { code: 'hi', label: 'हिंदी' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    language === lang.code
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white dark:bg-emerald-950/40 text-slate-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-2">
              Color Theme Mode
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/30">
              <span className="text-xs font-semibold text-slate-800 dark:text-emerald-200 flex items-center gap-2">
                <Icon name={isDarkMode ? 'dark_mode' : 'light_mode'} size={18} />
                Dark Mode Canvas
              </span>
              <input
                type="checkbox"
                checked={isDarkMode}
                onChange={toggleDarkMode}
                className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Section 2: Security & Storage */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
          <Icon name="security" size={20} className="text-emerald-600" />
          Security & Offline Storage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between bg-white dark:bg-emerald-950/40">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-emerald-100">Biometric Lock (Fingerprint/FaceID)</p>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400">Require PIN/Fingerprint on app open</p>
            </div>
            <input
              type="checkbox"
              checked={biometricLock}
              onChange={e => setBiometricLock(e.target.checked)}
              className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between bg-white dark:bg-emerald-950/40">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-emerald-100">Offline PWA Cache</p>
              <p className="text-[11px] text-slate-500 dark:text-emerald-400">Cache market prices for offline rural use</p>
            </div>
            <input
              type="checkbox"
              checked={offlineCache}
              onChange={e => setOfflineCache(e.target.value)}
              className="w-5 h-5 rounded accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Section 3: Toll-Free Helpline & Support */}
      <Card className="p-6 space-y-4 bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white border-emerald-800">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="gold">24x7 Toll-Free Support</Badge>
            <h3 className="text-lg font-extrabold text-white mt-1">National Kisan Call Center</h3>
            <p className="text-xs text-emerald-200/80">Connect directly with agricultural scientists & government advisors</p>
          </div>
          <Icon name="support_agent" size={36} className="text-amber-400" />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="tel:18001801551"
            className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 hover:bg-amber-400"
          >
            <Icon name="call" size={16} />
            Call 1800-180-1551 (Toll Free)
          </a>
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-800/80 text-emerald-100 font-bold text-xs flex items-center gap-2 border border-emerald-600 hover:bg-emerald-700"
          >
            <Icon name="feedback" size={16} />
            Submit App Feedback
          </button>
        </div>
      </Card>

      {/* Section 4: About & Version */}
      <Card className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-emerald-100">
              FarmConnect Ecosystem
            </h4>
            <p className="text-xs text-slate-500 dark:text-emerald-400">
              FarmConnect Smart Agriculture Ecosystem • Production Build v2.8.0
            </p>
          </div>
          <Badge variant="emerald">Production Ready</Badge>
        </div>

        <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between">
          <span className="text-xs text-slate-500">Terms of Service • Privacy Policy</span>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-rose-600 border-rose-300">
            <Icon name="logout" size={16} />
            Log Out
          </Button>
        </div>
      </Card>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-emerald-100">
                  Submit Feedback / Issue
                </h3>
                <button onClick={() => setShowFeedbackModal(false)} className="text-slate-400">
                  <Icon name="close" size={24} />
                </button>
              </div>

              <form onSubmit={handleSendFeedback} className="space-y-4">
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Describe your issue or suggestion for FarmConnect..."
                  className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950 text-xs font-medium text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />

                <Button type="submit" variant="primary" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700">
                  Submit Feedback
                </Button>

                {feedbackSuccess && (
                  <p className="text-xs font-bold text-emerald-500 text-center flex items-center justify-center gap-1">
                    <Icon name="check_circle" size={16} />
                    Thank you! Feedback received.
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
