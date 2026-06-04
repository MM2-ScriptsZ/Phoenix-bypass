import { put, list } from "@vercel/blob"
import { NextResponse } from "next/server"

export interface BypassLogEntry {
  username: string
  displayName: string
  avatarUrl: string
  userId: number
  status: "success" | "failed"
  timestamp: string
}

const BLOB_LOGS_KEY = "bypass-logs.json"

async function getExistingLogs(): Promise<BypassLogEntry[]> {
  try {
    const { blobs } = await list({ prefix: BLOB_LOGS_KEY })
    if (blobs.length === 0) return []

    const res = await fetch(blobs[0].url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const logs = await getExistingLogs()
    return NextResponse.json({ logs })
  } catch {
    return NextResponse.json({ logs: [] })
  }
}

export async function POST(request: Request) {
  try {
    const entry: BypassLogEntry = await request.json()

    if (!entry.username || !entry.userId) {
      return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 })
    }

    const existing = await getExistingLogs()

    // Add new entry at the beginning, keep max 7 logs (oldest gets removed when new one comes in)
    const updated = [
      {
        username: entry.username,
        displayName: entry.displayName || entry.username,
        avatarUrl: entry.avatarUrl || "",
        userId: entry.userId,
        status: entry.status,
        timestamp: entry.timestamp || new Date().toISOString(),
      },
      ...existing,
    ].slice(0, 7)

    await put(BLOB_LOGS_KEY, JSON.stringify(updated), {
      access: "public",
      addRandomSuffix: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving bypass log:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
