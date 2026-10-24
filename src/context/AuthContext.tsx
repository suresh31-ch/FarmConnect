/**
 * FarmConnect Supabase Auth Context
 * Real Supabase Authentication lifecycle, role persistence, and session management.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase, isSupabaseConfigured, testSupabaseConnection, ConnectionTestResult } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectionResult: ConnectionTestResult | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; role: UserRole | null; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; sessionCreated: boolean; error?: string }>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ success: boolean; role: UserRole | null; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  selectRole: (selectedRole: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  retestConnection: () => Promise<ConnectionTestResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [connectionResult, setConnectionResult] = useState<ConnectionTestResult | null>(null);

  // Map Supabase User to App User
  const formatUser = (sbUser: SupabaseUser, userRole: UserRole | null): User => {
    const userMeta = sbUser.user_metadata || {};
    return {
      id: sbUser.id,
      name: userMeta.name || userMeta.full_name || sbUser.email?.split('@')[0] || sbUser.phone || 'FarmConnect User',
      emailOrPhone: sbUser.email || sbUser.phone || '',
      role: userRole,
      isAuthenticated: true,
      isVerified: !!sbUser.email_confirmed_at || !!sbUser.phone_confirmed_at || true,
      location: userMeta.location || 'Guntur, Andhra Pradesh',
    };
  };

  const runConnectionCheck = async (): Promise<ConnectionTestResult> => {
    const res = await testSupabaseConnection();
    setConnectionResult(res);
    return res;
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // 1. Verify configuration & run initial test
      const testRes = await testSupabaseConnection();
      if (isMounted) {
        setConnectionResult(testRes);
      }

      if (!testRes.isConfigured) {
        if (isMounted) setIsLoading(false);
        return;
      }

      // 2. Retrieve existing session
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (isMounted) {
            setConnectionResult(prev => prev ? { ...prev, error: sessionError.message } : null);
          }
        } else if (session?.user && isMounted) {
          setSession(session);
          const savedRole = (session.user.user_metadata?.role as UserRole) || (localStorage.getItem(`farmconnect_role_${session.user.id}`) as UserRole) || null;
          setRole(savedRole);
          setUser(formatUser(session.user, savedRole));
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        if (isMounted) {
          setConnectionResult(prev => prev ? {
            ...prev,
            error: errMsg.includes('Failed to fetch')
              ? 'Could not connect to Supabase backend host. Please check network or CORS settings.'
              : errMsg
          } : null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // 3. Listen for Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;
      setSession(currentSession);
      if (currentSession?.user) {
        const savedRole = (currentSession.user.user_metadata?.role as UserRole) || (localStorage.getItem(`farmconnect_role_${currentSession.user.id}`) as UserRole) || null;
        setRole(savedRole);
        setUser(formatUser(currentSession.user, savedRole));
      } else {
        setUser(null);
        setRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Supabase Real Email + Password Login
  const login = async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return { success: false, role: null, error: error.message };
      }

      if (data.user) {
        // Enforce email confirmation if enabled in Supabase project settings
        if (data.user.email && !data.user.email_confirmed_at && !data.user.confirmed_at) {
          await supabase.auth.signOut();
          return {
            success: false,
            role: null,
            error: 'Email address not yet verified. Please click the verification link sent to your inbox before logging in.',
          };
        }

        const userRole = (data.user.user_metadata?.role as UserRole) || (localStorage.getItem(`farmconnect_role_${data.user.id}`) as UserRole) || null;
        setRole(userRole);
        setUser(formatUser(data.user, userRole));
        return { success: true, role: userRole };
      }

      return { success: false, role: null, error: 'Login failed. Invalid credentials.' };
    } catch (err: any) {
      const rawMsg = err?.message || String(err);
      const formattedError = rawMsg.includes('Failed to fetch')
        ? 'Connection error: Unable to reach Supabase authentication server.'
        : rawMsg;
      return { success: false, role: null, error: formattedError };
    }
  };

  // Supabase Real Email + Password Signup
  const signup = async (name: string, email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            name,
            full_name: name,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        return { success: false, sessionCreated: false, error: error.message };
      }

      if (data.user) {
        return { success: true, sessionCreated: !!data.session };
      }

      return { success: false, sessionCreated: false, error: 'Registration failed.' };
    } catch (err: any) {
      const rawMsg = err?.message || String(err);
      const formattedError = rawMsg.includes('Failed to fetch')
        ? 'Connection error: Unable to reach Supabase authentication server.'
        : rawMsg;
      return { success: false, sessionCreated: false, error: formattedError };
    }
  };

  // Send real Supabase Phone OTP
  const sendPhoneOtp = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send OTP.' };
    }
  };

  // Verify real Supabase Phone OTP
  const verifyPhoneOtp = async (phone: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) {
        return { success: false, role: null, error: error.message };
      }

      if (data.user) {
        const userRole = (data.user.user_metadata?.role as UserRole) || (localStorage.getItem(`farmconnect_role_${data.user.id}`) as UserRole) || null;
        setRole(userRole);
        setUser(formatUser(data.user, userRole));
        return { success: true, role: userRole };
      }

      return { success: false, role: null, error: 'Invalid or expired OTP code.' };
    } catch (err: any) {
      return { success: false, role: null, error: err?.message || 'Failed to verify OTP.' };
    }
  };

  // Supabase Password Reset Request
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Password reset request failed.' };
    }
  };

  // Save selected role in Supabase user metadata and local storage
  const selectRole = async (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (user) {
      setUser({ ...user, role: selectedRole });
      localStorage.setItem(`farmconnect_role_${user.id}`, selectedRole);
    }
    localStorage.setItem('farmconnect_role', selectedRole);

    try {
      await supabase.auth.updateUser({
        data: { role: selectedRole },
      });
      return true;
    } catch {
      return true;
    }
  };

  // Logout returns to Login screen
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setRole(null);
    setSession(null);
    localStorage.removeItem('farmconnect_role');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user && user.isAuthenticated,
        isLoading,
        connectionResult,
        login,
        signup,
        sendPhoneOtp,
        verifyPhoneOtp,
        resetPassword,
        selectRole,
        logout,
        retestConnection: runConnectionCheck,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
