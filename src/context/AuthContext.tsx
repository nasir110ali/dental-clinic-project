import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isCheckingAdmin: boolean;
  isLoadingSession: boolean;
  authError: string | null;
  unauthorizedMessage: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshAdminStatus: () => Promise<boolean>;
  claimAdminRole: () => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(false);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [unauthorizedMessage, setUnauthorizedMessage] = useState<string | null>(null);

  const verifyAdminAccess = useCallback(async (userId: string): Promise<boolean> => {
    if (!userId) {
      setIsAdmin(false);
      setUnauthorizedMessage(null);
      return false;
    }

    setIsCheckingAdmin(true);
    try {
      // Rule: Use admin_users.user_id to check admin access.
      // Do not check admin access by email.
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error querying admin_users table:', error);
      }

      if (data && data.user_id === userId) {
        setIsAdmin(true);
        setUnauthorizedMessage(null);
        return true;
      } else {
        setIsAdmin(false);
        setUnauthorizedMessage('You are signed in, but you are not authorized as an admin.');
        return false;
      }
    } catch (err) {
      console.error('Exception during admin verification:', err);
      setIsAdmin(false);
      setUnauthorizedMessage('You are signed in, but you are not authorized as an admin.');
      return false;
    } finally {
      setIsCheckingAdmin(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await verifyAdminAccess(initialSession.user.id);
          } else {
            setIsAdmin(false);
            setUnauthorizedMessage(null);
          }
        }
      } catch (err) {
        console.error('Error fetching initial session:', err);
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await verifyAdminAccess(newSession.user.id);
      } else {
        setIsAdmin(false);
        setUnauthorizedMessage(null);
      }
      setIsLoadingSession(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [verifyAdminAccess]);

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    setUnauthorizedMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        const hasAdminAccess = await verifyAdminAccess(data.user.id);
        if (!hasAdminAccess) {
          return {
            success: false,
            error: 'You are signed in, but you are not authorized as an admin.',
          };
        }
        return { success: true };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error during sign in';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setUnauthorizedMessage(null);
      setAuthError(null);
    }
  };

  const refreshAdminStatus = async (): Promise<boolean> => {
    if (!user) return false;
    return await verifyAdminAccess(user.id);
  };

  const claimAdminRole = async () => {
    if (!user) return { success: false, message: 'No user signed in' };
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert([{ user_id: user.id }]);

      if (error) {
        return {
          success: false,
          message: error.message || 'Could not grant admin role via direct insert.',
        };
      }

      await verifyAdminAccess(user.id);
      return { success: true, message: 'Admin access successfully verified.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register admin user';
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isCheckingAdmin,
        isLoadingSession,
        authError,
        unauthorizedMessage,
        signIn,
        signOut,
        refreshAdminStatus,
        claimAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
