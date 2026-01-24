'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar({ userName, isAdmin, handleSignOut }: any) {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { name: 'Beranda', href: '/', icon: '🏠' },
    { name: 'Tentang Permata', href: '/tentang', icon: '💎' },
    { name: 'Cari Jodoh', href: '/', icon: '❤️' },
    { name: 'Ruang Diskusi', href: '/diskusi', icon: '💬' },
    { name: 'Nasihat Pernikahan', href: '/nasihat', icon: '📖' },
  ]

  return (
    <>
      {/* TOP NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 px-6 py-4 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-3">
          {/* PENGGANTIAN LOGO DI SINI */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-emerald-100 overflow-hidden">
            <img 
              src="/logo-permata.png" 
              alt="Logo Permata" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xl font-black text-emerald-900 tracking-tighter leading-none">Permata</span>
            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Temukan Pasangan Meraih Surga</span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 bg-white rounded-full shadow-sm border border-emerald-50 z-50"
        >
          <span className={`w-5 h-0.5 bg-emerald-800 rounded-full transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-5 h-0.5 bg-emerald-800 rounded-full ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-5 h-0.5 bg-emerald-800 rounded-full transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </nav>

      {/* HAMBURGER OVERLAY MENU */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-md" onClick={() => setIsOpen(false)}></div>
        <aside className={`absolute right-0 top-0 h-full w-72 bg-white shadow-2xl transition-transform duration-500 p-8 pt-24 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b border-emerald-50 pb-2">Menu Utama</p>
            {menuItems.map((item) => (
              <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)} className="text-lg font-bold text-slate-800 hover:text-emerald-600 transition-colors">
                {item.name}
              </Link>
            ))}
            
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b border-emerald-50 pb-2 mt-4">Akun Saya</p>
            {userName ? (
              <>
                {isAdmin && <Link href="/admin/dashboard" className="font-bold text-amber-600">📊 Dashboard Admin</Link>}
                <Link href="/peserta/akun" className="font-bold text-slate-800 italic">👤 Profil: {userName}</Link>
                <button onClick={handleSignOut} className="text-left font-bold text-rose-600 uppercase tracking-tighter">🚪 Logout</button>
              </>
            ) : (
              <Link href="/login" className="font-bold text-emerald-600">🔑 Login / Daftar</Link>
            )}
          </div>
        </aside>
      </div>

      {/* STICKY BOTTOM NAVBAR (Icons Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:hidden">
        <nav className="max-w-md mx-auto bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-2xl flex justify-around items-center p-2 relative">
          <Link href="/" className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xl">🏠</span>
            <span className="text-[8px] font-black uppercase text-slate-400">Beranda</span>
          </Link>
          <Link href="/tentang" className="flex flex-col items-center gap-1 flex-1 mr-6">
            <span className="text-xl">💎</span>
            <span className="text-[8px] font-black uppercase text-slate-400">Tentang</span>
          </Link>

          {/* Cari Jodoh Central */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
            <Link href="/" className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl shadow-xl border-4 border-white active:scale-90 transition-all">
              ❤️
            </Link>
            <span className="mt-1 text-[8px] font-black uppercase text-emerald-700">Cari Jodoh</span>
          </div>

          <Link href="/diskusi" className="flex flex-col items-center gap-1 flex-1 ml-6">
            <span className="text-xl">💬</span>
            <span className="text-[8px] font-black uppercase text-slate-400">Diskusi</span>
          </Link>
          <Link href="/nasihat" className="flex flex-col items-center gap-1 flex-1">
            <span className="text-xl">📖</span>
            <span className="text-[8px] font-black uppercase text-slate-400">Nasihat</span>
          </Link>
        </nav>
      </div>
    </>
  )
}