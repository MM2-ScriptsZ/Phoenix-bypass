import crypto from "crypto"

export async function GET() {
  // Generate a random CSRF token (64 char hex = 32 bytes)
  const token = crypto.randomBytes(32).toString("hex")

  // Create response with token in JSON body
  const response = new Response(JSON.stringify({ csrfToken: token }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })

  // Set token as httpOnly cookie
  response.headers.set(
    "Set-Cookie",
    `csrf_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
  )

  return response
}
