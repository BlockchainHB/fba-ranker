import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient, getUserFromAuthHeader, getSupabaseUserClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || undefined
  const user = await getUserFromAuthHeader(authHeader)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Use service role client for database operations
  const supabase = getSupabaseServerClient()
  const body = await req.json()
  
  // Extract all the new FBA fields
  const {
    // Basic info
    productName,
    productCategory,
    productBrand,
    productSku,
    marketplace,
    reportingPeriod,
    currency,
    
    // Financial data
    revenue,
    cost,
    cogs,
    amazonFees,
    unitsSold,
    averageSellingPrice,
    
    // PPC metrics
    ppcSpend,
    ppcSales,
    totalClicks,
    totalImpressions,
    
    // Performance metrics
    conversionRate,
    sessions,
    pageViews,
    bsr,
    reviewsCount,
    averageRating,
    inventoryValue,
    returnRate,
    
    date,
    note,
    proofUrl
  } = body as {
    // Basic info
    productName: string
    productCategory?: string | null
    productBrand?: string | null
    productSku?: string | null
    marketplace?: string
    reportingPeriod?: string
    currency?: string
    
    // Financial data
    revenue: number
    cost: number
    cogs?: number | null
    amazonFees?: number | null
    unitsSold?: number | null
    averageSellingPrice?: number | null
    
    // PPC metrics
    ppcSpend?: number
    ppcSales?: number
    totalClicks?: number
    totalImpressions?: number
    
    // Performance metrics
    conversionRate?: number | null
    sessions?: number | null
    pageViews?: number | null
    bsr?: number | null
    reviewsCount?: number
    averageRating?: number | null
    inventoryValue?: number | null
    returnRate?: number | null
    
    date?: string
    note?: string
    proofUrl?: string
  }

  // Validate only the absolutely essential fields (maximum privacy)
  if (revenue == null || revenue === "" || isNaN(Number(revenue))) {
    return NextResponse.json({ error: "Valid revenue amount is required" }, { status: 400 })
  }
  
  if (cost == null || cost === "" || isNaN(Number(cost))) {
    return NextResponse.json({ error: "Valid cost amount is required" }, { status: 400 })
  }

  // Validate that revenue and cost are non-negative
  if (Number(revenue) < 0) {
    return NextResponse.json({ error: "Revenue cannot be negative" }, { status: 400 })
  }
  
  if (Number(cost) < 0) {
    return NextResponse.json({ error: "Cost cannot be negative" }, { status: 400 })
  }

  const profit = Math.max(0, Number(revenue) - Number(cost))
  
  // Helper function to safely convert to number or null
  const safeNumber = (value: any): number | null => {
    if (value === null || value === undefined || value === "") return null
    const num = Number(value)
    return isNaN(num) ? null : num
  }

  // Helper function to safely convert to number or zero (for metrics that default to 0)
  const safeNumberOrZero = (value: any): number => {
    if (value === null || value === undefined || value === "") return 0
    const num = Number(value)
    return isNaN(num) ? 0 : num
  }

  // Build the payload with privacy-friendly optional field handling
  const payload = {
    user_id: user.id,
    
    // Basic product info (respecting privacy preferences)
    product_name: productName?.trim() || null,
    product_category: productCategory?.trim() || null,
    product_brand: productBrand?.trim() || null,
    product_sku: productSku?.trim() || null,
    marketplace: marketplace || 'amazon_us',
    reporting_period: reportingPeriod || 'monthly',
    currency: currency || 'USD',
    
    // Financial data (only revenue/cost required)
    revenue: Number(revenue),
    cost: Number(cost),
    profit,
    cogs: safeNumber(cogs),
    amazon_fees: safeNumber(amazonFees),
    units_sold: safeNumber(unitsSold),
    average_selling_price: safeNumber(averageSellingPrice),
    
    // PPC metrics (completely optional, defaults to 0 for calculation purposes)
    ppc_spend: safeNumberOrZero(ppcSpend),
    ppc_sales: safeNumberOrZero(ppcSales),
    total_clicks: safeNumberOrZero(totalClicks),
    total_impressions: safeNumberOrZero(totalImpressions),
    
    // Performance metrics (all optional)
    conversion_rate: safeNumber(conversionRate),
    sessions: safeNumber(sessions),
    page_views: safeNumber(pageViews),
    bsr: safeNumber(bsr),
    reviews_count: safeNumberOrZero(reviewsCount),
    average_rating: safeNumber(averageRating),
    inventory_value: safeNumber(inventoryValue),
    return_rate: safeNumber(returnRate),
    
    // Metadata
    date: date ? new Date(date).toISOString() : new Date().toISOString(),
    note: note?.trim() || null,
    proof_url: proofUrl || null,
    status: "pending" as const,
  }

  const { data, error } = await supabase.from("submissions").insert(payload).select().single()
  if (error) {
    console.error('Submission insert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ submission: data })
}
