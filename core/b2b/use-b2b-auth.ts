'use client';

import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import { login } from './server-login';
import { useSDK } from './use-b2b-sdk';

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
    sdk?.callbacks?.addEventListener('on-registered', handleRegistered);

    return () => {
      sdk?.callbacks?.removeEventListener('on-logout', handleLogout);
      sdk?.callbacks?.removeEventListener('on-registered', handleRegistered);
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