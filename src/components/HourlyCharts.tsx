import { memo, useMemo } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import type { HourlyDataPoint, TimeFormat, StatKey } from '../types/weather';
import { formatHour, isMidnight, formatShortDate } from '../utils/time';

interface HourlyChartsProps {
  data: HourlyDataPoint[];
  timeFormat: TimeFormat;
  timezone: string;
  selectedStat: StatKey;
}

function HourlyChartsInner({
  data,
  timeFormat,
  timezone,
  selectedStat,
}: HourlyChartsProps) {
  const tempData = useMemo(
    () =>
      data
        .filter((_, i) => i > 0 && i % 2 === 0)
        .map((d) => ({ value: d.temperature })),
    [data],
  );

  const statData = useMemo(
    () => data.map((d) => ({ value: d[selectedStat] })),
    [data, selectedStat],
  );

  const statDomain = useMemo(() => {
    const values = data.map((d) => d[selectedStat]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max <= 1 && min >= 0) return [0, 1] as const;
    const pad = (max - min) * 0.1 || 1;
    return [min, max + pad] as const;
  }, [data, selectedStat]);

  const tempRange = useMemo(() => {
    const temps = data.map((d) => d.temperature);
    return {
      min: Math.min(...temps) + 0.5,
      max: Math.max(...temps) + 2,
    };
  }, [data]);

  const labels = useMemo(
    () =>
      data.map((d) => ({
        hour: formatHour(d.time, timeFormat, timezone),
        isMidnight: isMidnight(d.time, timezone),
        day: isMidnight(d.time, timezone)
          ? formatShortDate(d.time, timezone)
          : '',
      })),
    [data, timeFormat, timezone],
  );

  return (
    <div className="hourly-charts-content">
      <div className="charts-stack">
        <div className="chart-layer temperature-layer">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={tempData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <YAxis domain={[tempRange.min, tempRange.max]} hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke="rgba(255, 255, 255, 0.85)"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-layer stat-layer">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={statData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <YAxis domain={[statDomain[0], statDomain[1]]} hide />
              <Area
                type="monotone"
                dataKey="value"
                baseValue={statDomain[0]}
                stroke="rgba(80, 140, 255, 0.5)"
                fill="rgba(60, 120, 220, 0.5)"
                fillOpacity={1}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="hourly-labels labels">
        {labels.map((label, i) => (
          <span
            key={i}
            className={`label ${label.isMidnight ? 'midnight' : ''}`}
          >
            <span className="text">
              <span>{label.hour}</span>
            </span>
            {label.isMidnight && <span className="day">{label.day}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

const HourlyCharts = memo(HourlyChartsInner);
export default HourlyCharts;
