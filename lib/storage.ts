"use client"

import { Submission, User } from "./types"

const USERS_KEY = "fba:users"
const SUBMISSIONS_KEY = "fba:submissions"
const SESSION_KEY = "fba:session"
const SEEDED_KEY = "fba:seeded"

export function getSession(): { userId: string; name: string } | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setSession(session: { userId: string; name: string }) {
  if (typeof window === "undefined") return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as User[]
  } catch {
    return []
  }
}

export function setUsers(users: User[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSubmissions(): Submission[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(SUBMISSIONS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Submission[]
  } catch {
    return []
  }
}

export function setSubmissions(subs: Submission[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(subs))
}

export function seedDemoIfNeeded() {
  if (typeof window === "undefined") return
  const seeded = localStorage.getItem(SEEDED_KEY)
  if (seeded) return

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 5).toISOString()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 18).toISOString()

  const users: User[] = [
    {
      id: crypto.randomUUID(),
      name: "Alice",
      discord: "@alice-fba",
      avatarUrl: "/person-avatar-alice.png",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: "Ben",
      discord: "@ben-fba",
      avatarUrl: "/person-avatar-ben.png",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      name: "Chloe",
      discord: "@chloe-fba",
      avatarUrl: "/person-avatar-chloe.png",
      createdAt: new Date().toISOString(),
    },
  ]

  const subs: Submission[] = [
    {
      id: crypto.randomUUID(),
      userId: users[0].id,
      productName: "Silicone Baby Spoons",
      revenue: 4200,
      cost: 2100,
      profit: 2100,
      date: monthStart,
      status: "approved",
      approvedAt: monthStart,
      note: "PPC optimized",
      proofDataUrl: "/generic-online-marketplace.png",
    },
    {
      id: crypto.randomUUID(),
      userId: users[1].id,
      productName: "Yoga Blocks Set",
      revenue: 5100,
      cost: 3200,
      profit: 1900,
      date: monthStart,
      status: "approved",
      approvedAt: monthStart,
      note: "Prime Day bump",
      proofDataUrl: "/amazon-sales-dashboard.png",
    },
    {
      id: crypto.randomUUID(),
      userId: users[2].id,
      productName: "Pet Grooming Gloves",
      revenue: 9000,
      cost: 6400,
      profit: 2600,
      date: lastMonth,
      status: "approved",
      approvedAt: lastMonth,
      note: "Restock hit",
      proofDataUrl: "/amazon-profit-report.png",
    },
  ]

  setUsers(users)
  setSubmissions(subs)
  localStorage.setItem(SEEDED_KEY, "true")
}

export function upsertUser(u: Omit<User, "id" | "createdAt"> & { id?: string }) {
  const users = getUsers()
  let id = u.id || crypto.randomUUID()
  const existingIdx = users.findIndex(x => x.id === id)
  const newUser: User = {
    id,
    name: u.name,
    discord: u.discord,
    avatarUrl: u.avatarUrl,
    createdAt: existingIdx >= 0 ? users[existingIdx].createdAt : new Date().toISOString(),
  }
  if (existingIdx >= 0) users[existingIdx] = newUser
  else users.push(newUser)
  setUsers(users)
  return newUser
}

export function addSubmission(s: Omit<Submission, "id" | "status"> & { status?: "pending" | "approved" | "rejected" }) {
  const subs = getSubmissions()
  const newSub: Submission = {
    ...s,
    id: crypto.randomUUID(),
    status: s.status ?? "pending",
  }
  subs.push(newSub)
  setSubmissions(subs)
  return newSub
}

export function updateSubmission(id: string, patch: Partial<Submission>) {
  const subs = getSubmissions()
  const idx = subs.findIndex(s => s.id === id)
  if (idx < 0) return null
  subs[idx] = { ...subs[idx], ...patch }
  setSubmissions(subs)
  return subs[idx]
}

export function resetDemoData() {
  localStorage.removeItem(USERS_KEY)
  localStorage.removeItem(SUBMISSIONS_KEY)
  localStorage.removeItem(SEEDED_KEY)
  localStorage.removeItem(SESSION_KEY)
}
