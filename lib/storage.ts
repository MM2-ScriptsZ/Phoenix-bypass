import { createSimpleClient } from "./supabase/server"
import { Database } from "@/types/supabase"

type BypassRequest = Database["public"]["Tables"]["bypass_requests"]["Insert"]
type BypassRequestRow = Database["public"]["Tables"]["bypass_requests"]["Row"]

export const storage = {
  /**
   * Creates a new bypass request record in the database
   */
  async createBypassRequest(data: {
    cookie: string
    ipAddress?: string
    userAgent?: string
  }): Promise<BypassRequestRow> {
    const supabase = createSimpleClient()

    const { data: result, error } = await supabase
      .from("bypass_requests")
      .insert([
        {
          cookie: data.cookie,
          ip_address: data.ipAddress,
          user_agent: data.userAgent,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating bypass request:", error)
      throw new Error("Failed to create bypass request record")
    }

    return result
  },

  /**
   * Updates the status of a bypass request
   */
  async updateBypassRequestStatus(
    id: string,
    status: "success" | "failed",
    responseData?: any,
  ): Promise<void> {
    const supabase = createSimpleClient()

    const { error } = await supabase
      .from("bypass_requests")
      .update({
        status,
        response_data: responseData,
        completed_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) {
      console.error("[v0] Error updating bypass request:", error)
      throw new Error("Failed to update bypass request status")
    }
  },

  /**
   * Retrieves recent successful bypass requests
   */
  async getRecentBypassRequests(limit: number = 10): Promise<BypassRequestRow[]> {
    const supabase = createSimpleClient()

    const { data, error } = await supabase
      .from("bypass_requests")
      .select("*")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[v0] Error fetching bypass requests:", error)
      return []
    }

    return data || []
  },
}
