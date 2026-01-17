'use client'
import { useState } from 'react'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false) 
  const [userEmail, setUserEmail] = useState('')

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nama = formData.get('nama') as string
    const nomor_telepon = formData.get('nomor_telepon') as string // Ambil data nomor telepon

    setUserEmail(email)

    // 1. Signup ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama: nama,
        }
      }
    })

    if (authError) {
      alert("Gagal daftar: " + authError.message)
      setLoading(false)
      return
    }

    // 2. SINKRONISASI OTOMATIS: Buat profil di tabel peserta
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('peserta')
        .insert([
          { 
            id: authData.user.id, // Sinkronisasi ID dengan Auth
            nama: nama,
            email: email,
            nomor_telepon: nomor_telepon, // Simpan nomor telepon ke database
            is_visible: false // Tetap sembunyi sampai biodata lengkap
          }
        ])

      if (dbError) {
        console.error("Gagal sinkronisasi profil ke database:", dbError.message)
      }
    }

    setIsSubmitted(true)
    setLoading(false)
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-bounce">
            📩
          </div>
          <h1 className="text-2xl font-black text-emerald-900 mb-4 uppercase tracking-tight">Cek Email Anda</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Link konfirmasi telah dikirim ke <br />
            <strong className="text-emerald-700">{userEmail}</strong>.<br />
            Silakan klik link tersebut untuk mengaktifkan akun Anda.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg active:scale-95"
          >
            Lanjut ke Login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl">
          📝
        </div>

        <h1 className="text-2xl font-black text-emerald-900 mb-2 uppercase tracking-tight">Daftar Akun</h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-8">Buat akun untuk mulai taaruf</p>
        
        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nama Lengkap</label>
            <input 
              name="nama" 
              placeholder="Sesuai KTP" 
              className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-medium transition-all" 
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nomor WhatsApp</label>
            <input 
              name="nomor_telepon" 
              type="tel"
              placeholder="0812..." 
              className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-medium transition-all" 
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Email</label>
            <input 
              name="email" 
              type="email" 
              placeholder="email@aktif.com" 
              className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-medium transition-all" 
              required 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="Min. 6 Karakter" 
              className="w-full p-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50/50 font-medium transition-all" 
              required 
            />
          </div>
          
          <button 
            disabled={loading} 
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg active:scale-95 disabled:bg-gray-300 mt-2"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-emerald-600 hover:underline">
              Masuk Disini
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}