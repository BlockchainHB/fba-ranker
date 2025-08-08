import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getUserFromAuthHeader } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient()

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

  // Fetch all users with their profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      discord,
      role,
      created_at,
      avatar_url
    `)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get submission counts for each user
  const { data: submissionCounts, error: countError } = await supabase
    .from("submissions")
    .select("user_id, status")
    .eq("status", "approved")

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

  // Calculate submission counts per user
  const counts = submissionCounts.reduce((acc, sub) => {
    acc[sub.user_id] = (acc[sub.user_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Combine profiles with submission counts
  const usersWithStats = profiles.map(profile => ({
    ...profile,
    submission_count: counts[profile.id] || 0
  }))

  return NextResponse.json({ users: usersWithStats })
}
