import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseUrl, getSupabasePublishableKey, getSupabaseAnonKey } from './config'

export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabasePublishableKey() || getSupabaseAnonKey()
  )
}
