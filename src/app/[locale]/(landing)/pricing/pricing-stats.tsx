'use client';

import { NumberTicker } from '@/shared/components/magic-ui';

export function PricingStats() {
  return (
    <div className="mt-16 pt-8 border-t">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-primary">
            <NumberTicker value={10000} />+
          </div>
          <p className="text-sm text-muted-foreground mt-1">Active users</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-primary">
            <NumberTicker value={99.9} decimalPlaces={1} />%
          </div>
          <p className="text-sm text-muted-foreground mt-1">Uptime</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-primary">
            <NumberTicker value={50} />+
          </div>
          <p className="text-sm text-muted-foreground mt-1">Countries</p>
        </div>
        <div>
          <div className="text-3xl font-bold text-primary">
            <NumberTicker value={24} />/
            <NumberTicker value={7} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">Support</p>
        </div>
      </div>
    </div>
  );
}
