'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ShieldCheck, 
  Save, 
  MessageSquare, 
  HeartHandshake, 
  Award,
  RotateCcw,
  Trash2,
  User as UserIcon,
  UserX 
} from 'lucide-react'
import Link from 'next/link'

export default function KelolaPendampingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  
  const [peserta, setPeserta] = useState<any>(null)
  const [hubungan, setHubungan] = useState<any>(null) // State untuk data dari tabel taaruf_pasangan
  const [listTim, setListTim] = useState<any[]>([])
  const [listPasangan, setListPasangan] = useState<any[]>([]) 
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isMan = peserta?.jenis_kelamin === 'Laki-laki'
  
  const opsiStatus = [
    { label: 'Mediasi', value: 'Mediasi', icon: <MessageSquare size={14} className="text-blue-500" /> },
    { label: 'Melamar / Dilamar', value: 'Melamar', icon: <HeartHandshake size={14} className="text-rose-500" /> },
    { label: 'Menikah', value: 'Menikah', icon: <Award size={14} className="text-amber-500" /> }
  ]

  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil data peserta utama
      const { data: p } = await supabase.from('peserta').select('*').eq('id', id).single()
      const { data: t } = await supabase.from('tim_perkawinan').select('*').order('nama', { ascending: true })
      
      if (p) {
        setPeserta(p)
        const jenisKelaminLawan = p.jenis_kelamin === 'Laki-laki' ? 'Perempuan' : 'Laki-laki'

        // 2. Cek apakah peserta ini sudah punya pasangan di tabel taaruf_pasangan
        // Kita cari baris dimana ID dia muncul sebagai ikhwan_id ATAU akhwat_id
        let currentRelation = null
        if (p.jenis_kelamin === 'Laki-laki') {
           const { data: rel } = await supabase.from('taaruf_pasangan').select('*').eq('ikhwan_id', id).single()
           currentRelation = rel
        } else {
           const { data: rel } = await supabase.from('taaruf_pasangan').select('*').eq('akhwat_id', id).single()
           currentRelation = rel
        }
        setHubungan(currentRelation)

        // 3. Ambil daftar calon pasangan (Lawan Jenis)
        const { data: candidates } = await supabase
          .from('peserta')
          .select('id, nama')
          .eq('jenis_kelamin', jenisKelaminLawan)
          .order('nama')

        // 4. Ambil semua ID yang SUDAH berpasangan (sibuk) dari tabel taaruf_pasangan
        const { data: busyData } = await supabase.from('taaruf_pasangan').select('ikhwan_id, akhwat_id')
        
        const busyIds = new Set()
        busyData?.forEach((row: any) => {
          busyIds.add(row.ikhwan_id)
          busyIds.add(row.akhwat_id)
        })

        if (candidates) {
          // FILTER: Tampilkan hanya yang TIDAK sibuk ATAU yang sedang berpasangan dengan user ini
          const available = candidates.filter(c => {
            // Jika dia adalah pasangan user ini saat ini, tetap tampilkan
            const isMyPartner = (p.jenis_kelamin === 'Laki-laki' && currentRelation?.akhwat_id === c.id) ||
                                (p.jenis_kelamin === 'Perempuan' && currentRelation?.ikhwan_id === c.id)
            
            // Jika tidak sibuk atau dia adalah pasangan saya, tampilkan
            return !busyIds.has(c.id) || isMyPartner
          })
          setListPasangan(available)
        }
      }

      if (t) setListTim(t)
      setLoading(false)
    }
    fetchData()
  }, [id])

  // --- UPDATE LOGIC (Skema Baru: taaruf_pasangan) ---
  const handleUpdatePasangan = async (partnerId: string) => {
    setSaving(true)
    
    // Jika memilih "Reset" / Kosong
    if (!partnerId) {
      if (hubungan) {
        // Hapus relasi di tabel taaruf_pasangan
        await supabase.from('taaruf_pasangan').delete().eq('id', hubungan.id)
        setHubungan(null)
      }
    } else {
      // Jika memilih pasangan baru
      // Cek dulu apakah sudah ada hubungan?
      if (hubungan) {
        // Update pasangan yang ada (Ganti orang)
        const updatePayload = isMan ? { akhwat_id: partnerId } : { ikhwan_id: partnerId }
        const { data } = await supabase.from('taaruf_pasangan').update(updatePayload).eq('id', hubungan.id).select().single()
        setHubungan(data)
      } else {
        // Buat hubungan baru (Insert)
        const insertPayload = isMan 
          ? { ikhwan_id: id, akhwat_id: partnerId, status: 'Mediasi' }
          : { ikhwan_id: partnerId, akhwat_id: id, status: 'Mediasi' }
        
        const { data, error } = await supabase.from('taaruf_pasangan').insert(insertPayload).select().single()
        
        if (error) {
          alert("Gagal membuat pasangan: " + error.message)
        } else {
          setHubungan(data)
          // Bersihkan data tertarik/peminat sampah jika ada
          await supabase.from('tertarik').delete().or(`pemberi_id.eq.${id},penerima_id.eq.${id}`)
          await supabase.from('admin_peserta').delete().or(`pengirim_id.eq.${id},target_id.eq.${id}`)
        }
      }
    }
    setSaving(false)
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!hubungan) return // Tidak bisa ubah status jika belum punya pasangan
    setSaving(true)
    
    // Reset/Hapus Hubungan
    if (newStatus === '') {
        await supabase.from('taaruf_pasangan').delete().eq('id', hubungan.id)
        setHubungan(null)
    } else {
        // Update Status
        const { data, error } = await supabase
          .from('taaruf_pasangan')
          .update({ status: newStatus })
          .eq('id', hubungan.id)
          .select()
          .single()
        
        if (!error) setHubungan(data)
    }
    setSaving(false)
  }

  const handleUpdateTim = async (field: string, value: any) => {
    // Update data TIM tetap di tabel peserta
    setSaving(true)
    const val = value === "" ? null : value
    const { error } = await supabase.from('peserta').update({ [field]: val }).eq('id', id)
    if (!error) {
      setPeserta({ ...peserta, [field]: val })
    }
    setSaving(false)
  }

  const handleHapusPeserta = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus profil peserta ini secara permanen?")) {
      setSaving(true)
      try {
        // Hapus Profil Utama (Cascade di DB akan otomatis menghapus taaruf_pasangan)
        const { error } = await supabase.from('peserta').delete().eq('id', id)
        if (error) throw error

        alert("Peserta berhasil dihapus")
        router.refresh()
        router.push('/admin/dashboard')
      } catch (err: any) {
        alert("Gagal menghapus: " + err.message)
      } finally {
        setSaving(false)
      }
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>

  // Helper untuk mendapatkan ID pasangan saat ini dari state hubungan
  const currentPartnerId = hubungan ? (isMan ? hubungan.akhwat_id : hubungan.ikhwan_id) : ""
  const currentStatus = hubungan ? hubungan.status : ""

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4 text-slate-900 font-sans">
      <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-500">
        
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-1.5 bg-white rounded-xl shadow-sm border border-gray-100 text-slate-600 hover:bg-slate-50 transition-colors">
            <ChevronLeft size={20} strokeWidth={3} />
          </Link>
          <h1 className="text-lg font-black text-emerald-900 uppercase tracking-tight leading-none">Kelola Peserta</h1>
        </div>

        {/* INFO PESERTA */}
        <div className="bg-white p-4 rounded-4xl shadow-sm border border-emerald-50 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 shrink-0 overflow-hidden flex items-center justify-center">
            {peserta?.avatar_url ? (
              <img src={peserta.avatar_url} className="w-full h-full object-cover" alt="Foto Profil" />
            ) : (
              <UserIcon size={24} className="text-emerald-200" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-slate-800 uppercase leading-none truncate">{peserta?.nama}</h2>
            <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1 italic tracking-tighter">
              {peserta?.kelompok || 'Kelompok Belum Diisi'}
            </p>
            {/* Indikator Status di Header */}
            {currentStatus && (
               <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded border border-amber-100">
                 Status: {currentStatus}
               </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-4xl shadow-lg border border-gray-100 space-y-5">
          {/* PENUGASAN PENDAMPING */}
          <div className="space-y-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-1">Penugasan Pendamping</p>
            {[
              { label: 'Tim Kelompok', key: 'tim_kelompok_id', filter: 'Tim Perkawinan Kelompok' },
              { label: 'Tim Desa', key: 'tim_desa_id', filter: 'Tim Perkawinan Desa' },
              { label: 'Tim Daerah', key: 'tim_daerah_id', filter: 'Tim Perkawinan Daerah' }
            ].map((item) => (
              <div key={item.key} className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5 ml-1">
                  <ShieldCheck size={10} className="text-emerald-600" /> {item.label}
                </label>
                <select
                  disabled={saving}
                  value={peserta?.[item.key] || ""}
                  onChange={(e) => handleUpdateTim(item.key, e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-[11px] font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                >
                  <option value="">-- Pilih Petugas --</option>
                  {listTim.filter(t => t.dapukan === item.filter).map((tim) => (
                    <option key={tim.id} value={tim.id}>{tim.nama}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* PILIH PASANGAN (DROPDOWN) */}
          <div className="space-y-1 bg-rose-50/50 p-3 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2 duration-300">
            <label className="text-[9px] font-black text-rose-600 uppercase flex items-center gap-1.5 ml-1">
              <HeartHandshake size={10} /> Pilih Pasangan ({isMan ? 'Akhwat' : 'Ikhwan'})
            </label>
            
            {listPasangan.length > 0 ? (
              <select
                disabled={saving}
                value={currentPartnerId} 
                onChange={(e) => handleUpdatePasangan(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-[11px] font-bold text-rose-900 focus:ring-2 focus:ring-rose-500 outline-none transition-all appearance-none"
              >
                <option value="">-- Belum Ada Pasangan --</option>
                {listPasangan.map((p) => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/50 border border-rose-100 text-rose-400">
                <UserX size={14} />
                <span className="text-[10px] font-bold italic">Belum ada calon pasangan yang tersedia.</span>
              </div>
            )}
          </div>

          {/* STATUS PROSES (Hanya muncul jika sudah ada pasangan) */}
          {hubungan && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-end border-b border-gray-50 pb-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Hubungan</p>
                <button onClick={() => handleUpdateStatus("")} className="flex items-center gap-1 text-[8px] font-black text-rose-400 hover:text-rose-600 transition-colors uppercase">
                  <RotateCcw size={8} /> Reset status
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {opsiStatus.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    disabled={saving} 
                    onClick={() => handleUpdateStatus(status.value)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border transition-all active:scale-95 ${
                      currentStatus === status.value
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                        : 'bg-gray-50/50 border-gray-100 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {status.icon}
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${
                      currentStatus === status.value ? 'text-emerald-700' : 'text-slate-400'
                    }`}>
                      {status.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <button onClick={() => router.push('/admin/dashboard')} className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
              {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
              Selesai & Simpan
            </button>
            
            <button 
              onClick={handleHapusPeserta} 
              disabled={saving}
              className="w-full bg-rose-50 text-rose-600 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100 disabled:opacity-50"
            >
              <Trash2 size={14} /> Hapus Peserta Permanen
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}