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
      // Mengarahkan ke halaman utama setelah login berhasil
      router.push('/') 
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 text-center">
        {/* Dekorasi Visual */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl animate-pulse">
          🔐
        </div>
        
        <h1 className="text-2xl font-black text-emerald-900 mb-2 uppercase tracking-tight">Selamat Datang</h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">Masuk untuk mengelola biodata Anda</p>
        
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Alamat Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="Email Anda" 
              className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-medium transition-all" 
              required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Kata Sandi</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-medium transition-all" 
              required 
            />
          </div>
          
          <button 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 active:scale-95 disabled:bg-gray-300 mt-2"
          >
            {loading ? 'Memproses...' : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Belum punya akun?{' '}
            <Link href="/register" className="text-emerald-600 hover:underline">
              Daftar Disini
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}