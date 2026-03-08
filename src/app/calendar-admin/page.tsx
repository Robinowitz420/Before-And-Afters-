import CalendarClient from '../calendar/CalendarClient'

export const dynamic = 'force-dynamic'

export default function CalendarAdminPage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[url('/images/Backgrounds/plain%20wallpaper.png')] bg-cover bg-center bg-no-repeat" />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <CalendarClient canEdit />
      </div>
    </div>
  )
}
