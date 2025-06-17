import { supabase } from './supabase';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
}

// Sign in with magic link
export const signInWithMagicLink = async (email: string): Promise<boolean> => {
  try {
    console.log('🔐 Sending magic link to:', email);
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error('❌ Magic link error:', error);
      throw error;
    }

    console.log('✅ Magic link sent successfully');
    return true;
  } catch (error) {
    console.error('💥 Sign in error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send magic link';
    toast.error(message);
    return false;
  }
};

// Sign out
export const signOut = async (): Promise<boolean> => {
  try {
    console.log('🚪 Signing out user');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }

    console.log('✅ User signed out successfully');
    toast.success('Signed out successfully');
    return true;
  } catch (error) {
    console.error('💥 Sign out error:', error);
    const message = error instanceof Error ? error.message : 'Failed to sign out';
    toast.error(message);
    return false;
  }
};

// Get current user with better error handling
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Get user request timed out')), 10000);
    });

    const getUserPromise = supabase.auth.getUser();
    
    const { data: { user }, error } = await Promise.race([getUserPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Get user error:', error);
      // Don't throw error for missing session - this is normal for anonymous users
      if (error.message?.includes('Auth session missing') || error.message?.includes('session_not_found')) {
        console.log('ℹ️ No active session - user is anonymous');
        return null;
      }
      throw error;
    }

    if (!user) {
      console.log('ℹ️ No authenticated user');
      return null;
    }

    console.log('✅ Retrieved authenticated user:', user.email);
    return {
      id: user.id,
      email: user.email || '',
      created_at: user.created_at || '',
    };
  } catch (error) {
    console.error('💥 Get current user error:', error);
    // Return null instead of throwing to allow app to continue with anonymous user
    return null;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 Auth state changed:', event, session?.user?.email);
    
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        created_at: session.user.created_at || '',
      };
      callback(user);
    } else {
      callback(null);
    }
  });
};