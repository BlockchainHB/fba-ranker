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

  // We select approved submissions, group by user, and join profiles for display data
  // Using RPC via SQL query for efficiency
  const sql = `
    select
      u.id as user_id,
      u.name,
      u.discord,
      u.avatar_url,
      coalesce(sum(s.profit),0)::float8 as total_profit,
      count(s.id)::int as submission_count,
      max(s.approved_at) as last_submission_at
    from public.profiles u
    left join public.submissions s
      on s.user_id = u.id
      and s.status = 'approved'
      ${period === "month" ? `and (s.approved_at is null or s.approved_at >= '${dateFilter}')` : ""}
    group by u.id, u.name, u.discord, u.avatar_url
    order by total_profit desc
  `
  const { data, error } = await supabase.rpc("exec_sql", { query: sql }).select()

  // Fallback if exec_sql RPC is not available: perform via JS
  if (error) {
    // JS fallback
    const { data: approved, error: err1 } = await supabase
      .from("submissions")
      .select("*")
      .eq("status", "approved")
    if (err1) return NextResponse.json({ error: err1.message }, { status: 500 })

    const { data: profiles, error: err2 } = await supabase.from("profiles").select("*")
    if (err2) return NextResponse.json({ error: err2.message }, { status: 500 })

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const filtered = period === "month"
      ? approved.filter(s => !s.approved_at || new Date(s.approved_at) >= startOfMonth)
      : approved

    const map = new Map<string, { total: number; count: number; last?: string }>()
    for (const s of filtered) {
      const m = map.get(s.user_id) || { total: 0, count: 0, last: undefined }
      m.total += Number(s.profit)
      m.count += 1
      const when = s.approved_at || s.date
      if (!m.last || new Date(when) > new Date(m.last)) m.last = when
      map.set(s.user_id, m)
    }

    const rows = profiles.map(u => ({
      user_id: u.id,
      name: u.name,
      discord: u.discord,
      avatar_url: u.avatar_url,
      total_profit: map.get(u.id)?.total ?? 0,
      submission_count: map.get(u.id)?.count ?? 0,
      last_submission_at: map.get(u.id)?.last ?? null
    }))
    rows.sort((a, b) => b.total_profit - a.total_profit)
    return NextResponse.json({ rows })
  }

  return NextResponse.json({ rows: data })
}
