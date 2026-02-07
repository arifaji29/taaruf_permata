'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'
// Impor ikon Lucide (Loader2 ditambahkan untuk indikator loading pencarian)
import { User, Users, Heart, Camera, Save, ShieldCheck, Phone, MapPin, Loader2, Check } from 'lucide-react'

export default function RegisterPeserta() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // --- STATE BARU: SKEMA AUTOCOMPLETE ---
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputNamaTim, setInputNamaTim] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUserId(user.id)

      // Ambil profil beserta data tim kelompok jika sudah ada
      const { data } = await supabase
        .from('peserta')
        .select(`*, tim_kelompok:tim_kelompok_id(*)`)
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        if (data.avatar_url) setPreviewUrl(data.avatar_url)
        // Sinkronisasi input nama tim dengan data profil yang ada
        if (data.tim_kelompok?.nama) setInputNamaTim(data.tim_kelompok.nama)
      } else {
        setProfile({}) 
      }
      setLoadingProfile(false)
    }

    fetchProfile()
  }, [])

  // --- LOGIKA PENCARIAN (AUTOCOMPLETE) ---
  const handleSearchTim = async (val: string) => {
    setInputNamaTim(val)
    
    // Cari jika input lebih dari 1 karakter
    if (val.length > 1) {
      setIsSearching(true)
      const { data } = await supabase
        .from('tim_perkawinan')
        .select('*')
        // Filter berdasarkan peran petugas kelompok
        .eq('dapukan', 'Tim Perkawinan Kelompok')
        .ilike('nama', `%${val}%`)
        .limit(5)
      
      setSuggestions(data || [])
      setShowSuggestions(true)
      setIsSearching(false)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // --- LOGIKA MEMILIH SUGGESTION ---
  const selectSuggestion = (tim: any) => {
    setInputNamaTim(tim.nama)
    setShowSuggestions(false)
    
    // Update state profile agar input WA dan Alamat terisi otomatis (via defaultValue & key)
    setProfile((prev: any) => ({
      ...prev,
      tim_kelompok: {
        ...prev?.tim_kelompok,
        nomor_telepon: tim.nomor_telepon,
        alamat_lengkap: tim.alamat_lengkap
      }
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    let finalAvatarUrl = profile?.avatar_url || null

    if (imageFile && userId) {
      const fileExt = (imageFile as File).name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `user_photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, imageFile as File, { upsert: true })

      if (uploadError) {
        alert('Gagal upload foto: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
        
      finalAvatarUrl = publicUrl
    }

    // LOGIKA PENDAFTARAN/PEMBARUAN TIM KELOMPOK KE TABEL tim_perkawinan
    let currentTimKelompokId = profile?.tim_kelompok_id || null
    
    // Gunakan inputNamaTim dari state, bukan langsung dari formData karena autocomplete
    const namaTimInput = inputNamaTim 
    const waTimInput = formData.get('wa_tim_kelompok') as string
    const alamatTimInput = formData.get('alamat_tim_kelompok') as string

    if (namaTimInput) {
      // Menjalankan upsert petugas ke tabel tim_perkawinan
      const { data: newTim, error: timError } = await supabase
        .from('tim_perkawinan')
        .upsert({ 
          nama: namaTimInput, 
          nomor_telepon: waTimInput, 
          alamat_lengkap: alamatTimInput, // Alamat petugas tersinkronisasi
          dapukan: 'Tim Perkawinan Kelompok' 
        }, { onConflict: 'nama' }) 
        .select()
        .single()

      if (!timError && newTim) {
        currentTimKelompokId = newTim.id
      } else if (timError) {
        console.error("Gagal sinkronisasi petugas:", timError.message)
      }
    }

    const payload = {
      id: userId,
      avatar_url: finalAvatarUrl,
      nama: formData.get('nama') as string,
      bin_binti: formData.get('bin_binti') as string,
      jenis_kelamin: formData.get('jenis_kelamin') as string,
      status: formData.get('status') as string,
      tempat_lahir: formData.get('tempat_lahir') as string,
      tanggal_lahir: formData.get('tanggal_lahir') as string,
      anak_ke: Number(formData.get('anak_ke')),
      jumlah_saudara: Number(formData.get('jumlah_saudara')),
      suku: formData.get('suku') as string,
      tinggi_badan: Number(formData.get('tinggi_badan')),
      berat_badan: Number(formData.get('berat_badan')),
      pendidikan_terakhir: formData.get('pendidikan_terakhir') as string,
      pekerjaan: formData.get('pekerjaan') as string,
      nomor_telepon: formData.get('nomor_telepon') as string,
      hobby: formData.get('hobby') as string,
      dapukan: formData.get('dapukan') as string,
      kelompok: formData.get('kelompok') as string,
      desa: formData.get('desa') as string,
      daerah: formData.get('daerah') as string,
      tim_kelompok_id: currentTimKelompokId, // Relasi ke tabel tim_perkawinan diperbarui
      alamat_lengkap: formData.get('alamat_lengkap') as string,
      kriteria_calon_pasangan: formData.get('kriteria_calon_pasangan') as string,
      is_visible: true 
    }

    const { error } = await supabase
      .from('peserta')
      .upsert(payload, { onConflict: 'id' }) 

    if (error) {
      alert('Gagal menyimpan: ' + error.message)
    } else {
      alert('Biodata Taaruf Berhasil Diperbarui!')
      router.replace('/peserta/akun') 
    }

    setLoading(false)
  }

  if (loadingProfile) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900">
       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-600 mb-2"></div>
       <p className="font-bold text-emerald-800 uppercase tracking-widest text-[10px]">Memuat Formulir...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-white py-6">
      <div className="max-w-2xl mx-auto p-6 md:p-8 bg-white shadow-lg rounded-3xl border border-gray-100 text-slate-900 overflow-visible">
        
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => router.push('/peserta/akun')}
            className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-200 flex items-center gap-1.5"
          >
            <User size={12} /> Lihat Profil Saya
          </button>
        </div>

        <h1 className="text-xl font-black mb-6 text-emerald-800 border-b border-emerald-50 pb-3 text-center uppercase tracking-tight">
          Biodata Taaruf Permata
        </h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* --- SECTION FOTO --- */}
          <div className="md:col-span-2 flex flex-col items-center bg-emerald-50/30 p-4 rounded-2xl border-2 border-dashed border-emerald-100 mb-2">
            <div className="relative w-28 h-36 bg-white rounded-xl shadow-inner border border-emerald-100 overflow-hidden mb-3 flex items-center justify-center text-gray-300">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <Camera size={32} className="opacity-20" />
              )}
            </div>
            <label className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-black text-[10px] uppercase cursor-pointer hover:bg-emerald-700 transition shadow-sm active:scale-95 flex items-center gap-2">
              <Camera size={12} /> {profile?.avatar_url ? 'Ganti Foto' : 'Pilih Foto'}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <p className="text-[8px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">JPG / PNG | Max 2MB</p>
          </div>

          {/* --- 1. INFORMASI PERSONAL --- */}
          <div className="md:col-span-2 text-emerald-800 font-black border-l-4 border-emerald-600 pl-2 text-[11px] uppercase tracking-wider mt-2 flex items-center gap-2">
            <User size={14} /> Informasi Personal
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nama Lengkap</label>
            <input name="nama" defaultValue={profile?.nama} className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white font-medium" required />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Bin / Binti</label>
            <input name="bin_binti" defaultValue={profile?.bin_binti} className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white font-medium" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Jenis Kelamin</label>
            <select name="jenis_kelamin" defaultValue={profile?.jenis_kelamin} className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white font-medium" required>
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Status Pernikahan</label>
            <select name="status" defaultValue={profile?.status} className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white font-medium" required>
              <option value="">Pilih</option>
              <option value="Lajang">Lajang</option>
              <option value="Duda">Duda</option>
              <option value="Janda">Janda</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tempat Lahir</label>
            <input name="tempat_lahir" defaultValue={profile?.tempat_lahir} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tanggal Lahir</label>
            <input name="tanggal_lahir" type="date" defaultValue={profile?.tanggal_lahir} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Anak Ke</label>
              <input name="anak_ke" type="number" defaultValue={profile?.anak_ke} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Jumlah Bersaudara</label>
              <input name="jumlah_saudara" type="number" defaultValue={profile?.jumlah_saudara} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Suku</label>
            <input name="suku" defaultValue={profile?.suku} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tinggi / Berat</label>
            <div className="grid grid-cols-2 gap-2">
               <input name="tinggi_badan" type="number" placeholder="cm" defaultValue={profile?.tinggi_badan} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
               <input name="berat_badan" type="number" placeholder="kg" defaultValue={profile?.berat_badan} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Pendidikan Terakhir</label>
            <input name="pendidikan_terakhir" defaultValue={profile?.pendidikan_terakhir} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Pekerjaan</label>
            <input name="pekerjaan" defaultValue={profile?.pekerjaan} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nomor WA</label>
            <input name="nomor_telepon" type="tel" defaultValue={profile?.nomor_telepon} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Hobby</label>
            <input name="hobby" defaultValue={profile?.hobby} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Alamat Domisili</label>
            <textarea name="alamat_lengkap" defaultValue={profile?.alamat_lengkap} rows={2} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          {/* --- 2. INFORMASI SAMBUNG --- */}
          <div className="md:col-span-2 text-emerald-800 font-black border-l-4 border-emerald-600 pl-2 text-[11px] uppercase tracking-wider mt-3 flex items-center gap-2">
            <Users size={14} /> Informasi Sambung
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Dapukan</label>
            <input name="dapukan" defaultValue={profile?.dapukan} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Kelompok</label>
            <input name="kelompok" defaultValue={profile?.kelompok} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Desa</label>
            <input name="desa" defaultValue={profile?.desa} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Daerah</label>
            <input name="daerah" defaultValue={profile?.daerah} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" required />
          </div>

          {/* --- 3. KRITERIA CALON PASANGAN --- */}
          <div className="md:col-span-2 text-emerald-800 font-black border-l-4 border-emerald-600 pl-2 text-[11px] uppercase tracking-wider mt-3 flex items-center gap-2">
            <Heart size={14} /> Kriteria Calon Pasangan
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <textarea name="kriteria_calon_pasangan" defaultValue={profile?.kriteria_calon_pasangan} rows={2} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white font-medium" placeholder="Sebutkan kriteria khusus..." />
          </div>

          {/* --- 4. BAGIAN TIM PERKAWINAN KELOMPOK (AUTOCOMPLETE DITAMBAHKAN DI SINI) --- */}
          <div className="md:col-span-2 text-emerald-800 font-black border-l-4 border-emerald-600 pl-2 text-[11px] uppercase tracking-wider mt-3 flex items-center gap-2">
            <ShieldCheck size={14} /> Tim Perkawinan Kelompok
          </div>

          <div className="flex flex-col gap-1 relative z-50">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><User size={10}/> Nama Petugas</label>
            <div className="relative">
              <input 
                name="nama_tim_kelompok" 
                placeholder="Nama Lengkap Petugas"
                value={inputNamaTim}
                autoComplete="off"
                onChange={(e) => handleSearchTim(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay agar onClick bisa jalan sebelum hide
                className="w-full p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white font-bold" 
                required
              />
              {isSearching && <Loader2 size={12} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-500" />}
            </div>

            {/* Dropdown Suggestion */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-999 overflow-hidden mt-1 animate-in fade-in zoom-in-95 duration-200 border-t-4 border-t-emerald-500">
                <p className="bg-slate-50 px-3 py-1.5 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-gray-100">Database Petugas:</p>
                {suggestions.map((tim) => (
                  <button
                    key={tim.id}
                    type="button"
                    onMouseDown={() => selectSuggestion(tim)} // Gunakan onMouseDown agar prioritas lebih tinggi dari onBlur input
                    className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 transition-colors flex items-center justify-between group"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-700 group-hover:text-emerald-700 truncate capitalize">{tim.nama}</p>
                      <p className="text-[9px] text-slate-400 truncate tracking-tighter">{tim.alamat_lengkap || 'Alamat tidak tersedia'}</p>
                    </div>
                    <Check size={12} className="text-emerald-500 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 relative z-0">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><Phone size={10}/>No. WhatsApp</label>
            <input 
              name="wa_tim_kelompok" 
              placeholder="628..."
              defaultValue={profile?.tim_kelompok?.nomor_telepon}
              key={`wa-${profile?.tim_kelompok?.nomor_telepon}`} // Key unik agar input re-render saat data dipilih
              className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white font-bold" 
              required
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1 relative z-0">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-1"><MapPin size={10}/> Alamat/Kelompok</label>
            <input 
              name="alamat_tim_kelompok" 
              placeholder="Alamat Lengkap Petugas Kelompok"
              defaultValue={profile?.tim_kelompok?.alamat_lengkap}
              key={`addr-${profile?.tim_kelompok?.alamat_lengkap}`} // Key unik agar input re-render saat data dipilih
              className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white font-medium" 
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 disabled:bg-gray-400 transition-all shadow-md active:scale-95 mt-4 mb-6 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {loading ? 'Menyimpan...' : 'Simpan Perubahan ✨'}
          </button>
        </form>
      </div>
    </div>
  )
}