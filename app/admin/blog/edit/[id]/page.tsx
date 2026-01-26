'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react' // Menggunakan ikon Lucide agar konsisten

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
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

  useEffect(() => {
    setMounted(true)
  }, [])

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
    setSlug(value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''))
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

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
      alert('Perubahan berhasil disimpan!')
      router.push('/admin/blog')
      router.refresh() 
    }
    setSaving(false)
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Container dipersempit ke max-w-xl agar lebih kompak */}
      <div className="max-w-xl mx-auto bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6 text-slate-900 animate-in fade-in duration-500">
        
        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
          <Link href="/admin/blog" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
            <ChevronLeft size={20} strokeWidth={3} />
          </Link>
          <h1 className="text-xl font-black text-emerald-900 uppercase tracking-tight">Edit Blog</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Input Judul - Ukuran teks dan padding diperkecil */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Judul Artikel</label>
            <input 
              required
              type="text" 
              value={judul}
              onChange={handleJudulChange}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm text-slate-900 transition-all shadow-xs"
            />
          </div>

          {/* URL Slug - Dibuat lebih ramping */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">URL Slug (Otomatis)</label>
            <input 
              readOnly
              type="text" 
              value={slug}
              className="w-full p-3 bg-slate-100 border border-gray-200 rounded-xl text-slate-500 font-mono text-[11px] font-bold cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Link Gambar Thumbnail</label>
            <input 
              type="url" 
              value={gambarUrl}
              onChange={(e) => setGambarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 font-medium transition-all shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Isi Konten</label>
            <textarea 
              required
              rows={8}
              value={konten}
              onChange={(e) => setKonten(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 font-medium leading-relaxed resize-none shadow-xs transition-all"
            />
          </div>

          {/* Action Buttons - Tata letak lebih kompak */}
          <div className="flex gap-3 pt-2">
             <Link 
              href="/admin/blog"
              className="flex-1 text-center bg-slate-100 text-slate-600 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all border border-slate-200"
            >
              Batal
            </Link>
            <button 
              disabled={saving}
              type="submit"
              className="flex-2 bg-emerald-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={14} strokeWidth={3} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}