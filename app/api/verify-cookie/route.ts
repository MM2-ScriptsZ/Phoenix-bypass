import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { cookie } = await request.json()

    if (!cookie) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    // Authenticate with Roblox
    const userInfoResponse = await fetch('https://users.roblox.com/v1/users/authenticated', {
      headers: { Cookie: `.ROBLOSECURITY=${cookie.trim()}` },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.json({ success: false, message: 'Invalid cookie' }, { status: 401 })
    }

    const userData = await userInfoResponse.json()

    if (!userData?.id) {
      return NextResponse.json({ success: false, message: 'No user data' }, { status: 401 })
    }

    // Get avatar
    let avatarUrl = ''
    try {
      const avatarRes = await fetch(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userData.id}&size=150x150&format=Png&isCircular=false`
      )
      const avatarData = await avatarRes.json()
      avatarUrl = avatarData?.data?.[0]?.imageUrl || ''
    } catch {}

    return NextResponse.json({
      success: true,
      username: userData.name,
      displayName: userData.displayName,
      avatarUrl,
      userId: userData.id,
    })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
