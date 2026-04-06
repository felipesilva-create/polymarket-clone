"use client";

import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/components/Toast";
import { Market } from "@/types/market";
import { formatPrice } from "@/services/polymarket";

interface TradeModalProps {
  market: Market;
  isOpen: boolean;
  onClose: () => void;
}

export default function TradeModal({ market, isOpen, onClose }: TradeModalProps) {
  const { wallet, buyShares, sellShares, getPosition } = useWallet();
  const { showToast } = useToast();
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0);
  const [amount, setAmount] = useState<string>("10");
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const outcomes = market.outcomes || ["Yes", "No"];
  const prices = market.outcomePrices || ["0.5", "0.5"];
  const currentPrice = parseFloat(prices[selectedOutcome] || "0.5");
  const amountNum = parseFloat(amount) || 0;
  const shares = mode === "buy" ? amountNum / currentPrice : amountNum;
  const position = getPosition(market.id, outcomes[selectedOutcome]);

  const handleTrade = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (mode === "buy") {
        if (amountNum <= 0) {
          showToast("Insira um valor valido!", "error");
          return;
        }
        if (amountNum > wallet.balance) {
          showToast("Saldo insuficiente!", "error");
          return;
        }

        const result = await buyShares(
          market.id,
          market.question,
          outcomes[selectedOutcome],
          shares,
          currentPrice
        );

        if (result.success) {
          showToast(`Compra de ${shares.toFixed(2)} shares de ${outcomes[selectedOutcome]} realizada!`, "success");
          onClose();
        } else {
          showToast(result.message, "error");
        }
      } else {
        if (!position) {
          showToast("Voce nao tem essa posicao!", "error");
          return;
        }
        if (amountNum <= 0) {
          showToast("Insira uma quantidade valida!", "error");
          return;
        }
        const sharesToSell = Math.min(amountNum, position.shares);

        const result = await sellShares(
          market.id,
          outcomes[selectedOutcome],
          sharesToSell,
          currentPrice
        );

        if (result.success) {
          const pnlText = result.pnl !== undefined
            ? ` (P&L: ${result.pnl >= 0 ? "+" : ""}$${result.pnl.toFixed(2)})`
            : "";
          showToast(`Venda de ${sharesToSell.toFixed(2)} shares realizada!${pnlText}`, "success");
          onClose();
        } else {
          showToast(result.message, "error");
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const potentialProfit = shares * (1 - currentPrice);
  const maxSellShares = position?.shares || 0;
  const sellTotal = mode === "sell" ? amountNum * currentPrice : 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#141419] rounded-2xl max-w-md w-full p-6 relative border border-[#252530]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-4 pr-8">{market.question}</h2>

        {/* Buy/Sell Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setMode("buy"); setAmount("10"); }}
            className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
              mode === "buy"
                ? "bg-emerald-600 text-white"
                : "bg-[#1a1a22] text-gray-300 hover:bg-[#252530] border border-[#252530]"
            }`}
          >
            Comprar
          </button>
          <button
            onClick={() => { setMode("sell"); setAmount(""); }}
            className={`flex-1 py-2 rounded-xl font-medium transition-colors ${
              mode === "sell"
                ? "bg-rose-600 text-white"
                : "bg-[#1a1a22] text-gray-300 hover:bg-[#252530] border border-[#252530]"
            }`}
          >
            Vender
          </button>
        </div>

        {/* Outcome Selection */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Resultado</label>
          <div className="flex gap-2">
            {outcomes.slice(0, 2).map((outcome, index) => (
              <button
                key={index}
                onClick={() => setSelectedOutcome(index)}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  selectedOutcome === index
                    ? index === 0
                      ? "bg-emerald-600/20 border-2 border-emerald-500 text-emerald-400"
                      : "bg-rose-600/20 border-2 border-rose-500 text-rose-400"
                    : "bg-[#1a1a22] text-gray-300 border-2 border-transparent"
                }`}
              >
                <div>{outcome}</div>
                <div className="text-lg font-bold">{formatPrice(prices[index])}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Position Info */}
        {position && (
          <div className="bg-[#1a1a22] rounded-xl p-3 mb-4 border border-[#252530]">
            <p className="text-xs text-gray-400">Sua posicao em {outcomes[selectedOutcome]}</p>
            <p className="text-white font-medium">
              {position.shares.toFixed(2)} shares @ ${position.avgPrice.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500">
              Valor atual: ${(position.shares * currentPrice).toFixed(2)}
            </p>
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">
            {mode === "buy" ? "Valor ($)" : `Shares (max: ${maxSellShares.toFixed(2)})`}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {mode === "buy" ? "$" : ""}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1a1a22] text-white rounded-xl px-8 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-[#252530]"
              placeholder="0"
              min="0"
              step="0.01"
              max={mode === "sell" ? maxSellShares : undefined}
            />
          </div>
          {/* Quick amounts */}
          <div className="flex gap-2 mt-2">
            {mode === "buy" ? (
              <>
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="flex-1 py-1.5 text-sm bg-[#1a1a22] hover:bg-[#252530] text-gray-300 rounded-lg border border-[#252530] hover:border-amber-500/30 transition-all"
                  >
                    ${val}
                  </button>
                ))}
              </>
            ) : (
              <>
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setAmount((maxSellShares * pct / 100).toFixed(2))}
                    className="flex-1 py-1.5 text-sm bg-[#1a1a22] hover:bg-[#252530] text-gray-300 rounded-lg border border-[#252530] hover:border-amber-500/30 transition-all"
                  >
                    {pct}%
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#1a1a22] rounded-xl p-4 mb-4 border border-[#252530]">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Preco</span>
            <span className="text-white">${currentPrice.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Shares</span>
            <span className="text-white">
              {mode === "buy" ? shares.toFixed(2) : (amountNum || 0).toFixed(2)}
            </span>
          </div>
          {mode === "buy" && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Lucro potencial (se ganhar)</span>
              <span className="text-emerald-400">+${potentialProfit.toFixed(2)}</span>
            </div>
          )}
          {mode === "sell" && position && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">P&L estimado</span>
              <span className={`${(currentPrice - position.avgPrice) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {(currentPrice - position.avgPrice) >= 0 ? "+" : ""}
                ${((currentPrice - position.avgPrice) * amountNum).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t border-[#252530] mt-2 pt-2 flex justify-between">
            <span className="text-gray-400">Total</span>
            <span className="text-white font-bold">
              ${mode === "buy" ? amountNum.toFixed(2) : sellTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Balance */}
        <div className="text-sm text-gray-400 mb-4">
          Saldo disponivel: <span className="text-white font-medium">${wallet.balance.toFixed(2)}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTrade}
          disabled={isProcessing || amountNum <= 0 || (mode === "buy" && amountNum > wallet.balance) || (mode === "sell" && (!position || amountNum > position.shares))}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
            mode === "buy"
              ? "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800/50"
              : "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-800/50"
          } disabled:cursor-not-allowed`}
        >
          {isProcessing
            ? "Processando..."
            : mode === "buy"
            ? `Comprar ${outcomes[selectedOutcome]}`
            : `Vender ${outcomes[selectedOutcome]}`
          }
        </button>
      </div>
    </div>
  );
}
