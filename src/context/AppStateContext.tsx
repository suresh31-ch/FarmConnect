/**
 * FarmConnect AppState Context
 * Manages UI Shell state: screens, tabs, drawer, modals, notifications, and global search.
 */

import React, { createContext, useContext, useState } from 'react';
import { ScreenState, ActiveTab, NotificationItem, SearchResult } from '../types';

interface AppStateContextType {
  screenState: ScreenState;
  setScreenState: (screen: ScreenState) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  toggleDrawer: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  toggleNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearAllNotifications: () => void;
  searchResults: SearchResult[];
  isVoiceAutoFillEnabled: boolean;
  setIsVoiceAutoFillEnabled: (enabled: boolean) => void;
  toggleVoiceAutoFill: () => void;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: '⚠️ Heavy Coastal Rainfall Advisory',
    message: 'Heavy rain (40-60mm) expected in Guntur & Krishna districts over the next 48 hours. Ensure crop field drainage channels are clear.',
    timestamp: '10 mins ago',
    read: false,
    type: 'weather',
    category: 'Weather',
    priority: 'high',
    actionTab: 'weather',
  },
  {
    id: 'n2',
    title: '📈 Tomato Mandi Price Surge (+18%)',
    message: 'Guntur APMC Mandi tomato modal price rose to ₹38/kg today due to reduced wholesale inflow.',
    timestamp: '1 hour ago',
    read: false,
    type: 'market',
    category: 'Market',
    priority: 'medium',
    actionTab: 'ai_assistant',
  },
  {
    id: 'n3',
    title: '💰 YSR Rythu Bharosa / PM-KISAN Credited',
    message: 'Direct benefit installment of ₹7,500 has been credited to your Aadhaar-linked Bank Account ****4892.',
    timestamp: 'Yesterday',
    read: true,
    type: 'scheme',
    category: 'Schemes',
    priority: 'high',
    actionTab: 'govt_schemes',
  },
  {
    id: 'n4',
    title: '🚚 Order #FC-ORD-98214 Out for Delivery',
    message: 'Bolero Pickup driver Venkat is en route to Vijayawada with 500kg Organic Tomatoes. ETA: 4:30 PM.',
    timestamp: '2 hours ago',
    read: true,
    type: 'order',
    category: 'Orders',
    priority: 'medium',
    actionTab: 'orders',
  },
  {
    id: 'n5',
    title: '👨‍🌾 Harvest Worker Team Confirmed',
    message: 'Subba Rao labor gang accepted your hiring request for 10 harvest workers for Friday, July 26.',
    timestamp: '3 hours ago',
    read: true,
    type: 'worker',
    category: 'Worker',
    priority: 'medium',
    actionTab: 'worker_marketplace',
  },
];

const mockSearchData: SearchResult[] = [
  { id: 's1', title: 'Organic Hybrid Tomato', category: 'Crop', description: 'Fresh farm harvest available in bulk (500kg)', path: 'marketplace' },
  { id: 's2', title: 'Cotton Harvest Workers Needed', category: 'Worker', description: 'Daily wage ₹650/day in Prakasam district', path: 'worker_marketplace' },
  { id: 's3', title: 'Mahindra 575 DI Tractor', category: 'Equipment', description: 'Available for rental @ ₹450/hour', path: 'equipment_marketplace' },
  { id: 's4', title: 'PM Krishi Sinchayee Yojana', category: 'Scheme', description: '80% subsidy on drip irrigation setup', path: 'govt_schemes' },
  { id: 's5', title: 'AI Paddy Blast Disease Scan', category: 'Page', description: 'Scan leaf with smartphone camera for immediate cure', path: 'ai_assistant' },
  { id: 's6', title: 'Ongole Breed Bull / Calf', category: 'Livestock', description: 'Healthy certified breed for sale in Ongole', path: 'livestock_marketplace' },
];

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screenState, setScreenState] = useState<ScreenState>('splash');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isVoiceAutoFillEnabled, setIsVoiceAutoFillEnabled] = useState<boolean>(true);

  const toggleVoiceAutoFill = () => setIsVoiceAutoFillEnabled(prev => !prev);

  const toggleDrawer = () => setDrawerOpen(prev => !prev);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const searchResults = searchQuery.trim() === '' 
    ? mockSearchData 
    : mockSearchData.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <AppStateContext.Provider
      value={{
        screenState,
        setScreenState,
        activeTab,
        setActiveTab,
        drawerOpen,
        setDrawerOpen,
        toggleDrawer,
        searchOpen,
        setSearchOpen,
        searchQuery,
        setSearchQuery,
        voiceModalOpen,
        setVoiceModalOpen,
        notifications,
        unreadCount,
        markNotificationRead,
        toggleNotificationRead,
        markAllNotificationsRead,
        clearAllNotifications,
        searchResults,
        isVoiceAutoFillEnabled,
        setIsVoiceAutoFillEnabled,
        toggleVoiceAutoFill,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
};
