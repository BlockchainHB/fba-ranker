import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getUserFromAuthHeader } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServerClient()
  const authHeader = req.headers.get("authorization") || undefined
  const user = await getUserFromAuthHeader(authHeader)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json()
  const { productName, revenue, cost, date, note, proofUrl } = body as {
    productName: string
    revenue: number
    cost: number
    date?: string
    note?: string
    proofUrl?: string
  }
  if (!productName || revenue == null || cost == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const profit = Math.max(0, Number(revenue) - Number(cost))
  const payload = {
    user_id: user.id,
    product_name: productName,
    revenue,
    cost,
    profit,
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    note: note ?? null,
    proof_url: proofUrl ?? null,
    status: "pending" as const,
  }
  const { data, error } = await supabase.from("submissions").insert(payload).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submission: data })
}
