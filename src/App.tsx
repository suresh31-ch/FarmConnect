/**
 * FarmConnect Main Application Entry
 * Assembles Providers (Theme, Language, Auth, AppState) and manages Root Navigation.
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { FarmDataProvider } from './context/FarmDataContext';

// Screens
import { SplashScreen } from './screens/splash/SplashScreen';
import { LoginScreen } from './screens/auth/LoginScreen';
import { SignupScreen } from './screens/auth/SignupScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';
import { OtpVerificationScreen } from './screens/auth/OtpVerificationScreen';
import { RoleSelectionScreen } from './screens/auth/RoleSelectionScreen';

// Dashboards
import { HomeDashboard } from './screens/dashboards/HomeDashboard';
import { FarmerDashboard } from './screens/dashboards/FarmerDashboard';
import { ConsumerDashboard } from './screens/dashboards/ConsumerDashboard';
import { WorkerDashboardStub } from './screens/dashboards/WorkerDashboardStub';
import { DeliveryDashboard } from './screens/dashboards/DeliveryDashboard';
import { AdminDashboard } from './screens/dashboards/AdminDashboard';

// Marketplaces
import { WorkerMarketplace } from './screens/marketplace/WorkerMarketplace';
import { EquipmentMarketplace } from './screens/marketplace/EquipmentMarketplace';
import { LivestockMarketplace } from './screens/marketplace/LivestockMarketplace';

// AI Agriculture Suite
import { AiSmartAgricultureCenter } from './screens/ai/AiSmartAgricultureCenter';
import { GovernmentSchemes } from './screens/ai/GovernmentSchemes';
import { WeatherIntelligence } from './screens/ai/WeatherIntelligence';
import { CropCalendar } from './screens/ai/CropCalendar';
import { KnowledgeHub } from './screens/ai/KnowledgeHub';

// Realized Core Feature Screens
import { NotificationCenterScreen } from './screens/notifications/NotificationCenterScreen';
import { PaymentsScreen } from './screens/payments/PaymentsScreen';
import { SettingsScreen } from './screens/settings/SettingsScreen';
import { ProfileScreen } from './screens/profile/ProfileScreen';
import { GlobalSearchScreen } from './screens/search/GlobalSearchScreen';

// Section Stubs
import { GenericSectionStub } from './screens/stubs/GenericSectionStub';

// Layout
import { AppShell } from './components/layout/AppShell';

const MainRouter: React.FC = () => {
  const { screenState, activeTab } = useAppState();
  const { role } = useAuth();

  // Root screen router
  if (screenState === 'splash') {
    return <SplashScreen />;
  }
  if (screenState === 'login') {
    return <LoginScreen />;
  }
  if (screenState === 'signup') {
    return <SignupScreen />;
  }
  if (screenState === 'forgot_password') {
    return <ForgotPasswordScreen />;
  }
  if (screenState === 'otp_verification') {
    return <OtpVerificationScreen />;
  }
  if (screenState === 'role_selection') {
    return <RoleSelectionScreen />;
  }

  // Active role dashboard renderer for role specific view
  const renderRoleDashboard = () => {
    switch (role) {
      case 'farmer':
        return <FarmerDashboard />;
      case 'consumer':
        return <ConsumerDashboard />;
      case 'worker':
        return <WorkerMarketplace />;
      case 'delivery':
        return <DeliveryDashboard />;
      case 'equipment_owner':
        return <EquipmentMarketplace />;
      case 'livestock_seller':
        return <LivestockMarketplace />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <FarmerDashboard />;
    }
  };

  // Tab router inside AppShell
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeDashboard />;

      case 'farmer_dashboard':
        return <FarmerDashboard />;

      case 'consumer_dashboard':
      case 'marketplace':
      case 'products':
        return <ConsumerDashboard />;

      case 'worker_dashboard':
      case 'worker_marketplace':
        return <WorkerMarketplace />;

      case 'equipment_marketplace':
        return <EquipmentMarketplace />;

      case 'livestock_marketplace':
        return <LivestockMarketplace />;

      case 'delivery_dashboard':
      case 'delivery':
        return <DeliveryDashboard />;

      case 'admin_dashboard':
      case 'admin':
        return <AdminDashboard />;

      case 'search':
        return <GlobalSearchScreen />;

      case 'ai_assistant':
        return <AiSmartAgricultureCenter />;

      case 'govt_schemes':
        return <GovernmentSchemes />;

      case 'weather':
        return <WeatherIntelligence />;

      case 'crop_calendar':
        return <CropCalendar />;

      case 'knowledge_hub':
        return <KnowledgeHub />;

      case 'notifications':
        return <NotificationCenterScreen />;

      case 'payments':
        return <PaymentsScreen />;

      case 'settings':
        return <SettingsScreen />;

      case 'help':
        return (
          <GenericSectionStub
            title="Help & Kisan Support Desk"
            subtitle="Toll-free Kisan helpline, WhatsApp support, and interactive user manuals"
            icon="help"
            category="Support"
            description="1800-180-1551 Kisan Helpline integration, live chat support, and community forum."
            sampleItems={[
              { title: 'Toll-Free Kisan Helpline', subtitle: 'Call 1800-180-1551 (24x7)', tag: 'Voice Call' },
              { title: 'WhatsApp Support Bot', subtitle: 'Chat in Telugu / Hindi / English', tag: 'WhatsApp' },
              { title: 'Video User Guide', subtitle: 'How to list your crop in 2 minutes', tag: 'Tutorial' },
            ]}
          />
        );

      case 'about':
        return (
          <GenericSectionStub
            title="About FarmConnect Ecosystem"
            subtitle="AI Powered Smart Agriculture Ecosystem for Indian Farmers"
            icon="info"
            category="Project Vision"
            description="Eliminating unnecessary middlemen, increasing farmer income by up to 35%, and unifying agriculture stakeholders."
            sampleItems={[
              { title: 'FarmConnect Architecture', subtitle: 'Production Foundation Specs', tag: 'Architecture' },
              { title: 'Design System Tokens', subtitle: 'Poppins & Inter Typography • Emerald & Gold Palette', tag: 'Theme' },
              { title: 'Target Impact', subtitle: '+35% Farmer Net Profit Improvement', tag: 'Social Impact' },
            ]}
          />
        );

      case 'orders':
        return (
          <GenericSectionStub
            title="Orders & Shipments"
            subtitle="Track live farm produce deliveries, equipment rental bookings, and worker shifts"
            icon="shopping_bag"
            category="Orders"
            description="Live GPS vehicle tracking, order history, QR code delivery confirmation, and receipts."
            sampleItems={[
              { title: 'Order #FC-9081 - Tomato Harvest', subtitle: 'In Transit • Est Arrival 4:30 PM', tag: 'Live Track' },
              { title: 'Tractor Booking #EQ-441', subtitle: 'Confirmed for Jul 26 @ 7:00 AM', tag: 'Equipment' },
              { title: 'Worker Harvest Contract #WRK-12', subtitle: '10 Workers • Tenali Farm', tag: 'Completed' },
            ]}
          />
        );

      case 'profile':
        return <ProfileScreen />;

      default:
        return renderRoleDashboard();
    }
  };

  return (
    <AppShell activeKey={activeTab}>
      {renderTabContent()}
    </AppShell>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppStateProvider>
            <FarmDataProvider>
              <MainRouter />
            </FarmDataProvider>
          </AppStateProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
