'use client';

import { Children, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function MotionStack({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn('contents', className)}>
      {Children.map(children, (child, index) => (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: index * 0.06, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
