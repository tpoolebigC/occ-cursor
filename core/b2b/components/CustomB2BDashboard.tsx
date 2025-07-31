'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  ShoppingCart as CartIcon,
  Receipt as OrderIcon,
  Description as QuoteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useCustomerInfo, useOrders, useQuotes } from '../client-hooks';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export function CustomB2BDashboard() {
  const [tabValue, setTabValue] = useState(0);

  // Server action hooks - these consume the server actions
  const { data: customer, loading: customerLoading, error: customerError } = useCustomerInfo();
  const { data: orders, loading: ordersLoading, error: ordersError } = useOrders(5);
  const { data: quotes, loading: quotesLoading, error: quotesError } = useQuotes(5);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'cancelled':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (customerLoading || ordersLoading || quotesLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome back, {customer?.firstName || 'Customer'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your B2B account, orders, and quotes from your personalized dashboard.
        </Typography>
      </Box>

      {/* Error Display */}
      {(customerError || ordersError || quotesError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {customerError || ordersError || quotesError}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {customer?.companyName || 'Account'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {customer?.emailAddress}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <OrderIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {orders?.orders?.edges?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Recent Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <QuoteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {quotes?.quotes?.edges?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Quotes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CartIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">Quick Order</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Place New Order
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Recent Orders" />
            <Tab label="Active Quotes" />
            <Tab label="Account Details" />
          </Tabs>
        </Box>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Recent Orders
          </Typography>
          {orders?.orders?.edges?.length === 0 ? (
            <Typography color="text.secondary">No recent orders found.</Typography>
          ) : (
            <Grid container spacing={2}>
              {orders?.orders?.edges?.map((edge: any) => {
                const order = edge.node;
                return (
                  <Grid item xs={12} key={order.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6">
                              Order #{order.id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(order.orderedAt.utc)}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="h6">
                              {formatCurrency(order.totalIncTax.value, 'USD')}
                            </Typography>
                            <Chip
                              label={order.status.value}
                              color={getStatusColor(order.status.value) as any}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </TabPanel>

        {/* Quotes Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Active Quotes
          </Typography>
          {quotes?.quotes?.edges?.length === 0 ? (
            <Typography color="text.secondary">No active quotes found.</Typography>
          ) : (
            <Grid container spacing={2}>
              {quotes?.quotes?.edges?.map((edge: any) => {
                const quote = edge.node;
                return (
                  <Grid item xs={12} key={quote.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="h6">
                              Quote #{quote.id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Created: {formatDate(quote.createdAt)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Expires: {formatDate(quote.expiresAt)}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="h6">
                              {formatCurrency(quote.totalIncTax.value, 'USD')}
                            </Typography>
                            <Chip
                              label="Active"
                              color="success"
                              size="small"
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </TabPanel>

        {/* Account Details Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            Account Details
          </Typography>
          {customer && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">
                        {customer.firstName} {customer.lastName}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {customer.email}
                      </Typography>
                    </Box>
                    {customer.phone && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {customer.phone}
                        </Typography>
                      </Box>
                    )}
                    {customer.company && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Company
                        </Typography>
                        <Typography variant="body1">
                          {customer.company}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Addresses ({customer.addresses?.edges?.length || 0})
                    </Typography>
                    {customer.addresses?.edges?.map(({ node: address }: any, index: number) => (
                      <Box key={address.entityId} sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {address.addressType} Address
                        </Typography>
                        <Typography variant="body1">
                          {address.firstName} {address.lastName}
                        </Typography>
                        <Typography variant="body1">
                          {address.address1}
                        </Typography>
                        {address.address2 && (
                          <Typography variant="body1">
                            {address.address2}
                          </Typography>
                        )}
                        <Typography variant="body1">
                          {address.city}, {address.stateOrProvince} {address.postalCode}
                        </Typography>
                        {index < customer.addresses.edges.length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<CartIcon />}
          size="large"
        >
          Place New Order
        </Button>
        <Button
          variant="outlined"
          startIcon={<QuoteIcon />}
          size="large"
        >
          Request Quote
        </Button>
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          size="large"
        >
          Browse Products
        </Button>
      </Box>
    </Box>
  );
} 