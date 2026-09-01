import { useQueryClient } from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import FeeRuleForm from '../../../../components/FeeRuleForm'
import type { FeeRuleFormValue } from '../../../../components/FeeRuleForm'
import { createFeeRule } from '../../../../lib/fee-rules-functions'

export const Route = createFileRoute('/_app/profil/fee-rules/new')({
  component: NewFeeRulePage,
})

function NewFeeRulePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  async function handleSubmit(value: FeeRuleFormValue) {
    await createFeeRule({ data: value })
    await queryClient.invalidateQueries({ queryKey: ['fee-rules'] })
    await navigate({ to: '/profil/fee-rules' })
  }

  return (
    <main className="mx-auto max-w-lg px-4 pb-8 pt-6">
      <header className="mb-6 flex items-center gap-3">
        <Link to="/profil/fee-rules" style={{ color: 'var(--app-text)' }}>
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-xl font-bold">Tambah aturan fee</h1>
      </header>

      <FeeRuleForm submitLabel="Simpan" onSubmit={handleSubmit} />
    </main>
  )
}
