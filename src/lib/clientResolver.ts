// Resolve posicoes no cliente (pra usuarios sem login que usam localStorage)

import { cameras } from "@/data/cameras";

const DEFAULT_DURATION_MS = 60_000;
const durationCache = new Map<string, number>();

function parseDuration(d: string): number {
  const match = d.match(/(\d+)(s|min|m|h)/);
  if (!match) return DEFAULT_DURATION_MS;
  const value = parseInt(match[1]);
  const unit = match[2];
  if (unit === "s") return value * 1000;
  if (unit === "h") return value * 60 * 60 * 1000;
  return value * 60 * 1000;
}

export function getMarketDuration(marketId: string): number {
  const cached = durationCache.get(marketId);
  if (cached !== undefined) return cached;
  for (const cam of cameras) {
    for (const market of cam.markets) {
      if (market.id === marketId) {
        const ms = parseDuration(market.duration);
        durationCache.set(marketId, ms);
        return ms;
      }
    }
  }
  return DEFAULT_DURATION_MS;
}

export interface ClientPosition {
  marketId: string;
  marketQuestion: string;
  outcome: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalInvested: number;
  createdAt?: string;
}

export interface ClientTrade {
  id: string;
  marketId: string;
  marketQuestion: string;
  outcome: string;
  type: string;
  shares: number;
  price: number;
  total: number;
  pnl?: number;
  createdAt: string;
  resolved?: boolean;
  won?: boolean;
}

export interface ClientResolution {
  marketId: string;
  marketQuestion: string;
  outcome: string;
  shares: number;
  totalInvested: number;
  won: boolean;
  payout: number;
  pnl: number;
}

export interface ClientResolveResult {
  remainingPositions: ClientPosition[];
  newTrades: ClientTrade[];
  totalPayout: number;
  totalPnL: number;
  resolutions: ClientResolution[];
}

export function resolveClientPositions(
  positions: ClientPosition[],
  positionCreatedAtMap: Record<string, string>
): ClientResolveResult {
  const now = Date.now();
  const remaining: ClientPosition[] = [];
  const newTrades: ClientTrade[] = [];
  const resolutions: ClientResolution[] = [];
  let totalPayout = 0;
  let totalPnL = 0;

  for (const pos of positions) {
    const key = `${pos.marketId}::${pos.outcome}`;
    const createdAtIso = pos.createdAt || positionCreatedAtMap[key];
    if (!createdAtIso) {
      remaining.push(pos);
      continue;
    }

    const duration = getMarketDuration(pos.marketId);
    const expiresAt = new Date(createdAtIso).getTime() + duration;

    if (expiresAt > now) {
      remaining.push(pos);
      continue;
    }

    // Resolver: probabilidade = currentPrice
    const winProb = Math.max(0.05, Math.min(0.95, pos.currentPrice));
    const won = Math.random() < winProb;
    const payout = won ? pos.shares : 0;
    const pnl = payout - pos.totalInvested;

    newTrades.push({
      id: `resolve-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      marketId: pos.marketId,
      marketQuestion: pos.marketQuestion,
      outcome: pos.outcome,
      type: won ? "win" : "loss",
      shares: pos.shares,
      price: won ? 1 : 0,
      total: payout,
      pnl,
      createdAt: new Date().toISOString(),
      resolved: true,
      won,
    });

    resolutions.push({
      marketId: pos.marketId,
      marketQuestion: pos.marketQuestion,
      outcome: pos.outcome,
      shares: pos.shares,
      totalInvested: pos.totalInvested,
      won,
      payout,
      pnl,
    });

    totalPayout += payout;
    totalPnL += pnl;
  }

  return { remainingPositions: remaining, newTrades, totalPayout, totalPnL, resolutions };
}
