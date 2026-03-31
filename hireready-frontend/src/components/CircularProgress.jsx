import { useState, useEffect } from 'react';

export default function CircularProgress({
  score,
  size = 180,
  strokeWidth = 12,
  animated = true,
}) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }
    let startTime = null;
    const duration = 1500;
    const startVal = 0;
    const endVal = score;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startVal + (endVal - startVal) * eased));
      if (progress < 1) requestAnimationFrame(step);
    }

    const rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [score, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  let color;
  let label;
  if (score < 40) {
    color = '#ef4444';
    label = 'Poor';
  } else if (score < 60) {
    color = '#f59e0b';
    label = 'Needs Work';
  } else if (score < 80) {
    color = '#22d3ee';
    label = 'Good';
  } else {
    color = '#4ade80';
    label = 'Excellent';
  }

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease-out', filter: `drop-shadow(0 0 6px ${color})` }}
        />
        {/* Center text — counter-rotate so text is upright */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px`, fill: color, fontSize: size * 0.18, fontWeight: 700 }}
        >
          {displayScore}
        </text>
      </svg>
      <span style={{ color, fontWeight: 600, fontSize: '0.95rem', letterSpacing: '0.04em' }}>
        {label}
      </span>
    </div>
  );
}
