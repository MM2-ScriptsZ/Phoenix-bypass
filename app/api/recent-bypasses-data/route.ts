import { storage } from "@/lib/storage"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 100)

    const recentBypassRequests = await storage.getRecentBypassRequests(limit)

    return Response.json({
      success: true,
      data: recentBypassRequests,
      count: recentBypassRequests.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching recent bypasses:", error)
    return Response.json(
      {
        success: false,
        error: "Failed to fetch recent bypass requests",
      },
      { status: 500 },
    )
  }
}
