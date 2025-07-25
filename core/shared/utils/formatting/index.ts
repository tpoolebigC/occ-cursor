// Shared formatting utils exports
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US').format(date);
};

export const formatPhoneNumber = (phone: string): string => {
  // Basic phone formatting
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
};

export default {}; 