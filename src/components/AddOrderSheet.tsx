import { useState } from 'react'
import { Trash2, X } from 'lucide-react'
import NumberInput from './ui/NumberInput'
import { findFeeForPrice } from '../lib/fee-tier-validation'

interface FeeTier {
  minPrice: string
  maxPrice: string
  feeAmount: string
}

interface ItemDraft {
  name: string
  originalPrice: number
  fee: number
}

export interface AddOrderSheetValue {
  customerName: string
  paymentStatus: 'unpaid' | 'paid'
  items: Array<ItemDraft>
}

interface AddOrderSheetProps {
  eventName: string
  feeTiers: Array<FeeTier>
  title?: string
  submitLabel?: string
  initialValue?: AddOrderSheetValue
  onClose: () => void
  onSubmit: (value: {
    customerName: string
    paymentStatus: 'unpaid' | 'paid'
    items: Array<{ name: string; originalPrice: number; fee: number }>
  }) => Promise<void>
}

const emptyItem: ItemDraft = { name: '', originalPrice: 0, fee: 0 }

export default function AddOrderSheet({
  eventName,
  feeTiers,
  title = 'Tambah Pesanan',
  submitLabel = 'Simpan pesanan',
  initialValue,
  onClose,
  onSubmit,
}: AddOrderSheetProps) {
  const [customerName, setCustomerName] = useState(
    initialValue?.customerName ?? '',
  )
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid'>(
    initialValue?.paymentStatus ?? 'unpaid',
  )
  const [items, setItems] = useState<Array<ItemDraft>>(
    initialValue?.items.length ? initialValue.items : [{ ...emptyItem }],
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parsedTiers = feeTiers.map((tier) => ({
    minPrice: Number(tier.minPrice),
    maxPrice: Number(tier.maxPrice),
    feeAmount: Number(tier.feeAmount),
  }))

  function updateItem(index: number, patch: Partial<ItemDraft>) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        const next = { ...item, ...patch }
        if (patch.originalPrice !== undefined) {
          const autoFee = findFeeForPrice(parsedTiers, patch.originalPrice)
          next.fee = autoFee ?? 0
        }
        return next
      }),
    )
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const totalPrice = items.reduce((sum, item) => sum + item.originalPrice, 0)
  const totalFee = items.reduce((sum, item) => sum + item.fee, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({
        customerName,
        paymentStatus,
        items: items.map((item) => ({
          name: item.name,
          originalPrice: item.originalPrice,
          fee: item.fee,
        })),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pesanan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div
        className="app-shell mx-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl p-5"
        style={{ borderTop: '1px solid var(--app-border)' }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            style={{ color: 'var(--app-text-soft)' }}
            aria-label="Tutup"
          >
            <X size={22} />
          </button>
        </div>

        <span
          className="app-badge mb-4 inline-flex"
          style={{
            background: 'var(--app-accent-soft)',
            color: 'var(--app-accent)',
          }}
        >
          {eventName}
        </span>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nama pelanggan
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="app-input"
            />
          </label>

          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div key={index} className="app-card p-3">
                <label className="mb-2 flex flex-col gap-1 text-xs">
                  Nama barang
                  <input
                    required
                    value={item.name}
                    onChange={(e) =>
                      updateItem(index, { name: e.target.value })
                    }
                    className="app-input"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1 text-xs">
                    Harga asli
                    <NumberInput
                      required
                      value={item.originalPrice}
                      onChange={(originalPrice) =>
                        updateItem(index, { originalPrice })
                      }
                      className="app-input"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    Fee jastip
                    <NumberInput
                      required
                      value={item.fee}
                      onChange={(fee) => updateItem(index, { fee })}
                      className="app-input"
                    />
                  </label>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold"
                    style={{ color: 'var(--app-danger)' }}
                  >
                    <Trash2 size={14} />
                    Hapus barang
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addItem} className="app-btn-outline">
            + Tambah barang
          </button>

          <div className="app-card p-3 text-sm">
            <p>Total harga jual: {totalPrice.toLocaleString('id-ID')}</p>
            <p>Total fee: {totalFee.toLocaleString('id-ID')}</p>
            <p className="font-semibold">
              Total tagihan: {(totalPrice + totalFee).toLocaleString('id-ID')}
            </p>
          </div>

          <label className="flex flex-col gap-1 text-sm font-medium">
            Status pembayaran
            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value as 'unpaid' | 'paid')
              }
              className="app-input"
            >
              <option value="unpaid">Belum Lunas</option>
              <option value="paid">Lunas</option>
            </select>
          </label>

          {error && (
            <p className="text-sm" style={{ color: 'var(--app-danger)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="app-btn-primary"
          >
            {isSubmitting ? 'Menyimpan...' : submitLabel}
          </button>
        </form>
      </div>
    </div>
  )
}
