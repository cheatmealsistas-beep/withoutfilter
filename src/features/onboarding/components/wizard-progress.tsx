'use client';

import { motion } from 'framer-motion';

interface WizardProgressProps {
  current: number;
  total: number;
}

export function WizardProgress({ current, total }: WizardProgressProps) {
  const percentage = ((current + 1) / total) * 100;

  return (
    <div className="w-full h-1 bg-muted" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </div>
  );
}
