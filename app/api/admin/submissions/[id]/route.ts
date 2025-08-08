import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getUserFromAuthHeader } from "@/lib/supabase/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServerClient()
  const id = params.id
  const { status } = await req.json() as { status: "approved" | "rejected" }

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

  const patch: any = { status }
  if (status === "approved") patch.approved_at = new Date().toISOString()

  const { data, error } = await supabase.from("submissions").update(patch).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ submission: data })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServerClient()
  const id = params.id

  const authHeader = req.headers.get("authorization") || undefined
  const user = await getUserFromAuthHeader(authHeader)
  const passcode = req.headers.get("x-admin-passcode")

  // Same admin authorization check
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

  // Delete the submission
  const { error } = await supabase.from("submissions").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json({ message: "Submission deleted successfully" })
}
