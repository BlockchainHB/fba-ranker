import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let serverClient: SupabaseClient | null = null

// Server-only client with service role key.
// IMPORTANT: Never import or call this from a Client Component.
export function getSupabaseServerClient() {
  if (serverClient) return serverClient
  const url = process.env.SUPABASE_URL!
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!
  serverClient = createClient(url, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return serverClient
}

// Helper to read the Supabase user from Authorization: Bearer <access_token>
export async function getUserFromAuthHeader(authHeader?: string) {
  if (!authHeader) return null
  const token = authHeader.replace(/^Bearer\s+/i, "")
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error) return null
  return data.user
}
