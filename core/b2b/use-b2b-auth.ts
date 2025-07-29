'use client';

import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import { login } from './server-login';
import { useB2BSDK } from '~/shared/hooks/use-b2b-sdk';

interface Data {
  data: {
    email: string;
    password: string;
    landingLoginLocation: string;
  };
}

const handleRegistered = ({ data: { email, password, landingLoginLocation } }: Data) => {
  void login(email, password).then((error) => {
    if (error) {
      console.error('B2B Registration Error:', error);
      // TODO: Add toast notification for error
      return;
    }

    if (landingLoginLocation === '0') {
      window.location.href = '/';
    } else {
      window.location.href = '/?section=orders';
    }
  });
};

const handleLogout = () => {
  // Clear any section parameters from URL before logout
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.delete('section');
    window.history.replaceState({}, '', url.toString());
  }
  
  void signOut({
    redirect: true,
    redirectTo: '/',
  }).catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.error('Failed to sign out:', error);
  });
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
    sdk?.callbacks?.addEventListener('on-registered', handleRegistered);

    return () => {
      sdk?.callbacks?.removeEventListener('on-logout', handleLogout);
      sdk?.callbacks?.removeEventListener('on-registered', handleRegistered);
    };
  }, [sdk]);

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(searchParams);
    const section = params.get('section');

    if (!section || !sdk) {
      return;
    }

    if (sections[section]) {
      params.delete('section');
      window.history.replaceState({}, '', `${window.location.pathname}${params}`);
      sdk.utils?.openPage(sections[section]);
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