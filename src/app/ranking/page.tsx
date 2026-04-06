"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import WalletBar from "@/components/WalletBar";
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
  }, []);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-400";
      case 2: return "text-gray-300";
      case 3: return "text-amber-600";
      default: return "text-gray-500";
    }
  };

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header onSearch={() => {}} />
      <WalletBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Ranking de <span className="gradient-text">Traders</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Os melhores traders da plataforma. Quem vai liderar?
          </p>
        </div>

        {/* Premios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-gradient-to-br from-yellow-600/10 to-yellow-800/10 rounded-2xl p-6 border border-yellow-600/20 text-center">
            <div className="text-4xl mb-2">🥇</div>
            <h3 className="text-xl font-bold text-yellow-400">1o Lugar</h3>
            <p className="text-gray-400 text-sm mt-1">Badge Exclusivo + $500 bonus</p>
          </div>
          <div className="bg-gradient-to-br from-gray-400/10 to-gray-600/10 rounded-2xl p-6 border border-gray-500/20 text-center">
            <div className="text-4xl mb-2">🥈</div>
            <h3 className="text-xl font-bold text-gray-300">2o Lugar</h3>
            <p className="text-gray-400 text-sm mt-1">Badge Especial + $300 bonus</p>
          </div>
          <div className="bg-gradient-to-br from-amber-700/10 to-amber-900/10 rounded-2xl p-6 border border-amber-700/20 text-center">
            <div className="text-4xl mb-2">🥉</div>
            <h3 className="text-xl font-bold text-amber-500">3o Lugar</h3>
            <p className="text-gray-400 text-sm mt-1">Badge Bronze + $100 bonus</p>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="bg-[#141419] rounded-2xl border border-[#252530] overflow-hidden">
          <div className="p-5 border-b border-[#252530]">
            <h2 className="text-xl font-bold text-white">Top Traders</h2>
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
                e seja o primeiro!
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
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Trades</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252530]">
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#1a1a22]/50 ${
                        index < 3 ? "bg-[#1a1a22]/30" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className={`text-2xl font-bold ${getMedalColor(index + 1)}`}>
                          {getMedalEmoji(index + 1)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-500 text-xs">
                              {user.totalTrades || (user.totalWins + user.totalLosses)} trades
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-white font-bold">
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
                      <td className="px-5 py-4 text-right">
                        <span className="text-emerald-400">{user.totalWins}</span>
                        <span className="text-gray-500"> / </span>
                        <span className="text-rose-400">{user.totalLosses}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
