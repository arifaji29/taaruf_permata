'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import Link from 'next/link'

export default function AdminDashboard() {
  const supabase = createClient()
  const [peserta, setPeserta] = useState<any[]>([])
  const [listTim, setListTim] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
    
    const { data: dataPeserta, error: errPeserta } = await supabase
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

    if (errPeserta) {
        console.error("Kesalahan Query:", errPeserta.message);
    }

    if (dataPeserta) setPeserta(dataPeserta);
    if (dataTim) setListTim(dataTim);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

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
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION DENGAN NAVIGASI BARU */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-emerald-900 tracking-tight">Panel Kontrol Permata</h1>
            <p className="text-emerald-700 font-medium italic">Manajemen Verifikasi Akun & Pendampingan</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Tombol Beranda */}
            <Link 
              href="/" 
              className="bg-white text-emerald-700 border border-emerald-200 px-5 py-2.5 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-sm text-sm flex items-center gap-2"
            >
              🏠 Beranda
            </Link>
            
            {/* Tombol Tim Perkawinan */}
            <Link 
              href="/admin/tim-perkawinan" 
              className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-100 transition-all shadow-sm text-sm flex items-center gap-2"
            >
              🤝 Tim Perkawinan
            </Link>

            {/* Tombol Kelola Database Tim */}
            <Link 
              href="/admin/tim-perkawinan" 
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-sm font-black hover:bg-emerald-700 transition shadow-lg flex items-center gap-2"
            >
              📋 Kelola Database Tim
            </Link>
          </div>
        </div>

        {/* GRID DISPLAY PESERTA (Tetap Sama) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {peserta.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col relative">
              
              {/* LABEL KETERTARIKAN (TOOLTIP) */}
              {p.peminat && p.peminat.length > 0 && (
                <div className="absolute top-4 right-4 z-10 group">
                  <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg cursor-help">
                    ❤️ {p.peminat.length} Tertarik
                  </span>
                  
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-rose-100 rounded-xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <p className="text-[9px] font-black text-rose-500 uppercase mb-2 border-b pb-1"> Yang Tertarik:</p>
                    <div className="max-h-32 overflow-y-auto">
                      {p.peminat.map((m: any) => (
                        <div key={m.id} className="text-[11px] font-bold text-gray-700 py-1 flex items-center gap-2">
                          <span className="text-rose-300">•</span>
                          {m.pengirim?.nama || 'Akun Tanpa Nama'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 border-b border-gray-50 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald-50 shrink-0 border">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} className="w-full h-full object-cover" alt={p.nama} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-emerald-200 text-3xl font-black">{p.nama?.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight leading-none mb-1">{p.nama}</h2>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase italic">
                    {p.jenis_kelamin === 'Laki-laki' ? 'bin' : 'binti'} {p.bin_binti || '-'}
                  </p>
                  <p className="text-[10px] font-black text-gray-400 uppercase mt-1">
                    {hitungUmur(p.tanggal_lahir)} Tahun • {p.kelompok || 'Kelompok -'}
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4 grow bg-gray-50/30">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-1">Manajemen Pendamping</p>
                
                {[
                  { label: 'Tim Kelompok', id: p.tim_kelompok_id, target: 'tim_kelompok_id', data: p.tim_kelompok, filter: 'Tim Perkawinan Kelompok' },
                  { label: 'Tim Desa', id: p.tim_desa_id, target: 'tim_desa_id', data: p.tim_desa, filter: 'Tim Perkawinan Desa' },
                  { label: 'Tim Daerah', id: p.tim_daerah_id, target: 'tim_daerah_id', data: p.tim_daerah, filter: 'Tim Perkawinan Daerah' }
                ].map((item) => (
                  <div key={item.target} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{item.label}</label>
                    <select
                      value={item.id || ""}
                      onChange={(e) => handleAssignTim(p.id, e.target.value, item.target)}
                      className="w-full text-[11px] font-bold p-2.5 rounded-xl border border-gray-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    >
                      <option value="">-- Pilih Pendamping --</option>
                      {listTim.filter(t => t.dapukan === item.filter).map((tim) => (
                        <option key={tim.id} value={tim.id}>{tim.nama}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-gray-50 flex gap-2">
                <Link href={`/peserta/${p.id}`} className="flex-1 text-center bg-gray-100 text-gray-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition">
                  Lihat Detail
                </Link>
                <a href={`https://wa.me/${p.nomor_telepon?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-emerald-100 text-emerald-700 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition">
                  Hubungi Peserta
                </a>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-emerald-600 font-black text-xs uppercase tracking-widest">Sinkronisasi Data...</p>
          </div>
        )}
      </div>
    </main>
  );
}