import { AppShellDecor } from '@/components/AppShellDecor'
import { NavBar } from '@/components/NavBar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen app-sunset">
      <AppShellDecor />
      <NavBar />
      <div className="mx-auto flex min-h-screen w-full pt-14">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
