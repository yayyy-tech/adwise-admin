import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

export const callEdgeFunction = async (name: string, body: object, session?: { access_token: string } | null) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const response = await fetch(
    `${supabaseUrl}/functions/v1/${name}`,
    { method: 'POST', headers, body: JSON.stringify(body) }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Edge function failed')
  }

  return response.json()
}
