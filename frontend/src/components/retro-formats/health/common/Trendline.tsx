import { memo, useId } from 'react';
import './Trendline.css';

export interface Sample {
  time: number;
  avg: number;
  sd: number;
}

interface PropsT {
  samples: Sample[];
}

export const Trendline = memo<PropsT>(({ samples }) => {
  const gradID = useId();

  if (samples.length < 2) {
    return (
      <span className="trendline-na" title="No historic data">
        n/a
      </span>
    );
  }

  // svgW and svgH do not matter unless the browser does not
  // support 'vector-effect: non-scaling-stroke'
  const svgW = 80;
  const svgH = 30;
  const x0 = 0;
  const y0 = 0;
  const x1 = svgW;
  const y1 = svgH;

  const t0 = samples[0]!.time;
  const t1 = samples[samples.length - 1]!.time;
  const v0 = 1;
  const v1 = -1;
  const sx = (x1 - x0) / (t1 - t0);
  const sy = (y1 - y0) / (v1 - v0);

  const scaleSampleValue = (v: number) =>
    Math.max(y0, Math.min(y1, (v - v0) * sy + y0));

  const makeDistributionShape = (m: number) => {
    const p0: Point[] = [];
    const p1: Point[] = [];
    for (const sample of samples) {
      const x = (sample.time - t0) * sx + x0;
      p0.push({
        x,
        y: scaleSampleValue(sample.avg - sample.sd * m),
      });
      p1.push({
        x,
        y: scaleSampleValue(sample.avg + sample.sd * m),
      });
    }
    p1.reverse();
    return `M${makeCurve(p0)}L${makeCurve(p1)}Z`;
  };

  const avg: (Point & { v: boolean })[] = [];
  for (const sample of samples) {
    avg.push({
      x: (sample.time - t0) * sx + x0,
      y: scaleSampleValue(sample.avg),
      v: sample.sd < 2,
    });
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox={`0 0 ${svgW} ${svgH}`}
      preserveAspectRatio="none"
      className="trendline"
    >
      <defs>
        <linearGradient
          id={gradID}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={y0}
          x2="0"
          y2={y1}
        >
          <stop offset="0" className="good" />
          <stop offset="0.5" className="mid" />
          <stop offset="1" className="bad" />
        </linearGradient>
      </defs>
      <path className="line good" d={`M${x0} ${scaleSampleValue(1)}H${x1}`} />
      <path className="line mid" d={`M${x0} ${scaleSampleValue(0)}H${x1}`} />
      <path className="line bad" d={`M${x0} ${scaleSampleValue(-1)}H${x1}`} />
      {DISTRIBUTION_THRESHOLDS.map((m, i) => (
        <path
          key={i}
          fill={`url(#${gradID})`}
          opacity={1 / (DISTRIBUTION_THRESHOLDS.length - i)}
          d={makeDistributionShape(m)}
        />
      ))}
      <path
        className="average"
        stroke={`url(#${gradID})`}
        d={`M${makeCurve(avg)}`}
      />
      {avg.map((p, i) =>
        p.v ? (
          <path key={i} className="pointBack" d={`M${p.x} ${p.y}v0.0001`} />
        ) : null,
      )}
      {avg.map((p, i) =>
        p.v ? (
          <path
            key={i}
            className="point"
            stroke={`url(#${gradID})`}
            d={`M${p.x} ${p.y}v0.0001`}
          />
        ) : null,
      )}
    </svg>
  );
});

// erf(DISTRIBUTION_THRESHOLDS) = 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1
const DISTRIBUTION_THRESHOLDS = [
  0.733, 0.595, 0.477, 0.371, 0.272, 0.179, 0.089,
];

function makeCurve(points: Point[]) {
  let d = `${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length; ++i) {
    const prev = points[i - 1]!;
    const cur = points[i]!;
    d += `C${prev.x * 0.7 + cur.x * 0.3} ${prev.y} ${prev.x * 0.3 + cur.x * 0.7} ${cur.y} ${cur.x} ${cur.y}`;
  }
  return d;
}

interface Point {
  x: number;
  y: number;
}
