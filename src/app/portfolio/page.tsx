"use client";

import { useWallet } from "@/contexts/WalletContext";
import { formatPrice } from "@/services/polymarket";
import Header from "@/components/Header";
import WalletBar from "@/components/WalletBar";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function PortfolioPage() {
  const { wallet } = useWallet();
  const { data: session } = useSession();

  const totalPositionsValue = wallet.positions.reduce(
    (acc, pos) => acc + pos.shares * pos.currentPrice,
    0
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header onSearch={() => {}} />
      <WalletBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Meu Portfolio</h1>
            <p className="text-gray-400 mt-1">
              Gerencie suas posicoes e acompanhe seus investimentos
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-[#141419] text-white rounded-xl hover:bg-[#1a1a22] transition-colors border border-[#252530]"
            >
              Mercados
            </Link>
            <Link
              href="/historico"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              Historico
            </Link>
          </div>
        </div>

        {!session && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm">
              Voce esta no modo visitante. Os dados sao salvos localmente.{" "}
              <Link href="/login" className="underline font-medium">Faca login</Link> para salvar no servidor.
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141419] rounded-xl p-5 border border-[#252530]">
            <p className="text-gray-400 text-sm">Saldo Disponivel</p>
            <p className="text-2xl font-bold text-white">${wallet.balance.toFixed(2)}</p>
          </div>
          <div className="bg-[#141419] rounded-xl p-5 border border-[#252530]">
            <p className="text-gray-400 text-sm">Valor em Posicoes</p>
            <p className="text-2xl font-bold text-white">${totalPositionsValue.toFixed(2)}</p>
          </div>
          <div className="bg-[#141419] rounded-xl p-5 border border-[#252530]">
            <p className="text-gray-400 text-sm">Valor Total</p>
            <p className="text-2xl font-bold text-white">
              ${(wallet.balance + totalPositionsValue).toFixed(2)}
            </p>
          </div>
          <div className="bg-[#141419] rounded-xl p-5 border border-[#252530]">
            <p className="text-gray-400 text-sm">Lucro/Perda Total</p>
            <p
              className={`text-2xl font-bold ${
                wallet.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {wallet.totalPnL >= 0 ? "+" : ""}${wallet.totalPnL.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Stats row */}
        {(wallet.totalWins > 0 || wallet.totalLosses > 0) && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#141419] rounded-xl p-4 border border-[#252530] text-center">
              <p className="text-gray-400 text-xs mb-1">Vitorias</p>
              <p className="text-xl font-bold text-emerald-400">{wallet.totalWins}</p>
            </div>
            <div className="bg-[#141419] rounded-xl p-4 border border-[#252530] text-center">
              <p className="text-gray-400 text-xs mb-1">Derrotas</p>
              <p className="text-xl font-bold text-rose-400">{wallet.totalLosses}</p>
            </div>
            <div className="bg-[#141419] rounded-xl p-4 border border-[#252530] text-center">
              <p className="text-gray-400 text-xs mb-1">Win Rate</p>
              <p className="text-xl font-bold text-amber-400">{wallet.winRate.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* Positions Table */}
        <div className="bg-[#141419] rounded-2xl border border-[#252530] overflow-hidden">
          <div className="p-5 border-b border-[#252530]">
            <h2 className="text-xl font-bold text-white">Posicoes Abertas</h2>
          </div>

          {wallet.positions.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-gray-400 text-lg mb-2">Nenhuma posicao aberta</div>
              <p className="text-gray-500">
                Va para os{" "}
                <Link href="/" className="text-amber-400 hover:underline">
                  mercados
                </Link>{" "}
                e faca sua primeira aposta!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a22]">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-medium">Mercado</th>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-medium">Posicao</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Shares</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Preco Medio</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Preco Atual</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Valor</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252530]">
                  {wallet.positions.map((position, index) => {
                    const currentValue = position.shares * position.currentPrice;
                    const pnl = currentValue - position.totalInvested;
                    const pnlPercent = position.totalInvested > 0 ? (pnl / position.totalInvested) * 100 : 0;

                    return (
                      <tr key={index} className="hover:bg-[#1a1a22]/50">
                        <td className="px-5 py-4">
                          <p className="text-white font-medium line-clamp-1">
                            {position.marketQuestion}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              position.outcome === "Yes"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {position.outcome}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-white">
                          {position.shares.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-300">
                          ${position.avgPrice.toFixed(3)}
                        </td>
                        <td className="px-5 py-4 text-right text-white">
                          ${position.currentPrice.toFixed(3)}
                        </td>
                        <td className="px-5 py-4 text-right text-white font-medium">
                          ${currentValue.toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className={`${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            <div className="font-medium">
                              {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                            </div>
                            <div className="text-xs">
                              {pnl >= 0 ? "+" : ""}{pnlPercent.toFixed(1)}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
