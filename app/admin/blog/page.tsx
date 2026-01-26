'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// Impor ikon Lucide
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  X,
  FileText,
  Image as ImageIcon
} from 'lucide-react'

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('') 
  const supabase = createClient()
  const router = useRouter()

  const fetchBlogs = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('blog')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setBlogs(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  const filteredBlogs = blogs.filter(blog => 
    blog.judul?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleHapus = async (id: string, judul: string) => {
    const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus artikel: "${judul}"?`)
    
    if (konfirmasi) {
      const { error } = await supabase
        .from('blog')
        .delete()
        .eq('id', id)

      if (error) {
        alert('Gagal menghapus: ' + error.message)
      } else {
        setBlogs(blogs.filter(blog => blog.id !== id))
        alert('Artikel berhasil dihapus.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* HEADER SECTION DENGAN NAV MENU KONSISTEN */}
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100 relative z-50">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-emerald-900 tracking-tight leading-none uppercase">Manajemen Blog</h1>
            <p className="text-emerald-700 text-[10px] font-bold italic mt-1 leading-none">Kelola konten nasihat & artikel pernikahan</p>
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
                <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-emerald-700 bg-emerald-50/50">
                  <FileText size={14} /> Kelola Blog
                </Link>
                <Link href="/admin/tim-perkawinan" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">
                  <Users size={14} className="text-indigo-500" /> Tim Perkawinan
                </Link>
                <div className="border-t border-gray-50 my-1"></div>
                <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700">
                  <Home size={14} className="text-emerald-500" /> Beranda Utama
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH BAR & TAMBAH BLOG */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between px-2">
          <div className="relative w-full md:max-w-xs group">
            <input 
              type="text"
              placeholder="Cari judul artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2.5 pl-9 bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 text-[11px] font-bold text-slate-700 transition-all"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          
          <Link 
            href="/admin/blog/tambah" 
            className="w-full md:w-auto bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={14} strokeWidth={3} /> Blog Baru
          </Link>
        </div>

        {/* TABEL MANAJEMEN BLOG */}
        <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden mt-2">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest">Konten</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-gray-50 shadow-inner flex items-center justify-center">
                          {blog.gambar_url ? (
                            <img src={blog.gambar_url} className="w-full h-full object-cover" alt={blog.judul} />
                          ) : (
                            <ImageIcon size={16} className="text-slate-300" />
                          )}
                        </div>
                        
                        <div className="min-w-0">
                          <p className="font-black text-slate-800 text-xs leading-tight line-clamp-1 uppercase tracking-tight">{blog.judul}</p>
                          <p className="text-[9px] text-emerald-600 font-bold italic mt-0.5">/{blog.slug}</p>
                          <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold leading-none">
                            {new Date(blog.created_at).toLocaleDateString('id-ID')} {blog.penulis && `• ${blog.penulis}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Link 
                          href={`/admin/blog/edit/${blog.id}`}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors bg-emerald-50 p-2 rounded-lg"
                          title="Edit Artikel"
                        >
                          <Edit3 size={14} />
                        </Link>
                        <button 
                          onClick={() => handleHapus(blog.id, blog.judul)}
                          className="text-rose-500 hover:text-rose-700 transition-colors bg-rose-50 p-2 rounded-lg"
                          title="Hapus Artikel"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      {loading ? (
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <div className="bg-slate-50 p-4 rounded-full">
                            <FileText size={32} className="text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-black text-[10px] uppercase tracking-tighter italic">
                            {searchQuery ? 'Artikel tidak ditemukan' : 'Belum ada konten blog'}
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER STATS */}
        <div className="px-4 py-2 flex justify-end">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none">
            TOTAL: {filteredBlogs.length} ARTIKEL
          </p>
        </div>
      </div>
    </div>
  )
}