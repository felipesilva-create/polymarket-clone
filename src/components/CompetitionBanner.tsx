"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CompetitionBannerProps {
  variant?: "full" | "compact";
}

function getEndOfMonth(): Date {
  const now = new Date();
  // Ultimo dia do mes corrente as 23:59:59
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

export default function CompetitionBanner({ variant = "full" }: CompetitionBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const end = getEndOfMonth().getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);

      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (variant === "compact") {
    return (
      <Link
        href="/ranking"
        className="block bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-xl px-4 py-3 hover:border-amber-500/50 transition-all"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-amber-300 font-bold text-sm">
                Top 10 ganham premio real este mes!
              </p>
              <p className="text-gray-400 text-xs">
                Faltam {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </p>
            </div>
          </div>
          <span className="text-amber-400 text-xs font-medium hidden sm:block">
            Ver ranking →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-2xl p-6 md:p-8 mb-8">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-3 py-1 mb-3">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                Competicao Ativa
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              🏆 Top 10 do Mes Ganham Premio Real
            </h2>
            <p className="text-gray-300 text-sm md:text-base mb-4">
              Os 10 melhores em saldo + assertividade no fim do mes <span className="text-amber-400 font-bold">sacam dinheiro de verdade</span>.
              Acumule saldo, acerte mais e suba no ranking.
            </p>
            <Link
              href="/ranking"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-amber-500/20"
            >
              Ver Ranking
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Countdown */}
          <div className="shrink-0">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 text-center md:text-right">
              Termina em
            </p>
            <div className="grid grid-cols-4 gap-2">
              <CountdownBox value={timeLeft.days} label="Dias" />
              <CountdownBox value={timeLeft.hours} label="Horas" />
              <CountdownBox value={timeLeft.minutes} label="Min" />
              <CountdownBox value={timeLeft.seconds} label="Seg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-lg p-3 min-w-[60px] text-center">
      <div className="text-2xl md:text-3xl font-bold text-white tabular-nums">
        {value.toString().padStart(2, "0")}
      </div>
      <div className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mt-1">
        {label}
      </div>
    </div>
  );
}
