"use client"

import SiteHeader from "@/components/site-header"
import RankingTable from "@/components/ranking-table"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Seller's Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track who’s making the most profit this month and all time. Submit proof, get approved, climb the board.
          </p>

        </div>
        <RankingTable />
      </main>
    </div>
  )
}
