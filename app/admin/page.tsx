"use client"

import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import SiteHeader from "@/components/site-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ProofDialog } from "@/components/proof-dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar" // New shadcn sidebar primitives [^vercel_knowledge_base]
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Trophy } from "lucide-react"

type Tab = "pending" | "approved" | "rejected"

interface SubmissionRow {
  id: string
  user_id: string
  product_name: string
  revenue: number
  cost: number
  profit: number
  date: string
  note: string | null
  proof_url: string | null
  status: Tab
  profiles?: { name: string | null; discord: string | null } | null
}

export default function AdminPage() {
  const supabase = getSupabaseBrowserClient()
  const [isAuthed, setIsAuthed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminPasscode, setAdminPasscode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("pending")
  const [rows, setRows] = useState<SubmissionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [proofOpen, setProofOpen] = useState(false)
  const [proofUrl, setProofUrl] = useState<string | undefined>(undefined)
  const [proofTitle, setProofTitle] = useState<string>("")
  const [allRows, setAllRows] = useState<SubmissionRow[]>([])
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
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

  async function load() {
    setLoading(true)
    const h = await headers()
    
    // Load current tab data
    const res = await fetch(`/api/admin/submissions?status=${activeTab}`, { headers: h })
    const json = await res.json()
    setRows(json.submissions || [])
    
    // Load counts for all statuses for sidebar badges
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      fetch('/api/admin/submissions?status=pending', { headers: h }),
      fetch('/api/admin/submissions?status=approved', { headers: h }),
      fetch('/api/admin/submissions?status=rejected', { headers: h })
    ])
    
    const [pendingData, approvedData, rejectedData] = await Promise.all([
      pendingRes.json(),
      approvedRes.json(), 
      rejectedRes.json()
    ])
    
    setCounts({
      pending: pendingData.submissions?.length || 0,
      approved: approvedData.submissions?.length || 0,
      rejected: rejectedData.submissions?.length || 0,
    })
    
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAdmin, adminPasscode])

  async function gate() {
    const pass = prompt("Enter admin passcode (demo: admin)")
    if (pass) setAdminPasscode(pass)
  }

  async function approve(id: string) {
    const h = await headers()
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ status: "approved" }),
    })
    if (!res.ok) toast.error("Failed to approve")
    load()
  }

  async function reject(id: string) {
    const h = await headers()
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...h },
      body: JSON.stringify({ status: "rejected" }),
    })
    if (!res.ok) toast.error("Failed to reject")
    load()
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Are you sure you want to permanently delete this submission? This action cannot be undone.")) {
      return
    }
    
    const h = await headers()
    const res = await fetch(`/api/admin/submissions/${id}`, {
      method: "DELETE",
      headers: h,
    })
    if (!res.ok) {
      toast.error("Failed to delete submission")
    } else {
      toast.success("Submission deleted successfully")
    }
    load()
  }

  const filtered = useMemo(() => rows, [rows])

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!isAdmin && !adminPasscode) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Admin Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sign in with an admin account or use the demo passcode to continue.
              </p>
              <div className="flex gap-2">
                <Button onClick={gate}>Enter passcode</Button>
                <Button variant="outline" onClick={() => (window.location.href = "/signup")}>Manage profile</Button>
              </div>
            </CardContent>
          </Card>
        </main>
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
          activeTab={activeTab}
          pendingCount={counts.pending}
          approvedCount={counts.approved}
          rejectedCount={counts.rejected}
          onTabChange={(tab) => setActiveTab(tab as Tab)}
          userName={userInfo.name}
          userEmail={userInfo.email}
          userAvatar={userInfo.avatar}
          onSignOut={signOut}
          onRefresh={load}
        />
      <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <div className="text-sm text-muted-foreground">Admin Queue • {activeTab[0].toUpperCase() + activeTab.slice(1)}</div>

          </header>
          <main className="mx-auto w-full max-w-6xl p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Submissions • {activeTab}</span>
                  <Badge variant="secondary">Total: {filtered.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-right">Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(s => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{s.profiles?.name ?? "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">{s.profiles?.discord}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{s.product_name}</TableCell>
                        <TableCell className="text-right">${Number(s.revenue).toLocaleString()}</TableCell>
                        <TableCell className="text-right">${Number(s.cost).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">${Number(s.profit).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-xs">{new Date(s.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setProofUrl(s.proof_url || undefined); setProofTitle(`${s.profiles?.name}'s proof`); setProofOpen(true) }}>View</Button>
                            {activeTab === "pending" && (
                              <>
                                <Button size="sm" onClick={() => approve(s.id)}>Approve</Button>
                                <Button size="sm" variant="destructive" onClick={() => reject(s.id)}>Reject</Button>
                              </>
                            )}
                            {activeTab === "approved" && (
                              <Button size="sm" variant="destructive" onClick={() => deleteSubmission(s.id)}>
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">No submissions.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
          <ProofDialog open={proofOpen} onOpenChange={setProofOpen} title={proofTitle} proofDataUrl={proofUrl} />
        </SidebarInset>
    </SidebarProvider>
  )
}
