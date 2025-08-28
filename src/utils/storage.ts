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
    // First, delete all coupons
    const { error: deleteError } = await supabase
      .from('coupons')
      .delete()
      .gte('coupon_number', 1); // Delete all records where coupon_number >= 1

    if (deleteError) {
      console.error('Error clearing coupons:', deleteError);
      throw new Error('Gagal menghapus semua kupon.');
    }

    // Reset sequence using the function from migration
    const { error: seqError } = await supabase.rpc('reset_coupon_number_sequence');
    if (seqError) {
      console.warn('Warning: Could not reset coupon sequence:', seqError);
      // Don't throw error here as the main deletion succeeded
    }
  } catch (error) {
    console.error('Error clearing coupons:', error);
    throw error;
  }
};

// Get statistics for admin dashboard
export const getCouponStats = async () => {
  try {
    const coupons = await getCoupons();
    const activeCoupons = coupons.filter(c => c.status === 'active');
    const drawnCoupons = coupons.filter(c => c.status === 'drawn');
    
    return {
      total: coupons.length,
      active: activeCoupons.length,
      drawn: drawnCoupons.length,
      participationRate: coupons.length > 0 ? Math.round((drawnCoupons.length / coupons.length) * 100) : 0
    };
  } catch (error) {
    console.error('Error getting coupon stats:', error);
    return {
      total: 0,
      active: 0,
      drawn: 0,
      participationRate: 0
    };
  }
};

// Get recent winners for admin dashboard
export const getRecentWinners = async (limit: number = 10): Promise<Coupon[]> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('status', 'drawn')
      .order('drawn_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent winners:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading recent winners:', error);
    return [];
  }
};

// Bulk update coupon status (for admin operations)
export const bulkUpdateCouponStatus = async (
  couponIds: string[], 
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
      .in('id', couponIds);

    if (error) {
      console.error('Error bulk updating coupon status:', error);
      throw new Error('Gagal mengupdate status kupon secara bulk.');
    }
  } catch (error) {
    console.error('Error bulk updating coupon status:', error);
    throw error;
  }
};

// Delete specific coupon (for admin)
export const deleteCoupon = async (couponId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId);

    if (error) {
      console.error('Error deleting coupon:', error);
      throw new Error('Gagal menghapus kupon.');
    }
  } catch (error) {
    console.error('Error deleting coupon:', error);
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