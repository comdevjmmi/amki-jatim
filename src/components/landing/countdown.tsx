"use client";

import { useEffect, useState } from "react";

const UNITS = [
  { label: "Hari", key: "days" as const },
  { label: "Jam", key: "hours" as const },
  { label: "Menit", key: "minutes" as const },
  { label: "Detik", key: "seconds" as const },
];

function getRemaining(targetIso: string) {
  const diffMs = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function Countdown({ targetIso }: { targetIso: string }) {
  const [remaining, setRemaining] = useState<ReturnType<typeof getRemaining> | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(targetIso));
    // Deferred via setTimeout(0) rather than called inline, so the first
    // snapshot is delivered through the same async callback path as every
    // subsequent tick (avoids a synchronous setState in the effect body).
    const immediate = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(immediate);
      clearInterval(interval);
    };
  }, [targetIso]);

  return (
    <div className="mb-space-xl grid w-full max-w-xl grid-cols-4 gap-space-sm sm:gap-space-md">
      {UNITS.map((unit) => (
        <div
          key={unit.key}
          className="flex flex-col items-center justify-center rounded-xl bg-stitch-surface-container-lowest p-space-sm shadow-xl sm:p-space-md"
        >
          <p className="text-headline-lg font-extrabold tracking-tight text-stitch-on-surface tabular-nums">
            {remaining ? String(remaining[unit.key]).padStart(2, "0") : "--"}
          </p>
          <p className="mt-0.5 text-label-sm font-bold uppercase tracking-wider text-stitch-primary">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  );
}
