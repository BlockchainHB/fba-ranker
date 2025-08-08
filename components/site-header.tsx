"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function SiteHeader() {
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        // Fetch profile name
        const token = (await supabase.auth.getSession()).data.session?.access_token
        if (token) {
          const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
          const json = await res.json()
          setName(json?.profile?.name || data.user.user_metadata?.name || "User")
        } else {
          setName(data.user.user_metadata?.name || "User")
        }
      } else {
        setName(null)
      }
      setLoading(false)
    })
  }, [])

  async function signInWithDiscord() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/signup`,
      },
    })
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <header className={cn("w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">FBA RankBoard</Link>
        <nav className="flex items-center gap-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Leaderboard</Link>
          <Link href="/submit" className="text-sm text-muted-foreground hover:text-foreground">Submit Proof</Link>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link>
          <div className="w-px h-4 bg-border mx-1" />
          {loading ? null : name ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">Hi, {name}</span>
              <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
            </div>
          ) : (
            <>
              <Link href="/signup">
                <Button size="sm" variant="outline">Profile</Button>
              </Link>
              <Button size="sm" onClick={signInWithDiscord}>Sign in</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
