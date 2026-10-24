/**
 * FarmConnect Signup Screen - Powered by Supabase Authentication
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../components/common/Icon';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';

export const SignupScreen: React.FC = () => {
  const { signup } = useAuth();
  const { setScreenState } = useAppState();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const result = await signup(name, email, password);
      setIsLoading(false);

      if (!result.success) {
        setError(result.error || 'Registration failed. Please try again.');
        return;
      }

      // Display verification message
      setVerificationSent(true);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-[32px] glass-card-dark p-6 sm:p-8 border border-emerald-500/30 shadow-2xl space-y-5 relative z-10"
      >
        {verificationSent ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-xl">
              <Icon name="mark_email_read" size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h2>
              <p className="text-sm font-medium text-emerald-200 leading-relaxed px-2">
                A verification link has been sent to your email. Please verify your account before logging in.
              </p>
              <p className="text-xs text-emerald-400 font-mono pt-1">{email}</p>
            </div>

            <div className="pt-4 border-t border-emerald-800/60 space-y-3">
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setScreenState('login')}
                rightIcon="arrow_forward"
              >
                Go to Login
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-lg">
                <Icon name="person_add" size={28} />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('createAccount')}</h2>
              <p className="text-xs text-emerald-300/80 max-w-xs mx-auto">{t('signupSubtitle')}</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-medium text-center flex items-center justify-center gap-2">
                <Icon name="error_outline" size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <Input
                label="Full Name"
                icon="badge"
                placeholder="Ramesh Patel"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <Input
                label="Email Address"
                icon="mail"
                type="email"
                placeholder="farmer@farmconnect.ag"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                icon="lock"
                isPassword
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <Input
                label="Confirm Password"
                icon="lock_reset"
                isPassword
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="accent"
                size="lg"
                fullWidth
                isLoading={isLoading}
                rightIcon="arrow_forward"
              >
                {t('createAccount')}
              </Button>
            </form>

            <div className="text-center text-xs text-emerald-300/80 pt-1">
              <span>{t('alreadyHaveAccount')} </span>
              <button
                type="button"
                onClick={() => setScreenState('login')}
                className="font-bold text-amber-400 hover:underline cursor-pointer"
              >
                {t('login')}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
