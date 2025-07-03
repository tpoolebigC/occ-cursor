'use server';

import { cookies } from 'next/headers';

export async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('cartId')?.value;
}

export async function setCartId(cartId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'cartId',
    value: cartId,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
  });
}

export async function clearCartId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('cartId');
} 