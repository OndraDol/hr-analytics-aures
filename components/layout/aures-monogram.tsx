export function AuresMonogram({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" role="img" aria-label="AURES">
      <rect width="32" height="32" rx="7" fill="var(--aures-orange-500)" />
      <path
        d="M8.3 24 14.4 8h3.3L24 24h-3.4l-1.2-3.4h-6.7L11.5 24H8.3Zm5.3-6h4.9L16 11.1 13.6 18Z"
        fill="white"
      />
    </svg>
  );
}
