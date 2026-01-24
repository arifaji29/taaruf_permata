// 1. Perbaiki path ke utils menggunakan alias '@' agar lebih aman
import { createClient } from '../app/utils/supabase/server'
import Navbar from '@/components/navbar' 
import HeroSlider from '@/components/HeroSlider' 
import { redirect } from 'next/navigation'

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

  // Server Action untuk Logout
  async function handleSignOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-32 relative overflow-x-hidden">
      {/* Background Glow Decoration */}
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
            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
              Lihat Semua →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-16 border-2 border-dashed border-emerald-100 rounded-[2.5rem] text-center bg-white/40 backdrop-blur-sm">
              <div className="text-4xl mb-4">✍️</div>
              <p className="text-slate-500 font-bold text-sm tracking-tight italic">
                Konten nasihat pernikahan akan muncul di sini <br />
                setelah Admin mengisi data pada tabel 'nasihat'.
              </p>
            </div>
            <div className="hidden md:block p-16 border-2 border-dashed border-emerald-100 rounded-[2.5rem] text-center bg-white/40 backdrop-blur-sm opacity-50">
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}