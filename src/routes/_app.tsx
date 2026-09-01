import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import BottomNav, { useShowBottomNav } from '../components/BottomNav'
import { fetchCurrentUser } from '../lib/auth-functions'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const user = await fetchCurrentUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
  component: AppLayout,
})

function AppLayout() {
  const showBottomNav = useShowBottomNav()

  return (
    <div className="app-shell pb-20">
      <Outlet />
      {showBottomNav && <BottomNav />}
    </div>
  )
}
