import { getB2BHeaderAddresses, getB2BHeaderCompanies } from './actions';
import { B2BAddressSelector } from './b2b-address-selector';
import { B2BCompanySelector } from './b2b-company-selector';

/**
 * B2B Header Bar
 *
 * Server component that fetches companies + addresses and renders
 * the company selector and address selector in the site header.
 * This is the custom portal's equivalent of the freshstart b2b-header-bar,
 * but uses the B2B REST API instead of window.b2b.
 */
export async function B2BHeaderBar() {
  // Fetch both in parallel
  const [companiesResult, addressesResult] = await Promise.allSettled([
    getB2BHeaderCompanies(),
    getB2BHeaderAddresses(),
  ]);

  const companies =
    companiesResult.status === 'fulfilled' ? companiesResult.value.companies : [];
  const addresses =
    addressesResult.status === 'fulfilled' ? addressesResult.value.addresses : [];
  const currentCompanyName = companies.length > 0 ? companies[0]!.companyName : undefined;

  // If no B2B data is available, don't render anything
  if (companies.length === 0 && addresses.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2">
      {companies.length > 0 && (
        <B2BCompanySelector
          initialCompanies={companies}
          currentCompanyName={currentCompanyName}
        />
      )}
      {addresses.length > 0 && (
        <>
          {companies.length > 0 && (
            <div className="h-5 w-px bg-gray-300" />
          )}
          <B2BAddressSelector initialAddresses={addresses} />
        </>
      )}
    </div>
  );
}
