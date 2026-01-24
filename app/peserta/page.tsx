import { createClient } from '../utils/supabase/server'
import Link from 'next/link'
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

export default async function PesertaPage({
  searchParams,
}: {
  searchParams: Promise<{ gender?: string }>;
}) {
  const supabase = await createClient()
  const { gender } = await searchParams
  const { data: { user } } = await supabase.auth.getUser()

  // Ambil profil user untuk sapaan di Navbar jika perlu
  let userProfileName = null;
  if (user) {
    const { data: profile } = await supabase.from('peserta').select('nama').eq('id', user.id).single();
    userProfileName = profile?.nama;
  }
  const userName = userProfileName || user?.user_metadata?.nama || user?.email?.split('@')[0]
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  // Query data peserta dari tabel 'peserta'
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
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-emerald-500/10 to-transparent -z-10"></div>
      
      <Navbar userName={userName} isAdmin={isAdmin} handleSignOut={handleSignOut} />

      <div className="px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">Cari Jodoh</h1>
          <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest opacity-70">Database Peserta Permata</p>
        </header>

        {/* Filter Pill Section */}
        <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-sm w-fit mb-10">
          <Link href="/peserta" className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${!gender ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-700'}`}>Semua</Link>
          <Link href="/peserta?gender=Laki-laki" className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${gender === 'Laki-laki' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700'}`}>Ikhwan</Link>
          <Link href="/peserta?gender=Perempuan" className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${gender === 'Perempuan' ? 'bg-rose-500 text-white shadow-md' : 'text-rose-700'}`}>Akhwat</Link>
        </div>

        {/* Grid Display */}
        {!peserta || peserta.length === 0 ? (
          <div className="p-20 border-2 border-dashed border-emerald-200 rounded-[3rem] text-center bg-white/30 backdrop-blur-sm">
            <p className="text-emerald-800 font-bold italic">Belum ada peserta yang mempublikasikan biodata.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {peserta.map((p: Peserta) => (
              <Link key={p.id} href={`/peserta/${p.id}`} className="group relative backdrop-blur-md bg-white/60 border border-white/80 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 transition-all duration-500 active:scale-[0.97]">
                <div className="relative h-64 overflow-hidden">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.nama} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-50 to-teal-100 flex items-center justify-center text-7xl font-black text-emerald-200">
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
                  <h4 className="font-black text-xl text-slate-800 truncate capitalize mb-1">{p.nama}</h4>
                  <p className="text-[11px] text-emerald-600 font-bold mb-4 italic opacity-70 tracking-tighter">
                    {p.jenis_kelamin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || "---"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 p-3 rounded-2xl border border-white/50">
                      <span className="text-[9px] text-slate-400 block uppercase font-black tracking-tighter">Umur</span>
                      <span className="text-sm font-black text-slate-700">{hitungUmur(p.tanggal_lahir)} th</span>
                    </div>
                    <div className="bg-white/50 p-3 rounded-2xl border border-white/50">
                      <span className="text-[9px] text-slate-400 block uppercase font-black tracking-tighter">Kelompok</span>
                      <span className="text-sm font-black text-slate-700 truncate block">{p.kelompok || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-emerald-600 text-white flex justify-between items-center translate-y-full group-hover:translate-y-0 transition-all duration-300 absolute bottom-0 left-0 right-0">
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