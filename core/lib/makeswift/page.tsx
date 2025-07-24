import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { getPageSnapshot } from './client';

export async function Page({ path, locale }: { path: string; locale: string }) {
  const snapshot = await getPageSnapshot({ path, locale });

  if (snapshot == null) {
    // If no Makeswift page exists, show a default page instead of notFound
    // This prevents redirect loops and allows users to create pages in Makeswift
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Your Store
          </h1>
          <p className="text-gray-600 mb-6">
            This page hasn't been created in Makeswift yet.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              To edit this page in Makeswift:
            </p>
            <ol className="text-sm text-gray-500 list-decimal list-inside space-y-1">
              <li>Go to your Makeswift dashboard</li>
              <li>Create a new page with path "{path}"</li>
              <li>Add your custom components</li>
              <li>Publish the page</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <MakeswiftPage snapshot={snapshot} />;
}
