import CalendarClient from './CalendarClient'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function CalendarPage() {
  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/Backgrounds/plain wallpaper.png')",
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />
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
