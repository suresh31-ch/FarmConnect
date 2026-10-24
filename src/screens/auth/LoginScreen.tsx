/**
 * FarmConnect Login Screen - Powered by Real Supabase Authentication
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../components/common/Icon';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';

export const LoginScreen: React.FC = () => {
  const { login, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const { setScreenState, setActiveTab } = useAppState();
  const { t } = useLanguage();

  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('email');

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Phone OTP form
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      setIsLoading(false);

      if (!result.success) {
        setError(result.error || 'Invalid email or password.');
        return;
      }

      if (result.role) {
        setScreenState('app_shell');
        setActiveTab('home');
      } else {
        setScreenState('role_selection');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Login failed. Please try again.');
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter your mobile phone number with country code (e.g. +919876543210)');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const result = await sendPhoneOtp(formattedPhone);
      setIsLoading(false);

      if (!result.success) {
        setError(result.error || 'Failed to send OTP to mobile number.');
        return;
      }

      setOtpSent(true);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const result = await verifyPhoneOtp(formattedPhone, otpCode);
      setIsLoading(false);

      if (!result.success) {
        setError(result.error || 'Invalid OTP code.');
        return;
      }

      if (result.role) {
        setScreenState('app_shell');
        setActiveTab('home');
      } else {
        setScreenState('role_selection');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'OTP verification failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white relative overflow-hidden">
      {/* Glow Ambient Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[250px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-[32px] glass-card-dark p-6 sm:p-8 border border-emerald-500/30 shadow-2xl space-y-6 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40">
            <Icon name="agriculture" size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{t('welcomeBack')}</h2>
          <p className="text-xs sm:text-sm text-emerald-300/80 max-w-xs mx-auto">{t('loginSubtitle')}</p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex rounded-2xl bg-emerald-950/80 p-1 border border-emerald-700/50 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setLoginMode('email');
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loginMode === 'email'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Icon name="mail" size={16} />
            <span>Email Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('phone');
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              loginMode === 'phone'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Icon name="smartphone" size={16} />
            <span>Mobile OTP</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <Icon name="error_outline" size={18} />
            <span>{error}</span>
          </div>
        )}

        {loginMode === 'email' ? (
          /* Email + Password Form */
          <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
            <Input
              label="Email Address"
              icon="mail"
              type="email"
              placeholder="farmer@farmconnect.ag"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <Input
              label={t('password')}
              icon="lock"
              isPassword
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-emerald-200 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-emerald-600 text-emerald-600 focus:ring-emerald-500 bg-emerald-950/60"
                />
                <span>{t('rememberMe')}</span>
              </label>

              <button
                type="button"
                onClick={() => setScreenState('forgot_password')}
                className="font-bold text-amber-400 hover:underline cursor-pointer"
              >
                {t('forgotPassword')}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon="arrow_forward"
            >
              {t('login')}
            </Button>
          </form>
        ) : (
          /* Phone OTP Form */
          <form onSubmit={otpSent ? handleVerifyPhoneOtp : handleSendPhoneOtp} className="space-y-4">
            {!otpSent ? (
              <>
                <Input
                  label="Mobile Number"
                  icon="smartphone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  rightIcon="send"
                >
                  Send OTP Code
                </Button>
              </>
            ) : (
              <>
                <div className="p-3 rounded-2xl bg-emerald-900/40 border border-emerald-600/40 text-xs text-emerald-200 text-center">
                  OTP sent to <span className="font-bold text-white">{phone}</span>
                </div>
                <Input
                  label="6-Digit Verification Code"
                  icon="pin"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setOtpSent(false)}
                    className="text-emerald-300"
                  >
                    Change Number
                  </Button>
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    fullWidth
                    isLoading={isLoading}
                    rightIcon="arrow_forward"
                  >
                    Verify & Login
                  </Button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-emerald-300/80">
          <span>{t('dontHaveAccount')} </span>
          <button
            type="button"
            onClick={() => setScreenState('signup')}
            className="font-bold text-amber-400 hover:underline cursor-pointer"
          >
            {t('signup')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
