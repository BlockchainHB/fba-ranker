import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getUserFromAuthHeader } from "@/lib/supabase/server"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseServerClient()
  const userId = params.id
  const { role } = await req.json() as { role: "user" | "admin" }

  // Validate role
  if (!["user", "admin"].includes(role)) {
    return NextResponse.json({ error: "Invalid role. Must be 'user' or 'admin'" }, { status: 400 })
  }

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

  // Prevent self-demotion (admin can't remove their own admin role)
  if (user && user.id === userId && role === "user") {
    return NextResponse.json({ 
      error: "You cannot remove your own admin privileges" 
    }, { status: 400 })
  }

  // Update user role
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id, name, role")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    message: `User role updated to ${role}`,
    user: data 
  })
}
