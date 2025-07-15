import { redirect } from 'next/navigation';

export default function ShopAllPage() {
  // Redirect to search page with no search term and no filters
  // This ensures we get all products without any category or other filters
  redirect('/search?term=');
} 