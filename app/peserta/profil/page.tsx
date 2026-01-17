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

      // 1. PERBAIKAN: Ambil data berdasarkan 'id' (UUID Auth)
      const { data } = await supabase
        .from('peserta')
        .select('*')
        .eq('id', user.id) // Sinkronisasi dengan ID pendaftaran
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

    // 2. Mapping data: Pastikan menggunakan 'id' sebagai kunci utama
    const payload = {
      id: userId, // Gunakan 'id', bukan 'user_id'
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
      is_visible: true // 3. SET TRUE: Agar profil muncul di halaman utama setelah lengkap
    }

    // 4. UPSERT Berdasarkan kolom 'id'
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mb-4"></div>
       <p className="font-bold text-emerald-800 uppercase tracking-widest text-xs">Memuat Formulir...</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white shadow-lg my-10 rounded-xl border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-emerald-800 border-b pb-4 text-center">
        Formulir Lengkap Biodata Permata
      </h1>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- UPLOAD FOTO SECTION --- */}
        <div className="md:col-span-2 flex flex-col items-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-emerald-100 mb-4">
          <div className="relative w-32 h-40 bg-white rounded-xl shadow-inner border overflow-hidden mb-4 flex items-center justify-center text-gray-300">
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <span className="text-[10px] text-center p-2 uppercase font-bold">Belum Ada Foto</span>
            )}
          </div>
          <label className="bg-emerald-50 text-emerald-700 px-6 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-emerald-100 transition">
            {profile?.avatar_url ? 'Ganti Foto Profil' : 'Pilih Foto Profil'}
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">JPG / PNG | Max 2MB</p>
        </div>

        {/* --- DATA IDENTITAS --- */}
        <div className="md:col-span-2 text-emerald-700 font-bold border-l-4 border-emerald-600 pl-2">Informasi Identitas</div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Nama Lengkap</label>
          <input name="nama" defaultValue={profile?.nama} className="p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" required />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Bin / Binti</label>
          <input name="bin_binti" defaultValue={profile?.bin_binti} className="p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Jenis Kelamin</label>
          <select name="jenis_kelamin" defaultValue={profile?.jenis_kelamin} className="p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" required>
            <option value="">Pilih</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Status Pernikahan</label>
          <select name="status" defaultValue={profile?.status} className="p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" required>
            <option value="">Pilih</option>
            <option value="Lajang">Lajang</option>
            <option value="Duda">Duda</option>
            <option value="Janda">Janda</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Tempat Lahir</label>
          <input name="tempat_lahir" defaultValue={profile?.tempat_lahir} className="p-2 border rounded" required />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Tanggal Lahir</label>
          <input name="tanggal_lahir" type="date" defaultValue={profile?.tanggal_lahir} className="p-2 border rounded" required />
        </div>

        {/* --- PROFIL KELUARGA & FISIK --- */}
        <div className="md:col-span-2 text-emerald-700 font-bold border-l-4 border-emerald-600 pl-2 mt-4">Profil Keluarga & Fisik</div>

        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Anak Ke</label>
            <input name="anak_ke" type="number" defaultValue={profile?.anak_ke} className="p-2 border rounded" required />
        </div>

        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Jumlah Bersaudara</label>
            <input name="jumlah_saudara" type="number" defaultValue={profile?.jumlah_saudara} className="p-2 border rounded" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Suku</label>
          <input name="suku" defaultValue={profile?.suku} className="p-2 border rounded" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Tinggi Badan (cm)</label>
          <input name="tinggi_badan" type="number" defaultValue={profile?.tinggi_badan} className="p-2 border rounded" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Berat Badan (kg)</label>
          <input name="berat_badan" type="number" defaultValue={profile?.berat_badan} className="p-2 border rounded" required />
        </div>

        {/* --- LATAR BELAKANG --- */}
        <div className="md:col-span-2 text-emerald-700 font-bold border-l-4 border-emerald-600 pl-2 mt-4">Latar Belakang & Hobby</div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Pendidikan Terakhir</label>
          <input name="pendidikan_terakhir" defaultValue={profile?.pendidikan_terakhir} className="p-2 border rounded" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Pekerjaan</label>
          <input name="pekerjaan" defaultValue={profile?.pekerjaan} className="p-2 border rounded" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Nomor Telepon/WA</label>
          <input name="nomor_telepon" type="tel" defaultValue={profile?.nomor_telepon} className="p-2 border rounded" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Hobby</label>
          <input name="hobby" defaultValue={profile?.hobby} className="p-2 border rounded" />
        </div>

        {/* --- KEWILAYAHAN --- */}
        <div className="md:col-span-2 text-emerald-700 font-bold border-l-4 border-emerald-600 pl-2 mt-4">Informasi Kewilayahan</div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Dapukan</label>
          <input name="dapukan" defaultValue={profile?.dapukan} className="p-2 border rounded" required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Kelompok</label>
          <input name="kelompok" defaultValue={profile?.kelompok} className="p-2 border rounded" required />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Desa</label>
          <input name="desa" defaultValue={profile?.desa} className="p-2 border rounded" required />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Daerah</label>
          <input name="daerah" defaultValue={profile?.daerah} className="p-2 border rounded" required />
        </div>

        <div className="md:col-span-2 flex flex-col gap-1">
          <label className="text-sm font-semibold">Alamat Lengkap (Domisili)</label>
          <textarea name="alamat_lengkap" defaultValue={profile?.alamat_lengkap} rows={2} className="p-2 border rounded" required />
        </div>

        {/* --- KRITERIA --- */}
        <div className="md:col-span-2 text-emerald-700 font-bold border-l-4 border-emerald-600 pl-2 mt-4">Kriteria Calon Pasangan</div>

        <div className="md:col-span-2 flex flex-col gap-1">
          <textarea name="kriteria_calon_pasangan" defaultValue={profile?.kriteria_calon_pasangan} rows={3} className="p-2 border rounded" />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="md:col-span-2 bg-emerald-600 text-white py-4 rounded-lg font-black uppercase tracking-widest hover:bg-emerald-700 disabled:bg-gray-400 transition-all shadow-md active:scale-95 mt-6 mb-10"
        >
          {loading ? 'Menyimpan...' : 'Simpan Biodata Taaruf ✨'}
        </button>
      </form>
    </div>
  )
}