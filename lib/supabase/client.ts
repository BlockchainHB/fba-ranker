"use client"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  browserClient = createClient(url, anon, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "implicit",
      autoRefreshToken: true,
    },
  })
  return browserClient
}
