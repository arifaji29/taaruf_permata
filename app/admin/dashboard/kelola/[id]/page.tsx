'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ShieldCheck, User, Save, Users, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function KelolaPendampingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  
  const [peserta, setPeserta] = useState<any>(null)
  const [listTim, setListTim] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 text-slate-900">
      <div className="max-w-xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-slate-600">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-black text-emerald-900 uppercase">Kelola Pendamping</h1>
        </div>

        {/* INFO PESERTA RINGKAS */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-50 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-xl border border-emerald-100">
            {peserta?.nama?.charAt(0)}
          </div>
          <div>
            <h2 className="font-black text-slate-800 uppercase leading-none">{peserta?.nama}</h2>
            <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1 italic">
              {peserta?.kelompok || 'Kelompok Belum Diisi'}
            </p>
          </div>
        </div>

        {/* FORM MANAJEMEN */}
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 space-y-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Penugasan Petugas</p>
          
          {[
            { label: 'Tim Kelompok', key: 'tim_kelompok_id', filter: 'Tim Perkawinan Kelompok' },
            { label: 'Tim Desa', key: 'tim_desa_id', filter: 'Tim Perkawinan Desa' },
            { label: 'Tim Daerah', key: 'tim_daerah_id', filter: 'Tim Perkawinan Daerah' }
          ].map((item) => (
            <div key={item.key} className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-600" /> {item.label}
              </label>
              <select
                disabled={saving}
                value={peserta?.[item.key] || ""}
                onChange={(e) => handleUpdate(item.key, e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 bg-gray-50 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
              >
                <option value="">-- Pilih Petugas --</option>
                {listTim.filter(t => t.dapukan === item.filter).map((tim) => (
                  <option key={tim.id} value={tim.id}>{tim.nama}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="pt-4">
             <button 
              onClick={() => router.push('/admin/dashboard')}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 active:scale-95 transition-all"
             >
               Selesai & Simpan
             </button>
          </div>
        </div>
      </div>
    </main>
  )
}