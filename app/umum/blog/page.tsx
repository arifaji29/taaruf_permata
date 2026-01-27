import { createClient } from '@/app/utils/supabase/server'
import Navbar from '@/components/navbar'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react' // Menggunakan ikon Lucide agar seragam

export default async function PesertaBlogPage() {
  const supabase = await createClient()

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

  const { data: daftarBlog } = await supabase
    .from('blog')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    /* Menggunakan text-slate-900 untuk anti-dark mode secara global */
    <main className="min-h-screen bg-slate-50 pb-32 text-slate-900">
      <Navbar userName={userName} isAdmin={isAdmin} />

      {/* Header Halaman - Dibuat lebih ringkas (Kompak) */}
      <div className="bg-white border-b border-emerald-50 px-6 py-8 mb-8">
        <div className="max-w-6xl mx-auto text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
            <BookOpen size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kumpulan Nasihat</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">
            Nasihat Pernikahan
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed text-[11px] md:text-xs">
            Membangun rumah tangga sakinah, mawaddah, dan warahmah sesuai sunnah.
          </p>
        </div>
      </div>

      <div className="px-5 max-w-6xl mx-auto">
        {/* Grid Artikel - Spasi antar kolom dikurangi agar padat */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {daftarBlog && daftarBlog.length > 0 ? (
            daftarBlog.map((item) => (
              <div key={item.id} className="group bg-white rounded-3xl shadow-sm border border-emerald-50 overflow-hidden flex flex-col hover:shadow-md transition-all duration-300">
                {/* Thumbnail Gambar - Aspect ratio kompak */}
                {item.gambar_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.gambar_url} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={item.judul} 
                    />
                  </div>
                )}
                
                <div className="p-5 flex flex-col grow">
                  <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <span>{item.penulis || 'Admin'}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-slate-400">{new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                  </p>
                  
                  <h2 className="text-base font-black text-slate-800 leading-tight mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {item.judul}
                  </h2>
                  
                  <p className="text-slate-500 text-[11px] font-medium line-clamp-3 leading-relaxed grow italic opacity-80">
                    {item.konten}
                  </p>
                  
                  <Link 
                    href={`/umum/blog/${item.slug}`}
                    className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:gap-3 transition-all"
                  >
                    Baca Detail <ArrowRight size={10} strokeWidth={3} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-emerald-100">
              <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                 <BookOpen size={20} className="text-emerald-300" />
              </div>
              <p className="text-slate-400 text-xs font-bold italic">Belum ada nasihat yang dipublikasikan.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}