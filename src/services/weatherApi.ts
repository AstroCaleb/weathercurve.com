import axios from 'axios';
import type { WeatherData } from '../types/weather';

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
): Promise<WeatherData> {
  const response = await axios.get<WeatherData>(
    `${import.meta.env.VITE_API_URL}/v1/fetch-weather/?latitude=${latitude}&longitude=${longitude}&units=us&extend=hourly`,
  );
  return response.data;
}
