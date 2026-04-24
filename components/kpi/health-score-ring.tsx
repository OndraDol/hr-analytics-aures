'use client';

interface Props {
  score: number; // 0–100
  size?: number;
}

export function HealthScoreRing({ score, size = 120 }: Props) {
  const r = (size / 2) * 0.8;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';
  const label = score >= 75 ? 'Dobrý stav' : score >= 50 ? 'Vyžaduje pozornost' : 'Kritické';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#e2e8f0" strokeWidth={10}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium" style={{ color }}>{label}</span>
    </div>
  );
}
