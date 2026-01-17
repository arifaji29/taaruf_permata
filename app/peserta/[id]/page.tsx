import { createClient } from '../../utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function DetailPeserta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Ambil data user login & profilnya sendiri
  const { data: { user } } = await supabase.auth.getUser()
  
  let userProfile = null
  if (user) {
    const { data } = await supabase
      .from('peserta')
      .select('id, jenis_kelamin')
      .eq('id', user.id) 
      .single()
    userProfile = data
  }

  // 2. Fetch data peserta yang sedang dilihat
  const { data: p, error } = await supabase
    .from('peserta')
    .select(`
      *,
      tim_kelompok:tim_kelompok_id ( nama, nomor_telepon, dapukan ),
      tim_desa:tim_desa_id ( nama, nomor_telepon, dapukan ),
      tim_daerah:tim_daerah_id ( nama, nomor_telepon, dapukan )
    `)
    .eq('id', id)
    .single()

  if (error || !p) return notFound()

  // --- LOGIKA PEMBATASAN TOMBOL ---
  const isAdmin = user?.app_metadata?.role === 'admin'
  const isOwner = user?.id === id
  const isIkhwan = userProfile?.jenis_kelamin === 'Laki-laki'
  const isTargetPerempuan = p.jenis_kelamin === 'Perempuan'
  
  // Tombol HANYA muncul jika: Login + Bukan Admin + Bukan Profil Sendiri + Pengirim Laki-laki + Target Perempuan
  const tampilkanTombol = user && !isAdmin && !isOwner && isIkhwan && isTargetPerempuan

  // 3. Cek Status Ketertarikan Terkini (Logika Toggle)
  let statusMinatId: string | null = null
  if (user && !isAdmin) {
    const { data: statusMinat } = await supabase
        .from('admin_peserta')
        .select('id')
        .eq('pengirim_id', user.id) 
        .eq('target_id', id)
        .maybeSingle() 
    
    statusMinatId = statusMinat?.id || null
  }

  // 4. Server Action: Toggle Tertarik (Batal / Simpan)
  async function handleToggleTertarik() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.app_metadata?.role === 'admin' || user.id === id) return

    const { data: currentMinat } = await supabase
        .from('admin_peserta')
        .select('id')
        .eq('pengirim_id', user.id)
        .eq('target_id', id)
        .maybeSingle()

    if (currentMinat) {
      await supabase.from('admin_peserta').delete().eq('id', currentMinat.id)
    } else {
      await supabase.from('admin_peserta').insert([
        { pengirim_id: user.id, target_id: id, status: 'menunggu_mediasi' }
      ])
    }

    revalidatePath(`/peserta/${id}`)
  }

  // --- HELPER FUNCTIONS (TETAP DIJAGA) ---
  const hitungUmur = (tanggalLahir: string) => {
    if (!tanggalLahir) return '??'
    const lahir = new Date(tanggalLahir)
    const hariIni = new Date()
    let umur = hariIni.getFullYear() - lahir.getFullYear()
    const m = hariIni.getMonth() - lahir.getMonth()
    if (m < 0 || (m === 0 && hariIni.getDate() < lahir.getDate())) umur--
    return umur
  }

  const formatTanggal = (dateString: string) => {
    if (!dateString) return '-'
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}`
  }

  const listPendamping = [p.tim_kelompok, p.tim_desa, p.tim_daerah].filter(Boolean)

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Profil */}
        <div className="relative h-80 bg-emerald-800 flex flex-col items-center justify-center overflow-hidden">
          {p.avatar_url && (
             <img src={p.avatar_url} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" alt="" />
          )}
          <Link href="/" className="absolute top-6 left-6 bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all text-sm font-bold z-10">
            ← Kembali
          </Link>
          <div className="relative z-10 text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-3xl mx-auto mb-4 border border-white/30 overflow-hidden flex items-center justify-center text-4xl font-black shadow-lg">
              {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.nama?.charAt(0)}
            </div>
            <h1 className="text-4xl font-bold capitalize tracking-tight">{p.nama}</h1>
            <p className="opacity-80 italic text-emerald-100">
              {p.jenis_kelamin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || '---'}
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* AREA TOMBOL (Hanya muncul jika syarat terpenuhi) */}
          {tampilkanTombol && (
            <form action={handleToggleTertarik} className="mb-10">
              <button 
                type="submit"
                className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 ${
                  statusMinatId 
                  ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200' 
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-100'
                }`}
              >
                <span className="text-xl">{statusMinatId ? '✅' : '❤️'}</span> 
                {statusMinatId ? 'Minat Telah Terkirim (Klik untuk Batal)' : 'Saya Tertarik (Rahasia)'}
              </button>
            </form>
          )}

          {/* --- DATA BIODATA (SEMUA TETAP ADA) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 border-b border-gray-50 pb-12">
            <div className="space-y-4">
              <h3 className="text-emerald-800 font-bold border-b pb-2 uppercase text-[10px] tracking-[0.2em]">Informasi Personal</h3>
              <p className="flex justify-between text-sm text-gray-600">
                <span>Tempat, Tanggal Lahir:</span> 
                <b className="text-gray-900">{p.tempat_lahir || '-'}, {formatTanggal(p.tanggal_lahir)}</b>
              </p>
              <p className="flex justify-between text-sm text-gray-600"><span>Umur:</span> <b className="text-gray-900">{hitungUmur(p.tanggal_lahir)} Tahun</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Status:</span> <b className="text-gray-900">{p.status || '-'}</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Tinggi / Berat:</span> <b className="text-gray-900">{p.tinggi_badan}cm / {p.berat_badan}kg</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Suku:</span> <b className="text-gray-900">{p.suku || '-'}</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Anak Ke:</span> <b className="text-gray-900">{p.anak_ke} dari {p.jumlah_saudara || '?'} bersaudara</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Pendidikan:</span> <b className="text-gray-900">{p.pendidikan_terakhir || '-'}</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Pekerjaan:</span> <b className="text-gray-900">{p.pekerjaan || '-'}</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Hobby:</span> <b className="text-gray-900 capitalize">{p.hobby || '-'}</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Alamat:</span> <b className="text-gray-900 text-right">{p.alamat_lengkap || '-'}</b></p>
            </div>

            <div className="space-y-4">
              <h3 className="text-emerald-800 font-bold border-b pb-2 uppercase text-[10px] tracking-[0.2em]">Informasi Sambung</h3>
              <p className="flex justify-between text-sm text-gray-600"><span>Dapukan:</span> <b className="text-gray-900">{p.dapukan || '-'}</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Kelompok:</span> <b className="text-gray-900">{p.kelompok || '-'}</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Desa:</span> <b className="text-gray-900">{p.desa || '-'}</b></p>
              <p className="flex justify-between text-sm text-gray-600"><span>Daerah:</span> <b className="text-gray-900">{p.daerah || '-'}</b></p>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl mb-12 border border-emerald-100">
              <h3 className="text-emerald-900 font-bold text-xs uppercase mb-3 tracking-wider">Kriteria Pasangan:</h3>
              <p className="text-emerald-800 text-sm italic leading-relaxed font-medium">"{p.kriteria_calon_pasangan || 'Tidak ada kriteria khusus'}"</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-center text-gray-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Hubungi Tim Perkawinan</h3>
            <div className="grid grid-cols-1 gap-4">
              {listPendamping.map((tim: any, index: number) => {
                const waNumber = tim.nomor_telepon?.replace(/\D/g, '') || '';
                const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Bismillah, saya tertarik dengan profil ${p.nama} (ID: ${p.id}). Mohon arahan Bapak/Ibu.`)}`;
                return (
                  <div key={index} className="bg-gray-50 border border-gray-100 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center gap-4 text-left w-full md:w-auto">
                      <div className="bg-emerald-100 text-emerald-700 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black">
                        {tim.nama?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{tim.dapukan}</p>
                        <p className="font-bold text-gray-800 text-lg">{tim.nama}</p>
                      </div>
                    </div>
                    <a href={waLink} target="_blank" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl text-center text-sm">
                      Hubungi via WhatsApp
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}