"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { resolveClientPositions, ClientResolution } from "@/lib/clientResolver";

export interface Position {
  id?: string;
  marketId: string;
  marketQuestion: string;
  outcome: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalInvested: number;
  createdAt?: string;
}

export interface Trade {
  id: string;
  marketId: string;
  marketQuestion: string;
  outcome: string;
  type: "buy" | "sell" | "win" | "loss" | string;
  shares: number;
  price: number;
  total: number;
  pnl?: number;
  createdAt: string;
  resolved?: boolean;
  won?: boolean;
}

export interface WalletData {
  balance: number;
  initialBalance: number;
  positions: Position[];
  trades: Trade[];
  totalPnL: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
}

export type ResolutionListener = (resolution: ClientResolution) => void;

export interface WalletContextType {
  wallet: WalletData;
  loading: boolean;
  buyShares: (
    marketId: string,
    marketQuestion: string,
    outcome: string,
    shares: number,
    price: number
  ) => Promise<{ success: boolean; message: string }>;
  sellShares: (
    marketId: string,
    outcome: string,
    shares: number,
    price: number
  ) => Promise<{ success: boolean; message: string; pnl?: number }>;
  getPosition: (marketId: string, outcome: string) => Position | undefined;
  updatePrices: (markets: { id: string; outcomePrices: string[] }[]) => void;
  resetWallet: () => void;
  refreshWallet: () => Promise<void>;
  onResolution: (listener: ResolutionListener) => () => void;
}

const INITIAL_BALANCE = 1000;
const STORAGE_KEY = "polymarket_wallet";
const RESOLUTION_INTERVAL_MS = 5000; // checa expiracao a cada 5s

const defaultWallet: WalletData = {
  balance: INITIAL_BALANCE,
  initialBalance: INITIAL_BALANCE,
  positions: [],
  trades: [],
  totalPnL: 0,
  totalWins: 0,
  totalLosses: 0,
  winRate: 0,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;
  const [wallet, setWallet] = useState<WalletData>(defaultWallet);
  const [isLoaded, setIsLoaded] = useState(false);
  const resolutionListeners = useRef<Set<ResolutionListener>>(new Set());

  const onResolution = useCallback((listener: ResolutionListener) => {
    resolutionListeners.current.add(listener);
    return () => {
      resolutionListeners.current.delete(listener);
    };
  }, []);

  const emitResolutions = useCallback((resolutions: ClientResolution[]) => {
    for (const r of resolutions) {
      resolutionListeners.current.forEach((l) => {
        try {
          l(r);
        } catch (e) {
          console.error("Resolution listener error:", e);
        }
      });
    }
  }, []);

  // Buscar dados do banco quando logado (com auto-resolucao server-side)
  const refreshWallet = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setWallet({
          balance: data.user?.balance ?? INITIAL_BALANCE,
          initialBalance: data.user?.initialBalance ?? INITIAL_BALANCE,
          totalPnL: data.user?.totalPnL ?? 0,
          totalWins: data.user?.totalWins ?? 0,
          totalLosses: data.user?.totalLosses ?? 0,
          winRate: data.user?.winRate ?? 0,
          positions: (data.positions || []).map((p: any) => ({
            id: p.id,
            marketId: p.marketId,
            marketQuestion: p.marketQuestion,
            outcome: p.outcome,
            shares: p.shares,
            avgPrice: p.avgPrice,
            currentPrice: p.currentPrice,
            totalInvested: p.totalInvested,
            createdAt: p.createdAt,
          })),
          trades: (data.trades || []).map((t: any) => ({
            id: t.id,
            marketId: t.marketId,
            marketQuestion: t.marketQuestion,
            outcome: t.outcome,
            type: t.type,
            shares: t.shares,
            price: t.price,
            total: t.total,
            pnl: t.pnl,
            createdAt: t.createdAt,
            resolved: t.resolved,
            won: t.won,
          })),
        });

        // Notificar resolucoes que aconteceram no servidor
        if (data.resolutions && data.resolutions.length > 0) {
          emitResolutions(data.resolutions);
        }
      }
    } catch (e) {
      console.error("Error fetching wallet:", e);
    }
  }, [isAuthenticated, emitResolutions]);

  // Carregar dados: banco para logado, localStorage para visitante
  useEffect(() => {
    if (status === "loading") return;

    if (isAuthenticated) {
      setIsLoaded(false);
      refreshWallet().then(() => setIsLoaded(true));
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setWallet({
            ...defaultWallet,
            ...parsed,
            trades: (parsed.trades || []).map((t: any) => ({
              ...t,
              createdAt: t.createdAt || t.timestamp || new Date().toISOString(),
            })),
          });
        } catch (e) {
          console.error("Error loading wallet:", e);
        }
      }
      setIsLoaded(true);
    }
  }, [status, isAuthenticated, refreshWallet]);

  // Salvar no localStorage para visitantes
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
    }
  }, [wallet, isLoaded, isAuthenticated]);

  // Auto-resolver posicoes expiradas (visitantes: client-side; auth: chama servidor)
  useEffect(() => {
    if (!isLoaded) return;

    const checkResolution = () => {
      if (isAuthenticated) {
        // Server-side resolve via portfolio fetch (que chama resolveExpiredPositions)
        refreshWallet();
      } else {
        // Client-side resolve
        setWallet((prev) => {
          if (prev.positions.length === 0) return prev;

          const result = resolveClientPositions(prev.positions, {});
          if (result.resolutions.length === 0) return prev;

          // Emit notifications
          emitResolutions(result.resolutions);

          const newWins = result.resolutions.filter((r) => r.won).length;
          const newLosses = result.resolutions.filter((r) => !r.won).length;

          return {
            ...prev,
            balance: prev.balance + result.totalPayout,
            totalPnL: prev.totalPnL + result.totalPnL,
            totalWins: prev.totalWins + newWins,
            totalLosses: prev.totalLosses + newLosses,
            positions: result.remainingPositions,
            trades: [...result.newTrades, ...prev.trades],
          };
        });
      }
    };

    const interval = setInterval(checkResolution, RESOLUTION_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isLoaded, isAuthenticated, refreshWallet, emitResolutions]);

  const buyShares = useCallback(
    async (
      marketId: string,
      marketQuestion: string,
      outcome: string,
      shares: number,
      price: number
    ): Promise<{ success: boolean; message: string }> => {
      const total = shares * price;

      if (total > wallet.balance) {
        return { success: false, message: "Saldo insuficiente!" };
      }

      if (shares <= 0 || price <= 0) {
        return { success: false, message: "Valores invalidos!" };
      }

      if (isAuthenticated) {
        try {
          const res = await fetch("/api/trade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ marketId, marketQuestion, outcome, type: "buy", shares, price }),
          });
          const data = await res.json();
          if (!res.ok) {
            return { success: false, message: data.error || "Erro ao comprar" };
          }
          await refreshWallet();
          return { success: true, message: "Compra realizada com sucesso!" };
        } catch (e) {
          return { success: false, message: "Erro de conexao" };
        }
      } else {
        // Modo local (visitante)
        setWallet((prev) => {
          const existingPosition = prev.positions.find(
            (p) => p.marketId === marketId && p.outcome === outcome
          );

          let newPositions: Position[];

          if (existingPosition) {
            const newShares = existingPosition.shares + shares;
            const newTotalInvested = existingPosition.totalInvested + total;
            const newAvgPrice = newTotalInvested / newShares;

            newPositions = prev.positions.map((p) =>
              p.marketId === marketId && p.outcome === outcome
                ? {
                    ...p,
                    shares: newShares,
                    avgPrice: newAvgPrice,
                    totalInvested: newTotalInvested,
                    currentPrice: price,
                  }
                : p
            );
          } else {
            newPositions = [
              ...prev.positions,
              {
                marketId,
                marketQuestion,
                outcome,
                shares,
                avgPrice: price,
                currentPrice: price,
                totalInvested: total,
                createdAt: new Date().toISOString(),
              },
            ];
          }

          const newTrade: Trade = {
            id: Date.now().toString(),
            marketId,
            marketQuestion,
            outcome,
            type: "buy",
            shares,
            price,
            total,
            createdAt: new Date().toISOString(),
          };

          return {
            ...prev,
            balance: prev.balance - total,
            positions: newPositions,
            trades: [newTrade, ...prev.trades],
          };
        });

        return { success: true, message: "Compra realizada com sucesso!" };
      }
    },
    [wallet.balance, isAuthenticated, refreshWallet]
  );

  const sellShares = useCallback(
    async (
      marketId: string,
      outcome: string,
      shares: number,
      price: number
    ): Promise<{ success: boolean; message: string; pnl?: number }> => {
      const position = wallet.positions.find(
        (p) => p.marketId === marketId && p.outcome === outcome
      );

      if (!position || position.shares < shares) {
        return { success: false, message: "Shares insuficientes!" };
      }

      if (shares <= 0 || price <= 0) {
        return { success: false, message: "Valores invalidos!" };
      }

      if (isAuthenticated) {
        try {
          const res = await fetch("/api/trade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ marketId, outcome, type: "sell", shares, price }),
          });
          const data = await res.json();
          if (!res.ok) {
            return { success: false, message: data.error || "Erro ao vender" };
          }
          await refreshWallet();
          return { success: true, message: "Venda realizada com sucesso!", pnl: data.pnl };
        } catch (e) {
          return { success: false, message: "Erro de conexao" };
        }
      } else {
        const total = shares * price;
        const pnl = (price - position.avgPrice) * shares;

        setWallet((prev) => {
          const pos = prev.positions.find(
            (p) => p.marketId === marketId && p.outcome === outcome
          )!;

          let newPositions: Position[];

          if (pos.shares === shares) {
            newPositions = prev.positions.filter(
              (p) => !(p.marketId === marketId && p.outcome === outcome)
            );
          } else {
            newPositions = prev.positions.map((p) =>
              p.marketId === marketId && p.outcome === outcome
                ? { ...p, shares: p.shares - shares, totalInvested: p.totalInvested - shares * p.avgPrice }
                : p
            );
          }

          const newTrade: Trade = {
            id: Date.now().toString(),
            marketId,
            marketQuestion: pos.marketQuestion,
            outcome,
            type: "sell",
            shares,
            price,
            total,
            pnl,
            createdAt: new Date().toISOString(),
          };

          return {
            ...prev,
            balance: prev.balance + total,
            positions: newPositions,
            trades: [newTrade, ...prev.trades],
            totalPnL: prev.totalPnL + pnl,
            totalWins: pnl > 0 ? prev.totalWins + 1 : prev.totalWins,
            totalLosses: pnl <= 0 ? prev.totalLosses + 1 : prev.totalLosses,
          };
        });

        return { success: true, message: "Venda realizada com sucesso!", pnl };
      }
    },
    [wallet.positions, isAuthenticated, refreshWallet]
  );

  const getPosition = useCallback(
    (marketId: string, outcome: string): Position | undefined => {
      return wallet.positions.find(
        (p) => p.marketId === marketId && p.outcome === outcome
      );
    },
    [wallet.positions]
  );

  const updatePrices = useCallback(
    (markets: { id: string; outcomePrices: string[] }[]) => {
      setWallet((prev) => {
        const newPositions = prev.positions.map((pos) => {
          const market = markets.find((m) => m.id === pos.marketId);
          if (market) {
            // Encontrar indice do outcome
            const priceIndex = pos.outcome === "Sim" || pos.outcome === "Yes" ? 0 : 1;
            const newPrice = parseFloat(market.outcomePrices[priceIndex] || "0");
            if (newPrice > 0) return { ...pos, currentPrice: newPrice };
          }
          return pos;
        });
        return { ...prev, positions: newPositions };
      });
    },
    []
  );

  const resetWallet = useCallback(() => {
    setWallet(defaultWallet);
    if (!isAuthenticated) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isAuthenticated]);

  if (!isLoaded) {
    return null;
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        loading: !isLoaded,
        buyShares,
        sellShares,
        getPosition,
        updatePrices,
        resetWallet,
        refreshWallet,
        onResolution,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}
