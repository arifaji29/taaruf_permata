'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import Link from 'next/link'
// Impor ikon Lucide
import { 
  Users, 
  Heart, 
  Search, 
  Home, 
  FileText, 
  UserCheck, 
  ChevronDown, 
  ExternalLink,
  MessageCircle,
  MoreVertical,
  X,
  LayoutDashboard
} from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const [peserta, setPeserta] = useState<any[]>([])
  const [listTim, setListTim] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null)

  const hitungUmur = (tanggalLahir: string) => {
    if (!tanggalLahir) return '??';
    const birthDate = new Date(tanggalLahir);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: dataPeserta } = await supabase
      .from('peserta')
      .select(`
        *,
        tim_kelompok:tim_kelompok_id ( nama ),
        tim_desa:tim_desa_id ( nama ),
        tim_daerah:tim_daerah_id ( nama ),
        peminat:admin_peserta!target_id (
          id,
          pengirim:peserta!pengirim_id ( nama ) 
        )
      `)
      .order('created_at', { ascending: false });

    const { data: dataTim } = await supabase
      .from('tim_perkawinan')
      .select('id, nama, dapukan, nomor_telepon')
      .order('nama', { ascending: true });

    if (dataPeserta) setPeserta(dataPeserta);
    if (dataTim) setListTim(dataTim);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredPeserta = peserta.filter(p => 
    p.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.kelompok?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTerdaftar = peserta.length;
  const totalTertarik = peserta.filter(p => p.peminat && p.peminat.length > 0).length;

  const handleAssignTim = async (pesertaId: string, timId: string, targetKolom: string) => {
    const value = timId === "" ? null : timId;
    const { error } = await supabase
      .from('peserta')
      .update({ [targetKolom]: value })
      .eq('id', pesertaId);

    if (error) alert("Gagal memperbarui: " + error.message);
    else fetchData();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100 relative z-50">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-emerald-900 tracking-tight">Dashboard Admin</h1>
            <p className="text-emerald-700 text-[10px] font-bold italic">Permata: Manajemen Verifikasi</p>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all flex items-center justify-center"
            >
              {isMenuOpen ? <X size={20} /> : <MoreVertical size={20} />}
            </button>

            {/* NAV MENU KONSISTEN */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95">
                <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50/50">
                  <LayoutDashboard size={14} /> Dashboard Admin
                </Link>
                <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700">
                  <FileText size={14} className="text-orange-500" /> Kelola Blog
                </Link>
                <Link href="/admin/tim-perkawinan" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">
                  <UserCheck size={14} className="text-indigo-500" /> Tim Perkawinan
                </Link>
                <div className="border-t border-gray-50 my-1"></div>
                <Link href="/" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                  <Home size={14} className="text-emerald-500" /> Beranda Utama
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* STATISTIK SECTION */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Total Peserta</p>
              <h3 className="text-xl font-black text-slate-800">{totalTerdaftar} <span className="text-[10px] font-medium text-slate-400">Orang</span></h3>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
              <Users size={20} strokeWidth={2.5} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-rose-600 uppercase mb-1">Mendapat Hati</p>
              <h3 className="text-xl font-black text-slate-800">{totalTertarik} <span className="text-[10px] font-medium text-slate-400">Orang</span></h3>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600">
              <Heart size={20} strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <input 
            type="text"
            placeholder="Cari nama atau kelompok..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3.5 pl-12 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 text-sm transition-all"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <Search size={18} strokeWidth={2.5} />
          </span>
        </div>

        {/* GRID DISPLAY PESERTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPeserta.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden flex flex-col relative transition-all hover:shadow-lg">
              
              {/* ACCORDION PEMINAT */}
              {p.peminat && p.peminat.length > 0 && (
                <div className="absolute top-3 right-3 z-10 w-32">
                  <button 
                    onClick={() => setOpenAccordionId(openAccordionId === p.id ? null : p.id)}
                    className="w-full bg-rose-500 text-white text-[8px] font-black px-2 py-1.5 rounded-full shadow-md flex items-center justify-between gap-1 active:scale-95 transition-all"
                  >
                    <span className="flex items-center gap-1"><Heart size={8} fill="white" /> {p.peminat.length} Tertarik</span>
                    <ChevronDown size={10} className={`transition-transform duration-200 ${openAccordionId === p.id ? 'rotate-180' : ''}`} />
                  </button>

                  {openAccordionId === p.id && (
                    <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-rose-100 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-1 z-50">
                      <p className="text-[8px] font-black text-rose-500 uppercase mb-1 border-b pb-0.5">Daftar Peminat:</p>
                      <div className="max-h-24 overflow-y-auto space-y-1">
                        {p.peminat.map((m: any) => (
                          <div key={m.id} className="text-[9px] font-bold text-slate-700 py-0.5 flex items-center gap-1.5 leading-none border-b border-gray-50 last:border-0">
                            <span className="w-1 h-1 rounded-full bg-rose-300"></span> {m.pengirim?.nama || 'Tanpa Nama'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-50 shrink-0 border border-white shadow-sm flex items-center justify-center">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} className="w-full h-full object-cover" alt={p.nama} />
                  ) : (
                    <Users size={20} className="text-emerald-200" />
                  )}
                </div>
                <div className="min-w-0 pr-24">
                  <h2 className="text-sm font-black text-slate-800 uppercase truncate leading-none mb-0.5">{p.nama}</h2>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase italic truncate">
                    {p.jenis_kel2amin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || '-'}
                  </p>
                  <p className="text-[8px] font-black text-slate-400 uppercase mt-0.5">
                    {hitungUmur(p.tanggal_lahir)} thn • {p.kelompok || 'Kelompok -'}
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-3 grow bg-gray-50/30">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Manajemen Pendamping</p>
                {[
                  { label: 'Tim Kelompok', id: p.tim_kelompok_id, target: 'tim_kelompok_id', filter: 'Tim Perkawinan Kelompok' },
                  { label: 'Tim Desa', id: p.tim_desa_id, target: 'tim_desa_id', filter: 'Tim Perkawinan Desa' },
                  { label: 'Tim Daerah', id: p.tim_daerah_id, target: 'tim_daerah_id', filter: 'Tim Perkawinan Daerah' }
                ].map((item) => (
                  <div key={item.target} className="space-y-1">
                    <label className="text-[8px] font-black text-slate-500 uppercase ml-1">{item.label}</label>
                    <div className="relative">
                      <select
                        value={item.id || ""}
                        onChange={(e) => handleAssignTim(p.id, e.target.value, item.target)}
                        className="w-full text-[10px] font-bold p-2 pr-8 rounded-xl border border-gray-200 bg-white text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">-- Pilih Pendamping --</option>
                        {listTim.filter(t => t.dapukan === item.filter).map((tim) => (
                          <option key={tim.id} value={tim.id}>{tim.nama}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white border-t border-gray-50 flex gap-2">
                <Link href={`/peserta/${p.id}`} className="flex-1 text-center bg-gray-100 text-slate-600 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
                  <ExternalLink size={10} /> Detail
                </Link>
                <a href={`https://wa.me/${p.nomor_telepon?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-emerald-600 text-white py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-1.5">
                  <MessageCircle size={10} fill="currentColor" /> Hubungi
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* LOADING & NOT FOUND */}
        {!loading && filteredPeserta.length === 0 && (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
             <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search size={32} className="text-slate-300" />
             </div>
             <p className="text-slate-400 font-black uppercase tracking-tighter text-sm">Tidak ditemukan</p>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-100 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-emerald-900 font-black text-xs uppercase tracking-widest animate-pulse">Memuat Data...</p>
          </div>
        )}
      </div>
    </main>
  );
}