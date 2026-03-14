'use client';

import { useEffect, useState } from 'react';

export interface HealthLoaderProps {
  message?: string;
  icon?: string;
  submessage?: string;
}

const ROTATING_MESSAGES = [
  'Syncing your health data…',
  'Loading your records…',
  'Preparing your dashboard…',
  'Fetching latest metrics…',
  'Almost ready…',
];

// ECG waveform path — one QRS cycle repeated 3× so the scroll loop is seamless
const ECG_D =
  'M0,32 L18,32 L26,26 L34,32 L38,32 L41,38 L45,4 L49,52 L53,32 L58,20 L66,32 L100,32 ' +
  'M100,32 L118,32 L126,26 L134,32 L138,32 L141,38 L145,4 L149,52 L153,32 L158,20 L166,32 L200,32 ' +
  'M200,32 L218,32 L226,26 L234,32 L238,32 L241,38 L245,4 L249,52 L253,32 L258,20 L266,32 L300,32';

export function HealthLoader({ message, icon, submessage }: HealthLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (message) return; // static message provided — no rotation needed
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % ROTATING_MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, [message]);

  const displayMessage = message ?? ROTATING_MESSAGES[msgIndex];

  return (
    <div className="flex min-h-[62vh] select-none flex-col items-center justify-center gap-10 px-4">
      {/* Pulsing heart with ripple rings */}
      <div className="relative flex items-center justify-center">
        {/* outer ripple */}
        <span className="absolute inline-flex h-20 w-20 animate-ping-slow rounded-full bg-red-400/20" />
        {/* inner ripple */}
        <span
          className="absolute inline-flex h-14 w-14 animate-ping-slow rounded-full bg-red-400/25"
          style={{ animationDelay: '0.6s' }}
        />
        {/* heart */}
        <span className="relative animate-heartbeat text-5xl" role="img" aria-label="heartbeat">
          {icon ?? '❤️'}
        </span>
      </div>

      {/* ECG line strip */}
      <div className="w-full max-w-xs overflow-hidden rounded-full">
        <div className="animate-ecg-scroll" style={{ width: '600px', display: 'flex' }}>
          {/* We render the path twice side-by-side for seamless looping */}
          <svg viewBox="0 0 300 56" width="300" height="56" fill="none" aria-hidden="true">
            <path
              d={ECG_D}
              stroke="hsl(var(--primary))"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* duplicate for loop */}
          <svg viewBox="0 0 300 56" width="300" height="56" fill="none" aria-hidden="true">
            <path
              d={ECG_D}
              stroke="hsl(var(--primary))"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p
          key={displayMessage}
          className="animate-fade-cycle text-base font-medium text-foreground"
        >
          {displayMessage}
        </p>
        {submessage && <p className="text-sm text-muted-foreground">{submessage}</p>}

        {/* Bouncing dots */}
        <div className="mt-1 flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-dot-bounce rounded-full bg-primary"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
      </div>

      {/* Health tip at the bottom */}
      <HealthTip />
    </div>
  );
}

const HEALTH_TIPS = [
  '💡 Tip: Logging vitals daily improves your care plan accuracy.',
  '💡 Tip: 150 minutes of moderate exercise per week benefits heart health.',
  '💡 Tip: Consistent medication timing improves treatment outcomes.',
  '💡 Tip: Tracking meals helps manage blood glucose levels.',
  '💡 Tip: Quality sleep supports immune function and weight management.',
  '💡 Tip: Staying hydrated supports kidney function and energy levels.',
  '💡 Tip: Stress management is as important as diet and exercise.',
];

function HealthTip() {
  const [tip] = useState(() => HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)]);
  return (
    <p className="max-w-sm rounded-xl border border-border bg-card px-5 py-3 text-center text-xs text-muted-foreground shadow-card">
      {tip}
    </p>
  );
}
