import { createClient } from '@/app/utils/supabase/server'
import Navbar from '@/components/navbar'
import { Gem, ShieldCheck, Heart, Users, Sparkles, Link } from 'lucide-react'

export default async function TentangPermataPage() {
  const supabase = await createClient()

  // Ambil data Auth untuk Navbar
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

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-900 font-sans">
      <Navbar userName={userName} isAdmin={isAdmin} />

      {/* Hero Section Kompak */}
      <section className="bg-white border-b border-emerald-50 px-6 py-12 mb-8">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Gem size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase leading-none">
            Tentang Permata
          </h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed max-w-md mx-auto">
            Layanan taaruf mandiri yang didesain untuk membantu Anda menemukan pasangan hidup yang sevisi dalam meraih rida Allah SWT.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-6 space-y-8">
        {/* Visi & Misi Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Sparkles size={18} strokeWidth={3} />
            <h2 className="text-sm font-black uppercase tracking-wider">Visi Kami</h2>
          </div>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium italic">
            "Menjadi jembatan yang aman dan syar'i bagi para pencari jodoh untuk membangun keluarga yang Sakinah, Mawaddah, dan Warahmah."
          </p>
        </div>

        {/* Nilai-Nilai Utama (Grid Kompak) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">Privasi Terjaga</h3>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Data Anda bersifat rahasia dan hanya digunakan untuk keperluan mediasi tim perkawinan.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <Heart size={20} className="text-rose-500" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">Niat Ikhlas</h3>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Membangun platform tanpa biaya pendaftaran yang memberatkan bagi calon pengantin.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <Users size={20} className="text-emerald-600" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">Tim Pendamping</h3>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Didukung oleh tim perkawinan dari berbagai tingkatan untuk bimbingan langsung.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
            <Gem size={20} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight">Kualitas Profil</h3>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Setiap peserta melalui proses pengisian biodata yang detail dan terstruktur.
            </p>
          </div>
        </div>

        {/* Footer Info Kompak */}
        <div className="p-6 bg-emerald-900 rounded-[2.5rem] text-center text-white space-y-3 shadow-xl">
          <h3 className="text-sm font-black uppercase tracking-widest">Mulai Perjalanan Anda</h3>
          <p className="text-[10px] opacity-80 font-medium max-w-xs mx-auto">
            Bismillah, bulatkan niat dan lengkapi profil Anda sekarang juga.
          </p>
          <div className="pt-2">
            <Link 
              href="/register" 
              className="inline-block bg-white text-emerald-900 px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-50 transition-colors"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}