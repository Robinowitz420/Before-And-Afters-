import { TasteTunerClient } from '../taste-tuner/tasteTunerClient'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function ProfilePage() {
  const { userId } = await auth()
  let membership: string | null = null
  
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { membershipTier: true },
    })
    membership = user?.membershipTier ?? null
  }
  
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[url('/images/Backgrounds/plain%20wallpaper.png')] bg-cover bg-center bg-no-repeat opacity-70" />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 sm:px-6">
        {/* Hero Banner */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 shadow-lg lg:ml-[75px]">
          <Image
            src="/images/Banners/MyCLoset1.png"
            alt="My Closet"
            width={1176}
            height={441}
            priority
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 840px"
          />
        </div>

        {/* Become A Member Button - Desktop only */}
        {!membership ? (
          <div className="mb-6 hidden justify-center lg:flex">
            <Link href="/memberships">
              <Button
                type="button"
                className="border-[3px] border-[#FFD700] px-8 py-6 text-xl font-bold"
              >
                Become A Member
              </Button>
            </Link>
          </div>
        ) : null}

        <TasteTunerClient images={[]} membership={membership} />
      </div>
    </div>
  )
}
