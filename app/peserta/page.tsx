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

  let userProfile = null;
  if (user) {
    const { data: profile } = await supabase
      .from('peserta')
      .select('nama, jenis_kelamin')
      .eq('id', user.id)
      .single();
    userProfile = profile;
  }
  
  const userName = userProfile?.nama || user?.user_metadata?.nama || user?.email?.split('@')[0]
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  // --- LOGIKA FILTER OTOMATIS ---
  let query = supabase
    .from('peserta')
    .select('id, nama, bin_binti, jenis_kelamin, pekerjaan, kelompok, tanggal_lahir, avatar_url')
    .eq('is_visible', true)

  if (!isAdmin) {
    if (userProfile?.jenis_kelamin === 'Laki-laki') {
      query = query.eq('jenis_kelamin', 'Perempuan')
    } else if (userProfile?.jenis_kelamin === 'Perempuan') {
      query = query.eq('jenis_kelamin', 'Laki-laki')
    }
  }

  // Filter manual tetap aktif untuk Admin
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
    <main className="min-h-screen bg-slate-50 pb-32 relative overflow-x-hidden text-slate-900">
      <div className="absolute top-0 left-0 w-full h-72 bg-linear-to-b from-emerald-500/10 to-transparent -z-10"></div>
      
      <Navbar userName={userName} isAdmin={isAdmin} handleSignOut={handleSignOut} />

      <div className="px-4 py-6 max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Temukan Jodohmu Di sini</h1>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest opacity-70">Database Peserta Permata</p>
        </header>

        {/* Kondisi: Hanya tampilkan Tombol Filter jika user adalah ADMIN */}
        {isAdmin && (
          <div className="flex bg-white/50 backdrop-blur-md p-1 rounded-full border border-white/80 shadow-sm w-fit mb-8 animate-in fade-in duration-500">
            <Link href="/peserta" className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${!gender ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-700'}`}>Semua</Link>
            <Link href="/peserta?gender=Laki-laki" className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${gender === 'Laki-laki' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700'}`}>Ikhwan</Link>
            <Link href="/peserta?gender=Perempuan" className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${gender === 'Perempuan' ? 'bg-rose-500 text-white shadow-md' : 'text-rose-700'}`}>Akhwat</Link>
          </div>
        )}

        {!peserta || peserta.length === 0 ? (
          <div className="p-16 border-2 border-dashed border-emerald-200 rounded-3xl text-center bg-white/30 backdrop-blur-sm">
            <p className="text-emerald-800 text-sm font-bold italic">Belum ada peserta yang tersedia untuk saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {peserta.map((p: Peserta) => (
              <div key={p.id} className="bg-white rounded-4xl overflow-hidden shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col transition-transform active:scale-[0.98]">
                
                <div className="relative h-48 overflow-hidden">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-50 to-teal-100 flex items-center justify-center text-5xl font-black text-emerald-200">
                      {p.nama?.charAt(0)}
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest backdrop-blur-md text-white ${
                    p.jenis_kelamin === 'Laki-laki' ? 'bg-blue-500/80' : 'bg-rose-500/80'
                  }`}>
                    {p.jenis_kelamin === 'Laki-laki' ? 'Ikhwan' : 'Akhwat'}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 text-slate-900">
                  <h4 className="font-black text-base text-slate-800 truncate capitalize leading-tight">{p.nama}</h4>
                  <p className="text-[10px] text-emerald-600 font-bold mb-3 italic opacity-70 tracking-tighter">
                    {p.jenis_kelamin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || "---"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[8px] text-slate-400 block uppercase font-black tracking-tighter">Umur</span>
                      <span className="text-xs font-black text-slate-700">{hitungUmur(p.tanggal_lahir)} Tahun</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[8px] text-slate-400 block uppercase font-black tracking-tighter">Kelompok</span>
                      <span className="text-xs font-black text-slate-700 truncate block">{p.kelompok || '-'}</span>
                    </div>
                  </div>

                  <Link 
                    href={`/peserta/${p.id}`} 
                    className="mt-auto w-full bg-emerald-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-colors"
                  >
                    Lihat Detail Lengkap
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}