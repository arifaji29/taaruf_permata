'use client'
import { useState, useEffect } from 'react'

const slides = [
  {
    id: 1,
    title: "Temukan Pasangan Syar'i",
    desc: "Layanan Taaruf terpusat untuk membantu Anda menemukan pasangan hidup yang sesuai dengan syariat.",
    image: "https://images.unsplash.com/photo-1518101645466-7795885ff8f8?q=80&w=1200", // Contoh gambar Islami/Pernikahan
    color: "from-emerald-600/80"
  },
  {
    id: 2,
    title: "Privasi Terjaga Keamanannya",
    desc: "Data profil Anda hanya ditampilkan atas izin Anda dan dikelola oleh tim admin yang amanah.",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200",
    color: "from-teal-600/80"
  }
]

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full h-[100 md:h-125 overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/20">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Gambar Background */}
          <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
          
          {/* Overlay Glassmorphism */}
          <div className={`absolute inset-0 bg-linear-to-r ${slide.color} to-transparent flex items-center px-8 md:px-16`}>
            <div className="max-w-lg backdrop-blur-md bg-white/10 p-6 rounded-3xl border border-white/20">
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter mb-4 drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="text-white/90 text-sm md:text-base font-medium leading-relaxed drop-shadow-md">
                {slide.desc}
              </p>
              <button className="mt-6 bg-white text-emerald-700 px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-emerald-50 transition-all active:scale-95 shadow-lg">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Indikator Slide */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === current ? 'bg-white w-6' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}