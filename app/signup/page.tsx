"use client"

import { useEffect, useState } from "react"
import SiteHeader from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [discord, setDiscord] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setAuthed(!!data.user)
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle()
        if (profile) {
          setName(profile.name || "")
          setDiscord(profile.discord || "")
          setAvatarUrl(profile.avatar_url || (data.user.user_metadata?.avatar_url as string) || "")
        } else {
          setName((data.user.user_metadata?.name as string) || "")
          setAvatarUrl((data.user.user_metadata?.avatar_url as string) || "")
        }
      }
    })
  }, [])

  async function signInWithDiscord() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signInWithOAuth({ provider: "discord", options: { redirectTo: `${window.location.origin}/signup` } })
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    const supabase = getSupabaseBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      alert("Please sign in first.")
      return
    }
    const { error } = await supabase.from("profiles").upsert({
      id: userData.user.id,
      name,
      discord,
      avatar_url: avatarUrl || null,
    })
    if (error) {
      alert(error.message)
      return
    }
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>{authed ? "Your Profile" : "Create your profile"}</CardTitle>
            <CardDescription>Sign in and set your display name and Discord handle.</CardDescription>
          </CardHeader>
          <CardContent>
            {!authed && (
              <div className="mb-6">
                <Button onClick={signInWithDiscord} className="w-full">Continue with Discord</Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: You can also enable Email OTP or other providers in Supabase Auth settings.
                </p>
              </div>
            )}
            <form onSubmit={saveProfile} className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Display name</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alice" required />
              </div>
              <div>
                <label className="text-sm font-medium">Discord handle</label>
                <Input value={discord} onChange={e => setDiscord(e.target.value)} placeholder="@your-handle" required />
              </div>
              <div>
                <label className="text-sm font-medium">Avatar URL</label>
                <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." />
              </div>
              <Button type="submit">{authed ? "Save changes" : "Save and continue"}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
