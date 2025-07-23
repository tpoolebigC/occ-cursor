import './components/accordions/accordions.makeswift';
import './components/button-link/button-link.makeswift';
import './components/card-carousel/card-carousel.makeswift';
import './components/card/card.makeswift';
import './components/carousel/carousel.makeswift';
import './components/product-card/product-card.makeswift';
import './components/products-carousel/products-carousel.makeswift';
import './components/products-list/products-list.makeswift';
import './components/section/section.makeswift';
import './components/site-footer/site-footer.makeswift';
import './components/site-header/site-header.makeswift';
import './components/slideshow/slideshow.makeswift';
import './components/sticky-sidebar/sticky-sidebar.makeswift';
import './components/product-detail/register';

import './components/site-theme/register';

// Buyer Portal Components
import './components/customer-selector/customer-selector.makeswift';
import './components/order-history/order-history.makeswift';
import './components/order-list/order-list.makeswift';
import './components/order-search/order-search.makeswift';
import './components/order-filters/order-filters.makeswift';
import './components/quote-stats/quote-stats.makeswift';
import './components/quote-list/quote-list.makeswift';
import './components/quote-search/quote-search.makeswift';
import './components/quote-filters/quote-filters.makeswift';
import './components/catalog-search/catalog-search.makeswift';
import './components/catalog-filters/catalog-filters.makeswift';
import './components/catalog-sort/catalog-sort.makeswift';
import './components/catalog-grid/catalog-grid.makeswift';
import './components/account-navigation/account-navigation.makeswift';
import './components/profile-form/profile-form.makeswift';
import './components/company-form/company-form.makeswift';
import './components/preferences-form/preferences-form.makeswift';
import './components/security-form/security-form.makeswift';
import './components/revenue-metric/revenue-metric.makeswift';
import './components/orders-metric/orders-metric.makeswift';
import './components/customers-metric/customers-metric.makeswift';
import './components/growth-metric/growth-metric.makeswift';
import './components/revenue-chart/revenue-chart.makeswift';
import './components/orders-chart/orders-chart.makeswift';
import './components/products-chart/products-chart.makeswift';
import './components/segments-chart/segments-chart.makeswift';
import './components/recent-orders-table/recent-orders-table.makeswift';
import './components/top-customers-table/top-customers-table.makeswift';

import { MakeswiftComponentType } from '@makeswift/runtime';

import { runtime } from './runtime';

// Hide some builtin Makeswift components

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Carousel,
  label: 'Carousel (hidden)',
  hidden: true,
  props: {},
});

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Countdown,
  label: 'Countdown (hidden)',
  hidden: true,
  props: {},
});

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Form,
  label: 'Form (hidden)',
  hidden: true,
  props: {},
});

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Navigation,
  label: 'Navigation (hidden)',
  hidden: true,
  props: {},
});
