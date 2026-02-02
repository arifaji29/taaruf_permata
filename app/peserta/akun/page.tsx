'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
// Impor ikon Lucide untuk estetika yang konsisten
import { ShieldCheck, Phone, MapPin, ArrowLeft, Edit3 } from 'lucide-react'

export default function AkunPeserta() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      // Mengambil data profil beserta detail petugas kelompok melalui relasi tim_kelompok_id
      const { data, error } = await supabase
        .from('peserta')
        .select(`*, tim_kelompok:tim_kelompok_id(*)`)
        .eq('id', user.id) 
        .maybeSingle() 
      
      if (error) console.error("Error fetching profile:", error.message)
      
      setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  )

  const displayName = user?.user_metadata?.nama || user?.email?.split('@')[0]

  // Fields utama tetap dipertahankan sesuai kode asli Anda
  const displayFields = [
    'nama', 'bin_binti', 'jenis_kelamin', 'status', 'tempat_lahir', 'tanggal_lahir',
    'anak_ke', 'jumlah_saudara', 'suku', 'tinggi_badan', 'berat_badan', 'pendidikan_terakhir',
    'pekerjaan', 'nomor_telepon', 'hobby', 'dapukan', 'kelompok', 'desa', 'daerah',
    'alamat_lengkap', 'kriteria_calon_pasangan'
  ]

  return (
    <main className="min-h-screen bg-gray-50 py-4 md:py-8 px-4 text-slate-900 font-sans">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Card Utama Profil */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-emerald-800 p-5 md:p-6 text-white">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-2xl border border-white/30 overflow-hidden shrink-0 flex items-center justify-center text-xl font-black shadow-inner backdrop-blur-sm">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    displayName?.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Akun Terverifikasi</p>
                  <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight truncate leading-tight">
                    {displayName}
                  </h1>
                  <p className="text-[10px] font-medium opacity-70 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => router.push('/')}
                  className="flex-1 bg-emerald-900/40 text-white py-2 rounded-xl font-bold uppercase text-[9px] border border-emerald-700/50 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <ArrowLeft size={12} strokeWidth={3} /> Beranda
                </button>
                <button 
                  onClick={() => router.push('/peserta/profil')}
                  className="flex-1 bg-white text-emerald-800 py-2 rounded-xl font-black uppercase text-[9px] shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit3 size={12} strokeWidth={3} /> {profile?.tanggal_lahir ? 'Ubah Profil' : 'Lengkapi Profil'}
                </button>
              </div>
            </div>
          </div>

          {(!profile || !profile.tanggal_lahir) && (
            <div className="m-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-amber-900 font-bold text-[10px] uppercase">Biodata Belum Lengkap</p>
                <p className="text-amber-700 text-[9px] leading-tight italic">
                  Silakan lengkapi biodata Taaruf agar data Anda muncul di halaman utama.
                </p>
              </div>
            </div>
          )}

          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {displayFields.map((field) => (
              <div key={field} className="border-b border-gray-50 pb-1.5 group">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                  {field.replace(/_/g, ' ')}
                </p>
                
                <p className={`font-bold text-xs mt-0.5 ${profile?.[field] ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                  {field === 'anak_ke' && profile?.anak_ke && profile?.jumlah_saudara
                    ? `${profile.anak_ke} dari ${profile.jumlah_saudara} bersaudara`
                    : profile?.[field]?.toString() || 'Belum diisi'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- BAGIAN TERPISAH: TIM PERKAWINAN KELOMPOK --- */}
        <div className="bg-white rounded-3xl shadow-lg border border-emerald-50 overflow-hidden">
          <div className="bg-emerald-50/50 px-5 py-3 border-b border-emerald-100 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" strokeWidth={3} />
            <h2 className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">Tim Perkawinan Kelompok</h2>
          </div>
          
          <div className="p-5 space-y-4">
            {profile?.tim_kelompok ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Nama Petugas</p>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                    {profile.tim_kelompok.nama}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-slate-400 uppercase">WhatsApp</p>
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Phone size={10} fill="currentColor" /> {profile.tim_kelompok.nomor_telepon}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1 pt-1 border-t border-gray-50">
                  <p className="text-[8px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <MapPin size={8} /> Alamat Petugas
                  </p>
                  <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                    {profile.tim_kelompok.alamat_lengkap || 'Alamat belum diisi'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-tighter">
                  Belum ada data petugas kelompok.
                </p>
                <p className="text-[9px] text-slate-400 mt-1 uppercase">
                  Silakan tambahkan melalui menu Ubah Profil.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}