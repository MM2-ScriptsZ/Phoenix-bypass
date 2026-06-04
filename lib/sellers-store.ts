// Shared in-memory sellers store
// On Vercel serverless, each function has its own memory space,
// so this store is shared only within the same function invocation bundle.
// For production, use a database like Supabase.

export interface SellerData {
  webhook: string
  webhook2: string | null
  discord_server: string
  mode: string
  token: string
  created_at: string
}

const sellers: Record<string, SellerData> = {}

export function getSeller(username: string): SellerData | null {
  return sellers[username] || null
}

export function setSeller(username: string, data: SellerData): void {
  sellers[username] = data
}

export function hasSeller(username: string): boolean {
  return username in sellers
}

export function getAllSellers(): Record<string, SellerData> {
  return { ...sellers }
}
