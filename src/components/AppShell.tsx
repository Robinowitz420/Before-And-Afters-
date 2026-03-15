import { AppShellDecor } from '@/components/AppShellDecor'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen app-sunset">
      <AppShellDecor />
      <div className="mx-auto flex min-h-screen w-full">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
