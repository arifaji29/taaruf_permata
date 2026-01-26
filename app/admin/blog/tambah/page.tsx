'use client'
import { useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send } from 'lucide-react' // Menggunakan ikon Lucide agar konsisten

export default function TambahBlogPage() {
  const [judul, setJudul] = useState('')
  const [slug, setSlug] = useState('')
  const [konten, setKonten] = useState('')
  const [gambarUrl, setGambarUrl] = useState('')
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  const handleJudulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setJudul(value)
    setSlug(value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('blog')
      .insert([{ judul, slug, konten, gambar_url: gambarUrl }])

    if (error) {
      alert('Gagal menambah blog: ' + error.message)
    } else {
      router.push('/admin/blog')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Container dipersempit dari max-w-3xl ke max-w-xl agar lebih kompak */}
      <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 text-slate-900">
        
        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
          <Link href="/admin/blog" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
            <ChevronLeft size={20} strokeWidth={3} />
          </Link>
          <h1 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Blog Baru</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Judul - Padding dan ukuran teks dikecilkan */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Judul Artikel</label>
            <input 
              required
              type="text" 
              value={judul}
              onChange={handleJudulChange}
              placeholder="Judul nasihat pernikahan..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm text-slate-900 placeholder:text-slate-300 transition-all"
            />
          </div>

          {/* URL Slug - Dibuat lebih ramping */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">URL Slug (Otomatis)</label>
            <input 
              readOnly
              type="text" 
              value={slug}
              className="w-full p-3 bg-slate-100 border border-gray-200 rounded-xl text-slate-500 font-mono text-[11px] font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Link Gambar Thumbnail</label>
            <input 
              type="url" 
              value={gambarUrl}
              onChange={(e) => setGambarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 font-medium transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Isi Konten</label>
            <textarea 
              required
              rows={6}
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              placeholder="Tulis artikel di sini..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 font-medium leading-relaxed resize-none transition-all"
            />
          </div>

          {/* Tombol Publikasi - Lebih ramping dan kompak */}
          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Send size={14} strokeWidth={3} />
                Publikasikan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}