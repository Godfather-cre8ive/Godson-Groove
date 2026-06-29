import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdminOrderActions from './AdminOrderActions';

export const dynamic = 'force-dynamic';

interface SearchParams { page?: string; status?: string; }

async function getOrders(params: SearchParams) {
  const page = Number(params.page || 1);
  const limit = 20;
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { select: { quantity: true, book: { select: { title: true } } } },
        payment: { select: { status: true, provider: true } },
        address: true,
      },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total, page, totalPages: Math.ceil(total / limit) };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700', SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700', REFUNDED: 'bg-gray-100 text-gray-500',
};

const STATUSES = ['', 'PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const { orders, total, page, totalPages } = await getOrders(searchParams);

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders${s ? `?status=${s}` : ''}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              (searchParams.status || '') === s
                ? 'bg-brand-yellow text-brand-dark'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s || 'All'} {s && <span className="ml-1 opacity-60">({s})</span>}
          </Link>
        ))}
      </div>
      <p className="text-sm text-gray-500">{total} orders</p>

      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-dark text-sm">{order.user.firstName} {order.user.lastName}</p>
                    <p className="text-xs text-gray-400">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {order.items.map((i) => `${i.book.title} ×${i.quantity}`).join(', ').slice(0, 40)}
                    {order.items.join('').length > 40 && '...'}
                  </td>
                  <td className="px-4 py-3 font-bold text-brand-dark">₦{order.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {order.payment ? (
                      <span className={`badge text-xs ${order.payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.payment.status}
                      </span>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('en-NG')}
                  </td>
                  <td className="px-4 py-3">
                    <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {page > 1 && <Link href={`/admin/orders?page=${page - 1}`} className="px-4 py-2 text-sm bg-white rounded-xl border border-gray-200 hover:bg-gray-50">← Prev</Link>}
          <span className="px-4 py-2 text-sm bg-brand-yellow text-brand-dark rounded-xl font-bold">{page} / {totalPages}</span>
          {page < totalPages && <Link href={`/admin/orders?page=${page + 1}`} className="px-4 py-2 text-sm bg-white rounded-xl border border-gray-200 hover:bg-gray-50">Next →</Link>}
        </div>
      )}
    </div>
  );
}
