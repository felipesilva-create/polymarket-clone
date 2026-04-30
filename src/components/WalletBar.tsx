"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useWallet } from "@/contexts/WalletContext";

interface RankInfo {
  rank: number | null;
  totalUsers: number;
  inPrizeZone: boolean;
}

export default function WalletBar() {
  const { wallet, resetWallet } = useWallet();
  const { data: session } = useSession();
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);

  const totalPositionsValue = wallet.positions.reduce(
    (acc, pos) => acc + pos.shares * pos.currentPrice,
    0
  );

  const totalValue = wallet.balance + totalPositionsValue;
  const pnlPercent = ((totalValue - wallet.initialBalance) / wallet.initialBalance) * 100;
  const isProfit = totalValue >= wallet.initialBalance;

  // Buscar rank do usuario logado a cada 15s
  useEffect(() => {
    if (!session?.user) {
      setRankInfo(null);
      return;
    }

    let cancelled = false;

    const fetchRank = async () => {
      try {
        const res = await fetch("/api/ranking/me");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.rank) {
          setRankInfo({
            rank: data.rank,
            totalUsers: data.totalUsers,
            inPrizeZone: data.inPrizeZone,
          });
        }
      } catch (e) {
        // silent fail
      }
    };

    fetchRank();
    const interval = setInterval(fetchRank, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // re-fetch tambem quando o saldo muda (apos resolucao)
  }, [session?.user, wallet.balance, wallet.totalPnL]);

  return (
    <div className="bg-[#0d0d12] border-b border-[#252530]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            {/* Saldo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Saldo</p>
                <p className="text-lg font-bold text-white">
                  ${wallet.balance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Valor em Posicoes */}
            <div className="hidden sm:block border-l border-[#252530] pl-6 shrink-0">
              <p className="text-xs text-gray-500">Posicoes</p>
              <p className="text-lg font-bold text-white">
                ${totalPositionsValue.toFixed(2)}
              </p>
            </div>

            {/* Valor Total */}
            <div className="hidden md:block border-l border-[#252530] pl-6 shrink-0">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-white">
                ${totalValue.toFixed(2)}
              </p>
            </div>

            {/* PnL */}
            <div className="border-l border-[#252530] pl-6 shrink-0">
              <p className="text-xs text-gray-500">P&L</p>
              <p
                className={`text-lg font-bold ${
                  isProfit ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isProfit ? "+" : ""}
                {pnlPercent.toFixed(2)}%
              </p>
            </div>

            {/* Rank do usuario */}
            {rankInfo?.rank && (
              <Link
                href="/ranking"
                className={`border-l border-[#252530] pl-6 shrink-0 group transition-all ${
                  rankInfo.inPrizeZone ? "" : ""
                }`}
              >
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  Sua posicao
                  {rankInfo.inPrizeZone && (
                    <span className="text-amber-400">🏆</span>
                  )}
                </p>
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-lg font-bold ${
                      rankInfo.inPrizeZone
                        ? "text-amber-400 group-hover:text-amber-300"
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    #{rankInfo.rank}
                  </p>
                  <p className="text-xs text-gray-500">
                    de {rankInfo.totalUsers}
                  </p>
                </div>
                {rankInfo.inPrizeZone && (
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Zona de premio
                  </p>
                )}
                {!rankInfo.inPrizeZone && rankInfo.rank <= 20 && (
                  <p className="text-[10px] text-gray-500">
                    Faltam {rankInfo.rank - 10} pra zona
                  </p>
                )}
              </Link>
            )}
          </div>

          {/* Acoes */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-600 hidden lg:block">
              {wallet.positions.length} posicoes
            </span>
            <button
              onClick={resetWallet}
              className="text-xs text-gray-500 hover:text-amber-400 px-3 py-1.5 rounded-lg border border-[#252530] hover:border-amber-500/30 transition-all"
            >
              Resetar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
