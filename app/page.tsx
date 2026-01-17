import { createClient } from './utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface Peserta {
  id: string;
  nama: string;
  bin_binti: string;
  jenis_kelamin: string;
  pekerjaan?: string;
  kelompok?: string;
  tanggal_lahir: string;
  avatar_url?: string;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string }>;
}) {
  const supabase = await createClient()
  const { gender } = await searchParams

  // 1. Ambil data Auth User (Termasuk Metadata)
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Cek Status Admin Langsung dari Auth Metadata
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

  // 3. Ambil Profil Peserta spesifik untuk User yang sedang login
  let userProfileName = null;
  if (user) {
    const { data: profile } = await supabase
      .from('peserta')
      .select('nama')
      .eq('id', user.id)
      .single();
    
    userProfileName = profile?.nama;
  }

  // 4. Logika Sapaan Dinamis
  const userName = userProfileName || user?.user_metadata?.nama || user?.email?.split('@')[0]

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  // 5. Query untuk daftar peserta
  let query = supabase
    .from('peserta')
    .select('id, nama, bin_binti, jenis_kelamin, pekerjaan, kelompok, tanggal_lahir, avatar_url')
    .eq('is_visible', true)

  if (gender === 'Laki-laki' || gender === 'Perempuan') {
    query = query.eq('jenis_kelamin', gender)
  }

  const { data: peserta, error } = await query.order('created_at', { ascending: false });

  const hitungUmur = (tanggalLahir: string) => {
    if (!tanggalLahir) return '??'
    const birthDate = new Date(tanggalLahir)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  if (error) console.error('Error fetching data:', error.message);

  return (
    <main className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-900 tracking-tight">Permata</h1>
          <p className="text-emerald-700 font-medium italic">
            {user ? (
              <span>Selamat Datang, <span className="text-emerald-900 font-black">{userName}</span> ✨</span>
            ) : (
              "Database Taaruf Terpusat"
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              {/* Navigasi Admin */}
              {isAdmin && (
                <div className="flex items-center gap-2 mr-2 pr-4 border-r border-gray-200">
                  <Link href="/admin/dashboard" className="bg-amber-50 text-amber-700 border border-amber-200 px-5 py-3 rounded-full font-bold hover:bg-amber-100 transition-all shadow-sm text-sm flex items-center gap-2">
                    📊 Dashboard
                  </Link>
                  <Link href="/admin/tim-perkawinan" className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-5 py-3 rounded-full font-bold hover:bg-indigo-100 transition-all shadow-sm text-sm flex items-center gap-2">
                    🤝 Tim Perkawinan
                  </Link>
                </div>
              )}

              <form action={handleSignOut}>
                <button type="submit" className="bg-white text-rose-600 border border-rose-100 px-6 py-3 rounded-full font-bold hover:bg-rose-50 transition-all shadow-sm text-sm">
                  Keluar Akun
                </button>
              </form>

              {/* Logika Ganti Tombol ke Label Admin */}
              {isAdmin ? (
                <div className="bg-emerald-100 text-emerald-800 px-8 py-3 rounded-full font-black shadow-sm flex items-center gap-2 text-sm uppercase tracking-widest border border-emerald-200">
                  🛡️ Admin
                </div>
              ) : (
                <Link href="/peserta/akun" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg active:scale-95 flex items-center gap-2 text-sm">
                  👤 Profil Saya
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="bg-white text-emerald-700 border border-emerald-200 px-6 py-3 rounded-full font-bold hover:bg-emerald-50 transition-all shadow-sm text-sm">Masuk</Link>
              <Link href="/register" className="bg-white text-emerald-600 border border-emerald-600 px-6 py-3 rounded-full font-bold hover:bg-emerald-50 transition-all shadow-sm text-sm">Daftar Sekarang</Link>
            </>
          )}
        </div>
      </div>

      {/* SISTEM FILTER VISUAL */}
      <div className="flex flex-wrap gap-3 mb-8 bg-white p-2 rounded-2xl w-fit shadow-sm border border-emerald-50">
        <Link href="/" className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!gender ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-700 hover:bg-emerald-50'}`}>Semua</Link>
        <Link href="/?gender=Laki-laki" className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${gender === 'Laki-laki' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-50'}`}>Ikhwan</Link>
        <Link href="/?gender=Perempuan" className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${gender === 'Perempuan' ? 'bg-rose-500 text-white shadow-md' : 'text-rose-700 hover:bg-rose-50'}`}>Akhwat</Link>
      </div>

      {/* GRID DISPLAY */}
      {!peserta || peserta.length === 0 ? (
        <div className="p-20 border-2 border-dashed border-emerald-200 rounded-3xl text-center bg-white shadow-sm">
          <p className="text-emerald-800 text-xl font-medium italic">Data tidak ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {peserta.map((p: Peserta) => (
            <Link key={p.id} href={`/peserta/${p.id}`} className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-emerald-50 group flex flex-col cursor-pointer">
              <div className="relative h-56 bg-emerald-50 flex items-center justify-center overflow-hidden">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-emerald-200 text-7xl font-black uppercase select-none">{p.nama ? p.nama.charAt(0) : '?'}</span>
                    <span className="text-emerald-600 text-[10px] font-bold mt-2 uppercase tracking-widest opacity-40">Tanpa Foto</span>
                  </div>
                )}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${
                  p.jenis_kelamin === 'Laki-laki' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  {p.jenis_kelamin === 'Laki-laki' ? 'Ikhwan' : 'Akhwat'}
                </div>
              </div>

              <div className="p-6 grow">
                <h2 className="font-bold text-2xl text-gray-800 mb-1 truncate capitalize">{p.nama || "Tanpa Nama"}</h2>
                <p className="text-xs text-emerald-600 font-bold mb-4 border-b border-emerald-50 pb-2 italic">
                  {p.jenis_kelamin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || "---"}
                </p>
                <div className="space-y-3 text-[13px] text-gray-600 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Umur: <span className="text-gray-900 font-bold">{hitungUmur(p.tanggal_lahir)} Tahun</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="truncate">Kelompok: <span className="text-gray-900 font-bold">{p.kelompok || '-'}</span></span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-100/50 border-t border-gray-100 flex justify-between items-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <span className="text-[10px] font-bold tracking-widest uppercase">Lihat Detail</span>
                <span className="font-bold transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}