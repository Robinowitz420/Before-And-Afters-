import { SignUp } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <SignUp
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
            card: 'bg-slate-900 border-slate-700',
            socialButtonsBlockButton: 'bg-slate-800 border-slate-700 hover:bg-slate-700',
            formFieldInput: 'bg-slate-800 border-slate-600 text-white',
          }
        }}
      />
    </div>
  )
}
