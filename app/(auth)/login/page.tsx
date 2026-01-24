'use client'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 relative overflow-hidden">
      {/* Dekorasi Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      {/* Card Glassmorphism */}
      <div className="w-full max-w-md backdrop-blur-xl bg-white/20 p-10 rounded-[2.5rem] shadow-2xl border border-white/30 text-center z-10">
        {/* Ikon dengan efek Glass */}
        <div className="w-20 h-20 bg-white/30 backdrop-blur-md text-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl border border-white/40 shadow-xl">
          🔐
        </div>
        
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter drop-shadow-md">
          Selamat Datang
        </h1>
        <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 opacity-80">
          Masuk untuk mengelola biodata Anda
        </p>
        
        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-white/80 uppercase ml-2 tracking-wider">Alamat Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="Email Anda" 
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 text-white font-medium placeholder:text-white/40 transition-all backdrop-blur-sm" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[11px] font-black text-white/80 uppercase ml-2 tracking-wider">Kata Sandi</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 text-white font-medium placeholder:text-white/40 transition-all backdrop-blur-sm" 
              required 
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-white text-emerald-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-50 transition shadow-[0_10px_20px_rgba(0,0,0,0.1)] active:scale-95 disabled:bg-white/50 disabled:text-emerald-900/30 mt-4 overflow-hidden relative group"
          >
            <span className="relative z-10">{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
            <div className="absolute inset-0 bg-linear-to-r from-white via-emerald-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="text-xs text-white/70 font-bold uppercase tracking-widest">
            Belum punya akun?{' '}
            <Link href="/register" className="text-white hover:text-emerald-200 underline decoration-emerald-300/50 underline-offset-4">
              Daftar Disini
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}