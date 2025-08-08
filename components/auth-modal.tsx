"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")

  const supabase = getSupabaseBrowserClient()

  async function handleEmailAuth(type: "signin" | "signup") {
    if (!email) {
      toast.error("Please enter your email")
      return
    }

    setLoading(true)
    try {
      if (type === "signup") {
        // Sign up with email/password
        if (!password) {
          toast.error("Please enter a password")
          setLoading(false)
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        })
        if (error) throw error
        toast.success("Check your email to confirm your account!")
      } else {
        // Sign in with magic link (no password needed)
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        })
        if (error) throw error
        toast.success("Check your email for the login link!")
      }
      onOpenChange(false)
      setEmail("")
      setPassword("")
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSignIn() {
    if (!email || !password) {
      toast.error("Please enter both email and password")
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      onOpenChange(false)
      setEmail("")
      setPassword("")
      window.location.href = "/" // Redirect to leaderboard
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to FBA Ranker</DialogTitle>
          <DialogDescription>
            Sign in to submit your revenue proofs and climb the leaderboard!
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="signin-email">Email</label>
              <Input
                id="signin-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => handleEmailAuth("signin")} 
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="signin-password">Password (if you have one)</label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <Button 
                onClick={handlePasswordSignIn} 
                disabled={loading || !email || !password}
                variant="outline"
                className="w-full"
              >
                {loading ? "Signing in..." : "Sign in with Password"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="signup-email">Email</label>
              <Input
                id="signup-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="signup-password">Password</label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <Button 
              onClick={() => handleEmailAuth("signup")} 
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </TabsContent>
        </Tabs>
        
        <p className="text-xs text-muted-foreground text-center">
          Magic links are secure and don't require a password. Check your email after clicking!
        </p>
      </DialogContent>
    </Dialog>
  )
}
