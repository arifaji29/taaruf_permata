'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import Link from 'next/link'
// Impor ikon Lucide
import { 
  LayoutDashboard, 
  Home, 
  FileText, 
  UserPlus, 
  Trash2, 
  MoreVertical, 
  X,
  User,
  ShieldCheck,
  Phone,
  MapPin,
  Users,
  Edit3, // Ikon Edit baru
  RotateCcw, // Ikon Batal/Reset
  Check
} from 'lucide-react'

export default function ManajemenTim() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [tim, setTim] = useState<any[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // State baru untuk menangani mode edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formDataState, setFormDataState] = useState({
    nama: '',
    dapukan: '',
    nomor_telepon: '',
    alamat_lengkap: ''
  })

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

  // Fungsi untuk memicu mode edit
  const handleEditClick = (t: any) => {
    setEditingId(t.id)
    setFormDataState({
      nama: t.nama,
      dapukan: t.dapukan,
      nomor_telepon: t.nomor_telepon,
      alamat_lengkap: t.alamat_lengkap
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Fungsi untuk membatalkan edit
  const resetForm = () => {
    setEditingId(null)
    setFormDataState({
      nama: '',
      dapukan: '',
      nomor_telepon: '',
      alamat_lengkap: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const payload = {
      ...formDataState,
      ...(editingId && { id: editingId }) // Sertakan ID jika dalam mode edit
    }

    const { error } = await supabase
      .from('tim_perkawinan')
      .upsert([payload]) // Gunakan upsert agar bisa Insert/Update sekaligus

    if (error) {
      alert("Gagal memproses data: " + error.message)
    } else {
      alert(editingId ? "Data petugas diperbarui!" : "Petugas berhasil didaftarkan!")
      resetForm()
      fetchTim()
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100 relative z-50">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-emerald-900 tracking-tight leading-none uppercase">Manajemen Tim</h1>
            <p className="text-emerald-700 text-[10px] font-bold italic mt-1 leading-none">Pengelolaan Petugas Pendamping</p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center"
            >
              {isMenuOpen ? <X size={20} /> : <MoreVertical size={20} />}
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                  <LayoutDashboard size={14} className="text-emerald-500" /> Dashboard Admin
                </Link>
                <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700">
                  <FileText size={14} className="text-orange-500" /> Kelola Blog
                </Link>
                <Link href="/admin/tim-perkawinan" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50/50">
                  <Users size={14} /> Tim Perkawinan
                </Link>
                <div className="border-t border-gray-50 my-1"></div>
                <Link href="/" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                  <Home size={14} className="text-emerald-500" /> Beranda Utama
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORM INPUT / EDIT */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <h2 className={`text-sm font-black mb-4 border-b pb-2 uppercase flex items-center gap-2 ${editingId ? 'text-blue-700' : 'text-slate-800'}`}>
              {editingId ? <Edit3 size={16} /> : <UserPlus size={16} className="text-emerald-600" />}
              {editingId ? 'Edit Petugas' : 'Tambah Petugas'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={10} /> Nama Lengkap
                </label>
                <input 
                  value={formDataState.nama}
                  onChange={(e) => setFormDataState({...formDataState, nama: e.target.value})}
                  className="p-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 text-slate-900 font-bold" 
                  required 
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck size={10} /> Dapukan
                </label>
                <select 
                  value={formDataState.dapukan}
                  onChange={(e) => setFormDataState({...formDataState, dapukan: e.target.value})}
                  className="p-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 font-bold cursor-pointer" 
                  required
                >
                  <option value="">Pilih Tugas...</option>
                  {opsiDapukan.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest flex items-center gap-1.5">
                  <Phone size={10} /> Nomor WhatsApp
                </label>
                <input 
                  value={formDataState.nomor_telepon}
                  onChange={(e) => setFormDataState({...formDataState, nomor_telepon: e.target.value})}
                  placeholder="628..." 
                  className="p-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 text-slate-900 font-bold" 
                  required 
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={10} /> Alamat/Kelompok
                </label>
                <textarea 
                  value={formDataState.alamat_lengkap}
                  onChange={(e) => setFormDataState({...formDataState, alamat_lengkap: e.target.value})}
                  rows={2} 
                  className="p-2.5 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 resize-none text-slate-900 font-bold" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${editingId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                  {loading ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white"></div> : (editingId ? <Check size={14} /> : <UserPlus size={14} />)}
                  {editingId ? 'Simpan Perubahan' : 'Daftarkan Petugas'}
                </button>
                
                {editingId && (
                  <button type="button" onClick={resetForm} className="w-full bg-slate-100 text-slate-600 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition flex items-center justify-center gap-2">
                    <RotateCcw size={12} /> Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* DAFTAR PETUGAS */}
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
                  <tr key={t.id} className={`hover:bg-emerald-50/30 transition-colors ${editingId === t.id ? 'bg-blue-50/50' : ''}`}>
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">{t.nama}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[9px]">
                        <span className="text-emerald-700 font-black uppercase flex items-center gap-1">
                          <ShieldCheck size={10} /> {t.dapukan}
                        </span>
                        <span className="text-slate-400 font-bold flex items-center gap-1">
                          <Phone size={10} /> {t.nomor_telepon}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1.5 line-clamp-1 italic flex items-center gap-1">
                        <MapPin size={8} /> {t.alamat_lengkap}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(t)}
                          className="text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 p-2 rounded-lg inline-flex"
                          title="Edit Petugas"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={async () => {
                            if(confirm('Hapus petugas ini?')) {
                              await supabase.from('tim_perkawinan').delete().eq('id', t.id);
                              fetchTim();
                            }
                          }} 
                          className="text-rose-400 hover:text-rose-600 transition-colors bg-rose-50 p-2 rounded-lg inline-flex"
                          title="Hapus Petugas"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tim.length === 0 && (
              <div className="p-10 text-center flex flex-col items-center">
                <Users size={32} className="text-slate-200 mb-2" />
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