'use client';

import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import { useSDK } from './use-b2b-sdk';

interface Data {
  data: Record<string, string>;
}

const handleLogout = () => {
  void signOut({ callbackUrl: '/' });
};

const sections: Record<string, string> = {
  register: 'REGISTER_ACCOUNT',
  orders: 'ORDERS',
};

export function useB2BAuth(token?: string) {
  const searchParams = useSearchParams();
  const sdk = useSDK();

  useEffect(() => {
    sdk?.callbacks?.addEventListener('on-logout', handleLogout);

    return () => {
      sdk?.callbacks?.removeEventListener('on-logout', handleLogout);
    };
  }, [sdk]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const section = params.get('section');

    console.log('B2B Auth Debug:', {
      section,
      hasSdk: !!sdk,
      sdkUtils: !!sdk?.utils,
      openPageMethod: !!sdk?.utils?.openPage,
      sections: Object.keys(sections)
    });

    if (!section || !sdk) {
      console.log('B2B Auth: No section or SDK available');
      return;
    }

    if (sections[section]) {
      console.log('B2B Auth: Opening section:', section, 'with page:', sections[section]);
      params.delete('section');
      window.history.replaceState({}, '', `${window.location.pathname}${params}`);
      
      try {
        sdk.utils?.openPage(sections[section]);
        console.log('B2B Auth: openPage called successfully');
      } catch (error) {
        console.error('B2B Auth: Error calling openPage:', error);
      }
    } else {
      console.log('B2B Auth: Unknown section:', section);
    }
  }, [searchParams, sdk]);

  useEffect(() => {
    if (sdk && token && token !== sdk.utils?.user.getB2BToken()) {
      void sdk.utils?.user.loginWithB2BStorefrontToken(token);
    }
  }, [sdk, token]);

  return null;
} 