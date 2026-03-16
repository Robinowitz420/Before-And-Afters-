import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/taste-tuner(.*)',
  '/search(.*)',
  '/memberships(.*)',

  '/api/profile(.*)',
  '/api/taste-tuner-state(.*)',
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

