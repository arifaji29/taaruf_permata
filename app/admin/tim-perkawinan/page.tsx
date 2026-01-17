'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import Link from 'next/link'

export default function ManajemenTim() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [tim, setTim] = useState<any[]>([])

  const opsiDapukan = [
    "Tim Perkawinan Kelompok",
    "Tim Perkawinan Desa",
    "Tim Perkawinan Daerah"
  ];

  const fetchTim = async () => {
    // Mengambil data lengkap termasuk alamat_lengkap
    const { data, error } = await supabase
      .from('tim_perkawinan')
      .select('id, nama, dapukan, nomor_telepon, alamat_lengkap')
      .order('created_at', { ascending: false })
    
    if (data) setTim(data)
  }

  useEffect(() => {
    fetchTim()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const dataInput = Object.fromEntries(formData.entries())

    const { error } = await supabase
      .from('tim_perkawinan')
      .insert([dataInput])

    if (error) {
      alert("Gagal menambahkan petugas: " + error.message)
    } else {
      alert("Petugas berhasil didaftarkan!")
      e.currentTarget.reset()
      fetchTim()
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manajemen Tim Perkawinan</h1>
          <Link href="/admin/dashboard" className="text-sm font-black text-emerald-600 uppercase tracking-widest">
            ← Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-black mb-6 border-b pb-2">Tambah Petugas</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Nama Lengkap</label>
                <input name="nama" className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50" required />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Dapukan</label>
                <select name="dapukan" className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white" required>
                  <option value="">Pilih Tugas...</option>
                  {opsiDapukan.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Nomor WhatsApp</label>
                <input name="nomor_telepon" placeholder="628..." className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50" required />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Alamat</label>
                <textarea name="alamat_lengkap" rows={3} className="p-3 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 resize-none" required />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition active:scale-95">
                {loading ? 'Menyimpan...' : 'Daftarkan Petugas'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Petugas</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tim.map((t) => (
                  <tr key={t.id} className="hover:bg-emerald-50/30">
                    <td className="p-6">
                      <p className="font-bold text-gray-800">{t.nama}</p>
                      <div className="flex gap-4 mt-1 italic text-[10px]">
                        <span className="text-emerald-700 font-black uppercase">{t.dapukan}</span>
                        <span className="text-gray-400">{t.nomor_telepon}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 line-clamp-1">{t.alamat_lengkap}</p>
                    </td>
                    <td className="p-6 text-center">
                      <button onClick={async () => {
                        if(confirm('Hapus petugas?')) {
                          await supabase.from('tim_perkawinan').delete().eq('id', t.id);
                          fetchTim();
                        }
                      }} className="text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}