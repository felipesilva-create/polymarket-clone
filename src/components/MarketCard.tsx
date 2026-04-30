"use client";

import { useState } from "react";
import { Market } from "@/types/market";
import { formatVolume, formatPrice } from "@/services/polymarket";
import TradeModal from "./TradeModal";

interface MarketCardProps {
  market: Market;
}

const countryFlags: Record<string, string> = {
  US: "🇺🇸",
  JP: "🇯🇵",
  UK: "🇬🇧",
  BR: "🇧🇷",
  AE: "🇦🇪",
  NL: "🇳🇱",
  KE: "🇰🇪",
  NO: "🇳🇴",
  HK: "🇭🇰",
  SPACE: "🛸",
};

export default function MarketCard({ market }: MarketCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const outcomes = market.outcomes || ["Sim", "Nao"];
  const prices = market.outcomePrices || ["0.5", "0.5"];

  const yesPrice = parseFloat(prices[0] || "0.5");
  const noPrice = parseFloat(prices[1] || "0.5");

  return (
    <>
      <div className="bg-[#141419] rounded-2xl overflow-hidden card-hover border border-[#252530] hover:border-amber-500/30 group">
        {/* Camera Thumbnail */}
        {market.thumbnail && (
          <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <img
              src={market.thumbnail}
              alt={market.cameraName || "Camera"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${market.youtubeId}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-transparent to-transparent" />
            {/* Live badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">LIVE</span>
            </div>
            {/* Duration badge */}
            {market.duration && (
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                <span className="text-amber-400 text-[10px] font-bold uppercase">{market.duration}</span>
              </div>
            )}
            {/* Camera info */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{countryFlags[market.cameraCountry || ""] || "📹"}</span>
                <div>
                  <p className="text-white text-sm font-semibold drop-shadow-lg">{market.cameraName}</p>
                  <p className="text-gray-300 text-[11px] drop-shadow-lg">{market.cameraLocation}</p>
                </div>
              </div>
            </div>
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Category + Duration */}
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg capitalize">
              {market.category || "geral"}
            </span>
          </div>

          {/* Question */}
          <h3 className="text-white font-semibold text-base mb-4 line-clamp-2 leading-snug group-hover:text-amber-50 transition-colors">
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
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full live-indicator"></div>
              <span className="text-red-400 text-[10px] font-medium">AO VIVO</span>
            </div>
          </div>
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
