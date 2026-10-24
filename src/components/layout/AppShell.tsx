/**
 * FarmConnect Reusable App Shell Layout
 * Wraps Header, Drawer, Bottom Nav, Search, Voice Modal, and Page Transition Container.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TopHeaderBar } from './TopHeaderBar';
import { NavigationDrawer } from './NavigationDrawer';
import { BottomNavigation } from './BottomNavigation';
import { GlobalSearchBar } from '../common/GlobalSearchBar';
import { VoiceAssistantModal } from '../common/VoiceAssistantModal';
import { FloatingVoiceAssistant } from '../common/FloatingVoiceAssistant';

interface AppShellProps {
  children: React.ReactNode;
  activeKey?: string;
  hideBottomNav?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeKey = 'default',
  hideBottomNav = false,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1910] text-slate-900 dark:text-emerald-50 transition-colors">
      {/* Top Header */}
      <TopHeaderBar />

      {/* Navigation Drawer */}
      <NavigationDrawer />

      {/* Global Overlays */}
      <GlobalSearchBar />
      <VoiceAssistantModal />
      <FloatingVoiceAssistant />

      {/* Main Content Area with Page Transition */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pt-4 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeKey}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
};
