export type ApprovalStatus = "pending" | "approved" | "rejected"

export interface User {
  id: string
  name: string
  discord: string
  avatarUrl?: string
  createdAt: string
}

export interface Submission {
  id: string
  userId: string
  productName: string
  revenue: number
  cost: number
  profit: number
  proofDataUrl?: string // base64 data URL of image
  note?: string
  date: string // ISO
  status: ApprovalStatus
  approvedAt?: string // ISO
}

export interface RankingRow {
  user: User
  totalProfit: number
  submissionCount: number
  lastSubmissionAt?: string
}
