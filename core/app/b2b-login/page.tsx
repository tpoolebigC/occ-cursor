import { redirect } from 'next/navigation';
import { auth } from '~/auth';

export default async function B2BLoginPage() {
  const session = await auth();

  // If already authenticated and has B2B token, redirect to custom dashboard
  if (session?.user && session?.b2bToken) {
    redirect('/custom-dashboard');
  }

  // If authenticated but no B2B token, redirect to home
  if (session?.user && !session?.b2bToken) {
    redirect('/');
  }

  // If not authenticated, redirect to login
  redirect('/login');
} 