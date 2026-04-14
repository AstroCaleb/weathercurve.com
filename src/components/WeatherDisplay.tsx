import {
  type ReactNode,
  useState,
  useRef,
  useEffect,
  type CSSProperties,
} from 'react';
import { ArrowUp, ArrowDown, ChevronDown, Check } from 'lucide-react';
import {
  computePosition,
  flip,
  offset,
  shift,
  size,
  autoUpdate,
} from '@floating-ui/dom';
import WeatherAlerts from './WeatherAlerts';
import WeatherIcon from './WeatherIcon';
import ToggleSwitch from './ToggleSwitch';
import MinutelyChart from './MinutelyChart';
import { formatTemperature } from '../utils/temperature';
import { formatTime, formatDate } from '../utils/time';
import type {
  WeatherData,
  HourlyDataPoint,
  DailyDataPoint,
  TempFormat,
  TimeFormat,
  StatKey,
} from '../types/weather';

interface WeatherDisplayProps {
  weather: WeatherData;
  scrollIndex: number;
  scrollPercent: number;
  tempFormat: TempFormat;
  timeFormat: TimeFormat;
  onTempFormatChange: (format: TempFormat) => void;
  selectedStat: StatKey;
  onSelectedStatChange: (stat: StatKey) => void;
  children?: ReactNode;
}

const STAT_CARDS: {
  key: StatKey;
  label: string;
  format: (v: number, tf: TempFormat) => string;
}[] = [
  {
    key: 'precipProbability',
    label: 'Precip',
    format: (v) => `${Math.round(v * 100)}%`,
  },
  {
    key: 'apparentTemperature',
    label: 'Feels Like',
    format: (v, tf) => `${formatTemperature(v, tf)}\u00B0`,
  },
  {
    key: 'humidity',
    label: 'Humidity',
    format: (v) => `${Math.round(v * 100)}%`,
  },
  { key: 'windSpeed', label: 'Wind', format: (v) => `${Math.round(v)} mph` },
  {
    key: 'windGust',
    label: 'Wind Gust',
    format: (v) => (v > 0 ? `${Math.round(v)} mph` : '--'),
  },
  {
    key: 'dewPoint',
    label: 'Dew Point',
    format: (v, tf) => `${formatTemperature(v, tf)}\u00B0`,
  },
  {
    key: 'cloudCover',
    label: 'Clouds',
    format: (v) => `${Math.round(v * 100)}%`,
  },
  {
    key: 'visibility',
    label: 'Visibility',
    format: (v) => `${Math.round(v)} mi`,
  },
  { key: 'uvIndex', label: 'UV Index', format: (v) => `${v}` },
];

export default function WeatherDisplay({
  weather,
  scrollIndex,
  scrollPercent,
  tempFormat,
  timeFormat,
  onTempFormatChange,
  selectedStat,
  onSelectedStatChange,
  children,
}: WeatherDisplayProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({
    position: 'fixed',
  });
  const referenceRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen || !referenceRef.current || !floatingRef.current) return;
    const reference = referenceRef.current;
    const floating = floatingRef.current;
    const update = () => {
      computePosition(reference, floating, {
        strategy: 'fixed',
        middleware: [
          offset(6),
          flip({ padding: 16 }),
          shift({ padding: 16 }),
          size({
            apply({ rects, elements }) {
              Object.assign(elements.floating.style, {
                width: `${rects.reference.width}px`,
              });
            },
          }),
        ],
      }).then(({ x, y }) => {
        setMenuStyle({ position: 'fixed', top: y, left: x });
      });
    };
    const cleanup = autoUpdate(reference, floating, update);
    return cleanup;
  }, [menuOpen]);
  const isNow = scrollPercent < 0.3;
  const hourly = weather.hourly.data[scrollIndex];
  const dayWeather = findDayWeather(weather, scrollIndex);

  const current = isNow ? weather.currently : hourly;
  const summary = isNow
    ? (weather.minutely?.summary ?? '')
    : (dayWeather?.summary ?? '');
  const summaryTimeframe = isNow ? 'Next Hour' : 'Day';
  const hourLabel = isNow
    ? `NOW (${formatTime(weather.currently.time, timeFormat, weather.timezone)})`
    : formatTime(hourly.time, timeFormat, weather.timezone);
  const dateLabel = formatDate(
    (isNow ? weather.currently : hourly).time,
    weather.timezone,
  );

  const temp = formatTemperature(current.temperature, tempFormat);
  const icon = isNow ? weather.currently.icon : hourly.icon;
  const forecastSummary = isNow ? weather.currently.summary : hourly.summary;

  const activeStat = STAT_CARDS.find((c) => c.key === selectedStat)!;
  const otherStats = STAT_CARDS.filter((c) => c.key !== selectedStat);

  const highTemp = dayWeather
    ? formatTemperature(dayWeather.temperatureHigh, tempFormat)
    : '--';
  const lowTemp = dayWeather
    ? formatTemperature(dayWeather.temperatureLow, tempFormat)
    : '--';

  return (
    <>
      {weather.alerts && weather.alerts.length > 0 && (
        <WeatherAlerts alerts={weather.alerts} />
      )}
      <section className="hero">
        <p className="hero-date">{dateLabel}</p>
        <div className="hero-main">
          <WeatherIcon icon={icon} size={56} />
          <div className="hero-temp">
            {temp}
            <span className="degree">&deg;</span>
          </div>
        </div>
        <p className="hero-summary">{forecastSummary}</p>
        {weather.minutely && (
          <MinutelyChart data={weather.minutely.data} visible={isNow} />
        )}
        <div className="hero-meta">
          <span
            className="hero-time"
            dangerouslySetInnerHTML={{ __html: hourLabel }}
          />
          <span className="meta-sep">&middot;</span>
          <span className="high-low">
            <ArrowUp size={11} className="arrow-up" />
            {highTemp}&deg;
          </span>
          <span className="high-low">
            <ArrowDown size={11} className="arrow-down" />
            {lowTemp}&deg;
          </span>
          <span className="meta-sep">&middot;</span>
          <div className="temp-format">
            <ToggleSwitch
              checked={tempFormat === 'c'}
              onChange={(checked) => onTempFormatChange(checked ? 'c' : 'f')}
              label="Temp Format"
              labelHidden
              offLabel="F°"
              onLabel="C°"
            />
          </div>
        </div>
      </section>

      {children}

      {summary && (
        <div className="day-summary glass-card">
          <div>
            <span className="summary-label">{summaryTimeframe}</span>
            {summary}
          </div>
        </div>
      )}

      <div className="stat-selector">
        {menuOpen && (
          <div
            className="stat-menu-backdrop"
            onClick={() => setMenuOpen(false)}
          />
        )}
        <div
          ref={referenceRef}
          className="active-stat-card glass-card"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <div className="active-stat-info">
            <span className="active-stat-label">{activeStat.label}</span>
            <span className="active-stat-value">
              {activeStat.format(current[activeStat.key], tempFormat)}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={`stat-chevron${menuOpen ? ' open' : ''}`}
          />
        </div>

        {menuOpen && (
          <div
            ref={floatingRef}
            style={menuStyle}
            className="stat-menu glass-card"
          >
            {STAT_CARDS.map(({ key, label, format }) => (
              <div
                key={key}
                className={`stat-menu-item${selectedStat === key ? ' active' : ''}`}
                onClick={() => {
                  onSelectedStatChange(key);
                  setMenuOpen(false);
                }}
              >
                <span className="stat-menu-label">{label}</span>
                <span className="stat-menu-value">
                  {format(current[key], tempFormat)}
                </span>
                {selectedStat === key && (
                  <Check size={14} className="stat-menu-check" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="stats-text-grid">
        {otherStats.map(({ key, label, format }) => (
          <div
            key={key}
            className="stats-text-item"
            onClick={() => onSelectedStatChange(key)}
          >
            <span className="stats-text-label">{label}</span>
            <span className="stats-text-value">
              {format(current[key], tempFormat)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function findDayWeather(
  weather: WeatherData,
  hourIndex: number,
): DailyDataPoint | undefined {
  const hourlyPoint: HourlyDataPoint = weather.hourly.data[hourIndex];
  if (!hourlyPoint) return weather.daily.data[0];

  const hourTime = hourlyPoint.time;
  const dayStart = hourTime - (hourTime % 86400);

  return (
    weather.daily.data.find((day) => {
      const diff = Math.abs(day.time - dayStart);
      return diff < 86400;
    }) ?? weather.daily.data[0]
  );
}
