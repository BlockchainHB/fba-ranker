"use client"

import { useEffect, useState } from "react"
import SiteHeader from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function SubmitPage() {
  const supabase = getSupabaseBrowserClient()
  const [authed, setAuthed] = useState(false)
  const [productName, setProductName] = useState("")
  const [revenue, setRevenue] = useState<number | "">("")
  const [cost, setCost] = useState<number | "">("")
  const [date, setDate] = useState<string>("")
  const [note, setNote] = useState("")
  const profit = typeof revenue === "number" && typeof cost === "number" ? Math.max(0, revenue - cost) : 0
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user))
  }, [supabase])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    setFile(f || null)
  }

  async function uploadProof(userId: string) {
    if (!file) return undefined
    const ext = file.name.split(".").pop() || "png"
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from("proofs").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })
    if (error) throw error
    const { data } = supabase.storage.from("proofs").getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const userId = sessionData.session?.user?.id
      if (!token || !userId) {
        alert("Please sign in first.")
        setSubmitting(false)
        return
      }
      const proofUrl = await uploadProof(userId).catch(err => {
        console.warn("Upload failed:", err)
        return undefined
      })
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productName,
          revenue: typeof revenue === "number" ? revenue : 0,
          cost: typeof cost === "number" ? cost : 0,
          date,
          note,
          proofUrl,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed to submit")
      }
      alert("Submission sent. Waiting for admin approval.")
      window.location.href = "/"
    } catch (err: any) {
      alert(err.message || "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Submit Profit Proof</CardTitle>
            <CardDescription>Upload an image proof and details. Admins will review and approve.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Product name</label>
                  <Input value={productName} onChange={e => setProductName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">Revenue ($)</label>
                  <Input
                    inputMode="decimal"
                    value={revenue}
                    onChange={e => setRevenue(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Cost ($)</label>
                  <Input
                    inputMode="decimal"
                    value={cost}
                    onChange={e => setCost(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Profit ($)</label>
                  <Input value={profit} readOnly />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="PPC, coupons, restock, etc." />
              </div>
              <div>
                <label className="text-sm font-medium">Proof image</label>
                <Input type="file" accept="image/*" onChange={onFileChange} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Stored in Supabase Storage bucket "proofs". Make sure the bucket exists with public read.
                </p>
              </div>
              <Button type="submit" disabled={!authed || submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
              {!authed && <p className="text-xs text-red-600">You must sign in first.</p>}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
