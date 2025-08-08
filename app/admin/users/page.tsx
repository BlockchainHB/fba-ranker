"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Trophy, Shield, User, Crown } from "lucide-react"

interface UserProfile {
  id: string
  name: string | null
  discord: string | null
  role: "user" | "admin"
  created_at: string
  avatar_url: string | null
  submission_count: number
}

export default function AdminUsersPage() {
  const supabase = getSupabaseBrowserClient()
  const [isAuthed, setIsAuthed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPasscode, setAdminPasscode] = useState<string | null>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; avatar?: string }>({})

  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  useEffect(() => {
    setAuthLoading(true)
    supabase.auth.getUser().then(async ({ data }) => {
      setIsAuthed(!!data.user)
      if (data.user) {
        const { data: prof } = await supabase.from("profiles").select("role, name").eq("id", data.user.id).single()
        setIsAdmin(prof?.role === "admin")
        setUserInfo({
          name: prof?.name || data.user.user_metadata?.name || data.user.email || "Admin User",
          email: data.user.email,
          avatar: data.user.user_metadata?.avatar_url
        })
      }
      setAuthLoading(false)
    })
  }, [supabase])

  const headers = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const h: HeadersInit = {}
    if (token) h["Authorization"] = `Bearer ${token}`
    if (!isAdmin && adminPasscode) h["x-admin-passcode"] = adminPasscode
    return h
  }

  async function loadUsers() {
    setLoading(true)
    const h = await headers()
    const res = await fetch('/api/admin/users', { headers: h })
    const json = await res.json()
    if (res.ok) {
      setUsers(json.users || [])
    } else {
      toast.error(`Error: ${json.error}`)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin || adminPasscode) {
      loadUsers()
    }
  }, [isAdmin, adminPasscode])

  async function gate() {
    const pass = prompt("Enter admin passcode (demo: admin)")
    if (pass) setAdminPasscode(pass)
  }

  async function toggleUserRole(userId: string, currentRole: string) {
    const newRole = currentRole === "admin" ? "user" : "admin"
    const action = newRole === "admin" ? "promote" : "demote"
    
    if (!confirm(`Are you sure you want to ${action} this user to ${newRole}?`)) {
      return
    }

    const h = await headers()
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ role: newRole }),
    })

    const json = await res.json()
    if (res.ok) {
      toast.success(`User ${action}d successfully!`)
      loadUsers() // Refresh the list
    } else {
      toast.error(`Error: ${json.error}`)
    }
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin && !adminPasscode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              You need admin privileges to access user management.
            </p>
            <div className="flex gap-2">
              <Button onClick={gate}>Enter passcode</Button>
              <Button variant="outline" onClick={() => (window.location.href = "/admin")}>Back to Admin</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AdminSidebar 
        userName={userInfo.name}
        userEmail={userInfo.email}
        userAvatar={userInfo.avatar}
        onSignOut={signOut}
        onRefresh={loadUsers}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div className="text-sm text-muted-foreground">User Management</div>

        </header>
        <main className="mx-auto w-full max-w-6xl p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  All Users
                </span>
                <Badge variant="secondary">Total: {users.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Submissions</TableHead>
                    <TableHead className="text-right">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || ""} alt={user.name || "User"} />
                            <AvatarFallback>
                              {(user.name || "U").slice(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name || "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">{user.discord}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? (
                            <>
                              <Crown className="h-3 w-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              User
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{user.submission_count}</TableCell>
                      <TableCell className="text-right text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant={user.role === "admin" ? "destructive" : "default"}
                          onClick={() => toggleUserRole(user.id, user.role)}
                        >
                          {user.role === "admin" ? "Demote" : "Promote"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
