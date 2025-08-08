import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getUserFromAuthHeader } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient()
  const authHeader = req.headers.get("authorization") || undefined
  const user = await getUserFromAuthHeader(authHeader)
  if (!user) return NextResponse.json({ user: null, profile: null })

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
  return NextResponse.json({ user, profile })
}
