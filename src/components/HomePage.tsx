import React, { useState } from 'react';
import { Gift, Users, Clock, CheckCircle, AlertCircle, Trophy, Crown, Calendar } from 'lucide-react';
import { getCoupons, addCoupon, subscribeToCoupons } from '../utils/storage';
import { Coupon } from '../lib/supabase';

const HomePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Load coupons on component mount
  React.useEffect(() => {
    const loadCoupons = async () => {
      try {
        const data = await getCoupons();
        setCoupons(data);
      } catch (error) {
        console.error('Error loading coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();

    // Subscribe to real-time updates
    const subscription = subscribeToCoupons((updatedCoupons) => {
      setCoupons(updatedCoupons);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validasi
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Semua field harus diisi!');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Format email tidak valid!');
      return;
    }

    if (!/^[\d\+\-\s\(\)]{10,}$/.test(formData.phone)) {
      setError('Format nomor telepon tidak valid!');
      return;
    }

    try {
      // Tambah kupon baru
      await addCoupon({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '' });
      
      // Reload coupons
      const updatedCoupons = await getCoupons();
      setCoupons(updatedCoupons);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const activeCoupons = coupons.filter(c => c.status === 'active');
  const drawnCoupons = coupons.filter(c => c.status === 'drawn');
  const recentWinners = drawnCoupons.slice(-5).reverse(); // 5 pemenang terbaru

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-4 rounded-full shadow-lg">
            <Gift className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Dapatkan Kupon <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">Berhadiah</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Daftarkan diri Anda sekarang untuk mendapatkan kesempatan memenangkan hadiah menarik!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Winner Announcement - Full Width */}
        {recentWinners.length > 0 && (
          <div className="lg:col-span-3 mb-8">
            <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-xl shadow-lg border-2 border-yellow-200 p-8">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full shadow-lg">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  🎉 Selamat kepada Para Pemenang! 🎉
                </h2>
                <p className="text-lg text-gray-700">
                  Berikut adalah daftar pemenang undian kupon terbaru
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {recentWinners.map((winner, index) => (
                  <div key={winner.id} className="bg-white rounded-lg shadow-md border border-yellow-200 p-4 transform hover:scale-105 transition-all duration-200">
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <div className={`p-2 rounded-full ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                        }`}>
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{winner.name}</h3>
                      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2">
                        Kupon #{winner.coupon_number}
                      </div>
                      <div className="flex items-center justify-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(winner.drawn_at!).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {drawnCoupons.length > 5 && (
                <div className="text-center mt-6">
                  <p className="text-gray-600">
                    Dan {drawnCoupons.length - 5} pemenang lainnya...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registration Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              Daftar Kupon Gratis
            </h2>

            {isSubmitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800">Berhasil Terdaftar!</h4>
                  <p className="text-green-700">Kupon Anda telah berhasil didaftarkan. Tunggu pengumuman pemenang!</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="contoh@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="08123456789"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Mendaftar...' : 'Daftar Kupon Sekarang'}
              </button>
            </form>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              Statistik Kupon
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800 font-medium">Total Kupon</span>
                <span className="text-2xl font-bold text-blue-600">{coupons.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800 font-medium">Kupon Aktif</span>
                <span className="text-2xl font-bold text-green-600">{activeCoupons.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-orange-800 font-medium">Sudah Diundi</span>
                <span className="text-2xl font-bold text-orange-600">{drawnCoupons.length}</span>
              </div>
            </div>
            
            {recentWinners.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-800 font-medium text-sm">Pemenang Terbaru</span>
                  <Trophy className="h-4 w-4 text-yellow-600" />
                </div>
                <p className="text-yellow-700 font-semibold mt-1">{recentWinners[0].name}</p>
                <p className="text-yellow-600 text-xs">Kupon #{recentWinners[0].coupon_number}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cara Ikut Undian
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <p className="text-gray-700">Isi form pendaftaran dengan data yang benar</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <p className="text-gray-700">Dapatkan nomor kupon unik</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <p className="text-gray-700">Tunggu pengumuman pemenang</p>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">
                Admin? Akses melalui <code className="bg-gray-100 px-1 py-0.5 rounded">/admin</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;