"use client";

import { useState, useEffect } from "react";
import { getMarketDuration } from "@/lib/clientResolver";

interface PositionTimerProps {
  marketId: string;
  createdAt?: string;
}

export default function PositionTimer({ marketId, createdAt }: PositionTimerProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!createdAt) {
    return <span className="text-gray-500 text-xs">-</span>;
  }

  const duration = getMarketDuration(marketId);
  const expiresAt = new Date(createdAt).getTime() + duration;
  const remaining = expiresAt - Date.now();

  if (remaining <= 0) {
    return (
      <span className="px-2 py-1 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold animate-pulse">
        Resolvendo...
      </span>
    );
  }

  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSecs = seconds % 60;

  const isUrgent = remaining < 30000;

  let displayText: string;
  if (minutes > 0) {
    displayText = `${minutes}m ${remainingSecs}s`;
  } else {
    displayText = `${remainingSecs}s`;
  }

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-mono font-bold ${
        isUrgent
          ? "bg-rose-500/20 text-rose-400"
          : "bg-blue-500/20 text-blue-400"
      }`}
    >
      ⏱ {displayText}
    </span>
  );
}
