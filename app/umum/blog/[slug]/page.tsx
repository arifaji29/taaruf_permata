import { createClient } from '@/app/utils/supabase/server'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react' // Menggunakan ikon Lucide agar konsisten

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

  if (!blog) {
    notFound()
  }

  return (
    /* Menggunakan text-slate-900 untuk anti-dark mode */
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      <Navbar userName={userName} isAdmin={isAdmin} />

      {/* Konten Utama - Dipersempit dari max-w-4xl ke max-w-2xl agar kompak */}
      <article className="max-w-2xl mx-auto px-5 pt-8">
        
        {/* Navigasi Kembali - Lebih kecil dan rapat */}
        <Link 
          href="/umum/blog" 
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-6 hover:text-emerald-700 transition-all"
        >
          <ChevronLeft size={14} strokeWidth={3} /> Kembali ke Daftar Nasihat
        </Link>

        {/* Metadata Artikel */}
        <div className="space-y-2 mb-6">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.15em] opacity-70">
            {new Date(blog.created_at).toLocaleDateString('id-ID', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })} • Oleh {blog.penulis || 'Admin'}
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight uppercase">
            {blog.judul}
          </h1>
        </div>

        {/* Gambar Utama - Dikecilkan border radiusnya agar seimbang */}
        {blog.gambar_url && (
          <div className="w-full aspect-video rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 mb-8">
            <img 
              src={blog.gambar_url} 
              alt={blog.judul} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Isi Artikel - Ukuran teks disesuaikan agar lebih padat */}
        <div className="prose prose-slate max-w-none">
          <div className="text-slate-700 leading-relaxed font-medium text-sm md:text-base whitespace-pre-wrap italic opacity-90">
            {blog.konten}
          </div>
        </div>

        {/* Footer Artikel - Kompak (Dikecilkan ukurannya) */}
        <div className="mt-12 p-6 md:p-8 bg-white rounded-3xl border border-emerald-50 text-center space-y-3 shadow-sm">
          <span className="text-2xl">🌿</span>
          <h3 className="text-lg font-black text-emerald-900 uppercase tracking-tight leading-none">Semoga Bermanfaat</h3>
          <p className="text-slate-500 font-medium text-[11px] max-w-xs mx-auto leading-relaxed">
            Ambil kebaikan dari nasihat ini untuk diaplikasikan dalam membangun keluarga sakinah.
          </p>
          <div className="pt-2">
            <Link 
              href="/umum/blog" 
              className="inline-block bg-emerald-50 text-emerald-700 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-100 transition-colors"
            >
              Cari Nasihat Lainnya
            </Link>
          </div>
        </div>

      </article>
    </main>
  )
}