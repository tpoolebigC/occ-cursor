'use client';

import { useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

import { login } from '../services/auth';
import { useB2BSDK } from '~/shared/hooks/use-b2b-sdk';

interface RegistrationData {
  data: {
    email: string;
    password: string;
    landingLoginLocation: string;
  };
}

/**
 * B2B Authentication Hook
 * Handles B2B user authentication, registration, and logout events
 */
export function useB2BAuth(token?: string) {
  const searchParams = useSearchParams();
  const sdk = useB2BSDK();

  useEffect(() => {
    // Skip on server side
    if (typeof window === 'undefined') {
      return;
    }

    const handleRegistered = ({ data: { email, password, landingLoginLocation } }: RegistrationData) => {
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
      console.log('B2B Logout triggered from features hook');
      
      // Clear any section parameters from URL before logout
      const url = new URL(window.location.href);
      url.searchParams.delete('section');
      window.history.replaceState({}, '', url.toString());
      console.log('B2B Logout: Cleared section parameters from URL');
      
      void signOut({
        redirect: true,
        redirectTo: '/',
      }).catch((error: unknown) => {
        console.error('Failed to sign out:', error);
      });
    };

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

    const sections: Record<string, string> = {
      register: 'REGISTER_ACCOUNT',
      orders: 'ORDERS',
    };

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