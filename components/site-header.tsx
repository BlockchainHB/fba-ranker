"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { AuthModal } from "@/components/auth-modal"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Trophy, Upload, Settings, User } from "lucide-react"

export default function SiteHeader() {
  const [name, setName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        // Fetch profile name and admin status
        const token = (await supabase.auth.getSession()).data.session?.access_token
        if (token) {
          const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
          const json = await res.json()
          setName(json?.profile?.name || data.user.user_metadata?.name || "User")
          setIsAdmin(json?.profile?.role === "admin")
        } else {
          setName(data.user.user_metadata?.name || "User")
          setIsAdmin(false)
        }
      } else {
        setName(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })
  }, [])



  async function signOut() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60")}>
      <div className="container mx-auto flex h-16 max-w-6xl items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Trophy className="h-6 w-6" />
          <span className="font-bold text-xl">FBA Hangout</span>
        </Link>

        {/* Main Navigation - Centered */}
        <div className="flex-1 flex justify-center">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Leaderboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/submit" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Proof
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center space-x-4">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            <Trophy className="h-4 w-4" />
          </Link>
          <Link href="/submit" className="text-sm text-muted-foreground hover:text-foreground">
            <Upload className="h-4 w-4" />
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded" />
          ) : name ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium hidden sm:inline-block">Hi, {name}</span>
              {isAdmin && (
                <Link href="/admin">
                  <Button size="sm" variant="outline">
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/signup">
                <Button size="sm" variant="outline">
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={() => setAuthModalOpen(true)}>
                Sign in
              </Button>
            </div>
          )}
        </div>
      </div>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  )
}
