/**
 * FarmConnect Splash Screen
 * Features animated logo, floating leaves background, taglines, and loading progress.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../components/common/Icon';
import { useAppState } from '../../context/AppStateContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const SplashScreen: React.FC = () => {
  const { setScreenState } = useAppState();
  const { isAuthenticated, role } = useAuth();
  const { t } = useLanguage();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      if (isAuthenticated) {
        if (!role) {
          setScreenState('role_selection');
        } else {
          setScreenState('app_shell');
        }
      } else {
        setScreenState('login');
      }
    }
  }, [progress, isAuthenticated, role, setScreenState]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white overflow-hidden selection:bg-emerald-500">
      {/* Floating Leaves Motion Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: -50,
              x: Math.random() * window.innerWidth,
              rotate: 0,
              opacity: 0.1 + Math.random() * 0.4,
            }}
            animate={{
              y: window.innerHeight + 100,
              x: `calc(${Math.random() * window.innerWidth}px + ${(i % 2 === 0 ? 50 : -50)}px)`,
              rotate: 360,
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5,
            }}
            className="absolute text-emerald-400/40"
          >
            <Icon name={i % 2 === 0 ? 'eco' : 'grass'} size={24 + (i % 3) * 12} />
          </motion.div>
        ))}
      </div>

      <div className="pt-4" />

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center max-w-md z-10 space-y-6">
        {/* Animated Logo Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative"
        >
          <div className="w-28 h-28 rounded-[36px] bg-gradient-to-tr from-emerald-600 via-green-500 to-amber-400 p-1 shadow-2xl shadow-emerald-500/40">
            <div className="w-full h-full rounded-[34px] bg-emerald-950/90 backdrop-blur-xl flex items-center justify-center text-emerald-400 border border-white/20">
              <Icon name="agriculture" size={60} />
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-2 -right-2 w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg"
          >
            <Icon name="psychology" size={24} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-2"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
            {t('appName')}
          </h1>
          <p className="text-sm sm:text-base font-semibold text-emerald-300">
            {t('appTagline')}
          </p>
          <p className="text-xs text-emerald-200/70 tracking-wide font-medium max-w-xs mx-auto">
            {t('appSubTagline')}
          </p>
        </motion.div>
      </div>

      {/* Bottom Loading Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-xs z-10 pb-8 space-y-3 text-center"
      >
        <div className="flex justify-between text-xs font-bold text-emerald-300">
          <span>Initializing Ecosystem...</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-emerald-900/80 p-0.5 border border-emerald-700/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-amber-400"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[11px] text-emerald-400/60 font-medium">
          Farmer Direct • AI Diagnostics • Zero Middlemen
        </p>
      </motion.div>
    </div>
  );
};
