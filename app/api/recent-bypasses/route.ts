import { NextResponse } from "next/server"
import { createSimpleClient } from "@/lib/supabase/server"

async function fetchWithRetry(supabase: Awaited<ReturnType<typeof createSimpleClient>>, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase
        .from("recent_bypasses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.log(`[v0] Retry attempt ${i + 1}/${retries} failed:`, error instanceof Error ? error.message : error)
      if (i === retries - 1) {
        return { data: null, error }
      }
      await new Promise((resolve) => setTimeout(resolve, 200 * Math.pow(2, i)))
    }
  }
  return { data: null, error: new Error("Max retries exceeded") }
}

export async function GET() {
  try {
    let supabase
    try {
      supabase = createSimpleClient()
    } catch {
      // Return empty array if Supabase is not configured
      return NextResponse.json({ bypasses: [] })
    }

    const { data, error } = await fetchWithRetry(supabase)

    if (error) {
      return NextResponse.json({ bypasses: [] })
    }

    const bypasses = (data || []).map((bypass) => ({
      username: bypass.username,
      displayName: bypass.display_name || bypass.username,
      avatarUrl: bypass.avatar_url,
      timestamp: bypass.created_at,
    }))

    return NextResponse.json({ bypasses })
  } catch {
    return NextResponse.json({ bypasses: [] })
  }
}

export async function POST(request: Request) {
  try {
    const { username, displayName, avatarUrl, timestamp } = await request.json()

    let supabase
    try {
      supabase = createSimpleClient()
    } catch {
      return NextResponse.json({ success: true, data: null })
    }

    const insertData = {
      username,
      display_name: displayName || username,
      avatar_url: avatarUrl,
      created_at: timestamp || new Date().toISOString(),
    }

    const { data, error } = await supabase.from("recent_bypasses").insert(insertData).select()

    if (error) {
      return NextResponse.json({ success: true, data: null })
    }

    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: true, data: null })
  }
}
