"use client";

import { useState } from "react";
import { Market } from "@/types/market";
import { formatVolume, formatPrice } from "@/services/polymarket";
import TradeModal from "./TradeModal";

interface MarketCardProps {
  market: Market;
}

function formatTimeRemaining(endDate: string): string {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return "Encerrado";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? "mes" : "meses"}`;
  }
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return "< 1h";
}

export default function MarketCard({ market }: MarketCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const outcomes = market.outcomes || ["Yes", "No"];
  const prices = market.outcomePrices || ["0.5", "0.5"];

  const yesPrice = parseFloat(prices[0] || "0.5");
  const noPrice = parseFloat(prices[1] || "0.5");

  return (
    <>
      <div className="bg-[#141419] rounded-2xl p-5 card-hover border border-[#252530] hover:border-amber-500/30 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg capitalize">
            {market.category || "geral"}
          </span>
          {market.endDate && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTimeRemaining(market.endDate)}
            </span>
          )}
        </div>

        {/* Question */}
        <h3 className="text-white font-semibold text-base mb-5 line-clamp-2 leading-snug group-hover:text-amber-50 transition-colors">
          {market.question}
        </h3>

        {/* Price Display */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl p-3 transition-all group/btn"
          >
            <div className="text-xs text-gray-400 mb-1">{outcomes[0] || "Sim"}</div>
            <div className="text-xl font-bold text-emerald-400 group-hover/btn:text-emerald-300">
              {formatPrice(yesPrice)}
            </div>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 rounded-xl p-3 transition-all group/btn"
          >
            <div className="text-xs text-gray-400 mb-1">{outcomes[1] || "Nao"}</div>
            <div className="text-xl font-bold text-rose-400 group-hover/btn:text-rose-300">
              {formatPrice(noPrice)}
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-[#252530]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {formatVolume(market.volume || "0")}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatVolume(market.liquidity || "0")}
            </span>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full live-indicator"></div>
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal
        market={market}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
