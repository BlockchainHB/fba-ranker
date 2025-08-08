"use client"

import SiteHeader from "@/components/site-header"
import RankingTable from "@/components/ranking-table"
import { Badge } from "@/components/ui/badge"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Discord FBA Sellers Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track who’s making the most profit this month and all time. Submit proof, get approved, climb the board.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">Amazon FBA</Badge>
            <Badge variant="secondary">Private Label</Badge>
            <Badge variant="secondary">Profit First</Badge>
          </div>
        </div>
        <RankingTable />
      </main>
    </div>
  )
}
