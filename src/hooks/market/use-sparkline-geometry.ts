import { useMemo } from 'react';
import { getPrecisionForPrice } from '@/lib/binance-websocket';

export interface SparklineGeometryOptions {
  width?: number;
  height?: number;
  paddingY?: number;
  paddingXLeft?: number;
  paddingXRight?: number;
}

export interface SparklineGeometry {
  minPrice: number;
  maxPrice: number;
  isUp: boolean;
  pathD: string;
  areaD: string;
  lastPercentX: number;
  lastPercentY: number;
  precision: number;
  strokeColor: string;
}

/**
 * Builds a smoothed cubic Bézier SVG path from discrete coordinates using Catmull-Rom spline control points.
 */
export function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
  }

  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    // Catmull-Rom to Cubic Bézier control points
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return d;
}

/**
 * Computes smoothed SVG path geometry, bounding ranges, coordinate projections, and theme stroke colors for sparklines.
 */
export function useSparklineGeometry(
  points: number[],
  options: SparklineGeometryOptions = {}
): SparklineGeometry {
  const {
    width = 260,
    height = 52,
    paddingY = 8,
    paddingXLeft = 4,
    paddingXRight = 10,
  } = options;

  return useMemo(() => {
    if (points.length < 2) {
      return {
        minPrice: 0,
        maxPrice: 0,
        isUp: true,
        pathD: '',
        areaD: '',
        lastPercentX: 96,
        lastPercentY: 50,
        precision: 2,
        strokeColor: 'var(--color-theme-status-success)',
      };
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min;
    const prec = getPrecisionForPrice(max);

    const first = points[0] ?? 0;
    const last = points[points.length - 1] ?? 0;
    const up = last >= first;

    const usableHeight = height - paddingY * 2;
    const usableWidth = width - paddingXLeft - paddingXRight;
    const stepX = usableWidth / (points.length - 1);

    const coords = points.map((p, i) => {
      const x = Number((paddingXLeft + i * stepX).toFixed(1));
      // Guard flatline (range === 0) by centering vertically
      const normalizedY = range === 0 ? 0.5 : 1 - (p - min) / range;
      const y = Number((paddingY + normalizedY * usableHeight).toFixed(1));
      return { x, y };
    });

    const smoothedLine = buildSmoothPath(coords);
    const lastCoord = coords[coords.length - 1];
    const firstCoord = coords[0];

    const area = `${smoothedLine} L ${lastCoord.x},${height} L ${firstCoord.x},${height} Z`;

    const strokeColor = up
      ? 'var(--color-theme-status-success)'
      : 'var(--color-theme-status-danger)';

    return {
      minPrice: min,
      maxPrice: max,
      isUp: up,
      pathD: smoothedLine,
      areaD: area,
      // Percentage coordinates for non-distorted HTML dot positioning
      lastPercentX: (lastCoord.x / width) * 100,
      lastPercentY: (lastCoord.y / height) * 100,
      precision: prec,
      strokeColor,
    };
  }, [points, width, height, paddingY, paddingXLeft, paddingXRight]);
}
