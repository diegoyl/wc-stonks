import { ProfileProvider } from '@/components/ProfileProvider'
import Nav from '@/components/Nav'
import ProfilePicker from '@/components/ProfilePicker'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <Nav />
      <ProfilePicker />
      <main className="max-w-6xl mx-auto px-4 py-5 pb-24 md:pb-6">
        {children}
      </main>
    </ProfileProvider>
  )
}
