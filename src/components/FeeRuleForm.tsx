import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import NumberInput from './ui/NumberInput'
import { validateFeeTiers } from '../lib/fee-tier-validation'
import type { FeeTierInput } from '../lib/fee-tier-validation'

export interface FeeRuleFormValue {
  name: string
  tiers: Array<FeeTierInput>
}

interface FeeRuleFormProps {
  initialValue?: FeeRuleFormValue
  submitLabel: string
  onSubmit: (value: FeeRuleFormValue) => Promise<void>
}

const emptyTier: FeeTierInput = { minPrice: 0, maxPrice: 0, feeAmount: 0 }

export default function FeeRuleForm({
  initialValue,
  submitLabel,
  onSubmit,
}: FeeRuleFormProps) {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [tiers, setTiers] = useState<Array<FeeTierInput>>(
    initialValue?.tiers ?? [{ ...emptyTier }],
  )
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tierErrors = validateFeeTiers(tiers)
  const hasErrors = tierErrors.length > 0 || name.trim().length === 0

  function updateTier(index: number, patch: Partial<FeeTierInput>) {
    setTiers((prev) =>
      prev.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)),
    )
  }

  function addTier() {
    setTiers((prev) => [...prev, { ...emptyTier }])
  }

  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (hasErrors) return
    setServerError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({ name, tiers })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Gagal menyimpan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Nama aturan
        <input
          required
          placeholder="cth. Fee jastip by Mici"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="app-input"
        />
      </label>

      <p
        className="text-sm font-semibold"
        style={{ color: 'var(--app-text-soft)' }}
      >
        Tier harga
      </p>

      <div className="flex flex-col gap-3">
        {tiers.map((tier, index) => {
          const error = tierErrors.find((e) => e.index === index)
          return (
            <div
              key={index}
              className="app-card p-3"
              style={error ? { borderColor: 'var(--app-danger)' } : undefined}
            >
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--app-text-soft)' }}
                >
                  Tier {index + 1}
                </span>
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    style={{ color: 'var(--app-danger)' }}
                    aria-label="Hapus tier"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs">
                  Harga min
                  <NumberInput
                    value={tier.minPrice}
                    onChange={(minPrice) => updateTier(index, { minPrice })}
                    className="app-input"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  Harga maks
                  <NumberInput
                    value={tier.maxPrice}
                    onChange={(maxPrice) => updateTier(index, { maxPrice })}
                    className="app-input"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-xs">
                Fee jastip
                <NumberInput
                  value={tier.feeAmount}
                  onChange={(feeAmount) => updateTier(index, { feeAmount })}
                  className="app-input"
                />
              </label>
              {error && (
                <p
                  className="mt-2 text-xs"
                  style={{ color: 'var(--app-danger)' }}
                >
                  {error.message}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <button type="button" onClick={addTier} className="app-btn-outline">
        <Plus size={16} />
        Tambah tier
      </button>

      {serverError && (
        <p className="text-sm" style={{ color: 'var(--app-danger)' }}>
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={hasErrors || isSubmitting}
        className="app-btn-primary"
      >
        {isSubmitting ? 'Menyimpan...' : submitLabel}
      </button>
    </form>
  )
}
