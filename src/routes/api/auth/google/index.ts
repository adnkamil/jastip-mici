import { randomUUID } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { buildGoogleAuthUrl } from '../../../../lib/google-auth'

const STATE_COOKIE = 'google_oauth_state'

export const Route = createFileRoute('/api/auth/google/')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin
        const redirectUri = `${origin}/api/auth/google/callback`
        const state = randomUUID()

        const isProd = process.env.NODE_ENV === 'production'
        const stateCookie = `${STATE_COOKIE}=${state}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax${isProd ? '; Secure' : ''}`

        try {
          const authUrl = buildGoogleAuthUrl({ redirectUri, state })
          return new Response(null, {
            status: 302,
            headers: {
              Location: authUrl,
              'Set-Cookie': stateCookie,
            },
          })
        } catch (err) {
          console.error('Gagal bikin URL Google OAuth:', err)
          return new Response(null, {
            status: 302,
            headers: { Location: `${origin}/login?error=google_config` },
          })
        }
      },
    },
  },
})