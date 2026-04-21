import { QueryClient } from '@tanstack/react-query';
import { config } from '../config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: config.query.staleTimeMs,
      retry: config.query.retry,
      refetchOnWindowFocus: false,
    },
  },
});
