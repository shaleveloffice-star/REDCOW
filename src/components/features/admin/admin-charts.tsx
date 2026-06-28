type ChartSegment = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  segments: ChartSegment[];
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerValue?: string | number;
};

type BarChartItem = {
  label: string;
  value: number;
  sublabel?: string;
};

const CHART_PALETTE = [
  "#ffe1ba",
  "#e5c89a",
  "#c9a87a",
  "#f5edd8",
  "#d4a574",
  "#b8895a"
] as const;

export function getChartColor(index: number) {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

export function DonutChart({
  segments,
  size = 168,
  stroke = 22,
  centerLabel,
  centerValue
}: DonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;

  return (
    <div className="admin-chart-donut-wrap">
      <svg
        className="admin-chart-donut"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={centerLabel ?? "תרשים עוגה"}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255, 225, 186, 0.2)"
          strokeWidth={stroke}
        />
        {total > 0
          ? segments.map((segment, index) => {
              const fraction = segment.value / total;
              const dash = fraction * circumference;
              const gap = circumference - dash;
              const rotation = -90 + offset * 360;
              offset += fraction;

              return (
                <circle
                  key={`${segment.label}-${index}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                  transform={`rotate(${rotation} ${center} ${center})`}
                  className="admin-chart-donut-segment"
                  style={{ animationDelay: `${index * 80}ms` }}
                />
              );
            })
          : null}
      </svg>
      {(centerLabel || centerValue !== undefined) && (
        <div className="admin-chart-donut-center">
          {centerValue !== undefined ? (
            <strong className="admin-chart-donut-value">{centerValue}</strong>
          ) : null}
          {centerLabel ? <span className="admin-chart-donut-label">{centerLabel}</span> : null}
        </div>
      )}
    </div>
  );
}

export function BarChart({ items, maxValue }: { items: BarChartItem[]; maxValue?: number }) {
  const peak = maxValue ?? Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="admin-chart-bars" role="img" aria-label="תרשים עמודות">
      {items.map((item, index) => {
        const heightPct = peak > 0 ? (item.value / peak) * 100 : 0;

        return (
          <div key={`${item.label}-${index}`} className="admin-chart-bar-col">
            <div className="admin-chart-bar-track">
              <div
                className="admin-chart-bar-fill"
                style={
                  {
                    "--bar-h": `${heightPct}%`,
                    "--bar-delay": `${index * 60}ms`
                  } as React.CSSProperties
                }
              />
            </div>
            <span className="admin-chart-bar-value">{item.value}</span>
            <span className="admin-chart-bar-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function HorizontalBars({
  items
}: {
  items: Array<{ label: string; value: number; max: number; href?: string }>;
}) {
  return (
    <ul className="admin-chart-hbars">
      {items.map((item, index) => {
        const widthPct = item.max > 0 ? (item.value / item.max) * 100 : 0;

        return (
          <li key={`${item.label}-${index}`} className="admin-chart-hbar-row">
            <div className="admin-chart-hbar-head">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
            <div className="admin-chart-hbar-track">
              <div
                className="admin-chart-hbar-fill"
                style={
                  {
                    "--bar-w": `${widthPct}%`,
                    "--bar-delay": `${index * 70}ms`
                  } as React.CSSProperties
                }
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return null;
  }

  const width = 280;
  const height = 72;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 8) + 4;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      className="admin-chart-sparkline"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="adminSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255, 225, 186, 0.55)" />
          <stop offset="100%" stopColor="rgba(255, 225, 186, 0.02)" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#adminSparkFill)" />
      <polyline points={points} fill="none" stroke="#ffe1ba" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChartLegend({ segments }: { segments: ChartSegment[] }) {
  return (
    <ul className="admin-chart-legend">
      {segments.map((segment, index) => (
        <li key={`${segment.label}-${index}`}>
          <span className="admin-chart-legend-dot" style={{ background: segment.color }} />
          <span className="admin-chart-legend-label">{segment.label}</span>
          <strong className="admin-chart-legend-value">{segment.value}</strong>
        </li>
      ))}
    </ul>
  );
}
