"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Trophy, Shield, User, Crown, CheckCircle, XCircle, Settings, Upload, Eye } from "lucide-react"

const rolePermissions = {
  admin: {
    name: "Administrator",
    description: "Full access to all features and settings",
    color: "default" as const,
    icon: Crown,
    permissions: [
      { name: "View All Submissions", description: "Can view pending, approved, and rejected submissions", granted: true },
      { name: "Approve/Reject Submissions", description: "Can approve or reject user submissions", granted: true },
      { name: "Delete Submissions", description: "Can permanently delete approved submissions", granted: true },
      { name: "User Management", description: "Can promote/demote users and manage roles", granted: true },
      { name: "Admin Panel Access", description: "Full access to admin interface", granted: true },
      { name: "Site Navigation", description: "Access to all site features", granted: true },
    ]
  },
  user: {
    name: "Regular User",
    description: "Standard user with basic submission privileges",
    color: "secondary" as const,
    icon: User,
    permissions: [
      { name: "View Leaderboard", description: "Can view public leaderboard", granted: true },
      { name: "Submit Proof", description: "Can submit revenue proof for approval", granted: true },
      { name: "Profile Management", description: "Can manage their own profile", granted: true },
      { name: "View Own Submissions", description: "Can view their own submission history", granted: true },
      { name: "Admin Panel Access", description: "Cannot access admin interface", granted: false },
      { name: "User Management", description: "Cannot manage other users", granted: false },
    ]
  }
}

export default function AdminRolesPage() {
  const supabase = getSupabaseBrowserClient()
  const [isAuthed, setIsAuthed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPasscode, setAdminPasscode] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; avatar?: string }>({})
  const [roleStats, setRoleStats] = useState<{ admin: number; user: number }>({ admin: 0, user: 0 })
  const [loading, setLoading] = useState(false)

  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  useEffect(() => {
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
    })
  }, [supabase])

  const headers = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const h: HeadersInit = {}
    if (token) h["Authorization"] = `Bearer ${token}`
    if (!isAdmin && adminPasscode) h["x-admin-passcode"] = adminPasscode
    return h
  }

  async function loadRoleStats() {
    setLoading(true)
    const h = await headers()
    const res = await fetch('/api/admin/users', { headers: h })
    const json = await res.json()
    if (res.ok) {
      const users = json.users || []
      const stats = users.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      }, { admin: 0, user: 0 })
      setRoleStats(stats)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin || adminPasscode) {
      loadRoleStats()
    }
  }, [isAdmin, adminPasscode])

  async function gate() {
    const pass = prompt("Enter admin passcode (demo: admin)")
    if (pass) setAdminPasscode(pass)
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
              You need admin privileges to view role information.
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
        onRefresh={loadRoleStats}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <div className="text-sm text-muted-foreground">Role Management</div>

        </header>
        <main className="mx-auto w-full max-w-6xl p-4 space-y-6">
          {/* Role Statistics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.admin}</div>
                <p className="text-xs text-muted-foreground">Users with admin privileges</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roleStats.user}</div>
                <p className="text-xs text-muted-foreground">Regular users</p>
              </CardContent>
            </Card>
          </div>

          {/* Role Permissions */}
          <div className="grid gap-6 lg:grid-cols-2">
            {Object.entries(rolePermissions).map(([roleKey, role]) => {
              const IconComponent = role.icon
              return (
                <Card key={roleKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" />
                      {role.name}
                      <Badge variant={role.color}>{roleKey}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {role.permissions.map((permission, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {permission.granted ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          )}
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {permission.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/users">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Review Submissions
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
