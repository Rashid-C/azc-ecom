import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import createMiddleware from 'next-intl/middleware'
import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import authConfig from './auth.config'
import { routing } from './i18n/routing'

const RATE_LIMITED_PATHS = [
  '/api/auth/signin',
  '/api/auth/callback',
  '/sign-in',
  '/sign-up',
  '/checkout',
]

let ratelimit: Ratelimit | null = null

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: false,
  })
}

const publicPages = [
  '/',
  '/search',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/cart',
  '/cart/(.*)',
  '/product/(.*)',
  '/page/(.*)',
]

const intlMiddleware = createMiddleware(routing)
const { auth } = NextAuth(authConfig)

export default auth(async (req) => {
  const { pathname } = req.nextUrl

  // Rate limiting
  const shouldLimit = RATE_LIMITED_PATHS.some((path) =>
    pathname.startsWith(path)
  )

  if (shouldLimit && ratelimit) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)

    if (!success) {
      return new NextResponse('Too many requests. Please try again later.', {
        status: 429,
        headers: { 'Retry-After': '10' },
      })
    }
  }

  // Do not apply i18n page routing/redirect logic to API handlers.
  // Keep API routes functional while still allowing the rate-limit block above.
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Auth + i18n routing
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )
  const isPublicPage = publicPathnameRegex.test(pathname)

  if (isPublicPage) {
    return intlMiddleware(req)
  } else {
    if (!req.auth) {
      const newUrl = new URL(
        `/sign-in?callbackUrl=${encodeURIComponent(pathname) || '/'}`,
        req.nextUrl.origin
      )
      return Response.redirect(newUrl)
    } else {
      return intlMiddleware(req)
    }
  }
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
