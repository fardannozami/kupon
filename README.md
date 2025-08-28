# Sistem Website Kupon dan Dashboard Admin

Website pembagian kupon dengan dashboard admin untuk mengundi kupon berhadiah. Sistem ini menggunakan Supabase sebagai database untuk data yang persisten dan production-ready.

## 🚀 Fitur Utama

### Untuk Pengguna
- **Pendaftaran Kupon**: Form pendaftaran yang mudah digunakan
- **Pengumuman Pemenang**: Melihat daftar pemenang terbaru
- **Statistik Real-time**: Melihat jumlah kupon aktif dan yang sudah diundi
- **Responsive Design**: Optimal di semua perangkat

### Untuk Admin
- **Dashboard Komprehensif**: Statistik lengkap dan manajemen kupon
- **Sistem Undian**: Undian otomatis dengan animasi menarik
- **Manajemen Data**: CRUD operations untuk semua kupon
- **Real-time Updates**: Data terupdate secara real-time
- **Akses Aman**: Login admin dengan URL tersembunyi

## 🛠️ Teknologi

- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 Setup Development

### 1. Clone Repository
```bash
git clone <repository-url>
cd sistem-kupon
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy file `.env.example` menjadi `.env`
3. Isi environment variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Setup Database

Jalankan migration files di Supabase SQL Editor:
1. `supabase/migrations/create_coupons_table.sql`
2. `supabase/migrations/add_reset_sequence_function.sql`

### 5. Run Development Server
```bash
npm run dev
```

## 🗄️ Database Schema

### Table: `coupons`
```sql
- id (uuid, primary key)
- coupon_number (integer, unique, auto-increment)
- name (text, not null)
- email (text, unique, not null)
- phone (text, not null)
- status (enum: 'active', 'drawn')
- created_at (timestamptz, default now())
- drawn_at (timestamptz, nullable)
```

### Security (RLS Policies)
- **Public Read**: Semua orang bisa melihat kupon
- **Public Insert**: Semua orang bisa mendaftar kupon
- **Admin Update/Delete**: Hanya authenticated users

## 🔐 Akses Admin

1. Buka URL: `http://localhost:5173/admin`
2. Login dengan kredensial:
   - Username: `admin`
   - Password: `admin123`

## 🚀 Production Deployment

### Environment Variables
Pastikan environment variables sudah diset:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Build
```bash
npm run build
```

### Deploy
Deploy folder `dist` ke hosting provider pilihan Anda.

## 📱 Fitur Real-time

Sistem menggunakan Supabase real-time subscriptions untuk:
- Update otomatis ketika ada kupon baru
- Sinkronisasi data antar tab/device
- Notifikasi pemenang real-time

## 🔧 Kustomisasi

### Mengubah Kredensial Admin
Edit file `src/components/AdminLogin.tsx`:
```typescript
if (credentials.username === 'your_username' && credentials.password === 'your_password') {
  onLogin();
}
```

### Mengubah Tema Warna
Edit file `tailwind.config.js` atau gunakan CSS custom di `src/index.css`.

## 📄 License

MIT License - Silakan gunakan untuk project komersial maupun personal.

## 🤝 Contributing

1. Fork repository
2. Buat feature branch
3. Commit changes
4. Push ke branch
5. Buat Pull Request

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini.