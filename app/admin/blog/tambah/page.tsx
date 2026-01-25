'use client'
import { useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 hover:bg-slate-100 rounded-full transition-colors font-bold text-slate-800">
            ←
          </Link>
          <h1 className="text-3xl font-black text-slate-900">Tambah Blog Baru</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul Artikel dengan kontras lebih tinggi */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Judul Artikel</label>
            <input 
              required
              type="text" 
              value={judul}
              onChange={handleJudulChange}
              placeholder="Contoh: Tips Taaruf yang Berkah"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* URL Slug dengan teks monospaced yang lebih gelap */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">URL Slug (Otomatis)</label>
            <input 
              readOnly
              type="text" 
              value={slug}
              className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-600 font-mono text-sm font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Link Gambar Thumbnail</label>
            <input 
              type="url" 
              value={gambarUrl}
              onChange={(e) => setGambarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Isi Konten</label>
            <textarea 
              required
              rows={10}
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              placeholder="Tulis nasihat atau artikel Anda di sini..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium leading-relaxed placeholder:text-slate-400"
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Publikasikan Sekarang'}
          </button>
        </form>
      </div>
    </div>
  )
}