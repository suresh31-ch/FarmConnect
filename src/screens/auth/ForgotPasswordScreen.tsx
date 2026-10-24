/**
 * FarmConnect Forgot Password Screen - Powered by Supabase Authentication
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../components/common/Icon';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useAppState } from '../../context/AppStateContext';
import { useLanguage } from '../../context/LanguageContext';

export const ForgotPasswordScreen: React.FC = () => {
  const { resetPassword } = useAuth();
  const { setScreenState } = useAppState();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const result = await resetPassword(email);
      setIsLoading(false);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Failed to send reset link. Please try again.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-[32px] glass-card-dark p-6 sm:p-8 border border-emerald-500/30 shadow-2xl space-y-6 relative z-10 text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 shadow-xl">
          <Icon name="lock_reset" size={36} />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{t('resetPassword')}</h2>
          <p className="text-xs text-emerald-300/80">{t('resetPasswordSubtitle')}</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold text-center flex items-center justify-center gap-2">
            <Icon name="error_outline" size={18} />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs space-y-2">
            <Icon name="check_circle" size={32} className="mx-auto text-emerald-400" />
            <p className="font-bold">Reset Link Dispatched!</p>
            <p>If an account exists for {email}, password reset instructions have been sent.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScreenState('login')}
              className="mt-3 text-white border-white/30"
            >
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('emailOrPhone')}
              icon="mail"
              type="email"
              placeholder="farmer@farmconnect.ag"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <Button
              type="submit"
              variant="accent"
              size="lg"
              fullWidth
              isLoading={isLoading}
              rightIcon="send"
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="pt-2 border-t border-emerald-800/50">
          <button
            type="button"
            onClick={() => setScreenState('login')}
            className="text-xs font-semibold text-emerald-400 hover:text-white cursor-pointer"
          >
            ← Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};
