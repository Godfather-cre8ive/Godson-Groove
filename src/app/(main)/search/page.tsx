import SearchClient from './SearchClient';

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; access?: string };
}) {
  const initialQ = searchParams.q || '';
  const initialAccess = searchParams.access || '';

  return <SearchClient initialQ={initialQ} initialAccess={initialAccess} />;
}
