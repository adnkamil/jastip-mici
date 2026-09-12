const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

export interface GoogleProfile {
  sub: string
  email: string
  email_verified?: boolean
  name?: string
  picture?: string
}

function requireGoogleEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET belum di-set di .env.local',
    )
  }
  return { clientId, clientSecret }
}

export function buildGoogleAuthUrl({
  redirectUri,
  state,
}: {
  redirectUri: string
  state: string
}) {
  const { clientId } = requireGoogleEnv()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  })
  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

export async function exchangeGoogleCode({
  code,
  redirectUri,
}: {
  code: string
  redirectUri: string
}): Promise<GoogleProfile> {
  const { clientId, clientSecret } = requireGoogleEnv()

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    throw new Error('Gagal menukar kode otorisasi Google')
  }

  const tokenData = (await tokenRes.json()) as { access_token: string }

  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  if (!profileRes.ok) {
    throw new Error('Gagal mengambil profil Google')
  }

  return (await profileRes.json()) as GoogleProfile
}