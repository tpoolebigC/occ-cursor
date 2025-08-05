/**
 * Custom B2B Dashboard Page - New Implementation
 * 
 * This page uses the new B2B client with gql-tada instead of
 * relying on B2B buyer portal or B3Storage dependencies.
 */

import { CustomB2BDashboard } from '~/b2b/components/CustomB2BDashboard-new';

export default function CustomDashboardPage() {
  return <CustomB2BDashboard />;
} 