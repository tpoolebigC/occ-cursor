'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { HeaderCompany } from './actions';

interface B2BCompanySelectorProps {
  /** Pre-fetched companies from server component */
  initialCompanies?: HeaderCompany[];
  /** Current company name */
  currentCompanyName?: string;
  /** Called when user switches company */
  onCompanySwitch?: (company: HeaderCompany) => void;
}

export function B2BCompanySelector({
  initialCompanies = [],
  currentCompanyName,
  onCompanySwitch,
}: B2BCompanySelectorProps) {
  const [companies, setCompanies] = useState<HeaderCompany[]>(initialCompanies);
  const [companyName, setCompanyName] = useState(currentCompanyName || '');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialCompanies.length);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load companies if not provided via props
  useEffect(() => {
    if (initialCompanies.length > 0) {
      setCompanies(initialCompanies);
      if (!companyName && initialCompanies.length > 0) {
        setCompanyName(initialCompanies[0]!.companyName);
      }
      setIsLoading(false);
      return;
    }

    async function fetchCompanies() {
      try {
        const { getB2BHeaderCompanies } = await import('./actions');
        const result = await getB2BHeaderCompanies();
        if (result.companies.length > 0) {
          setCompanies(result.companies);
          if (!companyName) {
            setCompanyName(result.companies[0]!.companyName);
          }
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanies();
  }, [initialCompanies, companyName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelectCompany = useCallback(
    async (company: HeaderCompany) => {
      setIsOpen(false);
      setCompanyName(company.companyName);

      // Trigger company switch via B2B REST API
      try {
        // TODO: Call switchCompany when the user management context is available
        onCompanySwitch?.(company);
      } catch (error) {
        console.error('[B2B Header] Company switch failed:', error);
      }
    },
    [onCompanySwitch],
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Company
        </span>
        <div className="h-7 w-36 animate-pulse rounded border border-gray-200 bg-gray-100" />
      </div>
    );
  }

  if (!companyName) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Company
        </span>
        <button
          className="flex items-center gap-1 rounded border border-gray-300 bg-transparent px-2.5 py-1 text-sm hover:border-gray-400 hover:bg-gray-50 transition-colors"
          onClick={() => companies.length > 1 && setIsOpen(!isOpen)}
          type="button"
        >
          <span className="max-w-[200px] truncate">{companyName}</span>
          {companies.length > 1 && (
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z" />
            </svg>
          )}
        </button>
      </div>

      {isOpen && companies.length > 1 && (
        <ul className="absolute left-0 top-full z-50 mt-1 min-w-[250px] max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {companies.map((company) => (
            <li key={String(company.companyId)}>
              <button
                className={`block w-full px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                  company.companyName === companyName ? 'bg-indigo-50 font-medium text-indigo-700' : ''
                }`}
                onClick={() => handleSelectCompany(company)}
                type="button"
              >
                {company.companyName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
