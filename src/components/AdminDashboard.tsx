import React, { useState, useEffect } from 'react';
import { Trophy, Users, Gift, Shuffle, LogOut, RefreshCw, Crown, Calendar, Mail, Phone } from 'lucide-react';
import { getCoupons, updateCouponStatus, clearAllCoupons, subscribeToCoupons } from '../utils/storage';
import { Coupon } from '../lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winner, setWinner] = useState<Coupon | null>(null);
  const [drawHistory, setDrawHistory] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCoupons();

    // Subscribe to real-time updates
    const subscription = subscribeToCoupons((updatedCoupons) => {
      setCoupons(updatedCoupons);
      setDrawHistory(updatedCoupons.filter(c => c.status === 'drawn'));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const allCoupons = await getCoupons();
      setCoupons(allCoupons);
      setDrawHistory(allCoupons.filter(c => c.status === 'drawn'));
      setError('');
    } catch (error) {
      console.error('Error loading coupons:', error);
      setError('Gagal memuat data kupon');
    } finally {
      setLoading(false);
    }
  };

  const handleDraw = async () => {
    const activeCoupons = coupons.filter(c => c.status === 'active');
    
    if (activeCoupons.length === 0) {
      alert('Tidak ada kupon aktif untuk diundi!');
      return;
    }

    setIsDrawing(true);
    setWinner(null);
    setError('');

    try {
      // Simulasi animasi undian
      for (let i = 0; i < 20; i++) {
        const randomCoupon = activeCoupons[Math.floor(Math.random() * activeCoupons.length)];
        setWinner(randomCoupon);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Pilih pemenang final
      const finalWinner = activeCoupons[Math.floor(Math.random() * activeCoupons.length)];
      setWinner(finalWinner);
      
      // Update status kupon
      await updateCouponStatus(finalWinner.id, 'drawn');
      
      // Reload data
      await loadCoupons();
    } catch (error) {
      console.error('Error during draw:', error);
      setError('Gagal melakukan undian. Silakan coba lagi.');
    } finally {
      setIsDrawing(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data kupon?')) {
      try {
        setLoading(true);
        await clearAllCoupons();
        setCoupons([]);
        setDrawHistory([]);
        setWinner(null);
        setError('');
      } catch (error) {
        console.error('Error resetting coupons:', error);
        setError('Gagal menghapus data kupon');
      } finally {
        setLoading(false);
      }
    }
  };

  const activeCoupons = coupons.filter(c => c.status === 'active');
  const totalCoupons = coupons.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Kelola kupon dan lakukan undian berhadiah</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-700 flex items-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Memuat data...
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Kupon</p>
              <p className="text-3xl font-bold text-blue-600">{totalCoupons}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Kupon Aktif</p>
              <p className="text-3xl font-bold text-green-600">{activeCoupons.length}</p>
            </div>
            <Gift className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Sudah Diundi</p>
              <p className="text-3xl font-bold text-orange-600">{drawHistory.length}</p>
            </div>
            <Trophy className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tingkat Partisipasi</p>
              <p className="text-3xl font-bold text-purple-600">
                {totalCoupons > 0 ? Math.round((drawHistory.length / totalCoupons) * 100) : 0}%
              </p>
            </div>
            <Crown className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Drawing Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Draw Controls */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Undian Kupon</h2>
            
            {winner && (
              <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-center text-xl font-bold text-gray-900 mb-2">🎉 SELAMAT! 🎉</h3>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">{winner.name}</p>
                  <p className="text-gray-600">{winner.email}</p>
                  <p className="text-sm text-gray-500">Kupon #{winner.coupon_number}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleDraw}
                disabled={isDrawing || activeCoupons.length === 0}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
              >
                {isDrawing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Shuffle className="h-5 w-5" />}
                <span>{isDrawing ? 'Mengundi...' : 'Mulai Undian'}</span>
              </button>
              
              <button
                onClick={loadCoupons}
                disabled={loading}
                className="px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {activeCoupons.length === 0 && (
              <p className="text-center text-gray-500 mt-4">Tidak ada kupon aktif untuk diundi</p>
            )}
          </div>

          {/* Active Coupons List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kupon Aktif ({activeCoupons.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeCoupons.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Tidak ada kupon aktif</p>
              ) : (
                activeCoupons.map((coupon) => (
                  <div key={coupon.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                        {coupon.coupon_number}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{coupon.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{coupon.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{coupon.phone}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(coupon.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Draw History */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 text-orange-600 mr-2" />
              Riwayat Pemenang
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {drawHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Belum ada pemenang</p>
              ) : (
                drawHistory.reverse().map((winner, _) => (
                  <div key={winner.id} className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-gray-900">{winner.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">#{winner.coupon_number}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(winner.drawn_at!).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Admin</h3>
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menghapus...' : 'Reset Semua Data'}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Hati-hati! Aksi ini akan menghapus semua data kupon dan tidak dapat dikembalikan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;