import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient()
  const { searchParams } = new URL(req.url)
  const period = (searchParams.get("period") || "month") as "month" | "all"

  // Build date filter
  let dateFilter = ""
  if (period === "month") {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    dateFilter = startOfMonth
  }

  // Get approved submissions with date filtering
  let submissionsQuery = supabase
    .from("submissions")
    .select("*")
    .eq("status", "approved")

  if (period === "month") {
    submissionsQuery = submissionsQuery.gte("approved_at", dateFilter)
  }

  const { data: approved, error: err1 } = await submissionsQuery
  if (err1) return NextResponse.json({ error: err1.message }, { status: 500 })

  const { data: profiles, error: err2 } = await supabase.from("profiles").select("*")
  if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })

  // Process data in JavaScript instead of using RPC
  const map = new Map<string, { total: number; count: number; last?: string }>()
  for (const s of approved) {
    const m = map.get(s.user_id) || { total: 0, count: 0, last: undefined }
    m.total += Number(s.profit)
    m.count += 1
    const when = s.approved_at || s.date
    if (!m.last || new Date(when) > new Date(m.last)) m.last = when
    map.set(s.user_id, m)
  }

  // Only include users who have approved submissions
  const rows = profiles
    .map(u => ({
      user_id: u.id,
      name: u.name,
      discord: u.discord,
      avatar_url: u.avatar_url,
      total_profit: map.get(u.id)?.total ?? 0,
      submission_count: map.get(u.id)?.count ?? 0,
      last_submission_at: map.get(u.id)?.last ?? null
    }))
    .filter(row => row.submission_count > 0) // Only show users with approved submissions
  rows.sort((a, b) => b.total_profit - a.total_profit)
  return NextResponse.json({ rows })
}
