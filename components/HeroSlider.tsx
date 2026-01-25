'use client'
import { useState, useEffect } from 'react'

const slides = [
  {
    id: 1,
    title: "Temukan Pasangan Menuju SurgaNya",
    desc: "Layanan Taaruf terpusat untuk membantu Anda menemukan pasangan hidup yang sesuai dengan syariat.",
    image: "https://plus.unsplash.com/premium_photo-1678834778658-9862d9987dd3?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=1200",
    color: "from-emerald-600/80"
  },
  {
    id: 2,
    title: "Lebih Mudah dalam satu genggaman",
    desc: "Data profil Anda hanya ditampilkan atas izin Anda dan dikelola oleh tim admin yang amanah.",
    image: "https://images.unsplash.com/photo-1707329195093-83048065f99a?q=80&w=385&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=1200",
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
    /* Menggunakan aspet 4/3 agar lebih ramping di mobile daripada aspect-square */
    <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-125 overflow-hidden rounded-4xl md:rounded-[2.5rem] shadow-2xl border border-white/20">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100' : 'opacity-0 invisible'
          }`}
        >
          <img src={slide.image} className="w-full h-full object-cover" alt={slide.title} />
          
          <div className={`absolute inset-0 bg-linear-to-r ${slide.color} to-transparent flex items-center px-5 md:px-16`}>
            {/* Padding dikurangi dari p-5 ke p-4 agar lebih rapat */}
            <div className="max-w-[85%] md:max-w-lg backdrop-blur-md bg-white/10 p-4 md:p-8 rounded-[2rem] border border-white/20">
              {/* Ukuran teks diturunkan dari text-2xl ke text-xl */}
              <h2 className="text-xl md:text-5xl font-black text-white leading-tight mb-1.5 md:mb-4 drop-shadow-lg uppercase tracking-tighter">
                {slide.title}
              </h2>
              {/* Deskripsi diturunkan ke text-[10px] */}
              <p className="text-white/90 text-[10px] md:text-base font-medium leading-relaxed drop-shadow-md line-clamp-2 md:line-clamp-none">
                {slide.desc}
              </p>
              {/* Tombol diperkecil paddingnya */}
              <button className="mt-3 md:mt-6 bg-white text-emerald-700 px-5 md:px-8 py-2 md:py-3 rounded-full font-black uppercase tracking-widest text-[9px] md:text-xs shadow-lg active:scale-95 transition-all">
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Indikator Slide diperkecil posisinya */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1 rounded-full transition-all ${
              i === current ? 'bg-white w-5' : 'bg-white/40 w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  )
}