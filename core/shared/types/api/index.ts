// Shared API types exports
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiRequest<T = any> {
  data: T;
  headers?: Record<string, string>;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export default {}; 