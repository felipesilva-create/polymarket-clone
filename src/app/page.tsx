"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import MarketList from "@/components/MarketList";
import CategoryFilter from "@/components/CategoryFilter";
import StatsBar from "@/components/StatsBar";
import WalletBar from "@/components/WalletBar";
import { Market } from "@/types/market";
import { getMarkets } from "@/services/polymarket";
import { useWallet } from "@/contexts/WalletContext";

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortBy, setSortBy] = useState("volume");
  const { updatePrices } = useWallet();

  const fetchMarkets = useCallback(async () => {
    setIsUpdating(true);
    const data = await getMarkets(100);
    setMarkets(data);
    setSecondsAgo(0);
    setLoading(false);
    setTimeout(() => setIsUpdating(false), 500);

    // Atualizar precos das posicoes com dados reais
    if (data.length > 0) {
      updatePrices(
        data.map((m: Market) => ({
          id: m.id,
          outcomePrices: m.outcomePrices,
        }))
      );
    }
  }, [updatePrices]);

  useEffect(() => {
    fetchMarkets();
    const interval = setInterval(fetchMarkets, 15000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let filtered = [...markets];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((market) =>
        market.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((market) =>
        market.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "volume":
          return parseFloat(b.volume || "0") - parseFloat(a.volume || "0");
        case "liquidity":
          return parseFloat(b.liquidity || "0") - parseFloat(a.liquidity || "0");
        case "ending":
          const dateA = new Date(a.endDate || "2099-01-01").getTime();
          const dateB = new Date(b.endDate || "2099-01-01").getTime();
          return dateA - dateB;
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredMarkets(filtered);
  }, [selectedCategory, searchQuery, markets, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const totalVolume = markets.reduce(
    (acc, market) => acc + parseFloat(market.volume || "0"),
    0
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header onSearch={handleSearch} />
      <WalletBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Mercado de <span className="gradient-text">Previsoes</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Aposte em eventos reais. Ganhe quando suas previsoes estiverem certas.
          </p>
        </div>

        {/* Stats */}
        <StatsBar totalMarkets={markets.length} totalVolume={totalVolume} />

        {/* Filters */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Results info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <p className="text-gray-500">
              <span className="text-white font-medium">{filteredMarkets.length}</span> mercados ativos
            </p>
            {/* Update indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
              isUpdating
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-[#141419] text-gray-500 border border-[#252530]"
            } transition-all duration-300`}>
              <span className={`w-2 h-2 rounded-full ${
                isUpdating ? "bg-amber-400 animate-ping" : "bg-gray-600"
              }`}></span>
              {isUpdating ? "Atualizando..." : `${secondsAgo}s atras`}
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#141419] text-gray-300 rounded-xl px-4 py-2.5 border border-[#252530] focus:outline-none focus:border-amber-500/50 cursor-pointer"
          >
            <option value="volume">Maior Volume</option>
            <option value="liquidity">Maior Liquidez</option>
            <option value="newest">Mais Recentes</option>
            <option value="ending">Encerrando</option>
          </select>
        </div>

        {/* Market List */}
        <MarketList markets={filteredMarkets} loading={loading} />

        {/* Load More */}
        {!loading && filteredMarkets.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-[#141419] hover:bg-[#1a1a22] text-white px-8 py-3 rounded-xl font-medium transition-all border border-[#252530] hover:border-amber-500/30">
              Carregar Mais
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0f] border-t border-[#252530] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              PredictHub - Simulador de apostas
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                Sobre
              </a>
              <a href="#" className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                API
              </a>
              <a href="#" className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
