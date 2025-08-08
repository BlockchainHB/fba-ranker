"use client"

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type Period = "month" | "all"

interface Row {
  user_id: string
  name: string | null
  discord: string | null
  avatar_url: string | null
  total_profit: number
  submission_count: number
  last_submission_at: string | null
}

export default function RankingTable() {
  const [period, setPeriod] = useState<Period>("month")
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  async function load(p: Period) {
    setLoading(true)
    const res = await fetch(`/api/leaderboard?period=${p}`)
    const json = await res.json()
    setRows(json.rows || [])
    setLoading(false)
  }

  useEffect(() => {
    load(period)
  }, [period])

  const top3 = useMemo(() => rows.slice(0, 3), [rows])
  const data = rows

  return (
    <div className="grid gap-6">
      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
        <TabsContent value={period} className="mt-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading leaderboard...</div>
          ) : (
            <>
              {/* Podium */}
              <div className="grid gap-4 sm:grid-cols-3">
                {top3.map((row, idx) => (
                  <Card key={row.user_id} className={idx === 0 ? "border-green-500" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <span className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={row.avatar_url || ""} alt={row.name || "user"} />
                            <AvatarFallback>{(row.name || "?").slice(0,1).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span>{row.name || "Unknown"}</span>
                        </span>
                        <Badge variant={idx === 0 ? "default" : "secondary"}>#{idx + 1}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      <div className="text-2xl font-semibold text-foreground">${Number(row.total_profit || 0).toLocaleString()}</div>
                      <div className="text-xs">Profit</div>
                      <div className="mt-2 text-xs">{row.submission_count} approved submission{row.submission_count === 1 ? "" : "s"}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Full table */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Total Profit</TableHead>
                        <TableHead className="text-right">Submissions</TableHead>
                        <TableHead className="text-right">Last Submission</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, idx) => (
                        <TableRow key={row.user_id}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={row.avatar_url || ""} alt={row.name || "user"} />
                                <AvatarFallback>{(row.name || "?").slice(0,1).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{row.name || "Unknown"}</span>
                                <span className="text-xs text-muted-foreground">{row.discord || ""}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">${Number(row.total_profit || 0).toLocaleString()}</TableCell>
                          <TableCell className="text-right">{row.submission_count}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {row.last_submission_at ? new Date(row.last_submission_at).toLocaleDateString() : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {data.length === 0 && !loading && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">No data yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
