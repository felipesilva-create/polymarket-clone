"use client";

import { useWallet } from "@/contexts/WalletContext";

export default function WalletBar() {
  const { wallet, resetWallet } = useWallet();

  const totalPositionsValue = wallet.positions.reduce(
    (acc, pos) => acc + pos.shares * pos.currentPrice,
    0
  );

  const totalValue = wallet.balance + totalPositionsValue;
  const pnlPercent = ((totalValue - wallet.initialBalance) / wallet.initialBalance) * 100;
  const isProfit = totalValue >= wallet.initialBalance;

  return (
    <div className="bg-[#0d0d12] border-b border-[#252530]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Saldo */}
            <div className="flex items-center gap-3">
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
            <div className="hidden sm:block border-l border-[#252530] pl-6">
              <p className="text-xs text-gray-500">Posicoes</p>
              <p className="text-lg font-bold text-white">
                ${totalPositionsValue.toFixed(2)}
              </p>
            </div>

            {/* Valor Total */}
            <div className="hidden md:block border-l border-[#252530] pl-6">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-white">
                ${totalValue.toFixed(2)}
              </p>
            </div>

            {/* PnL */}
            <div className="border-l border-[#252530] pl-6">
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
          </div>

          {/* Acoes */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 hidden sm:block">
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
