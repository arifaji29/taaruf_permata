'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../../utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPeserta() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUserId(user.id)

      const { data } = await supabase
        .from('peserta')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        if (data.avatar_url) setPreviewUrl(data.avatar_url)
      } else {
        setProfile({}) 
      }
      setLoadingProfile(false)
    }

    fetchProfile()
  }, [])

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
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `user_photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, imageFile, { upsert: true })

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
      alert('Biodata Taaruf berhasil diperbarui!')
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
    /* Latar belakang putih paksa (Anti-Dark Mode) */
    <div className="min-h-screen bg-white py-6">
      <div className="max-w-2xl mx-auto p-6 md:p-8 bg-white shadow-lg rounded-3xl border border-gray-100 text-slate-900">
        
        {/* Tombol Lihat Profil */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => router.push('/peserta/akun')}
            className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-200"
          >
            👤 Lihat Profil Saya
          </button>
        </div>

        <h1 className="text-xl font-black mb-6 text-emerald-800 border-b border-emerald-50 pb-3 text-center uppercase tracking-tight">
          Biodata Taaruf Permata
        </h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* --- SECTION FOTO (KOMPAK) --- */}
          <div className="md:col-span-2 flex flex-col items-center bg-emerald-50/30 p-4 rounded-2xl border-2 border-dashed border-emerald-100 mb-2">
            <div className="relative w-28 h-36 bg-white rounded-xl shadow-inner border border-emerald-100 overflow-hidden mb-3 flex items-center justify-center text-gray-300">
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <span className="text-[9px] text-center p-2 uppercase font-black opacity-40">Foto Profil</span>
              )}
            </div>
            <label className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-black text-[10px] uppercase cursor-pointer hover:bg-emerald-700 transition shadow-sm active:scale-95">
              {profile?.avatar_url ? 'Ganti Foto' : 'Pilih Foto'}
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <p className="text-[8px] text-gray-400 mt-1.5 font-bold uppercase tracking-widest">JPG / PNG | Max 2MB</p>
          </div>

          {/* --- 1. INFORMASI PERSONAL --- */}
          <div className="md:col-span-2 text-emerald-800 font-black border-l-4 border-emerald-600 pl-2 text-[11px] uppercase tracking-wider mt-2">Informasi Personal</div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nama Lengkap</label>
            <input name="nama" defaultValue={profile?.nama} className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white" required />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Bin / Binti</label>
            <input name="bin_binti" defaultValue={profile?.bin_binti} className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Jenis Kelamin</label>
            <select name="jenis_kelamin" defaultValue={profile?.jenis_kelamin} className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white" required>
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Status Pernikahan</label>
            <select name="status" defaultValue={profile?.status} className="p-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 bg-white" required>
              <option value="">Pilih</option>
              <option value="Lajang">Lajang</option>
              <option value="Duda">Duda</option>
              <option value="Janda">Janda</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tempat Lahir</label>
            <input name="tempat_lahir" defaultValue={profile?.tempat_lahir} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tanggal Lahir</label>
            <input name="tanggal_lahir" type="date" defaultValue={profile?.tanggal_lahir} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Anak Ke</label>
              <input name="anak_ke" type="number" defaultValue={profile?.anak_ke} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Jumlah Bersaudara</label>
              <input name="jumlah_saudara" type="number" defaultValue={profile?.jumlah_saudara} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Suku</label>
            <input name="suku" defaultValue={profile?.suku} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Tinggi / Berat</label>
            <div className="grid grid-cols-2 gap-2">
               <input name="tinggi_badan" type="number" placeholder="cm" defaultValue={profile?.tinggi_badan} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
               <input name="berat_badan" type="number" placeholder="kg" defaultValue={profile?.berat_badan} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Pendidikan Terakhir</label>
            <input name="pendidikan_terakhir" defaultValue={profile?.pendidikan_terakhir} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Pekerjaan</label>
            <input name="pekerjaan" defaultValue={profile?.pekerjaan} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nomor WA</label>
            <input name="nomor_telepon" type="tel" defaultValue={profile?.nomor_telepon} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Hobby</label>
            <input name="hobby" defaultValue={profile?.hobby} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Alamat Domisili</label>
            <textarea name="alamat_lengkap" defaultValue={profile?.alamat_lengkap} rows={2} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          {/* --- 2. INFORMASI SAMBUNG --- */}
          <div className="md:col-span-2 text-emerald-800 font-black border-l-4 border-emerald-600 pl-2 text-[11px] uppercase tracking-wider mt-3">Informasi Sambung</div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Dapukan</label>
            <input name="dapukan" defaultValue={profile?.dapukan} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Kelompok</label>
            <input name="kelompok" defaultValue={profile?.kelompok} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Desa</label>
            <input name="desa" defaultValue={profile?.desa} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Daerah</label>
            <input name="daerah" defaultValue={profile?.daerah} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" required />
          </div>

          {/* --- 3. KRITERIA CALON PASANGAN --- */}
          <div className="md:col-span-2 text-emerald-800 font-black border-l-4 border-emerald-600 pl-2 text-[11px] uppercase tracking-wider mt-3">Kriteria Calon Pasangan</div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <textarea name="kriteria_calon_pasangan" defaultValue={profile?.kriteria_calon_pasangan} rows={2} className="p-2 text-xs border border-gray-200 rounded-lg text-slate-800 bg-white" placeholder="Sebutkan kriteria khusus..." />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="md:col-span-2 bg-emerald-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 disabled:bg-gray-400 transition-all shadow-md active:scale-95 mt-4 mb-6"
          >
            {loading ? 'Menyimpan...' : 'Simpan Perubahan ✨'}
          </button>
        </form>
      </div>
    </div>
  )
}