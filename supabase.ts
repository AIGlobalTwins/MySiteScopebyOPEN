import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para criar client no servidor
export function createSupabaseServer() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não está definida")
  }

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não está definida")
  }

  console.log("✅ Criando cliente Supabase server com service role")
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
