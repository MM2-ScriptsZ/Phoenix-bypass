import { validateCSRFToken } from "@/lib/csrf"

export interface CSRFValidationResult {
  valid: boolean
  error?: string
}

export async function validateCSRFMiddleware(
  request: Request,
): Promise<CSRFValidationResult> {
  // Only validate POST, PUT, DELETE, PATCH
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    return { valid: true }
  }

  // Get token from x-csrf-token header
  const headerToken = request.headers.get("x-csrf-token")

  // Get token from csrf_token cookie
  const cookieHeader = request.headers.get("cookie")
  let cookieToken: string | undefined

  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim())
    const csrfCookie = cookies.find((c) => c.startsWith("csrf_token="))
    if (csrfCookie) {
      cookieToken = csrfCookie.substring("csrf_token=".length)
    }
  }

  // Validate tokens match
  const isValid = validateCSRFToken(headerToken || undefined, cookieToken || undefined)

  if (!isValid) {
    return {
      valid: false,
      error: "Invalid CSRF token",
    }
  }

  return { valid: true }
}
