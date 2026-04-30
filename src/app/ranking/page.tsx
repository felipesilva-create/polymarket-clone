"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import WalletBar from "@/components/WalletBar";
import CompetitionBanner from "@/components/CompetitionBanner";
import Link from "next/link";

interface RankedUser {
  id: string;
  name: string;
  image: string | null;
  balance: number;
  totalPnL: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  rank: number;
  totalTrades: number;
}

const PRIZE_ZONE = 10;

export default function RankingPage() {
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const res = await fetch("/api/ranking");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching ranking:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
    const interval = setInterval(fetchRanking, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    if (rank <= PRIZE_ZONE) return "🏆";
    return `#${rank}`;
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    if (rank <= PRIZE_ZONE) return "text-amber-500";
    return "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header onSearch={() => {}} />
      <WalletBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">
            Ranking de <span className="gradient-text">Traders</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Top 10 do mes ganham premio real - voce esta dentro?
          </p>
        </div>

        {/* Competition Banner with countdown */}
        <CompetitionBanner />

        {/* Como funciona */}
        <div className="bg-[#141419] rounded-2xl p-6 border border-[#252530] mb-8">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <span>📋</span> Como funciona
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                1
              </div>
              <div>
                <p className="text-white font-medium text-sm">Faca previsoes</p>
                <p className="text-gray-500 text-xs mt-1">
                  Assista as cameras ao vivo e aposte nos mercados
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                2
              </div>
              <div>
                <p className="text-white font-medium text-sm">Acumule saldo</p>
                <p className="text-gray-500 text-xs mt-1">
                  Cada acerto vira ganho. Suba no ranking
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                3
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  Top 10 saca dinheiro real
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Os 10 com maior saldo no fim do mes recebem premio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="bg-[#141419] rounded-2xl border border-[#252530] overflow-hidden">
          <div className="p-5 border-b border-[#252530] flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Classificacao</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Atualiza a cada 30s
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-400 mt-4">Carregando ranking...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-gray-400 text-lg mb-2">Nenhum trader ainda</div>
              <p className="text-gray-500">
                <Link href="/login" className="text-amber-400 hover:underline">
                  Cadastre-se
                </Link>{" "}
                e seja o primeiro a entrar na zona de premio!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a22]">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-medium">Posicao</th>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-medium">Trader</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Saldo</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Lucro/Perda</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium hidden md:table-cell">Trades</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium hidden md:table-cell">Win Rate</th>
                    <th className="text-center px-5 py-3 text-gray-400 text-sm font-medium">Premio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252530]">
                  {users.map((user, index) => {
                    const rank = index + 1;
                    const inPrizeZone = rank <= PRIZE_ZONE;
                    const isLastPrizeRow = rank === PRIZE_ZONE;
                    return (
                      <>
                        <tr
                          key={user.id}
                          className={`transition-colors ${
                            inPrizeZone
                              ? "bg-gradient-to-r from-amber-500/5 to-transparent hover:from-amber-500/10"
                              : "hover:bg-[#1a1a22]/50"
                          }`}
                        >
                          <td className="px-5 py-4">
                            <span className={`text-2xl font-bold ${getMedalColor(rank)}`}>
                              {getMedalEmoji(rank)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold relative ${
                                  inPrizeZone
                                    ? "bg-gradient-to-br from-amber-400 to-orange-600 ring-2 ring-amber-500/40"
                                    : "bg-gradient-to-br from-gray-600 to-gray-700"
                                }`}
                              >
                                {user.name?.charAt(0).toUpperCase() || "?"}
                                {inPrizeZone && (
                                  <span className="absolute -top-1 -right-1 text-xs">🏆</span>
                                )}
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.name || "Anonimo"}</p>
                                <p className="text-gray-500 text-xs">
                                  {user.totalTrades || user.totalWins + user.totalLosses} trades
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`font-bold ${inPrizeZone ? "text-amber-300" : "text-white"}`}>
                              ${user.balance.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span
                              className={`font-medium ${
                                user.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {user.totalPnL >= 0 ? "+" : ""}${user.totalPnL.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right hidden md:table-cell">
                            <span className="text-emerald-400">{user.totalWins}</span>
                            <span className="text-gray-500"> / </span>
                            <span className="text-rose-400">{user.totalLosses}</span>
                          </td>
                          <td className="px-5 py-4 text-right hidden md:table-cell">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-[#252530] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${user.winRate}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-300 text-sm">
                                {user.winRate.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            {inPrizeZone ? (
                              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-1 rounded-md text-xs font-bold">
                                💰 Saca real
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                        {isLastPrizeRow && users.length > PRIZE_ZONE && (
                          <tr key="prize-line">
                            <td colSpan={7} className="px-5 py-2">
                              <div className="flex items-center gap-3 my-2">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                                  ↑ Zona de Premio • ↓ Fora do Premio
                                </span>
                                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/50 via-transparent to-transparent"></div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FAQ pequeno */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            * O premio sera distribuido proporcionalmente entre os top 10 conforme o saldo final.
            <br />
            Em caso de empate, prevalece o maior win rate.
          </p>
        </div>
      </main>
    </div>
  );
}
