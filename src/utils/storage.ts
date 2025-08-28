import { supabase, type Coupon } from '../lib/supabase';

// Get all coupons from database
export const getCoupons = async (): Promise<Coupon[]> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading coupons:', error);
    return [];
  }
};

// Add new coupon to database
export const addCoupon = async (couponData: {
  name: string;
  email: string;
  phone: string;
}): Promise<Coupon | null> => {
  try {
    // Check if email already exists
    const { data: existingCoupon } = await supabase
      .from('coupons')
      .select('email')
      .eq('email', couponData.email)
      .single();

    if (existingCoupon) {
      throw new Error('Email sudah terdaftar!');
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        name: couponData.name,
        email: couponData.email,
        phone: couponData.phone,
        status: 'active' as const
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding coupon:', error);
      throw new Error('Gagal menambahkan kupon. Silakan coba lagi.');
    }

    return data;
  } catch (error) {
    console.error('Error adding coupon:', error);
    throw error;
  }
};

// Update coupon status in database
export const updateCouponStatus = async (
  couponId: string, 
  status: Coupon['status']
): Promise<void> => {
  try {
    const updateData: any = { status };
    
    if (status === 'drawn') {
      updateData.drawn_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', couponId);

    if (error) {
      console.error('Error updating coupon status:', error);
      throw new Error('Gagal mengupdate status kupon.');
    }
  } catch (error) {
    console.error('Error updating coupon status:', error);
    throw error;
  }
};

// Clear all coupons from database
export const clearAllCoupons = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error clearing coupons:', error);
      throw new Error('Gagal menghapus semua kupon.');
    }

    // Reset sequence
    const { error: seqError } = await supabase.rpc('reset_coupon_sequence');
    if (seqError) {
      console.warn('Warning: Could not reset coupon sequence:', seqError);
    }
  } catch (error) {
    console.error('Error clearing coupons:', error);
    throw error;
  }
};

// Get coupons with real-time subscription
export const subscribeToCoupons = (callback: (coupons: Coupon[]) => void) => {
  const subscription = supabase
    .channel('coupons_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'coupons'
      },
      async () => {
        // Fetch updated data when changes occur
        const coupons = await getCoupons();
        callback(coupons);
      }
    )
    .subscribe();

  return subscription;
};

// Utility function to check database connection
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('coupons').select('count').limit(1);
    return !error;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};