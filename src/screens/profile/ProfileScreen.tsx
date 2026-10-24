/**
 * User Profile & Farm Details Screen
 * Multi-role profile management, land record linkages, language preference,
 * dark mode toggles, biometric security settings, and logout handler.
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

export const ProfileScreen: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { setScreenState } = useAppState();

  // Editable Profile Form State
  const [name, setName] = useState(user?.name || 'Ramesh Kumar');
  const [phone, setPhone] = useState(user?.phone || '9848022338');
  const [email, setEmail] = useState('ramesh.farmer@farmconnect.in');
  const [district, setDistrict] = useState('Guntur District, AP');
  const [landAcres, setLandAcres] = useState('12.5');
  const [soilType, setSoilType] = useState('Black Cotton Soil');
  const [waterSource, setWaterSource] = useState('Nagarjuna Sagar Canal + Borewell');
  const [primaryCrops, setPrimaryCrops] = useState('Tomatoes, Teja Chili, Sonamasuri Rice');
  const [surveyNumber, setSurveyNumber] = useState('142/3A & 144/2B');

  // Notification Toggles State
  const [notifSms, setNotifSms] = useState(true);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifWeather, setNotifWeather] = useState(true);
  const [notifMarketPrice, setNotifMarketPrice] = useState(true);

  // Security Toggles State
  const [biometricLock, setBiometricLock] = useState(true);
  const [largeFont, setLargeFont] = useState(false);

  // Saved Toast State
  const [savedToast, setSavedToast] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleConfirmLogout = () => {
    logout();
    setScreenState('login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Profile Header Card */}
      <Card className="p-6 relative overflow-hidden bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white border-emerald-800">
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <div className="relative">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-emerald-400 shadow-xl"
            />
            <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg">
              <Icon name="photo_camera" size={16} />
            </button>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white">{name}</h2>
              <Badge variant="gold" size="sm">
                <Icon name="verified" size={14} className="mr-1" />
                Verified {role.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-emerald-300 font-mono">+91 {phone} • {email}</p>
            <p className="text-xs text-emerald-200/80 flex items-center justify-center sm:justify-start gap-1">
              <Icon name="location_on" size={14} className="text-amber-400" />
              {district}
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Save Success Toast */}
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-center text-sm shadow-xl flex items-center justify-center gap-2"
          >
            <Icon name="check_circle" size={20} />
            Profile and Farm Details updated successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Section 1: Personal Details */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
            <Icon name="person" size={20} className="text-emerald-600 dark:text-emerald-400" />
            Personal & Contact Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                District / Location
              </label>
              <input
                type="text"
                value={district}
                onChange={e => setDistrict(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Farm Details (For Farmers) */}
        {role === 'farmer' && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
                <Icon name="agriculture" size={20} className="text-emerald-600 dark:text-emerald-400" />
                Agricultural Land & Crop Details
              </h3>
              <Badge variant="emerald">Land Records Linked</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                  Total Land Area (Acres)
                </label>
                <input
                  type="text"
                  value={landAcres}
                  onChange={e => setLandAcres(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                  Soil Type
                </label>
                <input
                  type="text"
                  value={soilType}
                  onChange={e => setSoilType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                  Water Irrigation Source
                </label>
                <input
                  type="text"
                  value={waterSource}
                  onChange={e => setWaterSource(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                  Primary Crops Cultivated
                </label>
                <input
                  type="text"
                  value={primaryCrops}
                  onChange={e => setPrimaryCrops(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-1">
                  Pattadar Passbook / Survey Numbers
                </label>
                <input
                  type="text"
                  value={surveyNumber}
                  onChange={e => setSurveyNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Section 3: App Language & Theme Preferences */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
            <Icon name="translate" size={20} className="text-emerald-600 dark:text-emerald-400" />
            Language & Visual Appearance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-emerald-300 mb-2">
                Select App Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'te', label: 'తెలుగు' },
                  { code: 'hi', label: 'हिंदी' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
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
                Theme & Display
              </label>
              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/30">
                <span className="text-xs font-semibold text-slate-800 dark:text-emerald-200 flex items-center gap-2">
                  <Icon name={isDarkMode ? 'dark_mode' : 'light_mode'} size={18} />
                  Dark Mode Theme
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

        {/* Section 4: Push & SMS Notification Controls */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-emerald-100 flex items-center gap-2">
            <Icon name="notifications" size={20} className="text-emerald-600 dark:text-emerald-400" />
            Alerts & Push Notifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'SMS Alerts', state: notifSms, setter: setNotifSms, desc: 'Receive OTPs and critical price alerts via SMS' },
              { label: 'WhatsApp Updates', state: notifWhatsapp, setter: setNotifWhatsapp, desc: 'Receive order receipts and scheme alerts on WhatsApp' },
              { label: 'Weather Advisories', state: notifWeather, setter: setNotifWeather, desc: 'Rainfall warnings & pest outbreak forecast' },
              { label: 'Market Price Spikes', state: notifMarketPrice, setter: setNotifMarketPrice, desc: 'Daily APMC mandi price changes for your crops' }
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 flex items-start justify-between gap-3 bg-white dark:bg-emerald-950/40">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-emerald-100">{item.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-400">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={e => item.setter(e.target.checked)}
                  className="w-5 h-5 rounded accent-emerald-600 cursor-pointer mt-0.5"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowLogoutModal(true)}
            className="text-rose-600 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <Icon name="logout" size={18} />
            Logout Account
          </Button>

          <Button type="submit" variant="primary" size="lg" className="px-8 bg-emerald-600 hover:bg-emerald-700">
            <Icon name="save" size={20} />
            Save Profile
          </Button>
        </div>
      </form>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <Icon name="warning" size={32} />
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-emerald-100">
                  Confirm Logout
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-emerald-300">
                Are you sure you want to log out of FarmConnect? You will need your mobile phone number to log back in.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowLogoutModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirmLogout} className="bg-rose-600 hover:bg-rose-700">
                  Log Out Now
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
