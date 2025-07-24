import { Checkbox, TextInput } from '@makeswift/runtime/controls';
import { runtime } from '~/lib/makeswift/runtime';
import { BuyerPortalQuickActionsClient } from './buyer-portal-quick-actions.client';

export const COMPONENT_TYPE = 'catalyst-buyer-portal-quick-actions';

runtime.registerComponent(BuyerPortalQuickActionsClient, {
  type: COMPONENT_TYPE,
  label: 'Buyer Portal Quick Actions',
  props: {
    showCreateQuote: Checkbox({
      label: 'Show Create Quote',
      defaultValue: true,
    }),
    showBrowseCatalog: Checkbox({
      label: 'Show Browse Catalog',
      defaultValue: true,
    }),
    showAccountSettings: Checkbox({
      label: 'Show Account Settings',
      defaultValue: true,
    }),
    createQuoteText: TextInput({
      label: 'Create Quote Text',
      defaultValue: 'Create New Quote',
    }),
    createQuoteDescription: TextInput({
      label: 'Create Quote Description',
      defaultValue: 'Request pricing for products',
    }),
    browseCatalogText: TextInput({
      label: 'Browse Catalog Text',
      defaultValue: 'Browse Catalog',
    }),
    browseCatalogDescription: TextInput({
      label: 'Browse Catalog Description',
      defaultValue: 'View available products',
    }),
    accountSettingsText: TextInput({
      label: 'Account Settings Text',
      defaultValue: 'Account Settings',
    }),
    accountSettingsDescription: TextInput({
      label: 'Account Settings Description',
      defaultValue: 'Manage customer information',
    }),
  },
}); 