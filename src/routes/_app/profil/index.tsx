import { useEffect, useState } from 'react'
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Contact,
  Download,
  History,
  Info,
  LogOut,
  Moon,
  SlidersHorizontal,
  Tag,
} from 'lucide-react'
import Switch from '../../../components/ui/Switch'
import { fetchCurrentUser, logoutUser } from '../../../lib/auth-functions'

const currentUserQuery = queryOptions({
  queryKey: ['current-user'],
  queryFn: () => fetchCurrentUser(),
})

export const Route = createFileRoute('/_app/profil/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(currentUserQuery),
  component: ProfilPage,
})

function useDarkModePreference() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle(next: boolean) {
    setIsDark(next)
    window.localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.classList.toggle('light', !next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    document.documentElement.style.colorScheme = next ? 'dark' : 'light'
  }

  return [isDark, toggle] as const
}

function RowLink({
  to,
  icon,
  label,
}: {
  to: string
  icon: React.ReactNode
  label: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 no-underline"
      style={{ color: 'var(--app-text)' }}
    >
      <span style={{ color: 'var(--app-text-soft)' }}>{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight size={18} style={{ color: 'var(--app-text-mute)' }} />
    </Link>
  )
}

function ProfilPage() {
  const { data: user } = useSuspenseQuery(currentUserQuery)
  const navigate = useNavigate()
  const [isDark, toggleDark] = useDarkModePreference()

  async function handleLogout() {
    await logoutUser()
    await navigate({ to: '/login' })
  }

  return (
    <main className="mx-auto max-w-lg px-4 pb-8 pt-6">
      <h1 className="mb-6 text-xl font-bold">Profil</h1>

      <div className="app-card mb-6 flex items-center gap-3 p-4">
        <div className="app-avatar h-14 w-14 text-xl">
          {user?.name.at(0)?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm" style={{ color: 'var(--app-text-soft)' }}>
            {user?.brandName || 'Belum ada nama brand'}
          </p>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--app-text-mute)' }} />
      </div>

      <section className="mb-6">
        <h2
          className="mb-2 text-xs font-semibold uppercase"
          style={{ color: 'var(--app-text-mute)' }}
        >
          Kelola
        </h2>
        <div
          className="app-card flex flex-col divide-y"
          style={{ borderColor: 'var(--app-border)' }}
        >
          <div
            style={{ borderColor: 'var(--app-border)' }}
            className="border-b"
          >
            <RowLink
              to="/profil/fee-rules"
              icon={<Tag size={18} />}
              label="Manajemen Fee"
            />
          </div>
          <div
            style={{ borderColor: 'var(--app-border)' }}
            className="border-b"
          >
            <RowLink
              to="/profil/customers"
              icon={<Contact size={18} />}
              label="Customer"
            />
          </div>
          <div
            style={{ borderColor: 'var(--app-border)' }}
            className="border-b"
          >
            <RowLink
              to="/profil"
              icon={<SlidersHorizontal size={18} />}
              label="Master Control"
            />
          </div>
          <RowLink
            to="/profil"
            icon={<History size={18} />}
            label="Activity Logs"
          />
        </div>
      </section>

      <section className="mb-6">
        <h2
          className="mb-2 text-xs font-semibold uppercase"
          style={{ color: 'var(--app-text-mute)' }}
        >
          Preferensi
        </h2>
        <div
          className="app-card flex flex-col divide-y"
          style={{ borderColor: 'var(--app-border)' }}
        >
          <div
            className="flex items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <Moon size={18} style={{ color: 'var(--app-text-soft)' }} />
            <span className="flex-1">Mode gelap</span>
            <Switch checked={isDark} onChange={toggleDark} label="Mode gelap" />
          </div>
          <div
            className="border-b"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <RowLink
              to="/profil"
              icon={<Bell size={18} />}
              label="Notifikasi"
            />
          </div>
          <Link
            to="/profil"
            className="flex items-center gap-3 px-4 py-3 no-underline"
          >
            <Download size={18} style={{ color: 'var(--app-accent)' }} />
            <span
              className="flex-1 font-medium"
              style={{ color: 'var(--app-accent)' }}
            >
              Tambahkan ke layar utama
            </span>
          </Link>
        </div>
      </section>

      <section className="mb-6">
        <h2
          className="mb-2 text-xs font-semibold uppercase"
          style={{ color: 'var(--app-text-mute)' }}
        >
          Lainnya
        </h2>
        <div
          className="app-card flex flex-col divide-y"
          style={{ borderColor: 'var(--app-border)' }}
        >
          <div
            className="border-b"
            style={{ borderColor: 'var(--app-border)' }}
          >
            <RowLink
              to="/profil"
              icon={<CircleHelp size={18} />}
              label="Bantuan"
            />
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Info size={18} style={{ color: 'var(--app-text-soft)' }} />
            <span className="flex-1">Tentang aplikasi</span>
            <span className="text-sm" style={{ color: 'var(--app-text-mute)' }}>
              v1.0.0
            </span>
          </div>
        </div>
      </section>

      <button
        onClick={handleLogout}
        className="app-btn-outline w-full"
        style={{
          color: 'var(--app-danger)',
          borderColor: 'var(--app-danger-soft)',
        }}
      >
        <LogOut size={18} />
        Keluar
      </button>
    </main>
  )
}