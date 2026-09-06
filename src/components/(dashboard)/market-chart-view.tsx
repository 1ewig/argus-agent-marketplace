'use client';

import React from 'react';
import { ChartClient } from './chart';

export function MarketChartView() {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-theme-border-subtle bg-theme-bg-base shadow-xs">
      <ChartClient />
    </div>
  );
}
