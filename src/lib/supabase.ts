import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:');
console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

// Validate that we have proper Supabase credentials (not placeholder values)
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return !url.includes('your-project-ref') && !url.includes('your-project') && url.startsWith('https://') && url.includes('.supabase.co');
  } catch {
    return false;
  }
};

const isValidKey = (key: string): boolean => {
  return key && !key.includes('your-anon-key-here') && !key.includes('your_supabase_anon_key_here') && key.length > 20;
};

// Create a proper mock query builder that matches Supabase's API
const createMockQueryBuilder = () => ({
  select: () => createMockQueryBuilder(),
  insert: () => createMockQueryBuilder(),
  update: () => createMockQueryBuilder(),
  delete: () => createMockQueryBuilder(),
  upsert: () => createMockQueryBuilder(),
  eq: () => createMockQueryBuilder(),
  neq: () => createMockQueryBuilder(),
  gt: () => createMockQueryBuilder(),
  gte: () => createMockQueryBuilder(),
  lt: () => createMockQueryBuilder(),
  lte: () => createMockQueryBuilder(),
  like: () => createMockQueryBuilder(),
  ilike: () => createMockQueryBuilder(),
  is: () => createMockQueryBuilder(),
  in: () => createMockQueryBuilder(),
  contains: () => createMockQueryBuilder(),
  containedBy: () => createMockQueryBuilder(),
  rangeGt: () => createMockQueryBuilder(),
  rangeGte: () => createMockQueryBuilder(),
  rangeLt: () => createMockQueryBuilder(),
  rangeLte: () => createMockQueryBuilder(),
  rangeAdjacent: () => createMockQueryBuilder(),
  overlaps: () => createMockQueryBuilder(),
  textSearch: () => createMockQueryBuilder(),
  match: () => createMockQueryBuilder(),
  not: () => createMockQueryBuilder(),
  or: () => createMockQueryBuilder(),
  filter: () => createMockQueryBuilder(),
  order: () => createMockQueryBuilder(),
  limit: () => createMockQueryBuilder(),
  range: () => createMockQueryBuilder(),
  abortSignal: () => createMockQueryBuilder(),
  single: () => Promise.resolve({ 
    data: null, 
    error: new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.') 
  }),
  maybeSingle: () => Promise.resolve({ 
    data: null, 
    error: new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.') 
  }),
  then: (resolve: any) => {
    // Make the query builder thenable so it works with await
    return Promise.resolve({ 
      data: [], 
      error: new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.') 
    }).then(resolve);
  }
});

// Create either a real client or a mock client based on credential validity
let supabaseClient: any;

if (!supabaseUrl || !supabaseAnonKey || !isValidUrl(supabaseUrl) || !isValidKey(supabaseAnonKey)) {
  console.error('❌ Invalid or missing Supabase environment variables!');
  console.error('');
  console.error('🔧 SETUP INSTRUCTIONS:');
  console.error('1. Go to https://supabase.com and create a new project');
  console.error('2. Wait for your project to be ready (this can take a few minutes)');
  console.error('3. Go to Settings > API in your Supabase dashboard');
  console.error('4. Copy your Project URL and anon/public key');
  console.error('5. Update your .env file with the real values:');
  console.error('   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"');
  console.error('   VITE_SUPABASE_ANON_KEY="your-actual-anon-key"');
  console.error('6. Restart your development server (npm run dev)');
  console.error('');
  console.error('📝 Current values:');
  console.error('   URL:', supabaseUrl || 'undefined');
  console.error('   Key:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined');
  
  // Create a comprehensive mock client that matches Supabase's API structure
  supabaseClient = {
    from: () => createMockQueryBuilder(),
    auth: {
      signUp: () => Promise.resolve({ 
        data: null, 
        error: new Error('Supabase not configured. Please set up your environment variables.') 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: null, 
        error: new Error('Supabase not configured. Please set up your environment variables.') 
      }),
      signInWithOtp: () => Promise.resolve({ 
        error: new Error('Supabase not configured. Please set up your environment variables.') 
      }),
      signOut: () => Promise.resolve({ 
        error: new Error('Supabase not configured. Please set up your environment variables.') 
      }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ 
        data: { 
          subscription: { 
            unsubscribe: () => console.log('Mock auth listener unsubscribed') 
          } 
        } 
      })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ 
          data: null, 
          error: new Error('Supabase not configured') 
        }),
        download: () => Promise.resolve({ 
          data: null, 
          error: new Error('Supabase not configured') 
        }),
        list: () => Promise.resolve({ 
          data: [], 
          error: new Error('Supabase not configured') 
        }),
        remove: () => Promise.resolve({ 
          data: null, 
          error: new Error('Supabase not configured') 
        }),
        getPublicUrl: () => ({ 
          data: { publicUrl: '' }, 
          error: new Error('Supabase not configured') 
        })
      })
    },
    realtime: {
      channel: () => ({
        on: () => ({}),
        subscribe: () => Promise.resolve('ok'),
        unsubscribe: () => Promise.resolve('ok')
      })
    }
  };
} else {
  // Create the real Supabase client with valid credentials
  console.log('✅ Creating real Supabase client with valid credentials');
  
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });

  // Test the connection on initialization with better error handling
  supabaseClient.from('tips').select('count', { count: 'exact', head: true })
    .then(({ data, error }: any) => {
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        console.error('💡 This might indicate missing database tables. Please run the database migrations.');
        console.error('💡 Check your Supabase project dashboard to ensure the database is set up correctly.');
      } else {
        console.log('✅ Supabase connection successful');
        console.log('📊 Database is ready with', data || 0, 'tips');
      }
    })
    .catch((err: any) => {
      console.error('❌ Supabase connection error:', err);
      console.error('💡 Please check your Supabase credentials and database setup');
    });
}

// Export the client (either real or mock)
export const supabase = supabaseClient;

export interface Tip {
  id: string;
  lat: number;
  lng: number;
  category: string;
  description: string;
  confirmations: number;
  created_at: string;
  last_confirmed_at: string;
  user_id?: string;
  user_email?: string;
  image_url?: string; // Added image URL field
}

export interface TipConfirmation {
  id: string;
  tip_id: string;
  user_id?: string;
  user_fingerprint: string;
  created_at: string;
}

// Helper function to check if a tip is expired
export const isTipExpired = (lastConfirmedAt: string): boolean => {
  const now = new Date();
  const lastConfirmed = new Date(lastConfirmedAt);
  const daysDiff = (now.getTime() - lastConfirmed.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff > 7;
};

// Helper function to get days until expiration
export const getDaysUntilExpiration = (lastConfirmedAt: string): number => {
  const now = new Date();
  const lastConfirmed = new Date(lastConfirmedAt);
  const daysDiff = (now.getTime() - lastConfirmed.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 7 - Math.floor(daysDiff));
};

// Generate a simple browser fingerprint for anonymous users
export const generateUserFingerprint = (): string => {
  try {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    // Fallback to random string
    return Math.random().toString(36).substring(2, 15);
  }
};

// FIXED: Use regular JavaScript operations instead of supabase.sql
export const toggleTipConfirmation = async (tipId: string, userId?: string): Promise<{ success: boolean; action: 'confirmed' | 'unconfirmed'; message?: string }> => {
  try {
    console.log('🔄 TOGGLE: Starting confirmation toggle for tip:', tipId);
    
    const fingerprint = generateUserFingerprint();
    console.log('🔍 Generated fingerprint:', fingerprint.substring(0, 8) + '...');
    
    // Create a timeout promise with shorter timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out after 8 seconds')), 8000);
    });
    
    // Step 1: Check if already confirmed
    console.log('🔍 Checking current confirmation status...');
    
    const checkPromise = (async () => {
      let existingConfirmation = null;
      
      if (userId) {
        const { data, error } = await supabase
          .from('tip_confirmations')
          .select('id')
          .eq('tip_id', tipId)
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        existingConfirmation = data;
      } else {
        const { data, error } = await supabase
          .from('tip_confirmations')
          .select('id')
          .eq('tip_id', tipId)
          .eq('user_fingerprint', fingerprint)
          .is('user_id', null)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        existingConfirmation = data;
      }
      
      return existingConfirmation;
    })();
    
    const existingConfirmation = await Promise.race([checkPromise, timeoutPromise]);
    
    if (existingConfirmation) {
      // UNCONFIRM: Remove existing confirmation
      console.log('❌ UNCONFIRM: Removing existing confirmation...');
      
      const deletePromise = supabase
        .from('tip_confirmations')
        .delete()
        .eq('id', existingConfirmation.id);
      
      const { error: deleteError } = await Promise.race([deletePromise, timeoutPromise]);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // FIXED: Update tip count manually instead of using supabase.sql
      // First get current count
      const { data: currentTip, error: getTipError } = await supabase
        .from('tips')
        .select('confirmations')
        .eq('id', tipId)
        .single();
      
      if (getTipError) {
        throw getTipError;
      }
      
      // Update with decremented count (minimum 0)
      const newCount = Math.max(0, currentTip.confirmations - 1);
      const updatePromise = supabase
        .from('tips')
        .update({
          confirmations: newCount
        })
        .eq('id', tipId)
        .select('confirmations')
        .single();
      
      const { data: tipData, error: tipError } = await Promise.race([updatePromise, timeoutPromise]);
      
      if (tipError) {
        throw tipError;
      }
      
      console.log('✅ Tip unconfirmed successfully');
      return { 
        success: true, 
        action: 'unconfirmed',
        message: `Total: ${tipData.confirmations}` 
      };
      
    } else {
      // CONFIRM: Add new confirmation
      console.log('✅ CONFIRM: Adding new confirmation...');
      
      const insertPromise = supabase
        .from('tip_confirmations')
        .insert([{
          tip_id: tipId,
          user_id: userId || null,
          user_fingerprint: fingerprint
        }])
        .select('id')
        .single();
      
      const { data: confirmationData, error: confirmationError } = await Promise.race([insertPromise, timeoutPromise]);
      
      if (confirmationError) {
        if (confirmationError.code === '23505') {
          return { success: false, action: 'confirmed', message: 'You have already confirmed this tip' };
        }
        throw confirmationError;
      }
      
      // FIXED: Update tip count manually instead of using supabase.sql
      // First get current count
      const { data: currentTip, error: getTipError } = await supabase
        .from('tips')
        .select('confirmations')
        .eq('id', tipId)
        .single();
      
      if (getTipError) {
        throw getTipError;
      }
      
      // Update with incremented count and timestamp
      const newCount = currentTip.confirmations + 1;
      const updatePromise = supabase
        .from('tips')
        .update({
          confirmations: newCount,
          last_confirmed_at: new Date().toISOString()
        })
        .eq('id', tipId)
        .select('confirmations')
        .single();
      
      const { data: tipData, error: tipError } = await Promise.race([updatePromise, timeoutPromise]);
      
      if (tipError) {
        throw tipError;
      }
      
      console.log('✅ Tip confirmed successfully');
      return { 
        success: true, 
        action: 'confirmed',
        message: `Total: ${tipData.confirmations}` 
      };
    }
    
  } catch (error) {
    console.error('💥 Error in toggleTipConfirmation:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Database tables not found. Please check your Supabase setup.';
      } else if (error.message.includes('Supabase not configured')) {
        errorMessage = 'Supabase not configured. Please set up your environment variables.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { 
      success: false, 
      action: 'confirmed',
      message: errorMessage
    };
  }
};

// Get all user confirmations for checking multiple tips at once with better error handling
export const getUserConfirmations = async (tipIds: string[], userId?: string): Promise<Set<string>> => {
  try {
    if (tipIds.length === 0) return new Set();
    
    console.log('🔍 Checking confirmations for', tipIds.length, 'tips');
    
    const fingerprint = generateUserFingerprint();
    
    // Create timeout with shorter duration and better error handling
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Get confirmations timed out after 5 seconds')), 5000);
    });
    
    const queryPromise = (async () => {
      let query = supabase
        .from('tip_confirmations')
        .select('tip_id')
        .in('tip_id', tipIds);
      
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('user_fingerprint', fingerprint).is('user_id', null);
      }
      
      return await query;
    })();
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    if (error) {
      console.error('❌ Error getting user confirmations:', error);
      
      // Check for specific database errors
      if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
        console.error('💡 Database tables missing. Please run Supabase migrations.');
      } else if (error.message?.includes('permission denied')) {
        console.error('💡 Permission denied. Please check RLS policies.');
      } else if (error.message?.includes('Supabase not configured')) {
        console.error('💡 Supabase not configured. Please set up your environment variables.');
      }
      
      // Return empty set instead of throwing to allow app to continue
      return new Set();
    }
    
    const confirmedTipIds = new Set(data?.map(item => item.tip_id) || []);
    console.log('✅ Found', confirmedTipIds.size, 'confirmed tips');
    
    return confirmedTipIds;
  } catch (error) {
    console.error('💥 Error in getUserConfirmations:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        console.error('💡 Database query timed out. This might indicate connection issues or missing database setup.');
      } else if (error.message.includes('fetch')) {
        console.error('💡 Network error. Please check your internet connection and Supabase credentials.');
      } else if (error.message.includes('Supabase not configured')) {
        console.error('💡 Supabase not configured. Please set up your environment variables.');
      }
    }
    
    // Always return empty set to allow app to continue functioning
    return new Set();
  }
};