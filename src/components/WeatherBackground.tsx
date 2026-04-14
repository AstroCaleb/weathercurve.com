import { useMemo } from 'react';
import type { WeatherIconType } from '../types/weather';

interface WeatherBackgroundProps {
  icon: WeatherIconType;
  windGust?: number;
}

const GRADIENTS: Record<WeatherIconType, [string, string, string]> = {
  'clear-day': ['#2a1810', '#4a3020', '#1a2040'],
  'clear-night': ['#080818', '#0c0c28', '#0a0a20'],
  'partly-cloudy-day': ['#1a1830', '#1e2845', '#14203a'],
  'partly-cloudy-night': ['#0a0c1e', '#10142a', '#0c1020'],
  cloudy: ['#151822', '#1a1e2e', '#12161f'],
  rain: ['#0a1020', '#0e1830', '#081525'],
  snow: ['#141828', '#1a2035', '#181e30'],
  sleet: ['#0e1420', '#121a2a', '#0c1522'],
  wind: ['#101820', '#142028', '#0e1a25'],
  fog: ['#141618', '#181a20', '#141820'],
};

// 0 = calm, 1 = 20-40 mph (moderate), 2 = 40+ mph (severe)
type WindTier = 0 | 1 | 2;

export default function WeatherBackground({
  icon,
  windGust = 0,
}: WeatherBackgroundProps) {
  const [c1, c2, c3] = GRADIENTS[icon] || GRADIENTS['cloudy'];

  const showRain = icon === 'rain' || icon === 'sleet';
  const showSnow = icon === 'snow';

  const windTier: WindTier = windGust >= 40 ? 2 : windGust > 20 ? 1 : 0;

  const particles = useMemo(() => {
    if (!showRain && !showSnow) return null;

    if (showSnow) {
      // Base: 4–8s, drift ±15px, 40 particles
      // Tier 1: ~1.4× faster (2.8–5.7s), slight drift, 50 particles
      // Tier 2: ~3.0× faster (1.34–2.68s), heavy drift, 65 particles
      const wobbleRange = windTier === 2 ? 120 : windTier === 1 ? 80 : 50;
      const count = windTier === 2 ? 65 : windTier === 1 ? 50 : 40;
      return Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 110 - 5,
        delay: Math.random() * 3,
        duration:
          windTier === 2
            ? 1.34 + Math.random() * 1.34
            : windTier === 1
              ? 1.87 + Math.random() * 1.93
              : 3.2 + Math.random() * 3.2,
        drift:
          windTier === 2
            ? (Math.random() - 0.2) * 120 + 40
            : windTier === 1
              ? (Math.random() - 0.3) * 60 + 15
              : (Math.random() - 0.5) * 30,
        wobble: (Math.random() - 0.5) * wobbleRange,
      }));
    }

    // Rain / sleet
    // Base: 0.6–1.0s, 0 drift, 50 particles
    // Tier 1: ~2.1× faster (0.29–0.48s), small drift, 60 particles
    // Tier 2: ~3.0× faster (0.20–0.34s), large drift, 75 particles
    const count = windTier === 2 ? 75 : windTier === 1 ? 60 : 50;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 110 - 5,
      delay: Math.random() * 3,
      duration:
        windTier === 2
          ? 0.2 + Math.random() * 0.14
          : windTier === 1
            ? 0.29 + Math.random() * 0.19
            : 0.6 + Math.random() * 0.4,
      drift:
        windTier === 2
          ? 50 + Math.random() * 70
          : windTier === 1
            ? 15 + Math.random() * 30
            : 0,
      wobble: 0,
    }));
  }, [showRain, showSnow, windTier]);

  const blusterClass =
    windTier === 2 ? ' blustery-high' : windTier === 1 ? ' blustery-low' : '';

  return (
    <>
      <div
        className="weather-bg"
        style={
          {
            '--bg-c1': c1,
            '--bg-c2': c2,
            '--bg-c3': c3,
          } as React.CSSProperties
        }
      />
      {particles && (
        <div
          className={`weather-particles ${showSnow ? 'snow' : 'rain'}${blusterClass}`}
        >
          {particles.map((p) => (
            <span
              key={p.id}
              className="particle"
              style={{
                left: `${p.left}%`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                ['--drift' as string]: `${p.drift}px`,
                ['--wobble' as string]: `${p.wobble}px`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
