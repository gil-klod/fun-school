"use client";

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + Math.cos(rad) * radius,
    y: cy + Math.sin(rad) * radius,
  };
}

export function AnalogClockFace({
  hour,
  minute,
  size = 220,
}: {
  hour: number;
  minute: number;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const faceR = size * 0.42;
  const hourAngle = ((hour % 12) + minute / 60) * 30 - 90;
  const minuteAngle = minute * 6 - 90;
  const hourHand = polar(cx, cy, faceR * 0.55, hourAngle);
  const minuteHand = polar(cx, cy, faceR * 0.78, minuteAngle);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto drop-shadow-md"
      aria-hidden
    >
      <circle cx={cx} cy={cy} r={faceR + 10} fill="#fffbeb" stroke="#f59e0b" strokeWidth="5" />
      {Array.from({ length: 12 }, (_, i) => {
        const n = i === 0 ? 12 : i;
        const outer = polar(cx, cy, faceR, i * 30 - 90);
        const inner = polar(cx, cy, faceR - 14, i * 30 - 90);
        const label = polar(cx, cy, faceR - 28, i * 30 - 90);
        return (
          <g key={i}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#92400e" strokeWidth="3" />
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-amber-900 text-sm font-bold"
              fontSize={size * 0.09}
            >
              {n}
            </text>
          </g>
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={hourHand.x}
        y2={hourHand.y}
        stroke="#1f2937"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={cy}
        x2={minuteHand.x}
        y2={minuteHand.y}
        stroke="#dc2626"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="7" fill="#374151" />
    </svg>
  );
}
