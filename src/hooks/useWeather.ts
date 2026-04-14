import { useQuery } from '@tanstack/react-query';
import { fetchWeatherData } from '../services/weatherApi';

export function useWeather(latitude: number, longitude: number) {
  return useQuery({
    queryKey: ['weather', latitude, longitude],
    queryFn: () => fetchWeatherData(latitude, longitude),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
