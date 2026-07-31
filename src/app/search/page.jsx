import { redirect } from 'next/navigation';

export default async function SearchRedirectPage({ searchParams }) {
  const params = await searchParams;
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => {
        query.append(key, item);
      });
      return;
    }
    if (value) query.set(key, value);
  });

  redirect(`/properties-coming-soon${query.toString() ? `?${query.toString()}` : ''}`);
}
