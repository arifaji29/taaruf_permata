import { createClient } from '@/app/utils/supabase/server'
import Navbar from '@/components/navbar'
import Link from 'next/link'

export default async function PesertaBlogPage() {
  const supabase = await createClient()

  // Ambil data Auth User untuk Navbar
  const { data: { user } } = await supabase.auth.getUser()

  // Ambil Profil untuk sapaan di Navbar
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

  // Ambil semua data blog dari database
  const { data: daftarBlog } = await supabase
    .from('blog')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-slate-50 pb-32">
      <Navbar userName={userName} isAdmin={isAdmin} />

      {/* Header Halaman */}
      <div className="bg-white border-b border-emerald-50 px-6 py-12 mb-12">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Nasihat Pernikahan</h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Kumpulan artikel dan nasihat untuk membangun rumah tangga yang sakinah, mawaddah, dan warahmah sesuai sunnah.
          </p>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto">
        {/* Grid Artikel 3 Kolom */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {daftarBlog && daftarBlog.length > 0 ? (
            daftarBlog.map((item) => (
              <div key={item.id} className="group bg-white rounded-4xl shadow-sm border border-emerald-50 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
                {/* Thumbnail Gambar */}
                {item.gambar_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.gambar_url} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt={item.judul} 
                    />
                  </div>
                )}
                
                <div className="p-6 flex flex-col grow">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">
                    {item.penulis || 'Admin'} • {new Date(item.created_at).toLocaleDateString('id-ID')}
                  </p>
                  
                  <h2 className="text-xl font-black text-slate-800 leading-tight mb-3 group-hover:text-emerald-700 transition-colors">
                    {item.judul}
                  </h2>
                  
                  <p className="text-slate-500 text-sm font-medium line-clamp-3 leading-relaxed grow">
                    {item.konten}
                  </p>
                  
                  <Link 
                    href={`/peserta/blog/${item.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 hover:gap-3 transition-all"
                  >
                    Baca Selengkapnya <span>→</span>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            /* Tampilan jika belum ada blog */
            <div className="col-span-full py-20 text-center bg-white rounded-4xl border-2 border-dashed border-emerald-100">
              <span className="text-5xl mb-4 block">📚</span>
              <p className="text-slate-400 font-bold italic">Belum ada nasihat yang dipublikasikan.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}