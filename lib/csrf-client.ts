/**
 * Client-side CSRF token management
 */

let cachedToken: string | null = null

/**
 * Fetches a new CSRF token from the server
 */
export async function fetchCSRFToken(): Promise<string> {
  console.log("[v0] Fetching CSRF token from /api/csrf-token")
  const response = await fetch("/api/csrf-token", {
    method: "GET",
    credentials: "include",
  })

  console.log("[v0] CSRF token response status:", response.status)
  if (!response.ok) {
    throw new Error("Failed to fetch CSRF token")
  }

  const data = await response.json()
  console.log("[v0] CSRF token fetched successfully:", data.csrfToken?.substring(0, 8) + "...")
  cachedToken = data.csrfToken
  return data.csrfToken
}

/**
 * Gets the cached CSRF token, or fetches a new one if needed
 */
export async function getCSRFToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken
  }

  return fetchCSRFToken()
}

/**
 * Makes a POST request with automatic CSRF token handling
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit & { data?: any } = {},
): Promise<Response> {
  console.log("[v0] fetchWithCSRF called for URL:", url)
  const token = await getCSRFToken()
  console.log("[v0] Got CSRF token:", token?.substring(0, 8) + "...")

  const headers = new Headers(options.headers || {})
  headers.set("x-csrf-token", token)
  headers.set("Content-Type", "application/json")

  const body = options.data ? JSON.stringify(options.data) : options.body

  console.log("[v0] Making POST request to:", url)
  const response = await fetch(url, {
    ...options,
    method: options.method || "POST",
    headers,
    credentials: "include",
    body,
  })
  console.log("[v0] POST request completed, response status:", response.status)
  return response
}
