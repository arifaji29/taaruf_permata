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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nama: nama } }
    })

    if (authError) {
      alert("Gagal daftar: " + authError.message)
      setLoading(false)
      return
    }

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
      if (dbError) console.error("Gagal sinkronisasi profil:", dbError.message)
    }

    setIsSubmitted(true)
    setLoading(false)
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-600 via-teal-700 to-cyan-800 p-4 relative overflow-hidden">
        <div className="w-full max-w-85 backdrop-blur-xl bg-white/15 p-6 rounded-4xl shadow-2xl border border-white/20 text-center animate-in fade-in zoom-in duration-300 z-10">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-white/30 animate-bounce">
            📩
          </div>
          <h1 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Cek Email</h1>
          <p className="text-emerald-50 text-[11px] leading-relaxed mb-6 opacity-90 px-2">
            Link konfirmasi telah dikirim ke <br />
            <strong className="text-white font-bold">{userEmail}</strong>.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full bg-white text-emerald-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition active:scale-95 shadow-md"
          >
            Lanjut ke Login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-600 via-teal-700 to-cyan-800 p-4 relative overflow-hidden text-slate-900">
      <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-emerald-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
      
      <div className="w-full max-w-85 backdrop-blur-xl bg-white/15 p-6 rounded-4xl shadow-2xl border border-white/20 text-center z-10">
        
        {/* Frame Logo Lingkaran - Diperbaiki agar full */}
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden border border-white/30">
          <img 
            src="/logo-permata.png" 
            alt="Logo Permata" 
            // Ganti object-contain menjadi object-cover agar gambar memenuhi lingkaran
            className="w-full h-full object-cover" 
          />
        </div>

        <h1 className="text-3l font-black text-white mb-1 uppercase tracking-tighter drop-shadow-md">Daftar Akun Permata</h1>
        <p className="text-emerald-100 text-[8px] font-bold uppercase tracking-[0.2em] mb-6 opacity-80">Lengkapi Data Diri Berikut</p>
        
        <form onSubmit={handleRegister} className="space-y-3 text-left">
          {[
            { label: 'Nama Lengkap', name: 'nama', type: 'text', placeholder: 'Nama Lengkapmu' },
            { label: 'Nomor WhatsApp', name: 'nomor_telepon', type: 'tel', placeholder: '0812...' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'email aktif' },
            { label: 'Password', name: 'password', type: 'password', placeholder: 'Min. 6 Karakter' }
          ].map((field) => (
            <div key={field.name} className="space-y-1">
              <label className="text-[9px] font-black text-white/90 uppercase ml-1 tracking-wider">{field.label}</label>
              <input 
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                className="w-full p-2.5 bg-white/10 border border-white/15 rounded-xl outline-none focus:ring-2 focus:ring-white/40 text-white text-xs font-medium placeholder:text-white/20 transition-all backdrop-blur-sm" 
                required 
              />
            </div>
          ))}
          
          <button 
            disabled={loading} 
            className="w-full bg-white text-emerald-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition active:scale-95 disabled:opacity-50 mt-3 shadow-md"
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-[9px] text-white/70 font-bold uppercase tracking-widest">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-white hover:text-emerald-200 underline decoration-white/30 underline-offset-2">
              Masuk Disini
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}