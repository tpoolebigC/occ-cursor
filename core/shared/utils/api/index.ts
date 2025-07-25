// Shared API utils exports
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  const url = new URL(endpoint, process.env.NEXT_PUBLIC_API_BASE_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
};

export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred';
};

export default {}; 