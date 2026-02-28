import { TasteTunerClient } from '../taste-tuner/tasteTunerClient'

export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[url('/images/Membership%20Images/Backgrounds/plain%20wallpaper.png')] bg-cover bg-center bg-no-repeat">
      <TasteTunerClient images={[]} />
    </div>
  )
}
