import crypto from "crypto"

/**
 * Generates a new CSRF token (64 character hex string)
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Validates CSRF token - header token must match cookie token
 */
export function validateCSRFToken(headerToken: string | undefined, cookieToken: string | undefined): boolean {
  if (!headerToken || !cookieToken) {
    return false
  }
  return headerToken === cookieToken
}

/**
 * Checks if a request method requires CSRF protection
 */
export function requiresCSRFProtection(method: string): boolean {
  return ["POST", "PUT", "DELETE", "PATCH"].includes(method)
}
