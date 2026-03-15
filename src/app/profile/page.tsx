import { TasteTunerClient } from '../taste-tuner/tasteTunerClient'

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[url('/images/Backgrounds/plain%20wallpaper.png')] bg-cover bg-center bg-no-repeat opacity-70" />
      <TasteTunerClient images={[]} />
    </div>
  )
}
