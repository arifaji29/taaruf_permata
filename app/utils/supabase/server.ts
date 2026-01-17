import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Tambahkan async di depan function
export async function createClient() {
  // Tambahkan await di depan cookies()
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}