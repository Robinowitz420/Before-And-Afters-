import React from 'react'

export default function CalendarPage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[url('/images/Membership%20Images/Backgrounds/plain%20wallpaper.png')] bg-cover bg-center bg-no-repeat" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-white/80 p-8 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-bold text-[hsl(var(--ink))] mb-6">Calendar of Events</h1>
          <div className="text-center py-16">
            <p className="text-lg text-[hsl(var(--ink))] opacity-70">
              Calendar events coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
