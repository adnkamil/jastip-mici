import { useState } from 'react'
import { Landmark, X } from 'lucide-react'

export interface BankAccountFormValue {
  bankName: string
  bankAccountNumber: string
}

interface BankAccountModalProps {
  title?: string
  submitLabel?: string
  initialValue?: BankAccountFormValue
  onClose: () => void
  onSubmit: (value: BankAccountFormValue) => Promise<void>
}

const BANK_OPTIONS = ['BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'Bank Lainnya']

export default function BankAccountModal({
  title = 'No. Rekening',
  submitLabel = 'Simpan',
  initialValue,
  onClose,
  onSubmit,
}: BankAccountModalProps) {
  const initialIsCustom = Boolean(
    initialValue?.bankName && !BANK_OPTIONS.includes(initialValue.bankName),
  )
  const [selectedBank, setSelectedBank] = useState(
    initialIsCustom ? 'Bank Lainnya' : (initialValue?.bankName ?? ''),
  )
  const [customBankName, setCustomBankName] = useState(
    initialIsCustom ? (initialValue?.bankName ?? '') : '',
  )
  const [bankAccountNumber, setBankAccountNumber] = useState(
    initialValue?.bankAccountNumber ?? '',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const bankName =
        selectedBank === 'Bank Lainnya' ? customBankName : selectedBank
      await onSubmit({
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan rekening')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!isSubmitting) onClose()
        }}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-[390px] overflow-hidden rounded-2xl border p-5 shadow-2xl"
        style={{
          background: 'var(--app-card)',
          borderColor: 'var(--app-border)',
          color: 'var(--app-text)',
        }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="app-icon-tile h-10 w-10">
              <Landmark size={18} />
            </span>
            <h3 className="text-base font-bold leading-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1 transition-colors hover:opacity-75 disabled:opacity-30"
            style={{ color: 'var(--app-text-mute)' }}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Nama bank
            <select
              required
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="app-input"
            >
              <option value="" disabled>
                Pilih bank
              </option>
              {BANK_OPTIONS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </label>

          {selectedBank === 'Bank Lainnya' && (
            <label className="flex flex-col gap-1 text-sm font-medium">
              Nama bank lain
              <input
                required
                autoFocus
                placeholder="cth. CIMB Niaga"
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                className="app-input"
              />
            </label>
          )}

          <label className="flex flex-col gap-1 text-sm font-medium">
            No. rekening
            <input
              required
              autoFocus={selectedBank !== 'Bank Lainnya'}
              inputMode="numeric"
              placeholder="1234567890"
              value={bankAccountNumber}
              onChange={(e) =>
                setBankAccountNumber(e.target.value.replace(/\s+/g, ''))
              }
              className="app-input"
            />
            <span className="text-xs" style={{ color: 'var(--app-text-mute)' }}>
              Nomor ini akan tampil di halaman invoice/tagih, bisa disalin
              pelanggan saat transfer.
            </span>
          </label>

          {error && (
            <p className="text-sm" style={{ color: 'var(--app-danger)' }}>
              {error}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
              style={{
                border: '1px solid var(--app-border)',
                background: 'transparent',
                color: 'var(--app-text-soft)',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--app-accent)' }}
            >
              {isSubmitting ? 'Menyimpan...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}