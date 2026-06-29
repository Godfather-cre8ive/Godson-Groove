import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdminUserActions from './AdminUserActions';

export const dynamic = 'force-dynamic';

interface SearchParams { page?: string; role?: string; search?: string; }

async function getUsers(params: SearchParams) {
  const page = Number(params.page || 1);
  const limit = 25;
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (params.role) where.role = params.role;
  if (params.search) {
    where.OR = [
      { email: { contains: params.search, mode: 'insensitive' } },
      { firstName: { contains: params.search, mode: 'insensitive' } },
      { lastName: { contains: params.search, mode: 'insensitive' } },
    ];
  }
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit, orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true,
        emailVerified: true, createdAt: true, phone: true,
        _count: { select: { orders: true, subscriptions: true, readingProgress: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SUBSCRIBER: 'bg-brand-yellow-pale text-brand-yellow-dark',
  FREE_USER: 'bg-gray-100 text-gray-600',
};

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const { users, total, page, totalPages } = await getUsers(searchParams);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <form method="GET">
            <input name="search" defaultValue={searchParams.search} placeholder="Search users..." className="input w-56 py-2 text-sm" />
          </form>
          {['', 'ADMIN', 'SUBSCRIBER', 'FREE_USER'].map((r) => (
            <Link
              key={r}
              href={`/admin/users${r ? `?role=${r}` : ''}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${(searchParams.role || '') === r ? 'bg-brand-yellow text-brand-dark' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {r || 'All'}
            </Link>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-500">{total} users</p>

      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Role', 'Orders', 'Books Read', 'Subscriptions', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-yellow flex items-center justify-center text-brand-dark font-bold text-xs flex-shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-brand-dark text-sm">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${ROLE_COLORS[user.role]}`}>
                      {user.role === 'ADMIN' ? '👑 ' : user.role === 'SUBSCRIBER' ? '⭐ ' : ''}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-center">{user._count.orders}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{user._count.readingProgress}</td>
                  <td className="px-4 py-3 text-gray-600 text-center">{user._count.subscriptions}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('en-NG')}
                  </td>
                  <td className="px-4 py-3">
                    <AdminUserActions userId={user.id} currentRole={user.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          {page > 1 && <Link href={`/admin/users?page=${page - 1}`} className="px-4 py-2 text-sm bg-white rounded-xl border border-gray-200 hover:bg-gray-50">← Prev</Link>}
          <span className="px-4 py-2 text-sm bg-brand-yellow text-brand-dark rounded-xl font-bold">{page} / {totalPages}</span>
          {page < totalPages && <Link href={`/admin/users?page=${page + 1}`} className="px-4 py-2 text-sm bg-white rounded-xl border border-gray-200 hover:bg-gray-50">Next →</Link>}
        </div>
      )}
    </div>
  );
}
