'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'

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

      const { data, error } = await supabase
        .from('peserta')
        .select('*')
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

  const displayFields = [
    'nama', 'bin_binti', 'jenis_kelamin', 'status', 'tempat_lahir', 'tanggal_lahir',
    'anak_ke', 'jumlah_saudara', 'suku', 'tinggi_badan', 'berat_badan', 'pendidikan_terakhir',
    'pekerjaan', 'nomor_telepon', 'hobby', 'dapukan', 'kelompok', 'desa', 'daerah',
    'alamat_lengkap', 'kriteria_calon_pasangan'
  ]

  return (
    <main className="min-h-screen bg-gray-50 py-4 md:py-8 px-4 text-slate-900">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Header Section - Ditambahkan Foto Profil Kecil */}
        <div className="bg-emerald-800 p-5 md:p-6 text-white">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar/Foto Profil Kecil */}
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
                className="flex-1 bg-emerald-900/40 text-white py-2 rounded-xl font-bold uppercase text-[9px] border border-emerald-700/50 flex items-center justify-center gap-1 active:scale-95 transition-all"
              >
                ← Kembali
              </button>
              <button 
                onClick={() => router.push('/peserta/profil')}
                className="flex-1 bg-white text-emerald-800 py-2 rounded-xl font-black uppercase text-[9px] shadow-md active:scale-95 transition-all"
              >
                {profile?.tanggal_lahir ? 'Ubah Profil' : 'Lengkapi Profil'}
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
    </main>
  )
}