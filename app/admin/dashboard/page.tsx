'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import Link from 'next/link'

export default function AdminDashboard() {
  const supabase = createClient()
  const [peserta, setPeserta] = useState<any[]>([])
  const [listTim, setListTim] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    // Dipaksa Light Mode dengan bg-gray-50 dan text-slate-900
    <main className="min-h-screen bg-gray-50 p-4 md:p-6 text-slate-900">
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
              className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all"
            >
              <div className="space-y-1 w-5">
                <div className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in-95">
                <Link href="/" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">🏠 Beranda</Link>
                <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-700">✍️ Kelola Blog</Link>
                <Link href="/admin/tim-perkawinan" className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">🤝 Tim Perkawinan</Link>
              </div>
            )}
          </div>
        </div>

        {/* STATISTIK SECTION (Ukuran Diperkecil) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">Total Peserta</p>
              <h3 className="text-xl font-black text-slate-800">{totalTerdaftar} <span className="text-[10px] font-medium text-slate-400">Orang</span></h3>
            </div>
            <div className="text-2xl bg-emerald-50 p-2 rounded-xl">👥</div>
          </div>
          <div className="bg-white p-4 rounded-3xl border border-rose-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-rose-600 uppercase mb-1">Mendapat Hati</p>
              <h3 className="text-xl font-black text-slate-800">{totalTertarik} <span className="text-[10px] font-medium text-slate-400">Orang</span></h3>
            </div>
            <div className="text-2xl bg-rose-50 p-2 rounded-xl">💖</div>
          </div>
        </div>

        {/* SEARCH BAR (Ukuran Diperkecil) */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Cari nama atau kelompok..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3.5 pl-12 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700 text-sm transition-all"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        </div>

        {/* GRID DISPLAY PESERTA (Card Lebih Ringkas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPeserta.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden flex flex-col relative transition-all hover:shadow-lg">
              
              {/* FITUR PEMINAT (TOOLTIP KEMBALI) */}
              {p.peminat && p.peminat.length > 0 && (
                <div className="absolute top-3 right-3 z-10 group">
                  <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-md cursor-help">
                    ❤️ {p.peminat.length} Tertarik
                  </span>
                  {/* Tooltip Nama Peminat */}
                  <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-rose-100 rounded-xl shadow-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <p className="text-[8px] font-black text-rose-500 uppercase mb-1 border-b pb-0.5">Daftar Peminat:</p>
                    <div className="max-h-20 overflow-y-auto">
                      {p.peminat.map((m: any) => (
                        <div key={m.id} className="text-[9px] font-bold text-slate-700 py-0.5 flex items-center gap-1.5 leading-none">
                          <span className="text-rose-300">•</span> {m.pengirim?.nama || 'Tanpa Nama'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-50 shrink-0 border border-white shadow-sm">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} className="w-full h-full object-cover" alt={p.nama} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-200 text-xl font-black">{p.nama?.charAt(0)}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-black text-slate-800 uppercase truncate leading-none mb-0.5">{p.nama}</h2>
                  <p className="text-[9px] font-bold text-emerald-600 uppercase italic truncate">
                    {p.jenis_kelamin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || '-'}
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
                    <select
                      value={item.id || ""}
                      onChange={(e) => handleAssignTim(p.id, e.target.value, item.target)}
                      // text-slate-900 untuk fix darkmode
                      className="w-full text-[10px] font-bold p-2 rounded-xl border border-gray-200 bg-white text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" className="text-slate-900">-- Pilih Pendamping --</option>
                      {listTim.filter(t => t.dapukan === item.filter).map((tim) => (
                        <option key={tim.id} value={tim.id} className="text-slate-900">{tim.nama}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white border-t border-gray-50 flex gap-2">
                <Link href={`/peserta/${p.id}`} className="flex-1 text-center bg-gray-100 text-slate-600 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-gray-200 transition-colors">
                  Detail
                </Link>
                <a href={`https://wa.me/${p.nomor_telepon?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-emerald-600 text-white py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100">
                  Hubungi
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* LOADING & NOT FOUND (Ukuran diperkecil) */}
        {!loading && filteredPeserta.length === 0 && (
          <div className="p-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
             <div className="text-4xl mb-3">🏜️</div>
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