import { createFileRoute } from '@tanstack/react-router'
import { ClipboardList } from 'lucide-react'

export const Route = createFileRoute('/_app/pesanan/')({
  component: PesananPage,
})

function PesananPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="app-icon-tile mb-4 h-14 w-14">
        <ClipboardList size={26} />
      </span>
      <h1 className="text-lg font-bold">Coming soon</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--app-text-soft)' }}>
        Daftar semua pesanan lintas event akan hadir di sini.
      </p>
    </main>
  )
}
