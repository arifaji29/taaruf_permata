import { createClient } from '@/app/utils/supabase/server'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Ambil Data Auth & Profil untuk Navbar
  const { data: { user } } = await supabase.auth.getUser()
  let userProfileName = null
  if (user) {
    const { data: profile } = await supabase
      .from('peserta')
      .select('nama')
      .eq('id', user.id)
      .single()
    userProfileName = profile?.nama
  }
  const userName = userProfileName || user?.user_metadata?.nama || user?.email?.split('@')[0]
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin'

  // 2. Ambil Data Blog berdasarkan Slug
  const { data: blog } = await supabase
    .from('blog')
    .select('*')
    .eq('slug', slug)
    .single()

  // Jika blog tidak ditemukan, tampilkan halaman 404
  if (!blog) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white pb-20">
      <Navbar userName={userName} isAdmin={isAdmin} />

      {/* Konten Utama */}
      <article className="max-w-4xl mx-auto px-6 pt-12">
        
        {/* Navigasi Kembali */}
        <Link 
          href="/peserta/blog" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 mb-8 hover:gap-3 transition-all"
        >
          ← Kembali ke Daftar Nasihat
        </Link>

        {/* Metadata Artikel */}
        <div className="space-y-4 mb-8">
          <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">
            {new Date(blog.created_at).toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })} • Oleh {blog.penulis || 'Admin'}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight">
            {blog.judul}
          </h1>
        </div>

        {/* Gambar Utama */}
        {blog.gambar_url && (
          <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl shadow-emerald-100/50 mb-12">
            <img 
              src={blog.gambar_url} 
              alt={blog.judul} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Isi Artikel */}
        <div className="prose prose-slate prose-lg max-w-none">
          <div className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
            {blog.konten}
          </div>
        </div>

        {/* Footer Artikel / Call to Action */}
        <div className="mt-20 p-8 md:p-12 bg-emerald-50 rounded-[3rem] border border-emerald-100 text-center space-y-4">
          <span className="text-3xl">🌿</span>
          <h3 className="text-xl font-black text-emerald-900">Semoga bermanfaat untuk rumah tangga Anda</h3>
          <p className="text-emerald-700 font-medium text-sm max-w-md mx-auto leading-relaxed">
            Ambil yang baik dari nasihat ini dan terapkanlah dengan penuh kasih sayang bersama pasangan.
          </p>
          <div className="pt-4">
            <Link 
              href="/peserta/blog" 
              className="inline-block bg-white text-emerald-700 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-sm hover:bg-emerald-100 transition-colors"
            >
              Baca Nasihat Lainnya
            </Link>
          </div>
        </div>

      </article>
    </main>
  )
}