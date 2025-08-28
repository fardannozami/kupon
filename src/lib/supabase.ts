import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up Supabase connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      coupons: {
        Row: {
          id: string;
          coupon_number: number;
          name: string;
          email: string;
          phone: string;
          status: 'active' | 'drawn';
          created_at: string;
          drawn_at: string | null;
        };
        Insert: {
          id?: string;
          coupon_number?: number;
          name: string;
          email: string;
          phone: string;
          status?: 'active' | 'drawn';
          created_at?: string;
          drawn_at?: string | null;
        };
        Update: {
          id?: string;
          coupon_number?: number;
          name?: string;
          email?: string;
          phone?: string;
          status?: 'active' | 'drawn';
          created_at?: string;
          drawn_at?: string | null;
        };
      };
    };
  };
}

export type Coupon = Database['public']['Tables']['coupons']['Row'];