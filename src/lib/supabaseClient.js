import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  throw new Error(
    [
      '[Supabase] Missing environment variables.',
      'Set BOTH of these in Netlify:',
      '- VITE_SUPABASE_URL',
      '- VITE_SUPABASE_ANON_KEY',
    ].join('\n')
  )
}

export const supabase = createClient(url, anon)
