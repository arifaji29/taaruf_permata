'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapping params sesuai standar Next.js 15
  const { id } = use(params)
  
  const [judul, setJudul] = useState('')
  const [slug, setSlug] = useState('')
  const [konten, setKonten] = useState('')
  const [gambarUrl, setGambarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false) 
  
  const supabase = createClient()
  const router = useRouter()

  // Solusi Hydration: Pastikan komponen sudah terpasang di client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Ambil data lama saat halaman dimuat
  useEffect(() => {
    if (!mounted) return

    const fetchBlogData = async () => {
      const { data, error } = await supabase
        .from('blog')
        .select('*')
        .eq('id', id)
        .single()

      if (data) {
        setJudul(data.judul)
        setSlug(data.slug)
        setKonten(data.konten)
        setGambarUrl(data.gambar_url || '')
      }
      if (error) {
        console.error('Error fetching:', error.message)
        router.push('/admin/blog')
      }
      setLoading(false)
    }

    fetchBlogData()
  }, [id, mounted])

  const handleJudulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setJudul(value)
    // Otomatisasi Slug agar URL ramah SEO
    setSlug(value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    // PERBAIKAN: Menghapus 'updated_at' agar tidak error jika kolom belum ada di DB
    const { error } = await supabase
      .from('blog')
      .update({ 
        judul, 
        slug, 
        konten, 
        gambar_url: gambarUrl
      })
      .eq('id', id)

    if (error) {
      alert('Gagal memperbarui: ' + error.message)
    } else {
      alert('Perubahan berhasil disimpan di database!')
      router.push('/admin/blog')
      router.refresh() 
    }
    setSaving(false)
  }

  // Mencegah error terminal dengan menunggu hydration selesai
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog" className="p-2 hover:bg-slate-100 rounded-full transition-colors font-bold text-slate-800">
            ←
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Blog</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Judul Artikel</label>
            <input 
              required
              type="text" 
              value={judul}
              onChange={handleJudulChange}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">URL Slug (Otomatis)</label>
            <input 
              readOnly
              type="text" 
              value={slug}
              className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-mono text-sm font-bold cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Link Gambar Thumbnail</label>
            <input 
              type="url" 
              value={gambarUrl}
              onChange={(e) => setGambarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 font-medium transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider">Isi Konten</label>
            <textarea 
              required
              rows={12}
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium leading-relaxed shadow-sm placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-4 pt-4">
             <Link 
              href="/admin/blog"
              className="flex-1 text-center bg-slate-100 text-slate-600 p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200 shadow-sm"
            >
              Batal
            </Link>
            <button 
              disabled={saving}
              type="submit"
              className="flex-2 bg-emerald-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 active:scale-95"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}