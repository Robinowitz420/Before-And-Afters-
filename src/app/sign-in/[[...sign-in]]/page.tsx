import { SignIn } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default function Page() {
  return (
    <div className="relative min-h-[100svh] w-full">
      <div className="fixed inset-0 -z-10 bg-[url('/images/Backgrounds/plain%20wallpaper.png')] bg-cover bg-center bg-no-repeat" />
      <div className="flex min-h-[100svh] w-full items-center justify-center">
        <SignIn
          appearance={{
            theme: dark,
            variables: {
              colorPrimary: '#6366f1',
              colorBackground: '#0f172a',
              colorInputBackground: '#1e293b',
              colorInputText: '#f8fafc',
            },
            elements: {
              formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
              card: 'bg-slate-900/90 border-slate-700 backdrop-blur-sm',
              socialButtonsBlockButton: 'bg-slate-800 border-slate-700 hover:bg-slate-700',
              formFieldInput: 'bg-slate-800 border-slate-600 text-white',
            }
          }}
        />
      </div>
    </div>
  )
}
