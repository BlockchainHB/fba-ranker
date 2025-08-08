"use client"

import { useEffect, useState } from "react"
import SiteHeader from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Upload } from "lucide-react"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [discord, setDiscord] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [authed, setAuthed] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

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

  async function uploadAvatar(userId: string, file: File): Promise<string | null> {
    const supabase = getSupabaseBrowserClient()
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) throw error
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      return publicUrl
    } catch (error) {
      console.error('Avatar upload failed:', error)
      throw error
    }
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image must be smaller than 2MB')
        return
      }
      
      setAvatarFile(file)
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setAvatarUrl(previewUrl)
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setUploading(true)
    
    const supabase = getSupabaseBrowserClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      toast.error("Please sign in first.")
      setUploading(false)
      return
    }

    try {
      let finalAvatarUrl = avatarUrl

      // Upload avatar if a new file was selected
      if (avatarFile) {
        toast.loading("Uploading avatar...")
        finalAvatarUrl = await uploadAvatar(userData.user.id, avatarFile)
      }

      // Save profile data
      const { error } = await supabase.from("profiles").upsert({
        id: userData.user.id,
        name,
        discord,
        avatar_url: finalAvatarUrl || null,
      })
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Profile saved successfully!")
      window.location.href = "/"
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile")
    } finally {
      setUploading(false)
    }
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
              <div className="mb-6 p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  You need to sign in first to set up your profile.
                </p>
                <p className="text-xs text-muted-foreground">
                  Click "Sign in" in the header to get started.
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
                <label className="text-sm font-medium">Avatar</label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={avatarUrl} alt={name || "Avatar"} />
                    <AvatarFallback>
                      {name ? name.slice(0, 1).toUpperCase() : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload an image (max 2MB) or leave empty for default
                    </p>
                  </div>
                </div>
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Saving..." : (authed ? "Save changes" : "Save and continue")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
