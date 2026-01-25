'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '../../utils/supabase/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default function DetailPeserta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  
  const [p, setP] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isZoomed, setIsZoomed] = useState(false)
  const [statusMinatId, setStatusMinatId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const supabase = createClient()

  const loadData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    setUser(authUser)

    if (authUser) {
      const { data: prof } = await supabase.from('peserta').select('id, jenis_kelamin').eq('id', authUser.id).single()
      setUserProfile(prof)

      // Cek status minat
      const { data: statusMinat } = await supabase
        .from('admin_peserta')
        .select('id')
        .eq('pengirim_id', authUser.id)
        .eq('target_id', id)
        .maybeSingle()
      setStatusMinatId(statusMinat?.id || null)
    }

    const { data: peserta, error } = await supabase
      .from('peserta')
      .select(`*, tim_kelompok:tim_kelompok_id(*), tim_desa:tim_desa_id(*), tim_daerah:tim_daerah_id(*)`)
      .eq('id', id)
      .single()

    if (error || !peserta) return
    setP(peserta)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [id])

  // Fungsi Toggle Tertarik yang diperbaiki untuk Client Component
  const handleToggleTertarik = async () => {
    if (!user || isProcessing) return
    setIsProcessing(true)

    if (statusMinatId) {
      await supabase.from('admin_peserta').delete().eq('id', statusMinatId)
      setStatusMinatId(null)
    } else {
      const { data } = await supabase
        .from('admin_peserta')
        .insert([{ pengirim_id: user.id, target_id: id, status: 'menunggu_mediasi' }])
        .select()
        .single()
      if (data) setStatusMinatId(data.id)
    }
    setIsProcessing(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-emerald-600 animate-pulse text-xs uppercase tracking-widest">Memuat Profil...</div>
  if (!p) return notFound()

  const isAdmin = user?.app_metadata?.role === 'admin'
  const isOwner = user?.id === id
  const isIkhwan = userProfile?.jenis_kelamin === 'Laki-laki'
  const isTargetPerempuan = p.jenis_kelamin === 'Perempuan'
  const tampilkanTombol = user && !isAdmin && !isOwner && isIkhwan && isTargetPerempuan

  const hitungUmur = (tgl: string) => {
    if (!tgl) return '??'
    const lahir = new Date(tgl); const hariIni = new Date();
    let umur = hariIni.getFullYear() - lahir.getFullYear();
    if (hariIni.getMonth() < lahir.getMonth() || (hariIni.getMonth() === lahir.getMonth() && lahir.getDate() < lahir.getDate())) umur--
    return umur
  }

  const formatTanggal = (d: string) => {
    if (!d) return '-'
    const [y, m, day] = d.split('-')
    return `${day}-${m}-${y}`
  }

  const listPendamping = [p.tim_kelompok, p.tim_desa, p.tim_daerah].filter(Boolean)

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4 text-slate-900 font-sans">
      {isZoomed && p.avatar_url && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsZoomed(false)}>
          <div className="relative max-w-2xl w-full aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-white/20">
            <img src={p.avatar_url} className="w-full h-full object-cover" alt={p.nama} />
            <button className="absolute top-6 right-6 bg-white/20 text-white w-10 h-10 rounded-full font-black text-lg">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="relative h-80 bg-emerald-800 flex flex-col items-center justify-center">
          {p.avatar_url && <img src={p.avatar_url} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-[2px]" alt="" />}
          <Link href="/peserta" className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-widest z-10">← Kembali</Link>
          <div className="relative z-10 text-center text-white px-4">
            <div onClick={() => p.avatar_url && setIsZoomed(true)} className="w-40 h-40 bg-white/20 rounded-[2.5rem] mx-auto mb-4 border-2 border-white/30 overflow-hidden flex items-center justify-center text-5xl font-black shadow-2xl backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform">
              {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : p.nama?.charAt(0)}
            </div>
            <h1 className="text-2xl font-black capitalize tracking-tight leading-tight">{p.nama}</h1>
            <p className="text-[10px] font-bold opacity-80 italic text-emerald-100">{p.jenis_kelamin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || '---'}</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {tampilkanTombol && (
            <div className="mb-8">
              <button 
                onClick={handleToggleTertarik}
                disabled={isProcessing}
                className={`w-full py-3 rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                statusMinatId ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-500 hover:bg-rose-600 text-white'
              }`}>
                <span>{statusMinatId ? '✅' : '❤️'}</span> 
                {isProcessing ? 'Memproses...' : statusMinatId ? 'Minat Terkirim (Batalkan)' : 'Saya Tertarik (Rahasia)'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-gray-50 pb-8">
            <div className="space-y-3 text-slate-900">
              <h3 className="text-emerald-800 font-black border-b border-emerald-50 pb-1.5 uppercase text-[9px] tracking-widest">Informasi Personal</h3>
              <div className="space-y-2 text-[11px]">
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Lahir:</span> <b className="text-slate-900">{p.tempat_lahir}, {formatTanggal(p.tanggal_lahir)}</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Umur:</span> <b className="text-slate-900">{hitungUmur(p.tanggal_lahir)} Tahun</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Status:</span> <b className="text-slate-900">{p.status}</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Tinggi/Berat:</span> <b className="text-slate-900">{p.tinggi_badan}cm / {p.berat_badan}kg</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Suku:</span> <b className="text-slate-900">{p.suku}</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Anak Ke:</span> <b className="text-slate-900">{p.anak_ke} dari {p.jumlah_saudara} bersaudara</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Pendidikan:</span> <b className="text-slate-900">{p.pendidikan_terakhir}</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Pekerjaan:</span> <b className="text-slate-900">{p.pekerjaan}</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Hobby:</span> <b className="text-slate-900 capitalize">{p.hobby}</b></p>
                <p className="flex flex-col pt-1"><span>Alamat Lengkap:</span> <b className="text-slate-900 mt-1 leading-relaxed italic">{p.alamat_lengkap}</b></p>
              </div>
            </div>

            <div className="space-y-3 h-fit text-slate-900">
              <h3 className="text-emerald-800 font-black border-b border-emerald-50 pb-1.5 uppercase text-[9px] tracking-widest">Informasi Sambung</h3>
              <div className="space-y-2 text-[11px]">
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Dapukan:</span> <b className="text-slate-900">{p.dapukan}</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Kelompok:</span> <b className="text-slate-900">{p.kelompok}</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Desa:</span> <b className="text-slate-900">{p.desa}</b></p>
                <p className="flex justify-between border-b border-gray-50 pb-1"><span>Daerah:</span> <b className="text-slate-900">{p.daerah}</b></p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-4 rounded-xl mb-8 border border-emerald-100">
              <h3 className="text-emerald-900 font-black text-[9px] uppercase mb-2 tracking-widest">Kriteria Pasangan:</h3>
              <p className="text-emerald-800 text-xs italic leading-relaxed font-medium">"{p.kriteria_calon_pasangan || 'Tidak ada kriteria khusus'}"</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-center text-gray-400 font-black uppercase text-[9px] tracking-[0.2em] mb-4">Hubungi Tim Perkawinan</h3>
            {listPendamping.map((tim: any, index: number) => (
              <div key={index} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black shrink-0">{tim.nama?.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="text-[8px] text-gray-400 font-black uppercase leading-none mb-1">{tim.dapukan}</p>
                    <p className="font-bold text-gray-800 text-sm truncate">{tim.nama}</p>
                  </div>
                </div>
                <a href={`https://wa.me/${tim.nomor_telepon?.replace(/\D/g, '')}?text=${encodeURIComponent(`Bismillah, mohon arahan mengenai profil ${p.nama}.`)}`} 
                   target="_blank" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase shadow-sm shrink-0 transition-colors">
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