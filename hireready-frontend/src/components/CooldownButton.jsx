import { useState, useRef, useEffect } from 'react';

export default function CooldownButton({
  onClick,
  children,
  disabled = false,
  cooldownMs = 5000,
  className = '',
  style = {},
}) {
  const [phase, setPhase] = useState('idle'); // idle | loading | cooldown
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef(null);

  // Clear interval on unmount to prevent memory leaks
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleClick = async () => {
    if (phase !== 'idle' || disabled) return;
    setPhase('loading');
    try {
      await onClick();
    } catch {
      // errors handled by caller
    } finally {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const seconds = Math.ceil(cooldownMs / 1000);
      setCountdown(seconds);
      setPhase('cooldown');
      let remaining = seconds;
      intervalRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setPhase('idle');
        }
      }, 1000);
    }
  };

  const isDisabled = disabled || phase !== 'idle';

  const label = phase === 'loading'
    ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        Analyzing...
      </span>
    )
    : phase === 'cooldown'
    ? `Wait ${countdown}s`
    : children;

  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <button
        className={`btn-primary ${className}`}
        style={{ opacity: isDisabled ? 0.6 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', ...style }}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {label}
      </button>
    </>
  );
}
