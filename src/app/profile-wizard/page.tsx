import { ProfileWizard } from './ProfileWizard'

export const dynamic = 'force-dynamic'

export default function ProfileWizardPage() {
  return (
    <div 
      className="min-h-screen w-full"
      style={{
        backgroundImage: 'url("/images/Membership%20Images/Backgrounds/plain%20wallpaper.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="min-h-screen w-full bg-black/30">
        <ProfileWizard />
      </div>
    </div>
  )
}
