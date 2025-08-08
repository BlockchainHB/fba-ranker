import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getUserFromAuthHeader } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient()
  const { searchParams } = new URL(req.url)
  const status = (searchParams.get("status") || "pending") as "pending" | "approved" | "rejected"

  // Admin check: either user role=admin or demo passcode header
  const authHeader = req.headers.get("authorization") || undefined
  const user = await getUserFromAuthHeader(authHeader)
  const passcode = req.headers.get("x-admin-passcode")
  if (!user && passcode !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (user) {
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    if (me?.role !== "admin" && passcode !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (passcode !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*, profiles!inner(name, discord)")
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submissions: data })
}
