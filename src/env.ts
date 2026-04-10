export const ENV = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
