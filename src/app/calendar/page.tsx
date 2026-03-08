import CalendarClient from './CalendarClient'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default function CalendarPage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/Backgrounds/plain wallpaper.png"
          alt=""
          fill
          priority
          quality={85}
          className="object-cover"
        />
      </div>
      <Link
        href="/calendar-admin"
        className="fixed bottom-2 right-2 z-10 h-24 w-24 rounded-full"
        aria-label="Edit calendar"
      />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <CalendarClient canEdit={false} />
      </div>
    </div>
  )
}
