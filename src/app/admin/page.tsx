import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers, newUsers, activeSubscriptions,
    totalBooks, totalOrders, pendingOrders,
    revenue, recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.book.count({ where: { published: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', paidAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        payment: { select: { status: true } },
        items: { select: { quantity: true } },
      },
    }),
  ]);

  return {
    totalUsers, newUsers, activeSubscriptions,
    totalBooks, totalOrders, pendingOrders,
    revenue: revenue._sum.amount || 0,
    recentOrders,
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default async function AdminDashboard() {
  const data = await getAnalytics();

  const stats = [
    { label: 'Total Users', value: data.totalUsers.toLocaleString(), sub: `+${data.newUsers} this month`, icon: '👥', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Subscriptions', value: data.activeSubscriptions.toLocaleString(), sub: 'Groove Pass', icon: '⭐', color: 'text-brand-yellow-dark', bg: 'bg-brand-yellow-pale' },
    { label: 'Total Books', value: data.totalBooks.toLocaleString(), sub: 'Published', icon: '📚', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Revenue (30d)', value: `₦${data.revenue.toLocaleString()}`, sub: 'Last 30 days', icon: '💰', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Orders', value: data.totalOrders.toLocaleString(), sub: `${data.pendingOrders} pending`, icon: '📦', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-soft">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center text-lg mb-3`}>
              {stat.icon}
            </div>
            <div className={`text-2xl font-black font-display ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-800 text-sm font-semibold mt-0.5">{stat.label}</div>
            <div className="text-gray-400 text-xs mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl p-5 shadow-soft">
        <h2 className="font-display font-bold text-brand-dark mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/books/create', label: '+ New Book', style: 'btn-primary text-sm py-2.5' },
            { href: '/admin/series', label: '+ New Series', style: 'btn-secondary text-sm py-2.5' },
            { href: '/admin/categories', label: '+ Category', style: 'btn-secondary text-sm py-2.5' },
            { href: '/admin/orders', label: 'View Orders', style: 'btn-ghost text-sm py-2.5 border border-gray-200' },
            { href: '/admin/users', label: 'Manage Users', style: 'btn-ghost text-sm py-2.5 border border-gray-200' },
          ].map((a) => (
            <Link key={a.href} href={a.href} className={a.style}>{a.label}</Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-brand-dark">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand-yellow-dark font-semibold hover:text-brand-dark transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                    #{order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-brand-dark">{order.user.firstName} {order.user.lastName}</p>
                    <p className="text-xs text-gray-400">{order.user.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-brand-dark">
                    ₦{/* (total not included in query — add if needed) */}—
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge text-xs ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-NG')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
