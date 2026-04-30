// Resolve mercados expirados e paga vencedores
// Estrategia: probabilidade baseada no preco atual (= probabilidade implicita do mercado)
//   - Se "Sim" tava a 70%, ha 70% de chance do "Sim" ganhar
//   - Quem comprou "Sim" recebe $1/share se ganhar, $0 se perder
//   - Justo (expected value = 0)

import { prisma } from "@/lib/prisma";
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

export function getMarketInfo(marketId: string) {
  for (const cam of cameras) {
    for (const market of cam.markets) {
      if (market.id === marketId) {
        return { camera: cam, market };
      }
    }
  }
  return null;
}

export interface ResolveResult {
  resolvedCount: number;
  winsCount: number;
  lossesCount: number;
  totalPayout: number;
  totalPnL: number;
  resolutions: ResolvedPosition[];
}

export interface ResolvedPosition {
  marketId: string;
  marketQuestion: string;
  outcome: string;
  shares: number;
  totalInvested: number;
  won: boolean;
  payout: number;
  pnl: number;
}

/**
 * Encontra posicoes expiradas do usuario e resolve elas.
 * Cada posicao expirada eh resolvida com probabilidade = currentPrice.
 * Se ganhou: shares × $1 cai no saldo. P&L = payout - totalInvested.
 * Se perdeu: nada paga. P&L = -totalInvested.
 */
export async function resolveExpiredPositions(
  userId: string
): Promise<ResolveResult> {
  const positions = await prisma.position.findMany({ where: { userId } });
  const now = Date.now();

  const result: ResolveResult = {
    resolvedCount: 0,
    winsCount: 0,
    lossesCount: 0,
    totalPayout: 0,
    totalPnL: 0,
    resolutions: [],
  };

  for (const pos of positions) {
    const duration = getMarketDuration(pos.marketId);
    const expiresAt = pos.createdAt.getTime() + duration;

    if (expiresAt > now) continue; // ainda nao expirou

    // Resolver: probabilidade de ganhar = currentPrice
    const winProb = Math.max(0.05, Math.min(0.95, pos.currentPrice));
    const won = Math.random() < winProb;
    const payout = won ? pos.shares : 0; // $1 por share se ganhou
    const pnl = payout - pos.totalInvested;

    // Marcar trades de compra como resolvidos
    await prisma.trade.updateMany({
      where: {
        userId,
        marketId: pos.marketId,
        outcome: pos.outcome,
        type: "buy",
        resolved: false,
      },
      data: {
        resolved: true,
        won,
      },
    });

    // Criar trade de "resolucao" (representando o pagamento/perda)
    await prisma.trade.create({
      data: {
        userId,
        marketId: pos.marketId,
        marketQuestion: pos.marketQuestion,
        outcome: pos.outcome,
        type: won ? "win" : "loss",
        shares: pos.shares,
        price: won ? 1 : 0,
        total: payout,
        pnl,
        resolved: true,
        won,
      },
    });

    // Deletar posicao
    await prisma.position.delete({ where: { id: pos.id } });

    // Atualizar saldo e stats do user
    await prisma.user.update({
      where: { id: userId },
      data: {
        balance: { increment: payout },
        totalPnL: { increment: pnl },
        totalWins: won ? { increment: 1 } : undefined,
        totalLosses: !won ? { increment: 1 } : undefined,
      },
    });

    result.resolvedCount++;
    if (won) result.winsCount++;
    else result.lossesCount++;
    result.totalPayout += payout;
    result.totalPnL += pnl;
    result.resolutions.push({
      marketId: pos.marketId,
      marketQuestion: pos.marketQuestion,
      outcome: pos.outcome,
      shares: pos.shares,
      totalInvested: pos.totalInvested,
      won,
      payout,
      pnl,
    });
  }

  // Atualizar winRate
  if (result.resolvedCount > 0) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const totalTrades = user.totalWins + user.totalLosses;
      const winRate = totalTrades > 0 ? (user.totalWins / totalTrades) * 100 : 0;
      await prisma.user.update({
        where: { id: userId },
        data: { winRate },
      });
    }
  }

  return result;
}
