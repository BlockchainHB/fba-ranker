"use client"

import { useEffect, useState } from "react"
import SiteHeader from "@/components/site-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Package, DollarSign, TrendingUp, MousePointer, Eye, ShoppingCart, Star, ChevronLeft, ChevronRight, Check, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Define the steps for the multi-step form
const STEPS = [
  { id: 'financial', title: 'Financial Data', description: 'Revenue & Cost (Required)' },
  { id: 'product', title: 'Product Info', description: 'Optional Details' },
  { id: 'ppc', title: 'PPC Metrics', description: 'Advertising Data' },
  { id: 'performance', title: 'Performance', description: 'Additional Metrics' },
  { id: 'final', title: 'Review', description: 'Submit & Proof' }
]

export default function SubmitPage() {
  const supabase = getSupabaseBrowserClient()
  const [authed, setAuthed] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  // Basic product info
  const [productName, setProductName] = useState("")
  const [productCategory, setProductCategory] = useState("")
  const [productBrand, setProductBrand] = useState("")
  const [productSku, setProductSku] = useState("")
  const [marketplace, setMarketplace] = useState("amazon_us")
  const [reportingPeriod, setReportingPeriod] = useState("monthly")
  const [currency, setCurrency] = useState("USD")
  
  // Financial data
  const [revenue, setRevenue] = useState<number | "">("")
  const [cost, setCost] = useState<number | "">("")
  const [cogs, setCogs] = useState<number | "">("")
  const [amazonFees, setAmazonFees] = useState<number | "">("")
  const [unitsold, setUnitsSold] = useState<number | "">("")
  const [averageSellingPrice, setAverageSellingPrice] = useState<number | "">("")
  
  // PPC Metrics
  const [ppcSpend, setPpcSpend] = useState<number | "">("")
  const [ppcSales, setPpcSales] = useState<number | "">("")
  const [totalClicks, setTotalClicks] = useState<number | "">("")
  const [totalImpressions, setTotalImpressions] = useState<number | "">("")
  
  // Performance metrics
  const [conversionRate, setConversionRate] = useState<number | "">("")
  const [sessions, setSessions] = useState<number | "">("")
  const [pageViews, setPageViews] = useState<number | "">("")
  const [bsr, setBsr] = useState<number | "">("")
  const [reviewsCount, setReviewsCount] = useState<number | "">("")
  const [averageRating, setAverageRating] = useState<number | "">("")
  const [inventoryValue, setInventoryValue] = useState<number | "">("")
  const [returnRate, setReturnRate] = useState<number | "">("")
  
  const [date, setDate] = useState<Date>(new Date())
  const [note, setNote] = useState("")
  const profit = typeof revenue === "number" && typeof cost === "number" ? Math.max(0, revenue - cost) : 0
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user))
  }, [supabase])

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Step validation
  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 0: // Financial step
        return revenue !== "" && cost !== "" && !isNaN(Number(revenue)) && !isNaN(Number(cost))
      default:
        return true // All other steps are optional
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

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
        toast.error("Please sign in first.")
        setSubmitting(false)
        return
      }
      const proofUrl = await uploadProof(userId).catch(err => {
        // Upload failed, continue without proof image
        return undefined
      })
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Basic info
          productName,
          productCategory: productCategory || null,
          productBrand: productBrand || null,
          productSku: productSku || null,
          marketplace,
          reportingPeriod,
          currency,
          
          // Financial data
          revenue: typeof revenue === "number" ? revenue : 0,
          cost: typeof cost === "number" ? cost : 0,
          cogs: typeof cogs === "number" ? cogs : null,
          amazonFees: typeof amazonFees === "number" ? amazonFees : null,
          unitsSold: typeof unitsold === "number" ? unitsold : null,
          averageSellingPrice: typeof averageSellingPrice === "number" ? averageSellingPrice : null,
          
          // PPC metrics
          ppcSpend: typeof ppcSpend === "number" ? ppcSpend : 0,
          ppcSales: typeof ppcSales === "number" ? ppcSales : 0,
          totalClicks: typeof totalClicks === "number" ? totalClicks : 0,
          totalImpressions: typeof totalImpressions === "number" ? totalImpressions : 0,
          
          // Performance metrics
          conversionRate: typeof conversionRate === "number" ? conversionRate : null,
          sessions: typeof sessions === "number" ? sessions : null,
          pageViews: typeof pageViews === "number" ? pageViews : null,
          bsr: typeof bsr === "number" ? bsr : null,
          reviewsCount: typeof reviewsCount === "number" ? reviewsCount : 0,
          averageRating: typeof averageRating === "number" ? averageRating : null,
          inventoryValue: typeof inventoryValue === "number" ? inventoryValue : null,
          returnRate: typeof returnRate === "number" ? returnRate : null,
          
          date: date.toISOString(),
          note,
          proofUrl,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || "Failed to submit")
      }
      toast.success("Submission sent. Waiting for admin approval.")
      
      // Send CLI notification for successful submission
      try {
        await fetch('/api/cli-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'fba_submission',
            message: `New FBA submission received - Revenue: $${Number(revenue).toLocaleString()}, Profit: $${profit.toLocaleString()}`,
            data: {
              revenue: Number(revenue),
              cost: Number(cost),
              profit,
              hasProductInfo: !!(productName || productCategory || productBrand),
              hasPPCData: !!(ppcSpend || ppcSales),
              hasPerformanceData: !!(sessions || conversionRate || bsr),
              marketplace,
              currency
            }
          }),
        })
      } catch (error) {
        console.log('CLI notification failed:', error)
        // Don't block the user experience if notification fails
      }
      
      window.location.href = "/"
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

    // Render individual steps
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Financial Data
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <DollarSign className="h-8 w-8 mx-auto text-green-600" />
              <h2 className="text-xl font-semibold">Financial Performance</h2>
              <p className="text-sm text-muted-foreground">
                Enter your revenue and cost data. This is the only required information.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="revenue" className="flex items-center gap-2">
                  Total Revenue *
                  <Badge variant="default" className="text-xs">Required</Badge>
                </Label>
                <Input
                  id="revenue"
                  inputMode="decimal"
                  value={revenue}
                  onChange={e => setRevenue(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Enter your revenue"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost" className="flex items-center gap-2">
                  Total Cost *
                  <Badge variant="default" className="text-xs">Required</Badge>
                </Label>
                <Input
                  id="cost"
                  inputMode="decimal"
                  value={cost}
                  onChange={e => setCost(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Enter your total cost"
                />
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Net Profit:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${profit.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="bottom" align="start" sideOffset={4} position="popper">
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Month End</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => selectedDate && setDate(selectedDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )

      case 1: // Product Info
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Package className="h-8 w-8 mx-auto text-blue-600" />
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-semibold">Product Information</h2>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Share product details only if you're comfortable. All fields are optional for privacy.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input 
                  id="productName"
                  value={productName} 
                  onChange={e => setProductName(e.target.value)} 
                  placeholder="e.g., Wireless Headphones"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productBrand">Brand</Label>
                <Input 
                  id="productBrand"
                  value={productBrand} 
                  onChange={e => setProductBrand(e.target.value)} 
                  placeholder="Your brand name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productCategory">Category</Label>
                <Input 
                  id="productCategory"
                  value={productCategory} 
                  onChange={e => setProductCategory(e.target.value)} 
                  placeholder="e.g., Electronics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productSku">SKU/ASIN</Label>
                <Input 
                  id="productSku"
                  value={productSku} 
                  onChange={e => setProductSku(e.target.value)} 
                  placeholder="e.g., B08X123ABC"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketplace">Marketplace</Label>
                <Select value={marketplace} onValueChange={setMarketplace}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon_us">Amazon US</SelectItem>
                    <SelectItem value="amazon_ca">Amazon CA</SelectItem>
                    <SelectItem value="amazon_uk">Amazon UK</SelectItem>
                    <SelectItem value="amazon_de">Amazon DE</SelectItem>
                    <SelectItem value="amazon_fr">Amazon FR</SelectItem>
                    <SelectItem value="amazon_it">Amazon IT</SelectItem>
                    <SelectItem value="amazon_es">Amazon ES</SelectItem>
                    <SelectItem value="amazon_jp">Amazon JP</SelectItem>
                    <SelectItem value="amazon_au">Amazon AU</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportingPeriod">Reporting Period</Label>
                <Select value={reportingPeriod} onValueChange={setReportingPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 2: // PPC Metrics
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <TrendingUp className="h-8 w-8 mx-auto text-orange-600" />
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-semibold">PPC Advertising</h2>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Share your advertising performance to help others understand ACOS/TACOS benchmarks.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ppcSpend">PPC Spend ({currency})</Label>
                <Input
                  id="ppcSpend"
                  inputMode="decimal"
                  value={ppcSpend}
                  onChange={e => setPpcSpend(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Total ad spend"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ppcSales">PPC Sales ({currency})</Label>
                <Input
                  id="ppcSales"
                  inputMode="decimal"
                  value={ppcSales}
                  onChange={e => setPpcSales(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Sales from ads"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalClicks">
                  <div className="flex items-center gap-1">
                    <MousePointer className="h-3 w-3" />
                    Total Clicks
                  </div>
                </Label>
                <Input
                  id="totalClicks"
                  inputMode="numeric"
                  value={totalClicks}
                  onChange={e => setTotalClicks(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Ad clicks"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalImpressions">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Impressions
                  </div>
                </Label>
                <Input
                  id="totalImpressions"
                  inputMode="numeric"
                  value={totalImpressions}
                  onChange={e => setTotalImpressions(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Ad impressions"
                />
              </div>
            </div>

            {ppcSpend && ppcSales && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ACOS:</span>
                  <span className="text-lg font-semibold">
                    {((Number(ppcSpend) / Number(ppcSales)) * 100).toFixed(1)}%
                  </span>
                </div>
                {revenue && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">TACOS:</span>
                    <span className="text-lg font-semibold">
                      {((Number(ppcSpend) / Number(revenue)) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 3: // Performance Metrics
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <ShoppingCart className="h-8 w-8 mx-auto text-purple-600" />
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-semibold">Performance Metrics</h2>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Additional performance data to help the community understand market trends.
              </p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sessions">Sessions</Label>
                <Input
                  id="sessions"
                  inputMode="numeric"
                  value={sessions}
                  onChange={e => setSessions(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Product page sessions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conversionRate">Conversion Rate (%)</Label>
                <Input
                  id="conversionRate"
                  inputMode="decimal"
                  value={conversionRate}
                  onChange={e => setConversionRate(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Session conversion rate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bsr">Best Sellers Rank</Label>
                <Input
                  id="bsr"
                  inputMode="numeric"
                  value={bsr}
                  onChange={e => setBsr(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Category BSR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnRate">Return Rate (%)</Label>
                <Input
                  id="returnRate"
                  inputMode="decimal"
                  value={returnRate}
                  onChange={e => setReturnRate(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Product return rate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewsCount">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Reviews Count
                  </div>
                </Label>
                <Input
                  id="reviewsCount"
                  inputMode="numeric"
                  value={reviewsCount}
                  onChange={e => setReviewsCount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Total reviews"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="averageRating">Average Rating</Label>
                <Input
                  id="averageRating"
                  inputMode="decimal"
                  value={averageRating}
                  onChange={e => setAverageRating(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="5.0"
                  max="5"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        )

      case 4: // Final Review
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Check className="h-8 w-8 mx-auto text-green-600" />
              <h2 className="text-xl font-semibold">Review & Submit</h2>
              <p className="text-sm text-muted-foreground">
                Review your data and add any additional context or proof.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">Financial Summary</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium">{revenue ? `$${Number(revenue).toLocaleString()}` : 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="font-medium">{cost ? `$${Number(cost).toLocaleString()}` : 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Net Profit:</span>
                    <span className="text-green-600">${profit.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note">Notes & Context</Label>
                  <Textarea 
                    id="note"
                    value={note} 
                    onChange={e => setNote(e.target.value)} 
                    placeholder="Add context about your performance: promotions, seasonality, product launches, etc."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proofImage">Proof Screenshot</Label>
                  <Input 
                    id="proofImage"
                    type="file" 
                    accept="image/*" 
                    onChange={onFileChange} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a screenshot from your Amazon Seller Central dashboard or analytics
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Submit FBA Performance Data
            </CardTitle>
            <CardDescription>
              Step-by-step submission process. Only revenue and cost are required - everything else is optional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Step {currentStep + 1} of {STEPS.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicators */}
            <div className="flex justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center space-y-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    index < currentStep ? 'bg-green-100 text-green-600' :
                    index === currentStep ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-medium">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Current Step Content */}
            <div className="min-h-[400px]">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!authed || submitting}
                >
                  {submitting ? "Submitting..." : "Submit for Review"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep(currentStep)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>

            {!authed && (
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">
                  Please sign in to submit your FBA performance data.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
