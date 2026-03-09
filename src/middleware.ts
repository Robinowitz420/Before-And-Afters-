import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/search(.*)',
  '/memberships(.*)',

  '/api/profile(.*)',
  '/api/deposit(.*)',
  '/api/rentals(.*)',
  '/api/memberships(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}

