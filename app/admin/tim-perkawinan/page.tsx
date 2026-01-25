'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import Link from 'next/link'

export default function ManajemenTim() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [tim, setTim] = useState<any[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false) // State Hamburger Menu

  const opsiDapukan = [
    "Tim Perkawinan Kelompok",
    "Tim Perkawinan Desa",
    "Tim Perkawinan Daerah"
  ];

  const fetchTim = async () => {
    const { data } = await supabase
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
    // Dipaksa Light Mode dengan bg-gray-50 dan text-slate-900
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER SECTION DENGAN HAMBURGER MENU */}
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100 relative z-50">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-emerald-900 tracking-tight leading-none uppercase">Manajemen Tim</h1>
            <p className="text-emerald-700 text-[10px] font-bold italic mt-1 leading-none">Pengelolaan Petugas Pendamping</p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all"
            >
              <div className="space-y-1 w-5">
                <div className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">📊 Dashboard Utama</Link>
                <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">🏠 Beranda</Link>
                <div className="border-t border-gray-50 my-1"></div>
                <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700">✍️ Kelola Blog</Link>
              </div>
            )}
          </div>
        </div>

        {/* CONTENT GRID (UKURAN LEBIH KOMPAK) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORM TAMBAH PETUGAS */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-sm font-black mb-4 border-b pb-2 uppercase text-slate-800">Tambah Petugas</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Nama Lengkap</label>
                <input name="nama" className="p-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 text-slate-900" required />
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Dapukan</label>
                <select name="dapukan" className="p-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900" required>
                  <option value="" className="text-slate-900">Pilih Tugas...</option>
                  {opsiDapukan.map(o => <option key={o} value={o} className="text-slate-900">{o}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Nomor WhatsApp</label>
                <input name="nomor_telepon" placeholder="628..." className="p-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 text-slate-900" required />
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Alamat</label>
                <textarea name="alamat_lengkap" rows={2} className="p-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 resize-none text-slate-900" required />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50">
                {loading ? 'Menyimpan...' : 'Daftarkan Petugas'}
              </button>
            </form>
          </div>

          {/* DAFTAR PETUGAS (TABEL KOMPAK) */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-fit">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Info Petugas</th>
                  <th className="p-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tim.map((t) => (
                  <tr key={t.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-800">{t.nama}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[9px]">
                        <span className="text-emerald-700 font-black uppercase">{t.dapukan}</span>
                        <span className="text-slate-400 font-medium">{t.nomor_telepon}</span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1.5 line-clamp-1 italic">{t.alamat_lengkap}</p>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={async () => {
                          if(confirm('Hapus petugas ini?')) {
                            await supabase.from('tim_perkawinan').delete().eq('id', t.id);
                            fetchTim();
                          }
                        }} 
                        className="text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tim.length === 0 && (
              <div className="p-10 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic leading-none">
                  Belum ada data petugas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}