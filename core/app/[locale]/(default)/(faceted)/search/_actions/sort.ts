'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

const sortSchema = z.object({
  sort: z.string().optional(),
  term: z.string().optional(),
});

export async function updateSort(formData: FormData) {
  const data = Object.fromEntries(formData);
  const result = sortSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Invalid sort parameters' };
  }

  const { sort, term } = result.data;
  const searchParams = new URLSearchParams();

  if (term) {
    searchParams.set('term', term);
  }

  if (sort) {
    searchParams.set('sort', sort);
  }

  const url = `/search?${searchParams.toString()}`;
  redirect(url);
} 