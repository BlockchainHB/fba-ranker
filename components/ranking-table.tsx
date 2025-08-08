"use client"

import { useEffect, useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useIsMobile } from "@/hooks/use-mobile"
import { Trophy, Crown, Medal, TrendingUp, Package, DollarSign, Target, Percent, ShoppingCart, Globe, Tag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type Period = "month" | "all"

interface Row {
  user_id: string
  name: string | null
  discord: string | null
  avatar_url: string | null
  total_profit: number
  total_revenue: number
  total_ppc_spend: number
  submission_count: number
  total_units_sold: number
  avg_acos: number | null
  avg_tacos: number | null
  avg_profit_margin: number | null
  categories: string[]
  marketplaces: string[]
  last_submission_at: string | null
}

export default function RankingTable() {
  const [period, setPeriod] = useState<Period>("month")
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const isMobile = useIsMobile()

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
    <div className="grid gap-4 sm:gap-6">
      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="month" className="flex-1 sm:flex-none">This Month</TabsTrigger>
          <TabsTrigger value="all" className="flex-1 sm:flex-none">All Time</TabsTrigger>
        </TabsList>
        <TabsContent value={period} className="mt-6">
          {loading ? (
            <>
              {/* Loading state for Top 3 FBA Sellers */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-20 ml-auto" />
                </div>
                
                {isMobile ? (
                  /* Mobile loading: Horizontal skeleton cards */
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="flex-shrink-0 w-64">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="absolute -top-1 -right-1 h-4 w-4 rounded" />
                              </div>
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            </div>
                            <Skeleton className="h-5 w-8 rounded-full" />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Desktop loading: Enhanced podium skeletons */
                  <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className={`${i === 2 ? '' : 'mt-4'}`}>
                        
                        <CardContent className="p-6 text-center">
                          <div className="mb-4">
                            <Skeleton className={`mx-auto ${i === 2 ? 'h-16 w-16' : 'h-12 w-12'} rounded-full`} />
                          </div>
                          
                          <div className="mb-3 space-y-2">
                            <Skeleton className={`h-5 w-24 mx-auto ${i === 2 ? 'w-28' : ''}`} />
                            <Skeleton className="h-3 w-20 mx-auto" />
                          </div>
                          
                          <div className="space-y-2">
                            <Skeleton className={`h-6 w-20 mx-auto ${i === 2 ? 'h-8 w-24' : ''}`} />
                            <Skeleton className="h-3 w-16 mx-auto" />
                            <Skeleton className="h-4 w-18 mx-auto" />
                            <Skeleton className="h-6 w-16 mx-auto rounded-full" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Loading state for FBA Seller Rankings */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-6 w-52" />
                    <Skeleton className="h-5 w-20 ml-auto rounded-full" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isMobile ? (
                    /* Mobile loading: Card skeletons */
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-6 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Desktop loading: Table skeletons */
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Skeleton className="h-4 w-8" />
                            </TableHead>
                            <TableHead>
                              <Skeleton className="h-4 w-20" />
                            </TableHead>
                            <TableHead className="text-right">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </TableHead>
                            <TableHead className="text-right hidden sm:table-cell">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </TableHead>
                            <TableHead className="text-right hidden md:table-cell">
                              <Skeleton className="h-4 w-12 ml-auto" />
                            </TableHead>
                            <TableHead className="text-right hidden lg:table-cell">
                              <Skeleton className="h-4 w-14 ml-auto" />
                            </TableHead>
                            <TableHead className="text-right hidden lg:table-cell">
                              <Skeleton className="h-4 w-12 ml-auto" />
                            </TableHead>
                            <TableHead className="text-right hidden xl:table-cell">
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <TableRow key={i}>
                              <TableCell>
                                <Skeleton className="h-4 w-4" />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-7 w-7 rounded-full" />
                                  <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-20" />
                                    <div className="flex gap-1 mt-1">
                                      <Skeleton className="h-4 w-12 rounded-full" />
                                      <Skeleton className="h-4 w-16 rounded-full" />
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="space-y-1">
                                  <Skeleton className="h-4 w-20 ml-auto" />
                                  <Skeleton className="h-3 w-16 ml-auto" />
                                </div>
                              </TableCell>
                              <TableCell className="text-right hidden sm:table-cell">
                                <div className="space-y-1">
                                  <Skeleton className="h-4 w-20 ml-auto" />
                                  <Skeleton className="h-3 w-16 ml-auto" />
                                </div>
                              </TableCell>
                              <TableCell className="text-right hidden md:table-cell">
                                <div className="space-y-1">
                                  <Skeleton className="h-4 w-12 ml-auto" />
                                  <Skeleton className="h-3 w-16 ml-auto" />
                                </div>
                              </TableCell>
                              <TableCell className="text-right hidden lg:table-cell">
                                <Skeleton className="h-4 w-12 ml-auto" />
                              </TableCell>
                              <TableCell className="text-right hidden lg:table-cell">
                                <Skeleton className="h-4 w-16 ml-auto" />
                              </TableCell>
                              <TableCell className="text-right hidden xl:table-cell">
                                <div className="flex justify-end gap-1">
                                  <Skeleton className="h-4 w-8 rounded-full" />
                                  <Skeleton className="h-4 w-8 rounded-full" />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Top 3 FBA Sellers */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold">Top Amazon FBA Sellers</h3>
                  <Badge variant="outline" className="text-xs">
                    <Package className="h-3 w-3 mr-1" />
                    Private Label
                  </Badge>
                </div>
                
                {isMobile ? (
                  /* Mobile: Horizontal swipable cards */
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                    {top3.map((row, idx) => (
                      <Card 
                        key={row.user_id} 
                        className={`flex-shrink-0 w-64 snap-start ${
                          idx === 0 ? "border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50" : 
                          idx === 1 ? "border-slate-400 bg-gradient-to-br from-slate-50 to-gray-50" :
                          "border-amber-600 bg-gradient-to-br from-amber-50 to-yellow-50"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative">
                                <Avatar className="h-8 w-8 flex-shrink-0">
                                  <AvatarImage src={row.avatar_url || ""} alt={row.name || "user"} />
                                  <AvatarFallback>{(row.name || "?").slice(0,1).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {idx === 0 && <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-600" />}
                                {idx === 1 && <Medal className="absolute -top-1 -right-1 h-4 w-4 text-slate-500" />}
                                {idx === 2 && <Medal className="absolute -top-1 -right-1 h-4 w-4 text-amber-600" />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium truncate">{row.name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground truncate">{row.discord || ""}</div>
                              </div>
                            </div>
                            <Badge variant={idx === 0 ? "default" : "secondary"} className="flex-shrink-0 text-xs">
                              #{idx + 1}
                            </Badge>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <div className="text-xl font-semibold text-foreground flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {Number(row.total_profit || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {row.submission_count} product{row.submission_count === 1 ? "" : "s"}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {top3.length === 0 && (
                      <div className="w-full text-center text-muted-foreground py-8">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No FBA sellers yet. Launch your first product!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Desktop: Enhanced podium layout */
                  <div className="grid grid-cols-3 gap-6">
                    {top3.map((row, idx) => {
                      const isWinner = idx === 0
                      const isRunner = idx === 1
                      const isThird = idx === 2
                      
                      return (
                        <Card 
                          key={row.user_id} 
                          className={`transition-all duration-200 hover:scale-105 ${
                            isWinner ? "border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg order-2" : 
                            isRunner ? "border-slate-400 bg-gradient-to-br from-slate-50 to-gray-50 mt-4 order-1" :
                            "border-amber-600 bg-gradient-to-br from-amber-50 to-yellow-50 mt-4 order-3"
                          }`}
                        >
                          
                          <CardContent className="p-6 text-center">
                            <div className="mb-4">
                              <Avatar className={`mx-auto ${isWinner ? "h-16 w-16" : "h-12 w-12"} ring-2 ${
                                isWinner ? "ring-yellow-500" : isRunner ? "ring-slate-400" : "ring-amber-600"
                              }`}>
                                <AvatarImage src={row.avatar_url || ""} alt={row.name || "user"} />
                                <AvatarFallback className="text-lg font-bold">
                                  {(row.name || "?").slice(0,1).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="mb-3">
                              <h4 className={`font-bold truncate ${isWinner ? "text-lg" : "text-base"}`}>
                                {row.name || "Unknown Seller"}
                              </h4>
                              <p className="text-xs text-muted-foreground truncate">{row.discord || "FBA Seller"}</p>
                            </div>
                            
                            <div className="space-y-3">
                              {/* Primary Metric: Profit */}
                              <div className={`font-bold flex items-center justify-center gap-1 ${
                                isWinner ? "text-2xl text-yellow-700" : "text-xl text-foreground"
                              }`}>
                                <DollarSign className={`${isWinner ? "h-5 w-5" : "h-4 w-4"}`} />
                                {Number(row.total_profit || 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">Monthly Profit</div>
                              
                              {/* Enhanced Metrics Grid */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {/* Revenue */}
                                <div className="text-center">
                                  <div className="font-semibold text-green-600">
                                    ${Number(row.total_revenue || 0).toLocaleString()}
                                  </div>
                                  <div className="text-muted-foreground">Revenue</div>
                                </div>
                                
                                {/* Units or ACOS */}
                                {row.total_units_sold > 0 ? (
                                  <div className="text-center">
                                    <div className="font-semibold text-blue-600">
                                      {Number(row.total_units_sold).toLocaleString()}
                                    </div>
                                    <div className="text-muted-foreground">Units</div>
                                  </div>
                                ) : row.avg_acos !== null ? (
                                  <div className="text-center">
                                    <div className={`font-semibold ${
                                      row.avg_acos <= 30 ? "text-green-600" :
                                      row.avg_acos <= 50 ? "text-yellow-600" : "text-red-600"
                                    }`}>
                                      {Number(row.avg_acos).toFixed(1)}%
                                    </div>
                                    <div className="text-muted-foreground">ACOS</div>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <div className="font-semibold text-purple-600">
                                      {row.submission_count}
                                    </div>
                                    <div className="text-muted-foreground">Products</div>
                                  </div>
                                )}
                                
                                {/* Profit Margin or TACOS */}
                                {row.avg_profit_margin !== null ? (
                                  <div className="text-center">
                                    <div className={`font-semibold ${
                                      row.avg_profit_margin >= 20 ? "text-green-600" :
                                      row.avg_profit_margin >= 10 ? "text-yellow-600" : "text-red-600"
                                    }`}>
                                      {Number(row.avg_profit_margin).toFixed(1)}%
                                    </div>
                                    <div className="text-muted-foreground">Margin</div>
                                  </div>
                                ) : row.avg_tacos !== null ? (
                                  <div className="text-center">
                                    <div className={`font-semibold ${
                                      row.avg_tacos <= 15 ? "text-green-600" :
                                      row.avg_tacos <= 25 ? "text-yellow-600" : "text-red-600"
                                    }`}>
                                      {Number(row.avg_tacos).toFixed(1)}%
                                    </div>
                                    <div className="text-muted-foreground">TACOS</div>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <div className="font-semibold text-orange-600">
                                      {((row.total_profit / row.total_revenue) * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-muted-foreground">ROI</div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Categories & Markets */}
                              {(row.categories.length > 0 || row.marketplaces.length > 0) && (
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {row.categories.slice(0, 2).map((cat, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      <Tag className="h-2 w-2 mr-1" />
                                      {cat}
                                    </Badge>
                                  ))}
                                  {row.marketplaces.slice(0, 2).map((market, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      <Globe className="h-2 w-2 mr-1" />
                                      {market.replace('amazon_', '').toUpperCase()}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {/* Position Badge */}
                              <Badge 
                                variant={isWinner ? "default" : "secondary"} 
                                className={`text-xs ${isWinner ? "bg-yellow-600 hover:bg-yellow-700" : ""}`}
                              >
                                <Trophy className="h-3 w-3 mr-1" />
                                #{idx + 1} Place
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                    
                    {top3.length === 0 && (
                      <div className="col-span-3 text-center text-muted-foreground py-12">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h4 className="text-lg font-semibold mb-2">No FBA Champions Yet</h4>
                        <p>Be the first to submit your Amazon FBA profits and claim the crown!</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Scroll indicator for mobile */}
                {isMobile && top3.length > 1 && (
                  <div className="flex justify-center mt-3 gap-1">
                    {top3.map((_, idx) => (
                      <div key={idx} className={`w-1.5 h-1.5 rounded-full ${
                        idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-slate-400" : "bg-amber-600"
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              {/* FBA Seller Rankings */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Amazon FBA Profit Rankings
                    <Badge variant="outline" className="text-xs ml-auto">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {period === "month" ? "This Month" : "All Time"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isMobile ? (
                    /* Mobile card layout */
                    <div className="space-y-3">
                      {data.map((row, idx) => (
                        <div key={row.user_id} className="p-4 rounded-lg border bg-card">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="text-xs">#{idx + 1}</Badge>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={row.avatar_url || ""} alt={row.name || "user"} />
                                <AvatarFallback>{(row.name || "?").slice(0,1).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium truncate">{row.name || "Unknown"}</span>
                                <span className="text-xs text-muted-foreground truncate">{row.discord || ""}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-semibold text-lg flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {Number(row.total_profit || 0).toLocaleString()}
                              </div>
                              {row.avg_profit_margin && (
                                <div className="text-xs text-muted-foreground">
                                  {Number(row.avg_profit_margin).toFixed(1)}% margin
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* FBA Metrics Grid */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp className="h-3 w-3" />
                                <span>Revenue</span>
                              </div>
                              <span className="font-medium">${Number(row.total_revenue || 0).toLocaleString()}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Package className="h-3 w-3" />
                                <span>Units</span>
                              </div>
                              <span className="font-medium">{Number(row.total_units_sold || 0).toLocaleString()}</span>
                            </div>

                            {row.avg_acos !== null && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Target className="h-3 w-3" />
                                  <span>ACOS</span>
                                </div>
                                <span className={`font-medium ${
                                  row.avg_acos <= 30 ? "text-green-600" : 
                                  row.avg_acos <= 50 ? "text-yellow-600" : "text-red-600"
                                }`}>
                                  {Number(row.avg_acos).toFixed(1)}%
                                </span>
                              </div>
                            )}

                            {row.avg_tacos !== null && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Percent className="h-3 w-3" />
                                  <span>TACOS</span>
                                </div>
                                <span className={`font-medium ${
                                  row.avg_tacos <= 15 ? "text-green-600" : 
                                  row.avg_tacos <= 25 ? "text-yellow-600" : "text-red-600"
                                }`}>
                                  {Number(row.avg_tacos).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Categories and Markets */}
                          {((row.categories && row.categories.length > 0) || (row.marketplaces && row.marketplaces.length > 0)) && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex flex-wrap gap-2">
                                {row.categories && row.categories.slice(0, 2).map((cat, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    <Tag className="h-2 w-2 mr-1" />
                                    {cat}
                                  </Badge>
                                ))}
                                {row.marketplaces && row.marketplaces.slice(0, 2).map((market, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    <Globe className="h-2 w-2 mr-1" />
                                    {market.replace('amazon_', '').toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {data.length === 0 && !loading && (
                        <div className="text-center text-muted-foreground py-8">No data yet.</div>
                      )}
                    </div>
                  ) : (
                    /* Desktop table layout */
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Rank</TableHead>
                            <TableHead>FBA Seller</TableHead>
                            <TableHead className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <DollarSign className="h-3 w-3" />
                                Profit
                              </div>
                            </TableHead>
                            <TableHead className="text-right hidden sm:table-cell">
                              <div className="flex items-center justify-end gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Revenue
                              </div>
                            </TableHead>
                            <TableHead className="text-right hidden md:table-cell">
                              <div className="flex items-center justify-end gap-1">
                                <Target className="h-3 w-3" />
                                ACOS
                              </div>
                            </TableHead>
                            <TableHead className="text-right hidden lg:table-cell">
                              <div className="flex items-center justify-end gap-1">
                                <Percent className="h-3 w-3" />
                                TACOS
                              </div>
                            </TableHead>
                            <TableHead className="text-right hidden lg:table-cell">
                              <div className="flex items-center justify-end gap-1">
                                <Package className="h-3 w-3" />
                                Units
                              </div>
                            </TableHead>
                            <TableHead className="text-right hidden xl:table-cell">
                              <div className="flex items-center justify-end gap-1">
                                <Globe className="h-3 w-3" />
                                Markets
                              </div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.map((row, idx) => (
                            <TableRow key={row.user_id}>
                              <TableCell className="font-medium">{idx + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={row.avatar_url || ""} alt={row.name || "user"} />
                                    <AvatarFallback>{(row.name || "?").slice(0,1).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium truncate">{row.name || "Unknown"}</span>
                                    <span className="text-xs text-muted-foreground truncate">{row.discord || ""}</span>
                                    {row.categories && row.categories.length > 0 && (
                                      <div className="flex gap-1 mt-1">
                                        {row.categories.slice(0, 2).map((cat, i) => (
                                          <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                                            <Tag className="h-2 w-2 mr-1" />
                                            {cat}
                                          </Badge>
                                        ))}
                                        {row.categories.length > 2 && (
                                          <Badge variant="outline" className="text-xs px-1 py-0">
                                            +{row.categories.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                <div className="flex flex-col items-end">
                                  <span>${Number(row.total_profit || 0).toLocaleString()}</span>
                                  {row.avg_profit_margin && (
                                    <span className="text-xs text-muted-foreground">
                                      {Number(row.avg_profit_margin).toFixed(1)}% margin
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right hidden sm:table-cell">
                                <div className="flex flex-col items-end">
                                  <span className="font-medium">${Number(row.total_revenue || 0).toLocaleString()}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {row.submission_count} product{row.submission_count === 1 ? "" : "s"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right hidden md:table-cell">
                                {row.avg_acos !== null ? (
                                  <div className="flex flex-col items-end">
                                    <span className={`font-medium ${
                                      row.avg_acos <= 30 ? "text-green-600" : 
                                      row.avg_acos <= 50 ? "text-yellow-600" : "text-red-600"
                                    }`}>
                                      {Number(row.avg_acos).toFixed(1)}%
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ${Number(row.total_ppc_spend || 0).toLocaleString()} spend
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right hidden lg:table-cell">
                                {row.avg_tacos !== null ? (
                                  <span className={`font-medium ${
                                    row.avg_tacos <= 15 ? "text-green-600" : 
                                    row.avg_tacos <= 25 ? "text-yellow-600" : "text-red-600"
                                  }`}>
                                    {Number(row.avg_tacos).toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right hidden lg:table-cell">
                                <span className="font-medium">
                                  {Number(row.total_units_sold || 0).toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="text-right hidden xl:table-cell">
                                <div className="flex flex-wrap justify-end gap-1">
                                  {row.marketplaces && row.marketplaces.slice(0, 2).map((market, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {market.replace('amazon_', '').toUpperCase()}
                                    </Badge>
                                  ))}
                                  {row.marketplaces && row.marketplaces.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{row.marketplaces.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {data.length === 0 && !loading && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center text-muted-foreground">No data yet.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
