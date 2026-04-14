import { memo, useMemo } from 'react';
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts';
import type { MinutelyDataPoint } from '../types/weather';

interface MinutelyChartProps {
  data: MinutelyDataPoint[];
  visible: boolean;
}

function MinutelyChartInner({ data, visible }: MinutelyChartProps) {
  const hasSignificantPrecip = useMemo(
    () => data.some((d) => d.precipProbability > 0.1),
    [data],
  );

  const chartData = useMemo(
    () => data.map((d) => ({ value: d.precipProbability })),
    [data],
  );

  if (!hasSignificantPrecip) return null;

  return (
    <div className={`next-hour-chart${visible ? ' visible' : ''}`}>
      <span className="next-hour-label">Next Hour</span>
      <div className="next-hour-graph">
        <ResponsiveContainer width="100%" height={50}>
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <YAxis domain={[0, 1]} hide />
            <Area
              type="monotone"
              dataKey="value"
              stroke="rgba(50, 119, 189, 0.95)"
              fill="rgba(50, 119, 189, 0.7)"
              fillOpacity={1}
              strokeWidth={1}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const MinutelyChart = memo(MinutelyChartInner);
export default MinutelyChart;
