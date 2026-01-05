import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente estándar (respetará las reglas de seguridad de la base de datos)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente Admin (para el bot, necesitamos poder escribir sin restricciones)
// Solo se usará en el servidor, nunca en el navegador
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)