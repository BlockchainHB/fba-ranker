"use client"

import SiteHeader from "@/components/site-header"
import RankingTable from "@/components/ranking-table"
import { Trophy } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <span>Amazon FBA Profit Leaderboard</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track the top private label sellers making the most profit this month and all time. Submit your FBA earnings, get verified, and climb the rankings.
          </p>
        </div>
        <RankingTable />
      </main>
    </div>
  )
}
