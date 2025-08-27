export interface Coupon {
  id: string;
  couponNumber: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'drawn';
  createdAt: string;
  drawnAt?: string;
}

const STORAGE_KEY = 'kupon_lucky_data';

export const getCoupons = (): Coupon[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading coupons:', error);
    return [];
  }
};

export const saveCoupons = (coupons: Coupon[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  } catch (error) {
    console.error('Error saving coupons:', error);
  }
};

export const addCoupon = (couponData: Omit<Coupon, 'id' | 'couponNumber' | 'status' | 'createdAt'>): Coupon => {
  const coupons = getCoupons();
  const maxCouponNumber = coupons.length > 0 ? Math.max(...coupons.map(c => c.couponNumber)) : 0;
  
  const newCoupon: Coupon = {
    id: generateId(),
    couponNumber: maxCouponNumber + 1,
    ...couponData,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  
  const updatedCoupons = [...coupons, newCoupon];
  saveCoupons(updatedCoupons);
  
  return newCoupon;
};

export const updateCouponStatus = (couponId: string, status: Coupon['status']): void => {
  const coupons = getCoupons();
  const updatedCoupons = coupons.map(coupon => {
    if (coupon.id === couponId) {
      return {
        ...coupon,
        status,
        ...(status === 'drawn' && { drawnAt: new Date().toISOString() })
      };
    }
    return coupon;
  });
  
  saveCoupons(updatedCoupons);
};

export const clearAllCoupons = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};