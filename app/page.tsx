import { createClient } from './utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'

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

  // 1. Ambil data Auth User
  const { data: { user } } = await supabase.auth.getUser()
  
  // 2. Cek Status Admin
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

  // 3. Ambil Profil Peserta
  let userProfileName = null;
  if (user) {
    const { data: profile } = await supabase
      .from('peserta')
      .select('nama')
      .eq('id', user.id)
      .single();
    
    userProfileName = profile?.nama;
  }

  const userName = userProfileName || user?.user_metadata?.nama || user?.email?.split('@')[0]

  // 4. Server Action untuk Logout
  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  // 5. Query data peserta
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
    <main className="min-h-screen bg-slate-50 pb-32 relative overflow-x-hidden">
      {/* Dekorasi Latar Belakang Glassmorphism */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-emerald-500/20 to-transparent -z-10"></div>
      <div className="absolute top-20 -right-20 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl -z-10 animate-pulse"></div>

      {/* Komponen Navigasi (Top & Bottom) */}
      <Navbar 
        userName={userName} 
        isAdmin={isAdmin} 
        handleSignOut={handleSignOut} 
      />

      {/* Hero Greeting Section */}
      <section className="px-6 pt-8 pb-4">
        <div className="backdrop-blur-xl bg-white/40 border border-white/60 p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-900/5 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-black text-slate-800 tracking-tighter leading-tight">
              {user ? (
                <>Assalamu'alaikum, <span className="text-emerald-700">{userName}</span> ✨</>
              ) : (
                <>Temukan Pasangan <br /><span className="text-emerald-700">Syar'i Anda</span></>
              )}
            </h2>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Konten Utama: Daftar Peserta */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Peserta Permata</h3>
          <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-sm">
            <Link href="/" className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${!gender ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-700'}`}>Semua</Link>
            <Link href="/?gender=Laki-laki" className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${gender === 'Laki-laki' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700'}`}>Ikhwan</Link>
            <Link href="/?gender=Perempuan" className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${gender === 'Perempuan' ? 'bg-rose-500 text-white shadow-md' : 'text-rose-700'}`}>Akhwat</Link>
          </div>
        </div>

        {/* Grid Display */}
        {!peserta || peserta.length === 0 ? (
          <div className="p-20 border-2 border-dashed border-emerald-200 rounded-[3rem] text-center bg-white/30 backdrop-blur-sm">
            <p className="text-emerald-800 font-bold italic">Belum ada data peserta.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {peserta.map((p: Peserta) => (
              <Link key={p.id} href={`/peserta/${p.id}`} className="group relative backdrop-blur-md bg-white/60 border border-white/80 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-emerald-900/10 transition-all duration-500 active:scale-[0.97]">
                <div className="relative h-60 overflow-hidden">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-50 to-teal-100 flex items-center justify-center text-6xl font-black text-emerald-200 select-none">
                      {p.nama?.charAt(0)}
                    </div>
                  )}
                  <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md text-white ${
                    p.jenis_kelamin === 'Laki-laki' ? 'bg-blue-500/80' : 'bg-rose-500/80'
                  }`}>
                    {p.jenis_kelamin === 'Laki-laki' ? 'Ikhwan' : 'Akhwat'}
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-black text-xl text-slate-800 truncate capitalize mb-1">{p.nama || "Tanpa Nama"}</h4>
                  <p className="text-[11px] text-emerald-600 font-bold mb-4 tracking-tighter italic opacity-70">
                    {p.jenis_kelamin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || "---"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 p-3 rounded-2xl border border-white/50 shadow-xs">
                      <span className="text-[9px] text-slate-400 block uppercase font-black tracking-tighter">Umur</span>
                      <span className="text-sm font-black text-slate-700">{hitungUmur(p.tanggal_lahir)} th</span>
                    </div>
                    <div className="bg-white/50 p-3 rounded-2xl border border-white/50 shadow-xs">
                      <span className="text-[9px] text-slate-400 block uppercase font-black tracking-tighter">Kelompok</span>
                      <span className="text-sm font-black text-slate-700 truncate block">{p.kelompok || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Tombol Lihat Selengkapnya (Hover Effect) */}
                <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 absolute bottom-0 left-0 right-0">
                  <span className="text-[10px] font-black uppercase tracking-widest">Lihat Detail Lengkap</span>
                  <span className="font-bold">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}