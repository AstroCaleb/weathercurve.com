export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  currently: CurrentWeather;
  minutely?: MinutelyBlock;
  hourly: HourlyBlock;
  daily: DailyBlock;
  alerts?: WeatherAlert[];
}

export interface CurrentWeather {
  time: number;
  summary: string;
  icon: WeatherIconType;
  precipProbability: number;
  temperature: number;
  apparentTemperature: number;
  dewPoint: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
}

export interface MinutelyBlock {
  summary: string;
  data: MinutelyDataPoint[];
}

export interface MinutelyDataPoint {
  time: number;
  precipProbability: number;
}

export interface HourlyBlock {
  summary: string;
  data: HourlyDataPoint[];
}

export interface HourlyDataPoint {
  time: number;
  summary: string;
  icon: WeatherIconType;
  precipProbability: number;
  temperature: number;
  apparentTemperature: number;
  dewPoint: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  cloudCover: number;
  visibility: number;
  uvIndex: number;
}

export interface DailyBlock {
  summary: string;
  data: DailyDataPoint[];
}

export interface DailyDataPoint {
  time: number;
  summary: string;
  icon: WeatherIconType;
  temperatureHigh: number;
  temperatureLow: number;
}

export interface WeatherAlert {
  title: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  description: string;
  time: number;
  expires: number;
  regions?: string[];
  uri?: string;
}

export type WeatherIconType =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'rain'
  | 'sleet'
  | 'snow'
  | 'wind'
  | 'fog';

export interface SavedLocation {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
}

export interface SavedLocationsData {
  useCurrent: boolean;
  activeLocation: string | null;
  locations: SavedLocation[];
}

export type TempFormat = 'f' | 'c';
export type TimeFormat = '12' | '24';

export type StatKey =
  | 'precipProbability'
  | 'apparentTemperature'
  | 'humidity'
  | 'windSpeed'
  | 'windGust'
  | 'dewPoint'
  | 'cloudCover'
  | 'visibility'
  | 'uvIndex';
