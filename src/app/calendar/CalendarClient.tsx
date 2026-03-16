'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'

type EventItem = {
  id: string
  title?: string
  description?: string
  date?: string
  startTime?: string | null
  endTime?: string | null
  location?: string | null
  imageUrls?: string[]
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toYmd(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function monthLabel(date: Date) {
  return date.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

export default function CalendarClient({ canEdit }: { canEdit: boolean }) {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [rsvpStatus, setRsvpStatus] = useState<'none' | 'attending' | 'not_attending'>('none')
  const [rsvpSaving, setRsvpSaving] = useState(false)

  const [draft, setDraft] = useState<Partial<EventItem> & { id?: string }>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    imageUrls: [],
  })

  const [draftImagesText, setDraftImagesText] = useState('')

  const monthStart = month

  const calendarData = useMemo(() => {
    const year = monthStart.getFullYear()
    const m = monthStart.getMonth()
    const last = new Date(year, m + 1, 0)
    const daysInMonth = last.getDate()

    const d = monthStart.getDay()
    const leadingBlanks = (d + 6) % 7

    const eventMap = new Map<string, EventItem[]>()
    for (const ev of events) {
      if (!ev.date) continue
      const list = eventMap.get(ev.date) ?? []
      list.push(ev)
      eventMap.set(ev.date, list)
    }

    return { daysInMonth, leadingBlanks, eventsByDate: eventMap }
  }, [monthStart, events])

  const daysInMonth = calendarData.daysInMonth
  const leadingBlanks = calendarData.leadingBlanks
  const eventsByDate = calendarData.eventsByDate

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/events', { cache: 'no-store' })
      const json = (await res.json().catch(() => null)) as any
      if (!res.ok) throw new Error(json?.error || 'Failed to load events')
      setEvents(Array.isArray(json?.events) ? json.events : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const openEvent = async (ev: EventItem) => {
    setSelectedEvent(ev)
    setRsvpStatus('none')

    try {
      const res = await fetch(`/api/events/rsvp?eventId=${encodeURIComponent(ev.id)}`, { cache: 'no-store' })
      if (res.ok) {
        const json = (await res.json().catch(() => null)) as any
        const s = json?.status
        if (s === 'attending' || s === 'not_attending' || s === 'none') setRsvpStatus(s)
      }
    } catch {
      // ignore
    }

    if (canEdit) {
      setDraft({
        id: ev.id,
        title: ev.title ?? '',
        description: ev.description ?? '',
        date: ev.date ?? '',
        startTime: ev.startTime ?? '',
        endTime: ev.endTime ?? '',
        location: ev.location ?? '',
        imageUrls: Array.isArray(ev.imageUrls) ? ev.imageUrls : [],
      })

      const urls = Array.isArray(ev.imageUrls) ? ev.imageUrls : []
      setDraftImagesText(urls.join('\n'))
    }
  }

  const clearDraft = () => {
    setDraft({ title: '', description: '', date: '', startTime: '', endTime: '', location: '', imageUrls: [] })
    setDraftImagesText('')
  }

  const saveDraft = async () => {
    const imageUrls = draftImagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 6)

    const payload: any = {
      ...draft,
      imageUrls,
    }

    const method = draft?.id ? 'PUT' : 'POST'

    const res = await fetch('/api/events', {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) throw new Error(json?.error || 'Failed to save event')

    await refresh()
    clearDraft()
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return

    const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const json = (await res.json().catch(() => null)) as any
    if (!res.ok) throw new Error(json?.error || 'Failed to delete')

    setSelectedEvent(null)
    await refresh()
  }

  const setRsvp = async (status: 'attending' | 'not_attending') => {
    if (!selectedEvent) return
    setRsvpSaving(true)
    try {
      const res = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEvent.id, status }),
      })
      const json = (await res.json().catch(() => null)) as any
      if (!res.ok) throw new Error(json?.error || 'Failed to RSVP')
      setRsvpStatus(status)
    } finally {
      setRsvpSaving(false)
    }
  }

  const calendarCells = useMemo(() => {
    const cells: Array<{ date: string | null; day: number | null }> = []
    for (let i = 0; i < leadingBlanks; i++) cells.push({ date: null, day: null })
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day)
      cells.push({ date: toYmd(date), day })
    }
    return cells
  }, [daysInMonth, leadingBlanks, monthStart])

  return (
    <div className="rounded-3xl border border-black/10 bg-pink-200/95 p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--ink))]">Calendar of Events</h1>
          <div className="mt-1 text-sm text-[hsl(var(--ink))]/70">{monthLabel(monthStart)}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-[3px] border-[#FFD700]"
            onClick={() => setMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1))}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-[3px] border-[#FFD700]"
            onClick={() => setMonth(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1))}
          >
            Next
          </Button>
        </div>
      </div>

      {loading ? <div className="mt-8 text-[hsl(var(--ink))]">Loading…</div> : null}
      {error ? <div className="mt-8 text-red-700">{error}</div> : null}

      <div className="mt-6 grid grid-cols-7 gap-2 text-xs font-semibold text-[hsl(var(--ink))]">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {calendarCells.map((cell, idx) => {
          const dayEvents = cell.date ? eventsByDate.get(cell.date) ?? [] : []
          return (
            <div
              key={`${cell.date ?? 'blank'}_${idx}`}
              className="min-h-32 rounded-2xl border border-black/10 bg-white/90 p-2"
            >
              {cell.day ? <div className="text-sm font-bold text-[hsl(var(--ink))]">{cell.day}</div> : null}
              {dayEvents.slice(0, 4).map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => openEvent(ev)}
                  className="mt-1 block w-full truncate rounded-lg border border-black/10 bg-white/70 px-2 py-1 text-left text-xs text-[hsl(var(--ink))] hover:bg-white"
                >
                  {ev.title || 'Untitled'}
                </button>
              ))}
              {dayEvents.length > 4 ? (
                <div className="mt-1 text-[10px] text-[hsl(var(--ink))]/70">+{dayEvents.length - 4} more</div>
              ) : null}
            </div>
          )
        })}
      </div>

      {selectedEvent ? (
        <div className="mt-8 rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-2xl font-bold text-[hsl(var(--ink))]">{selectedEvent.title}</div>
              <div className="mt-1 text-sm text-[hsl(var(--ink))]/70">
                {selectedEvent.date}
                {selectedEvent.startTime ? ` • ${selectedEvent.startTime}` : ''}
                {selectedEvent.endTime ? `–${selectedEvent.endTime}` : ''}
              </div>
              {selectedEvent.location ? (
                <div className="mt-1 text-sm text-[hsl(var(--ink))]/70">{selectedEvent.location}</div>
              ) : null}
            </div>
            <Button type="button" variant="outline" onClick={() => setSelectedEvent(null)} className="border-[3px] border-[#FFD700]">
              Close
            </Button>
          </div>

          {selectedEvent.description ? (
            <div className="mt-4 whitespace-pre-wrap text-[hsl(var(--ink))]">{selectedEvent.description}</div>
          ) : null}

          {Array.isArray(selectedEvent.imageUrls) && selectedEvent.imageUrls.length ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {selectedEvent.imageUrls.map((url) => (
                <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-black/10 bg-white">
                  <Image src={url} alt="Event" fill sizes="600px" className="object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          ) : null}

          {!canEdit ? (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                onClick={() => setRsvp('attending')}
                disabled={rsvpSaving}
                className="border-[3px] border-[#FFD700] px-8 py-6 text-xl font-bold"
              >
                {rsvpStatus === 'attending' ? 'Attending' : 'Mark Attending'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRsvp('not_attending')}
                disabled={rsvpSaving}
                className="border-[3px] border-[#FFD700] px-8 py-6 text-xl font-bold"
              >
                {rsvpStatus === 'not_attending' ? 'Not attending' : 'Mark Not Attending'}
              </Button>
            </div>
          ) : (
            <div className="mt-8">
              <div className="text-sm font-semibold text-[hsl(var(--ink))]">Edit Event</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm text-[hsl(var(--ink))]">
                  Title
                  <input
                    value={draft.title ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-[hsl(var(--ink))]">
                  Date (YYYY-MM-DD)
                  <input
                    value={draft.date ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-[hsl(var(--ink))]">
                  Start time (HH:MM)
                  <input
                    value={draft.startTime ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-[hsl(var(--ink))]">
                  End time (HH:MM)
                  <input
                    value={draft.endTime ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-[hsl(var(--ink))] sm:col-span-2">
                  Location
                  <input
                    value={draft.location ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-[hsl(var(--ink))] sm:col-span-2">
                  Description
                  <textarea
                    value={draft.description ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                    className="mt-1 min-h-28 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-[hsl(var(--ink))] sm:col-span-2">
                  Image URLs (one per line)
                  <textarea
                    value={draftImagesText}
                    onChange={(e) => setDraftImagesText(e.target.value)}
                    className="mt-1 min-h-24 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      await saveDraft()
                    } catch (e) {
                      alert(e instanceof Error ? e.message : 'Failed to save')
                    }
                  }}
                  className="border-[3px] border-[#FFD700] px-8 py-6 text-xl font-bold"
                >
                  Save
                </Button>
                {draft.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await deleteEvent(draft.id as string)
                      } catch (e) {
                        alert(e instanceof Error ? e.message : 'Failed to delete')
                      }
                    }}
                    className="border-[3px] border-[#FFD700] px-8 py-6 text-xl font-bold"
                  >
                    Delete
                  </Button>
                ) : null}
                <Button type="button" variant="outline" onClick={clearDraft} className="border-[3px] border-[#FFD700] px-8 py-6 text-xl font-bold">
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : canEdit ? (
        <div className="mt-8 rounded-3xl border border-black/10 bg-white/95 p-6 shadow-sm">
          <div className="text-lg font-semibold text-[hsl(var(--ink))]">Create Event</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-[hsl(var(--ink))]">
              Title
              <input
                value={draft.title ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
              />
            </label>
            <label className="text-sm text-[hsl(var(--ink))]">
              Date (YYYY-MM-DD)
              <input
                value={draft.date ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
              />
            </label>
            <label className="text-sm text-[hsl(var(--ink))]">
              Start time (HH:MM)
              <input
                value={draft.startTime ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, startTime: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
              />
            </label>
            <label className="text-sm text-[hsl(var(--ink))]">
              End time (HH:MM)
              <input
                value={draft.endTime ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, endTime: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
              />
            </label>
            <label className="text-sm text-[hsl(var(--ink))] sm:col-span-2">
              Location
              <input
                value={draft.location ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
              />
            </label>
            <label className="text-sm text-[hsl(var(--ink))] sm:col-span-2">
              Description
              <textarea
                value={draft.description ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className="mt-1 min-h-28 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
              />
            </label>
            <label className="text-sm text-[hsl(var(--ink))] sm:col-span-2">
              Image URLs (one per line)
              <textarea
                value={draftImagesText}
                onChange={(e) => setDraftImagesText(e.target.value)}
                className="mt-1 min-h-24 w-full rounded-lg border border-black/10 bg-white/80 px-3 py-2"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={async () => {
                try {
                  await saveDraft()
                } catch (e) {
                  alert(e instanceof Error ? e.message : 'Failed to save')
                }
              }}
              className="border-[3px] border-[#FFD700] px-8 py-6 text-xl font-bold"
            >
              Create
            </Button>
            <Button type="button" variant="outline" onClick={clearDraft} className="border-[3px] border-[#FFD700] px-8 py-6 text-xl font-bold">
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-8 text-xs text-[hsl(var(--ink))]/70">
        Today: {toYmd(new Date())}
      </div>
    </div>
  )
}
