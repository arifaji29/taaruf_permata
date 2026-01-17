'use server'
import { createClient } from '../utils/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nama = formData.get('nama') as string

  // 1. Daftarkan user ke Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { error: authError?.message }
  }

  // 2. Masukkan biodata awal ke tabel peserta menggunakan ID dari Auth
  const { error: dbError } = await supabase
    .from('peserta')
    .insert([{ 
      user_id: authData.user.id, 
      nama: nama,
      status: 'LAJANG' // Status default sesuai UI Anda
    }])

  if (dbError) {
    return { error: dbError.message }
  }

  redirect('/dashboard/akun')
}