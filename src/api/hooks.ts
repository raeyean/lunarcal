import { useQuery } from '@tanstack/react-query';
import { api } from './client';

export function useYiJi(year: number, month: number, day: number) {
  return useQuery({
    queryKey: ['yiji', year, month, day],
    queryFn: () => api.yiji(year, month, day),
  });
}

export function useDirections(year: number, month: number, day: number) {
  return useQuery({
    queryKey: ['directions', year, month, day],
    queryFn: () => api.directions(year, month, day),
  });
}

export function useDeity(lunarMonth: number, lunarDay: number) {
  return useQuery({
    queryKey: ['deity', lunarMonth, lunarDay],
    queryFn: () =>
      lunarMonth > 0 ? api.deity(lunarMonth, lunarDay) : Promise.resolve({ deity: null }),
  });
}

export function useDeityList() {
  return useQuery({
    queryKey: ['deity-list'],
    queryFn: () => api.deityList(),
  });
}
