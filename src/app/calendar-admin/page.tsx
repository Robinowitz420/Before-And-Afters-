import CalendarClient from '../calendar/CalendarClient'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default function CalendarAdminPage() {
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
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <CalendarClient canEdit />
      </div>
    </div>
  )
}
