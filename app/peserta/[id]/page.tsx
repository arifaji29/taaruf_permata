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

  const { data: { user } } = await supabase.auth.getUser()
  
  let userProfile = null
  if (user) {
    const { data } = await supabase.from('peserta').select('id, jenis_kelamin').eq('id', user.id).single()
    userProfile = data
  }

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

  const isAdmin = user?.app_metadata?.role === 'admin'
  const isOwner = user?.id === id
  const isIkhwan = userProfile?.jenis_kelamin === 'Laki-laki'
  const isTargetPerempuan = p.jenis_kelamin === 'Perempuan'
  const tampilkanTombol = user && !isAdmin && !isOwner && isIkhwan && isTargetPerempuan

  let statusMinatId: string | null = null
  if (user && !isAdmin) {
    const { data: statusMinat } = await supabase.from('admin_peserta').select('id').eq('pengirim_id', user.id).eq('target_id', id).maybeSingle() 
    statusMinatId = statusMinat?.id || null
  }

  async function handleToggleTertarik() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id === id) return
    const { data: currentMinat } = await supabase.from('admin_peserta').select('id').eq('pengirim_id', user.id).eq('target_id', id).maybeSingle()

    if (currentMinat) {
      await supabase.from('admin_peserta').delete().eq('id', currentMinat.id)
    } else {
      await supabase.from('admin_peserta').insert([{ pengirim_id: user.id, target_id: id, status: 'menunggu_mediasi' }])
    }
    revalidatePath(`/peserta/${id}`)
  }

  const hitungUmur = (tanggalLahir: string) => {
    if (!tanggalLahir) return '??'
    const lahir = new Date(tanggalLahir); const hariIni = new Date();
    let umur = hariIni.getFullYear() - lahir.getFullYear();
    if (hariIni.getMonth() < lahir.getMonth() || (hariIni.getMonth() === lahir.getMonth() && hariIni.getDate() < lahir.getDate())) umur--
    return umur
  }

  const formatTanggal = (dateString: string) => {
    if (!dateString) return '-'
    const [year, month, day] = dateString.split('-')
    return `${day}-${month}-${year}`
  }

  const listPendamping = [p.tim_kelompok, p.tim_desa, p.tim_daerah].filter(Boolean)

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Header Profil Kompak */}
        <div className="relative h-60 bg-emerald-800 flex flex-col items-center justify-center">
          {p.avatar_url && <img src={p.avatar_url} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[2px]" alt="" />}
          <Link href="/peserta" className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-widest z-10">
            ← Kembali
          </Link>
          <div className="relative z-10 text-center text-white px-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto mb-3 border border-white/30 overflow-hidden flex items-center justify-center text-3xl font-black shadow-lg">
              {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.nama?.charAt(0)}
            </div>
            <h1 className="text-2xl font-black capitalize tracking-tight leading-tight">{p.nama}</h1>
            <p className="text-[10px] font-bold opacity-80 italic text-emerald-100">
              {p.jenis_kelamin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || '---'}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Tombol Tertarik Kompak */}
          {tampilkanTombol && (
            <form action={handleToggleTertarik} className="mb-8">
              <button type="submit" className={`w-full py-3 rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${
                statusMinatId ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}>
                <span>{statusMinatId ? '✅' : '❤️'}</span> 
                {statusMinatId ? 'Minat Terkirim (Batalkan)' : 'Saya Tertarik (Rahasia)'}
              </button>
            </form>
          )}

          {/* Biodata Grid Kompak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-gray-50 pb-8">
            <div className="space-y-2.5">
              <h3 className="text-emerald-800 font-black border-b border-emerald-50 pb-1.5 uppercase text-[9px] tracking-widest">Informasi Personal</h3>
              <div className="space-y-2 text-[11px]">
                <p className="flex justify-between text-gray-500"><span>Lahir:</span> <b className="text-gray-900">{p.tempat_lahir}, {formatTanggal(p.tanggal_lahir)}</b></p>
                <p className="flex justify-between text-gray-500"><span>Umur / Status:</span> <b className="text-gray-900">{hitungUmur(p.tanggal_lahir)} Thn / {p.status}</b></p>
                <p className="flex justify-between text-gray-500"><span>Tinggi / Berat:</span> <b className="text-gray-900">{p.tinggi_badan}cm / {p.berat_badan}kg</b></p>
                <p className="flex justify-between text-gray-500"><span>Suku:</span> <b className="text-gray-900">{p.suku}</b></p>
                <p className="flex justify-between text-gray-500"><span>Anak Ke:</span> <b className="text-gray-900">{p.anak_ke} dari {p.jumlah_saudara}</b></p>
                <p className="flex justify-between text-gray-500"><span>Pendidikan:</span> <b className="text-gray-900">{p.pendidikan_terakhir}</b></p>
                <p className="flex justify-between text-gray-500"><span>Pekerjaan:</span> <b className="text-gray-900">{p.pekerjaan}</b></p>
                <p className="flex justify-between text-gray-500"><span>Hobby:</span> <b className="text-gray-900 capitalize">{p.hobby}</b></p>
                <p className="flex flex-col text-gray-500"><span>Alamat:</span> <b className="text-gray-900 mt-0.5">{p.alamat_lengkap}</b></p>
              </div>
            </div>

            <div className="space-y-2.5 h-fit">
              <h3 className="text-emerald-800 font-black border-b border-emerald-50 pb-1.5 uppercase text-[9px] tracking-widest">Informasi Sambung</h3>
              <div className="space-y-2 text-[11px]">
                <p className="flex justify-between text-gray-500"><span>Dapukan:</span> <b className="text-gray-900">{p.dapukan}</b></p>
                <p className="flex justify-between text-gray-500"><span>Kelompok:</span> <b className="text-gray-900">{p.kelompok}</b></p>
                <p className="flex justify-between text-gray-500"><span>Desa / Daerah:</span> <b className="text-gray-900">{p.desa} / {p.daerah}</b></p>
              </div>
            </div>
          </div>

          {/* Kriteria Kompak */}
          <div className="bg-emerald-50/50 p-4 rounded-xl mb-8 border border-emerald-100">
              <h3 className="text-emerald-900 font-black text-[9px] uppercase mb-2 tracking-widest">Kriteria Pasangan:</h3>
              <p className="text-emerald-800 text-xs italic leading-relaxed font-medium">"{p.kriteria_calon_pasangan || 'Tidak ada kriteria khusus'}"</p>
          </div>

          {/* Tim Perkawinan Kompak */}
          <div className="space-y-3">
            <h3 className="text-center text-gray-400 font-black uppercase text-[9px] tracking-[0.2em] mb-4">Hubungi Tim Perkawinan</h3>
            {listPendamping.map((tim: any, index: number) => (
              <div key={index} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 hover:bg-emerald-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0">
                    {tim.nama?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] text-gray-400 font-black uppercase leading-none mb-1">{tim.dapukan}</p>
                    <p className="font-bold text-gray-800 text-sm truncate">{tim.nama}</p>
                  </div>
                </div>
                <a href={`https://wa.me/${tim.nomor_telepon?.replace(/\D/g, '')}?text=${encodeURIComponent(`Bismillah, mohon arahan mengenai profil ${p.nama}.`)}`} 
                   target="_blank" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase shadow-sm shrink-0">
                  WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}