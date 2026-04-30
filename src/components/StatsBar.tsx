"use client";

import { useState, useEffect } from "react";
import { formatVolume } from "@/services/polymarket";

interface StatsBarProps {
  totalMarkets: number;
  totalVolume: number;
}

export default function StatsBar({ totalMarkets, totalVolume }: StatsBarProps) {
  const [stats, setStats] = useState({ totalUsers: 0, tradesToday: 0, totalTrades: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Error fetching stats:", e);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#141419] rounded-2xl p-6 mb-8 border border-[#252530]">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center md:text-left">
          <p className="text-gray-500 text-sm mb-1">Mercados ao Vivo</p>
          <p className="text-2xl font-bold text-white">{totalMarkets}</p>
        </div>
        <div className="text-center md:text-left">
          <p className="text-gray-500 text-sm mb-1">Volume Total</p>
          <p className="text-2xl font-bold gradient-text">
            {formatVolume(totalVolume)}
          </p>
        </div>
        <div className="text-center md:text-left">
          <p className="text-gray-500 text-sm mb-1">Espectadores</p>
          <p className="text-2xl font-bold text-white">
            {stats.totalUsers.toLocaleString()}
          </p>
        </div>
        <div className="text-center md:text-left">
          <p className="text-gray-500 text-sm mb-1">Apostas Hoje</p>
          <p className="text-2xl font-bold text-white">
            {stats.tradesToday.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
