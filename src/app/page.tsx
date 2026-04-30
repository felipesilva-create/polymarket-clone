"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import MarketList from "@/components/MarketList";
import CategoryFilter from "@/components/CategoryFilter";
import StatsBar from "@/components/StatsBar";
import WalletBar from "@/components/WalletBar";
import CompetitionBanner from "@/components/CompetitionBanner";
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

    if (selectedCategory !== "all") {
      filtered = filtered.filter((market) =>
        market.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((market) =>
        market.question.toLowerCase().includes(q) ||
        (market.cameraName || "").toLowerCase().includes(q) ||
        (market.cameraLocation || "").toLowerCase().includes(q)
      );
    }

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

  // Contar cameras unicas
  const uniqueCameras = new Set(markets.map((m) => m.cameraId)).size;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header onSearch={handleSearch} />
      <WalletBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-400 text-sm font-medium">{uniqueCameras} cameras ao vivo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Assista e <span className="gradient-text">Preveja</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Cameras ao vivo do mundo inteiro. Assista, faca suas previsoes e ganhe quando acertar.
          </p>
        </div>

        {/* Competition Banner */}
        <CompetitionBanner />

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
              <span className="text-white font-medium">{filteredMarkets.length}</span> mercados ao vivo
            </p>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
              isUpdating
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-[#141419] text-gray-500 border border-[#252530]"
            } transition-all duration-300`}>
              <span className={`w-2 h-2 rounded-full ${
                isUpdating ? "bg-amber-400 animate-ping" : "bg-gray-600"
              }`}></span>
              {isUpdating ? "Atualizando odds..." : `${secondsAgo}s atras`}
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
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0f] border-t border-[#252530] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              PredictCam - Assista e Preveja
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                Sobre
              </a>
              <a href="#" className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                Cameras
              </a>
              <a href="https://github.com/felipesilva-create/polymarket-clone" className="text-gray-500 hover:text-amber-400 text-sm transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
