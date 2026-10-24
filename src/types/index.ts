/**
 * FarmConnect Core Types
 */

export type UserRole = 'farmer' | 'consumer' | 'delivery' | 'worker' | 'equipment_owner' | 'livestock_seller' | 'admin';

export type Language = 'en' | 'te' | 'hi';

export interface User {
  id: string;
  name: string;
  emailOrPhone: string;
  role: UserRole | null;
  avatar?: string;
  isAuthenticated: boolean;
  isVerified: boolean;
  location?: string;
  phone?: string;
  language?: Language;
}

export interface RoleInfo {
  id: UserRole;
  title: string;
  titleTe: string;
  titleHi: string;
  subtitle: string;
  description: string;
  badge: string;
  color: string;
  bgGradient: string;
  icon: string;
  benefits: string[];
}

export interface NavItem {
  id: string;
  label: string;
  labelTe?: string;
  labelHi?: string;
  icon: string;
  path: string;
  badge?: string | number;
  section?: 'main' | 'marketplaces' | 'services' | 'account' | 'info';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'order' | 'alert' | 'weather' | 'scheme' | 'system' | 'market' | 'worker';
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  actionTab?: ActiveTab;
  actionPath?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  category: 'Crop' | 'Product' | 'Worker' | 'Equipment' | 'Livestock' | 'Scheme' | 'Page';
  description: string;
  path: string;
  badge?: string;
}

export type ScreenState = 
  | 'splash'
  | 'login'
  | 'signup'
  | 'forgot_password'
  | 'otp_verification'
  | 'role_selection'
  | 'app_shell';

export type ActiveTab = 
  | 'home'
  | 'marketplace'
  | 'ai_assistant'
  | 'orders'
  | 'profile'
  | 'products'
  | 'worker_marketplace'
  | 'equipment_marketplace'
  | 'livestock_marketplace'
  | 'govt_schemes'
  | 'weather'
  | 'crop_calendar'
  | 'knowledge_hub'
  | 'notifications'
  | 'payments'
  | 'settings'
  | 'help'
  | 'about'
  | 'admin'
  | 'search'
  | 'admin_dashboard'
  | 'farmer_dashboard'
  | 'consumer_dashboard'
  | 'worker_dashboard'
  | 'delivery_dashboard'
  | 'delivery';
