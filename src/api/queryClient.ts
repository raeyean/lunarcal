import { QueryClient } from '@tanstack/react-query';

// Lunar data is deterministic on date input → cache forever.
// gcTime: drop unused entries after 24h to bound memory.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 24 * 60 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});
