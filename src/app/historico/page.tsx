"use client";

import { useWallet } from "@/contexts/WalletContext";
import Header from "@/components/Header";
import WalletBar from "@/components/WalletBar";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HistoricoPage() {
  const { wallet } = useWallet();
  const { data: session } = useSession();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalBuys = wallet.trades.filter((t) => t.type === "buy").length;
  const totalSells = wallet.trades.filter((t) => t.type === "sell").length;
  const totalVolume = wallet.trades.reduce((acc, t) => acc + t.total, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header onSearch={() => {}} />
      <WalletBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Historico de Trades</h1>
            <p className="text-gray-400 mt-1">
              Todas as suas operacoes de compra e venda
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
              href="/portfolio"
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              Portfolio
            </Link>
          </div>
        </div>

        {!session && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm">
              Modo visitante: dados salvos localmente.{" "}
              <Link href="/login" className="underline font-medium">Faca login</Link> para persistencia no servidor.
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#141419] rounded-xl p-5 border border-[#252530]">
            <p className="text-gray-400 text-sm">Total de Trades</p>
            <p className="text-2xl font-bold text-white">{wallet.trades.length}</p>
          </div>
          <div className="bg-[#141419] rounded-xl p-5 border border-[#252530]">
            <p className="text-gray-400 text-sm">Compras</p>
            <p className="text-2xl font-bold text-emerald-400">{totalBuys}</p>
          </div>
          <div className="bg-[#141419] rounded-xl p-5 border border-[#252530]">
            <p className="text-gray-400 text-sm">Vendas</p>
            <p className="text-2xl font-bold text-rose-400">{totalSells}</p>
          </div>
          <div className="bg-[#141419] rounded-xl p-5 border border-[#252530]">
            <p className="text-gray-400 text-sm">Volume Total</p>
            <p className="text-2xl font-bold text-white">${totalVolume.toFixed(2)}</p>
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-[#141419] rounded-2xl border border-[#252530] overflow-hidden">
          <div className="p-5 border-b border-[#252530]">
            <h2 className="text-xl font-bold text-white">Todas as Operacoes</h2>
          </div>

          {wallet.trades.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-gray-400 text-lg mb-2">Nenhum trade realizado</div>
              <p className="text-gray-500">
                Va para os{" "}
                <Link href="/" className="text-amber-400 hover:underline">
                  mercados
                </Link>{" "}
                e faca sua primeira operacao!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a22]">
                  <tr>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-medium">Data</th>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-medium">Tipo</th>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-medium">Mercado</th>
                    <th className="text-left px-5 py-3 text-gray-400 text-sm font-medium">Posicao</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Shares</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Preco</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">Total</th>
                    <th className="text-right px-5 py-3 text-gray-400 text-sm font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252530]">
                  {wallet.trades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-[#1a1a22]/50">
                      <td className="px-5 py-4 text-gray-300 text-sm">
                        {formatDate(trade.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${
                            trade.type === "buy"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {trade.type === "buy" ? "Compra" : "Venda"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white font-medium line-clamp-1 max-w-xs">
                          {trade.marketQuestion}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            trade.outcome === "Yes"
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          {trade.outcome}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-white">
                        {trade.shares.toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right text-gray-300">
                        ${trade.price.toFixed(3)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className={`font-medium ${
                            trade.type === "buy" ? "text-rose-400" : "text-emerald-400"
                          }`}
                        >
                          {trade.type === "buy" ? "-" : "+"}${trade.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {trade.pnl !== undefined && trade.pnl !== null ? (
                          <span className={`font-medium ${trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
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
