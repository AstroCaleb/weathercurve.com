import { useRef, useCallback, useEffect } from 'react';
import HourlyCharts from './HourlyCharts';
import type { WeatherData, TimeFormat, StatKey } from '../types/weather';

interface HourlyScrollerProps {
  weather: WeatherData;
  timeFormat: TimeFormat;
  selectedStat: StatKey;
  onScrollUpdate: (index: number, percent: number) => void;
}

const CHART_WIDTH = 1600;

export default function HourlyScroller({
  weather,
  timeFormat,
  selectedStat,
  onScrollUpdate,
}: HourlyScrollerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const scrollPercentRef = useRef(0);

  const calculateScrollPosition = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const scrollLeft = wrapper.scrollLeft;
    const wrapperWidth = wrapper.clientWidth;
    const percent = (scrollLeft / (CHART_WIDTH - wrapperWidth * 0.5)) * 100;
    const increment = 100 / weather.hourly.data.length;
    let index = Math.floor(percent / increment);

    if (index < 0) index = 0;
    if (index >= weather.hourly.data.length) {
      index = weather.hourly.data.length - 1;
    }

    scrollPercentRef.current = percent;
    onScrollUpdate(index, percent);
  }, [weather.hourly.data.length, onScrollUpdate]);

  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(calculateScrollPosition);
  }, [calculateScrollPosition]);

  useEffect(() => {
    calculateScrollPosition();
  }, [calculateScrollPosition]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleScrollToNow = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    wrapper.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  const showNowPill = scrollPercentRef.current > 0.5;

  return (
    <div className="hourly-weather-wrapper">
      <div id="hour-indicator-line" />
      <div
        className="hourly-chart-wrapper"
        ref={wrapperRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="region"
        aria-label="Hourly forecast chart"
      >
        <HourlyCharts
          data={weather.hourly.data}
          timeFormat={timeFormat}
          timezone={weather.timezone}
          selectedStat={selectedStat}
        />
      </div>
      <button
        className={`now-pill${showNowPill ? ' visible' : ''}`}
        onClick={handleScrollToNow}
      >
        Now
      </button>
    </div>
  );
}
