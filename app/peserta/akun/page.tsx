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
      // 1. Ambil data user auth lengkap dengan metadata
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)

      // 2. SINKRONISASI ID: Menggunakan .eq('id', user.id)
      // Ini memastikan data yang diambil adalah baris yang dibuat saat register tadi
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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
    </div>
  )

  // Nama sapaan diambil dari metadata auth yang diisi saat register
  const displayName = user?.user_metadata?.nama || user?.email?.split('@')[0]

  // Daftar kolom tampilan disesuaikan dengan skema tabel peserta
  const displayFields = [
    'nama', 'bin_binti', 'jenis_kelamin', 'status', 'tempat_lahir', 'tanggal_lahir',
    'anak_ke', 'jumlah_saudara', 'suku', 'tinggi_badan', 'berat_badan', 'pendidikan_terakhir',
    'pekerjaan', 'nomor_telepon', 'hobby', 'dapukan', 'kelompok', 'desa', 'daerah',
    'alamat_lengkap', 'kriteria_calon_pasangan'
  ]

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-emerald-800 p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Akun Terverifikasi</p>
              <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-2">
                {displayName} <span className="text-sm normal-case font-medium opacity-70">({user?.email})</span>
              </h1>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => router.push('/')}
                className="flex-1 md:flex-none bg-emerald-900/50 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs hover:bg-emerald-700 transition border border-emerald-700/50 flex items-center justify-center gap-2"
              >
                ← Kembali
              </button>
              <button 
                onClick={() => router.push('/peserta/profil')}
                className="flex-1 md:flex-none bg-white text-emerald-800 px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-emerald-50 transition shadow-lg"
              >
                {profile?.tanggal_lahir ? 'Ubah Profil' : 'Lengkapi Profil ✨'}
              </button>
            </div>
          </div>
        </div>

        {/* Peringatan jika data utama (seperti tanggal lahir) belum diisi */}
        {(!profile || !profile.tanggal_lahir) && (
          <div className="m-8 p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="text-amber-900 font-bold text-sm uppercase">Biodata Belum Lengkap</p>
              <p className="text-amber-700 text-xs italic">
                Halo {displayName}, akun Anda sudah aktif. Silakan lengkapi biodata Taaruf agar data Anda muncul di halaman utama.
              </p>
            </div>
          </div>
        )}

        {/* Data Grid dari Database */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {displayFields.map((field) => (
            <div key={field} className="border-b border-gray-50 pb-2 group">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">
                {field.replace(/_/g, ' ')}
              </p>
              
              <p className={`font-bold mt-1 ${profile?.[field] ? 'text-gray-700' : 'text-gray-300 italic text-sm'}`}>
                {/* Logika khusus untuk menampilkan "Anak ke X dari Y bersaudara" */}
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