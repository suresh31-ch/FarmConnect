/**
 * FarmConnect OTP Verification Screen Stub
 * Redirects back to login as fake OTP has been replaced with Supabase Authentication.
 */

import React from 'react';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { useAppState } from '../../context/AppStateContext';

export const OtpVerificationScreen: React.FC = () => {
  const { setScreenState } = useAppState();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white">
      <div className="w-full max-w-md rounded-[32px] glass-card-dark p-8 border border-emerald-500/30 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-600 flex items-center justify-center text-white shadow-xl">
          <Icon name="check_circle" size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Supabase Direct Auth Enabled</h2>
          <p className="text-xs text-emerald-300">Fake OTP verification has been replaced with secure Email + Password Supabase Authentication.</p>
        </div>
        <Button variant="primary" size="lg" fullWidth onClick={() => setScreenState('login')}>
          Return to Login
        </Button>
      </div>
    </div>
  );
};
