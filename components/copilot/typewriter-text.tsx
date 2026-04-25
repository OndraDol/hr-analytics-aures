'use client';

import { useEffect, useState } from 'react';

export function TypewriterText({
  text,
  render,
  speed = 8,
}: {
  text: string;
  render: (visibleText: string) => React.ReactNode;
  speed?: number;
}) {
  const [visibleLength, setVisibleLength] = useState(text.length);

  useEffect(() => {
    setVisibleLength(0);
    if (!text) return;

    const interval = window.setInterval(() => {
      setVisibleLength((current) => {
        if (current >= text.length) {
          window.clearInterval(interval);
          return current;
        }
        return Math.min(text.length, current + Math.max(1, Math.round(text.length / 90)));
      });
    }, speed);

    return () => window.clearInterval(interval);
  }, [speed, text]);

  return <>{render(text.slice(0, visibleLength))}</>;
}
