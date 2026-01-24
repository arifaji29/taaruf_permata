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
    const nomor_telepon = formData.get('nomor_telepon') as string

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
            id: authData.user.id, 
            nama: nama,
            email: email,
            nomor_telepon: nomor_telepon, 
            is_visible: false 
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
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 relative overflow-hidden">
        <div className="w-full max-w-md backdrop-blur-xl bg-white/20 p-10 rounded-[2.5rem] shadow-2xl border border-white/30 text-center animate-in fade-in zoom-in duration-300 z-10">
          <div className="w-20 h-20 bg-white/30 backdrop-blur-md text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-white/40 animate-bounce">
            📩
          </div>
          <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tight drop-shadow-md">Cek Email Anda</h1>
          <p className="text-emerald-50 text-sm leading-relaxed mb-8 opacity-90">
            Link konfirmasi telah dikirim ke <br />
            <strong className="text-white font-bold">{userEmail}</strong>.<br />
            Silakan klik link tersebut untuk mengaktifkan akun Anda.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full bg-white text-emerald-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-50 transition shadow-lg active:scale-95"
          >
            Lanjut ke Login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 relative overflow-hidden">
      {/* Dekorasi Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md backdrop-blur-xl bg-white/20 p-10 rounded-[2.5rem] shadow-2xl border border-white/30 text-center z-10">
        <div className="w-16 h-16 bg-white/30 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl border border-white/40">
          📝
        </div>

        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter drop-shadow-md">Daftar Akun</h1>
        <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 opacity-80">Buat akun untuk mulai taaruf</p>
        
        <form onSubmit={handleRegister} className="space-y-4 text-left">
          {[
            { label: 'Nama Lengkap', name: 'nama', type: 'text', placeholder: 'Nama Lengkapmu' },
            { label: 'Nomor WhatsApp', name: 'nomor_telepon', type: 'tel', placeholder: '0812...' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'email aktif' },
            { label: 'Password', name: 'password', type: 'password', placeholder: 'Min. 6 Karakter' }
          ].map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label className="text-[11px] font-black text-white/80 uppercase ml-2 tracking-wider">{field.label}</label>
              <input 
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                className="w-full p-3.5 bg-white/10 border border-white/20 rounded-2xl outline-none focus:ring-2 focus:ring-white/50 text-white font-medium placeholder:text-white/30 transition-all backdrop-blur-sm" 
                required 
              />
            </div>
          ))}
          
          <button 
            disabled={loading} 
            className="w-full bg-white text-emerald-700 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-50 transition shadow-xl active:scale-95 disabled:bg-white/50 disabled:text-emerald-900/30 mt-4"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-white/70 font-bold uppercase tracking-widest">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-white hover:text-emerald-200 underline decoration-emerald-300/50 underline-offset-4">
              Masuk Disini
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}