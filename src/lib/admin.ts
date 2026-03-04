import { currentUser } from '@clerk/nextjs/server'

export async function requireAdminOrThrow() {
  const email = process.env.ADMIN_EMAIL
  if (!email) {
    throw new Error('ADMIN_EMAIL is not set')
  }

  const user = await currentUser()
  const userEmail =
    user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || null

  if (!userEmail || userEmail.toLowerCase() !== email.toLowerCase()) {
    const error = new Error('Unauthorized') as Error & { status?: number }
    error.status = 401
    throw error
  }

  return { user, userEmail }
}
