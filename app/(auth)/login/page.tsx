'use client'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react' // Impor library ikon modern

export default function Login() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // State untuk mengontrol visibilitas kata sandi
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      router.push('/') 
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-600 via-teal-700 to-cyan-800 p-4 relative overflow-hidden text-slate-900 font-sans">
      <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-cyan-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>

      <div className="w-full max-w-85 backdrop-blur-xl bg-white/15 p-6 rounded-4xl shadow-2xl border border-white/20 text-center z-10">
        
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden border border-white/30">
          <img 
            src="/logo-permata.png" 
            alt="Logo Permata" 
            className="w-full h-full object-cover" 
          />
        </div>

        <h1 className="text-3l font-black text-white mb-1 uppercase tracking-tighter drop-shadow-md">
          Selamat Datang
        </h1>
        <p className="text-emerald-100 text-[8px] font-bold uppercase tracking-[0.2em] mb-8 opacity-80">
          Masuk ke Akun Permata Anda
        </p>
        
        <form onSubmit={handleLogin} className="space-y-3 text-left">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-white/90 uppercase ml-1 tracking-wider">Alamat Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="Email Anda" 
              className="w-full p-2.5 bg-white/10 border border-white/15 rounded-xl outline-none focus:ring-2 focus:ring-white/40 text-white text-xs font-medium placeholder:text-white/20 transition-all backdrop-blur-sm" 
              required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-white/90 uppercase ml-1 tracking-wider">Kata Sandi</label>
            {/* Kontainer relatif untuk menampung tombol ikon di dalam input */}
            <div className="relative group">
              <input 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                className="w-full p-2.5 bg-white/10 border border-white/15 rounded-xl outline-none focus:ring-2 focus:ring-white/40 text-white text-xs font-medium placeholder:text-white/20 transition-all backdrop-blur-sm pr-10" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
              >
                {/* Ikon Lucide untuk kesan profesional */}
                {showPassword ? <EyeOff size={14} strokeWidth={2.5} /> : <Eye size={14} strokeWidth={2.5} />}
              </button>
            </div>
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-white text-teal-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition shadow-md active:scale-95 disabled:opacity-50 mt-4"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest">
            Belum punya akun?{' '}
            <Link href="/register" className="text-white hover:text-emerald-200 underline decoration-white/30 underline-offset-2">
              Daftar Disini
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}