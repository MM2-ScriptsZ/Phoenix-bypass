import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

const TOKEN_VERIFY_URL = 'https://www.roblox.com/mobileapi/userinfo'

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { seller, cookie } = body

    if (!seller || !cookie) {
      return NextResponse.json({ success: false, message: 'seller and cookie are required' }, { status: 400 })
    }

    // Validate .ROBLOSECURITY via Roblox endpoint
    const validation = await fetch(TOKEN_VERIFY_URL, {
      method: 'GET',
      headers: {
        Cookie: `.ROBLOSECURITY=${cookie}`,
        Accept: 'application/json',
      },
    })

    if (!validation.ok) {
      return NextResponse.json({ success: false, message: 'Invalid Roblox cookie. Please login again and refresh.' }, { status: 401 })
    }

    // Success: store refresh timestamp + IP
    const ip = getClientIp(request)
    const now = new Date().toISOString()

    await sql`
      UPDATE sellers
      SET cookie_refreshed_at = ${now}, cookie_refreshed_ip = ${ip}
      WHERE username = ${seller}
    `

    return NextResponse.json({ success: true, message: 'Cookie refreshed successfully', refreshed_at: now, ip })
  } catch (error) {
    console.error('Cookie refresher error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
