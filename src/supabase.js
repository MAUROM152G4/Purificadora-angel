import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('URL:', supabaseUrl)
console.log('KEY:', supabaseKey ? 'Encontrada' : 'No encontrada')

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de configuración de Supabase')
}

export const supabase = createClient(
  supabaseUrl.trim(),
  supabaseKey.trim()
)