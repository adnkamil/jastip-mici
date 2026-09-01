import { useState } from 'react'
import {
  queryOptions,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ChevronRight,
  CopyPlus,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Tag,
} from 'lucide-react'
import { z } from 'zod'
import AddOrderSheet from '../../components/AddOrderSheet'
import { getEventDetail, updateEvent } from '../../lib/events-functions'
import { listFeeRules } from '../../lib/fee-rules-functions'
import {
  createOrder,
  updateOrder,
  updateOrderPaymentStatus,
} from '../../lib/orders-functions'

const searchSchema = z.object({
  addOrder: z.boolean().optional(),
})

export const Route = createFileRoute('/_app/events/$eventId')({
  validateSearch: searchSchema,
  loader: ({ context, params }) => {
    const query = queryOptions({
      queryKey: ['event', params.eventId],
      queryFn: () => getEventDetail({ data: { id: params.eventId } }),
    })
    return context.queryClient.ensureQueryData(query)
  },
  component: EventDetailPage,
})

function formatIDR(value: string | number) {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 1,
  }).format(Number(value))
}

function EventDetailPage() {
  const { eventId } = Route.useParams()
  const { addOrder } = Route.useSearch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [sheetMode, setSheetMode] = useState<
    | { type: 'create' }
    | { type: 'duplicate'; customerName: string }
    | { type: 'edit'; orderId: string }
    | null
  >(addOrder ? { type: 'create' } : null)
  const [search, setSearch] = useState('')

  const query = queryOptions({
    queryKey: ['event', eventId],
    queryFn: () => getEventDetail({ data: { id: eventId } }),
  })
  const { data: event } = useSuspenseQuery(query)

  const feeRulesQuery = queryOptions({
    queryKey: ['fee-rules'],
    queryFn: () => listFeeRules(),
  })
  const { data: feeRules } = useSuspenseQuery(feeRulesQuery)

  const amountIn = event.orders
    .filter((o) => o.paymentStatus === 'paid')
    .flatMap((o) => o.items)
    .reduce(
      (sum, item) => sum + Number(item.originalPrice) + Number(item.fee),
      0,
    )
  const outstanding = event.orders
    .filter((o) => o.paymentStatus === 'unpaid')
    .flatMap((o) => o.items)
    .reduce(
      (sum, item) => sum + Number(item.originalPrice) + Number(item.fee),
      0,
    )

  const filteredOrders = event.orders.filter((order) =>
    order.customerName.toLowerCase().includes(search.toLowerCase()),
  )

  const editingOrder =
    sheetMode?.type === 'edit'
      ? event.orders.find((o) => o.id === sheetMode.orderId)
      : undefined

  async function handleCreateOrder(value: {
    customerName: string
    paymentStatus: 'unpaid' | 'paid'
    items: Array<{ name: string; originalPrice: number; fee: number }>
  }) {
    await createOrder({ data: { eventId, ...value } })
    await queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    await queryClient.invalidateQueries({ queryKey: ['events'] })
    setSheetMode(null)
    await navigate({ to: '/events/$eventId', params: { eventId }, search: {} })
  }

  async function handleUpdateOrder(
    orderId: string,
    value: {
      customerName: string
      paymentStatus: 'unpaid' | 'paid'
      items: Array<{ name: string; originalPrice: number; fee: number }>
    },
  ) {
    await updateOrder({ data: { orderId, ...value } })
    await queryClient.invalidateQueries({ queryKey: ['event', eventId] })
    await queryClient.invalidateQueries({ queryKey: ['events'] })
    setSheetMode(null)
  }

  async function togglePaymentStatus(
    orderId: string,
    current: 'unpaid' | 'paid',
  ) {
    await updateOrderPaymentStatus({
      data: { orderId, paymentStatus: current === 'paid' ? 'unpaid' : 'paid' },
    })
    await queryClient.invalidateQueries({ queryKey: ['event', eventId] })
  }

  async function handleFeeRuleChange(feeRuleId: string) {
    await updateEvent({
      data: {
        id: eventId,
        name: event.name,
        description: event.description ?? undefined,
        eventDate: new Date(event.eventDate).toISOString(),
        feeRuleId: feeRuleId || null,
      },
    })
    await queryClient.invalidateQueries({ queryKey: ['event', eventId] })
  }

  return (
    <main className="app-shell relative mx-auto max-w-lg px-4 pb-24 pt-6">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" style={{ color: 'var(--app-text)' }}>
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-lg font-bold">{event.name}</h1>
            <p className="text-xs" style={{ color: 'var(--app-text-soft)' }}>
              Event date{' '}
              {new Date(event.eventDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <MoreVertical size={20} style={{ color: 'var(--app-text-mute)' }} />
      </header>

      <section className="mb-4 grid grid-cols-2 gap-3">
        <div className="app-card p-4">
          <p className="mb-1 text-sm" style={{ color: 'var(--app-text-soft)' }}>
            Uang masuk
          </p>
          <p className="text-lg font-bold">{formatIDR(amountIn)}</p>
        </div>
        <div className="app-card p-4">
          <p className="mb-1 text-sm" style={{ color: 'var(--app-text-soft)' }}>
            Belum bayar
          </p>
          <p
            className="text-lg font-bold"
            style={{ color: 'var(--app-warning)' }}
          >
            {formatIDR(outstanding)}
          </p>
        </div>
      </section>

      <p className="mb-2 text-sm" style={{ color: 'var(--app-text-soft)' }}>
        Aturan fee jastip untuk event ini
      </p>
      <div className="relative mb-4">
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center"
          style={{ color: 'var(--app-accent)' }}
        >
          <Tag size={16} />
        </span>
        <select
          value={event.feeRule?.id ?? ''}
          onChange={(e) => handleFeeRuleChange(e.target.value)}
          className="app-input appearance-none pl-9"
        >
          <option value="">Belum dipilih</option>
          {feeRules.map((rule) => (
            <option key={rule.id} value={rule.id}>
              {rule.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative mb-4">
        <span
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center"
          style={{ color: 'var(--app-text-mute)' }}
        >
          <Search size={16} />
        </span>
        <input
          placeholder="Cari nama pelanggan"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="app-input pl-9"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredOrders.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--app-text-soft)' }}>
            Belum ada pesanan.
          </p>
        )}
        {filteredOrders.map((order) => {
          const orderTotal = order.items.reduce(
            (sum, item) => sum + Number(item.originalPrice) + Number(item.fee),
            0,
          )
          return (
            <details key={order.id} className="app-card p-4">
              <summary className="flex cursor-pointer items-center gap-3">
                <span className="app-avatar h-9 w-9 flex-shrink-0">
                  {order.customerName.at(0)?.toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{order.customerName}</p>
                  <p
                    className="text-xs"
                    style={{ color: 'var(--app-text-soft)' }}
                  >
                    {order.items.length} item · {formatIDR(orderTotal)}
                  </p>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setSheetMode({
                      type: 'duplicate',
                      customerName: order.customerName,
                    })
                  }}
                  style={{ color: 'var(--app-text-mute)' }}
                  aria-label="Tambah pesanan untuk pelanggan ini"
                >
                  <CopyPlus size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setSheetMode({ type: 'edit', orderId: order.id })
                  }}
                  style={{ color: 'var(--app-text-mute)' }}
                  aria-label="Edit pesanan"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    togglePaymentStatus(order.id, order.paymentStatus)
                  }}
                  className={
                    order.paymentStatus === 'paid'
                      ? 'app-badge app-badge-success'
                      : 'app-badge app-badge-warning'
                  }
                >
                  {order.paymentStatus === 'paid' ? 'Lunas' : 'Belum lunas'}
                </button>
                <ChevronRight
                  size={16}
                  style={{ color: 'var(--app-text-mute)' }}
                />
              </summary>
              <div
                className="mt-3 flex flex-col gap-2 border-t pt-3"
                style={{ borderColor: 'var(--app-border)' }}
              >
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>
                      {formatIDR(Number(item.originalPrice) + Number(item.fee))}
                    </span>
                  </div>
                ))}
                <div
                  className="mt-1 flex justify-between border-t pt-2 text-sm font-semibold"
                  style={{ borderColor: 'var(--app-border)' }}
                >
                  <span>Total</span>
                  <span>{formatIDR(orderTotal)}</span>
                </div>
              </div>
            </details>
          )
        })}
      </div>

      <button
        onClick={() => setSheetMode({ type: 'create' })}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
        style={{ background: 'var(--app-accent)' }}
        aria-label="Tambah Pesanan"
      >
        <Plus size={26} />
      </button>

      {sheetMode?.type === 'create' && (
        <AddOrderSheet
          eventName={event.name}
          feeTiers={event.feeRule?.tiers ?? []}
          onClose={() => setSheetMode(null)}
          onSubmit={handleCreateOrder}
        />
      )}

      {sheetMode?.type === 'duplicate' && (
        <AddOrderSheet
          eventName={event.name}
          feeTiers={event.feeRule?.tiers ?? []}
          title="Tambah Pesanan"
          submitLabel="Simpan pesanan"
          initialValue={{
            customerName: sheetMode.customerName,
            paymentStatus: 'unpaid',
            items: [],
          }}
          onClose={() => setSheetMode(null)}
          onSubmit={handleCreateOrder}
        />
      )}

      {sheetMode?.type === 'edit' && editingOrder && (
        <AddOrderSheet
          eventName={event.name}
          feeTiers={event.feeRule?.tiers ?? []}
          title="Edit Pesanan"
          submitLabel="Simpan perubahan"
          initialValue={{
            customerName: editingOrder.customerName,
            paymentStatus: editingOrder.paymentStatus,
            items: editingOrder.items.map((item) => ({
              name: item.name,
              originalPrice: Number(item.originalPrice),
              fee: Number(item.fee),
            })),
          }}
          onClose={() => setSheetMode(null)}
          onSubmit={(value) => handleUpdateOrder(editingOrder.id, value)}
        />
      )}
    </main>
  )
}
