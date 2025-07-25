export interface B2BProfile {
  role: B2BRole;
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export enum B2BRole {
  GUEST = 'guest',
  B2C = 'b2c',
  B2B = 'b2b',
}

export interface QuoteConfigProps {
  id: string;
  name: string;
  enabled: boolean;
}

export interface LineItem {
  productId: number;
  quantity: number;
  options?: Array<{
    optionId: number;
    value: string;
  }>;
}

// Global Window interface moved to features/b2b/types/sdk.ts 