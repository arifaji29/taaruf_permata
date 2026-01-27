// 1. Perbaiki path ke utils menggunakan alias '@' agar lebih aman
import { createClient } from '@/app/utils/supabase/server' 
import Navbar from '@/components/navbar' 
import HeroSlider from '@/components/HeroSlider' 
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Ambil data Auth User
  const { data: { user } } = await supabase.auth.getUser()

  // Ambil Profil Peserta untuk sapaan Ahlan wa Sahlan
  let userProfileName = null;
  if (user) {
    const { data: profile } = await supabase
      .from('peserta')
      .select('nama')
      .eq('id', user.id)
      .single();
    
    userProfileName = profile?.nama;
  }
  
  const userName = userProfileName || user?.user_metadata?.nama || user?.email?.split('@')[0]
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

  // --- QUERY DATA BLOG: Mengambil 3 data terbaru ---
  const { data: daftarBlog } = await supabase
    .from('blog')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  // Server Action untuk Logout
  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-32 relative overflow-x-hidden text-slate-900">
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-emerald-500/10 to-transparent -z-10"></div>

      <Navbar userName={userName} isAdmin={isAdmin} handleSignOut={handleSignOut} />

      <div className="px-6 py-4 max-w-7xl mx-auto space-y-6">
        
        {/* SECTION SAPAAN DI BAWAH NAVBAR (SEBELAH KANAN) */}
        {user && (
          <div className="flex justify-end px-2 animate-in fade-in slide-in-from-right-2 duration-1000">
            <div className="bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-100/50 shadow-xs flex items-center gap-1.5">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-[9px] font-black text-emerald-800 tracking-tighter">
                Assalamu'alaikum, <span className="text-slate-500 font-bold">{userName}</span>
              </p>
            </div>
          </div>
        )}

        {/* HERO SLIDER SECTION - Kompak */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <HeroSlider />
        </section>

        {/* SECTION BLOG / INFORMASI TERBARU - Kompak */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Informasi Terbaru</h3>
            <Link 
              href="/umum/blog"
              className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              Lihat Semua →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {daftarBlog && daftarBlog.length > 0 ? (
              daftarBlog.map((item) => (
                <div key={item.id} className="group bg-white p-4 rounded-3xl shadow-sm border border-emerald-50 hover:shadow-md transition-all flex flex-col">
                  {item.gambar_url && (
                    <div className="aspect-video mb-3 overflow-hidden rounded-2xl">
                      <img src={item.gambar_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.judul} />
                    </div>
                  )}
                  
                  <div className="space-y-1 grow">
                    <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider">{item.penulis || 'Admin'}</p>
                    <h4 className="text-sm font-black text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {item.judul}
                    </h4>
                    <p className="text-slate-500 text-[10px] line-clamp-2 font-medium leading-relaxed italic">
                      {item.konten}
                    </p>
                  </div>

                  <Link 
                    href={`/umum/blog/${item.slug}`}
                    className="mt-3 text-[8px] font-black uppercase text-slate-400 group-hover:text-emerald-600 flex items-center gap-1 transition-colors"
                  >
                    Baca Selengkapnya <span>→</span>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-8 border-2 border-dashed border-emerald-100 rounded-3xl text-center bg-white/40 backdrop-blur-sm col-span-full">
                <div className="text-2xl mb-2 text-slate-300">✍️</div>
                <p className="text-slate-400 font-bold text-[10px] tracking-tight italic">
                  Konten blog akan muncul di sini.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}