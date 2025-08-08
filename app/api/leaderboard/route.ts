import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = getSupabaseServerClient()
  const { searchParams } = new URL(req.url)
  const period = (searchParams.get("period") || "month") as "month" | "all"

  // Build date filter
  let dateFilter = ""
  if (period === "month") {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    dateFilter = startOfMonth
  }

  // Get approved submissions with enhanced FBA data
  let submissionsQuery = supabase
    .from("submissions")
    .select(`
      *,
      profiles:user_id (
        id,
        name,
        discord,
        avatar_url
      )
    `)
    .eq("status", "approved")

  if (period === "month") {
    submissionsQuery = submissionsQuery.gte("approved_at", dateFilter)
  }

  const { data: approved, error: err1 } = await submissionsQuery
  if (err1) return NextResponse.json({ error: err1.message }, { status: 500 })

  // Process enhanced FBA data
  const userMap = new Map<string, {
    profile: any;
    totalProfit: number;
    totalRevenue: number;
    totalPpcSpend: number;
    submissionCount: number;
    totalUnitsSold: number;
    avgAcos: number;
    avgTacos: number;
    avgProfitMargin: number;
    categories: Set<string>;
    marketplaces: Set<string>;
    lastSubmissionAt?: string;
    submissions: any[];
  }>()

  for (const submission of approved) {
    const userId = submission.user_id
    const profile = submission.profiles
    
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        profile,
        totalProfit: 0,
        totalRevenue: 0,
        totalPpcSpend: 0,
        submissionCount: 0,
        totalUnitsSold: 0,
        avgAcos: 0,
        avgTacos: 0,
        avgProfitMargin: 0,
        categories: new Set(),
        marketplaces: new Set(),
        submissions: []
      })
    }

    const userData = userMap.get(userId)!
    
    // Aggregate financial data
    userData.totalProfit += Number(submission.profit || 0)
    userData.totalRevenue += Number(submission.revenue || 0)
    userData.totalPpcSpend += Number(submission.ppc_spend || 0)
    userData.totalUnitsSold += Number(submission.units_sold || 0)
    userData.submissionCount += 1

    // Track categories and marketplaces
    if (submission.product_category) userData.categories.add(submission.product_category)
    if (submission.marketplace) userData.marketplaces.add(submission.marketplace)

    // Track latest submission
    const submissionDate = submission.approved_at || submission.date
    if (!userData.lastSubmissionAt || new Date(submissionDate) > new Date(userData.lastSubmissionAt)) {
      userData.lastSubmissionAt = submissionDate
    }

    userData.submissions.push(submission)
  }

  // Calculate averages and format final data
  const rows = Array.from(userMap.values()).map(userData => {
    const validAcosSubmissions = userData.submissions.filter(s => s.acos != null)
    const validTacosSubmissions = userData.submissions.filter(s => s.tacos != null)
    const validProfitMarginSubmissions = userData.submissions.filter(s => s.profit_margin != null)

    return {
      user_id: userData.profile.id,
      name: userData.profile.name,
      discord: userData.profile.discord,
      avatar_url: userData.profile.avatar_url,
      total_profit: userData.totalProfit,
      total_revenue: userData.totalRevenue,
      total_ppc_spend: userData.totalPpcSpend,
      submission_count: userData.submissionCount,
      total_units_sold: userData.totalUnitsSold,
      avg_acos: validAcosSubmissions.length > 0 
        ? validAcosSubmissions.reduce((sum, s) => sum + Number(s.acos), 0) / validAcosSubmissions.length 
        : null,
      avg_tacos: validTacosSubmissions.length > 0
        ? validTacosSubmissions.reduce((sum, s) => sum + Number(s.tacos), 0) / validTacosSubmissions.length
        : null,
      avg_profit_margin: validProfitMarginSubmissions.length > 0
        ? validProfitMarginSubmissions.reduce((sum, s) => sum + Number(s.profit_margin), 0) / validProfitMarginSubmissions.length
        : null,
      categories: Array.from(userData.categories),
      marketplaces: Array.from(userData.marketplaces),
      last_submission_at: userData.lastSubmissionAt
    }
  })

  // Sort by total profit
  rows.sort((a, b) => b.total_profit - a.total_profit)
  
  return NextResponse.json({ rows })
}
