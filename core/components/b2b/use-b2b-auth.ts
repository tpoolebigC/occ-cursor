'use client';

import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import { useB2BSDK } from '~/shared/hooks/use-b2b-sdk';

interface Data {
  data: Record<string, string>;
}

const handleLogout = () => {
  console.log('B2B Logout triggered from component hook');
  
  // Clear any section parameters from URL before logout
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.delete('section');
    window.history.replaceState({}, '', url.toString());
    console.log('B2B Logout: Cleared section parameters from URL');
  }
  
  void signOut({ callbackUrl: '/' });
};

const sections: Record<string, string> = {
  register: 'REGISTER_ACCOUNT',
  orders: 'ORDERS',
};

export function useB2BAuth(token?: string) {
  const searchParams = useSearchParams();
  const sdk = useB2BSDK();

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }
    sdk?.callbacks?.addEventListener('on-logout', handleLogout);

    return () => {
      sdk?.callbacks?.removeEventListener('on-logout', handleLogout);
    };
  }, [sdk]);

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

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
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

    if (sdk && token && token !== sdk.utils?.user.getB2BToken()) {
      void sdk.utils?.user.loginWithB2BStorefrontToken(token);
    }
  }, [sdk, token]);

  return null;
} 