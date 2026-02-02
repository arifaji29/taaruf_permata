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
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'

export default function KelolaPendampingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  
  const [peserta, setPeserta] = useState<any>(null)
  const [listTim, setListTim] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Opsi Status Taaruf
    const opsiStatus = [
      { label: 'Mediasi', value: 'Mediasi', icon: <MessageSquare size={14} className="text-blue-500" /> },
      { label: 'Dilamar', value: 'Dilamar', icon: <HeartHandshake size={14} className="text-rose-500" /> },
      { label: 'Menikah', value: 'Menikah', icon: <Award size={14} className="text-amber-500" /> }
    ]

  useEffect(() => {
    const fetchData = async () => {
      const { data: p } = await supabase.from('peserta').select('*').eq('id', id).single()
      const { data: t } = await supabase.from('tim_perkawinan').select('*').order('nama', { ascending: true })
      
      if (p) setPeserta(p)
      if (t) setListTim(t)
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleUpdate = async (field: string, value: string) => {
    setSaving(true)
    const val = value === "" ? null : value
    const { error } = await supabase.from('peserta').update({ [field]: val }).eq('id', id)
    
    if (!error) {
      setPeserta({ ...peserta, [field]: val })
    } else {
      alert("Gagal memperbarui: " + error.message)
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4 text-slate-900 font-sans">
      <div className="max-w-xl mx-auto space-y-4 animate-in fade-in duration-500">
        
        {/* HEADER KOMPAK */}
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-1.5 bg-white rounded-xl shadow-sm border border-gray-100 text-slate-600 hover:bg-slate-50 transition-colors">
            <ChevronLeft size={20} strokeWidth={3} />
          </Link>
          <h1 className="text-lg font-black text-emerald-900 uppercase tracking-tight leading-none">Kelola Peserta</h1>
        </div>

        {/* INFO PESERTA RINGKAS */}
        <div className="bg-white p-4 rounded-4xl shadow-sm border border-emerald-50 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-lg border border-emerald-100 shrink-0">
            {peserta?.nama?.charAt(0)}
          </div>
          <div className="min-w-0">
            <h2 className="font-black text-slate-800 uppercase leading-none truncate">{peserta?.nama}</h2>
            <p className="text-[9px] font-bold text-emerald-600 uppercase mt-1 italic tracking-tighter">
              {peserta?.kelompok || 'Kelompok Belum Diisi'}
            </p>
          </div>
        </div>

        {/* FORM MANAJEMEN KOMPAK */}
        <div className="bg-white p-5 rounded-4xl shadow-lg border border-gray-100 space-y-5">
          
          {/* BAGIAN PENUGASAN PETUGAS */}
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
                  onChange={(e) => handleUpdate(item.key, e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-[11px] font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer appearance-none"
                >
                  <option value="">-- Pilih Petugas --</option>
                  {listTim.filter(t => t.dapukan === item.filter).map((tim) => (
                    <option key={tim.id} value={tim.id}>{tim.nama}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* BAGIAN STATUS PROSES (BARU) */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end border-b border-gray-50 pb-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Proses Taaruf</p>
              {peserta?.status_taaruf && (
                <button 
                  onClick={() => handleUpdate('status_taaruf', "")}
                  className="flex items-center gap-1 text-[8px] font-black text-rose-400 hover:text-rose-600 transition-colors uppercase"
                >
                  <RotateCcw size={8} /> Reset
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {opsiStatus.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  disabled={saving}
                  onClick={() => handleUpdate('status_taaruf', status.value)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border transition-all active:scale-95 ${
                    peserta?.status_taaruf === status.value
                      ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                      : 'bg-gray-50/50 border-gray-100 opacity-60 hover:opacity-100'
                  }`}
                >
                  {status.icon}
                  <span className={`text-[9px] font-black uppercase tracking-tighter ${
                    peserta?.status_taaruf === status.value ? 'text-emerald-700' : 'text-slate-400'
                  }`}>
                    {status.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TOMBOL AKSI */}
          <div className="pt-2 flex flex-col gap-2">
            <button 
              onClick={() => router.push('/admin/dashboard')}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={14} />}
              Selesai & Simpan
            </button>
            <Link 
              href={`/peserta/${peserta?.id}`}
              className="w-full bg-slate-100 text-slate-500 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest text-center hover:bg-slate-200 transition-all"
            >
              Pratinjau Profil
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}