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
    <main className="min-h-screen bg-slate-50 pb-32 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-emerald-500/10 to-transparent -z-10"></div>

      <Navbar userName={userName} isAdmin={isAdmin} handleSignOut={handleSignOut} />

      <div className="px-6 py-8 max-w-7xl mx-auto space-y-12">
        
        {/* HERO SLIDER SECTION */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
           <HeroSlider />
        </section>

        {/* SECTION BLOG / NASIHAT PERNIKAHAN */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Nasihat Terbaru</h3>
            {/* Navigasi ke daftar semua blog peserta */}
            <Link 
              href="/peserta/blog"
              className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
            >
              Lihat Semua →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {daftarBlog && daftarBlog.length > 0 ? (
              daftarBlog.map((item) => (
                <div key={item.id} className="group bg-white p-5 rounded-4xl shadow-sm border border-emerald-50 hover:shadow-md transition-all flex flex-col">
                  {item.gambar_url && (
                    <div className="aspect-video mb-4 overflow-hidden rounded-3xl">
                      <img src={item.gambar_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.judul} />
                    </div>
                  )}
                  
                  <div className="space-y-2 grow">
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">{item.penulis || 'Admin'}</p>
                    <h4 className="text-base font-black text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                      {item.judul}
                    </h4>
                    <p className="text-slate-500 text-[11px] line-clamp-3 font-medium leading-relaxed">
                      {item.konten}
                    </p>
                  </div>

                  {/* UPDATE: Menggunakan Link yang mengarah ke detail slug */}
                  <Link 
                    href={`/peserta/blog/${item.slug}`}
                    className="mt-4 text-[9px] font-black uppercase text-slate-400 group-hover:text-emerald-600 flex items-center gap-1 transition-colors"
                  >
                    Baca Selengkapnya <span>→</span>
                  </Link>
                </div>
              ))
            ) : (
              <>
                <div className="p-12 border-2 border-dashed border-emerald-100 rounded-4xl text-center bg-white/40 backdrop-blur-sm">
                  <div className="text-3xl mb-3">✍️</div>
                  <p className="text-slate-500 font-bold text-[11px] tracking-tight italic">
                    Konten blog akan muncul di sini <br />
                    setelah Admin mengisi data pada tabel 'blog'.
                  </p>
                </div>
                <div className="hidden md:block p-12 border-2 border-dashed border-emerald-100 rounded-4xl opacity-50"></div>
                <div className="hidden md:block p-12 border-2 border-dashed border-emerald-100 rounded-4xl opacity-30"></div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}