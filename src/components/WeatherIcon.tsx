import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudHail,
  Wind,
  CloudFog,
} from 'lucide-react';
import type { WeatherIconType } from '../types/weather';

const iconMap: Record<
  WeatherIconType,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  'clear-day': Sun,
  'clear-night': Moon,
  'partly-cloudy-day': CloudSun,
  'partly-cloudy-night': CloudMoon,
  cloudy: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  sleet: CloudHail,
  wind: Wind,
  fog: CloudFog,
};

interface WeatherIconProps {
  icon: WeatherIconType;
  size?: number;
}

export default function WeatherIcon({ icon, size = 52 }: WeatherIconProps) {
  const IconComponent = iconMap[icon] || Cloud;
  return <IconComponent size={size} className="weather-icon" />;
}
