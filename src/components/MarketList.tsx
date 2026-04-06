"use client";

import { Market } from "@/types/market";
import MarketCard from "./MarketCard";

interface MarketListProps {
  markets: Market[];
  loading?: boolean;
}

export default function MarketList({ markets, loading }: MarketListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-xl p-5 animate-pulse border border-gray-700"
          >
            <div className="h-4 bg-gray-700 rounded w-20 mb-4"></div>
            <div className="h-6 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="space-y-2 mb-4">
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">Nenhum mercado encontrado</div>
        <p className="text-gray-500 mt-2">
          Tente ajustar os filtros ou buscar por outro termo
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  );
}
