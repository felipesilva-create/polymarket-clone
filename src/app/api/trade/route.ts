import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { marketId, marketQuestion, outcome, type, shares, price } = body;

    // Validacao
    if (!marketId || !outcome || !type || !shares || !price) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    if (shares <= 0 || price <= 0 || price > 1) {
      return NextResponse.json({ error: "Valores invalidos" }, { status: 400 });
    }

    if (type !== "buy" && type !== "sell") {
      return NextResponse.json({ error: "Tipo invalido" }, { status: 400 });
    }

    const total = shares * price;

    // Buscar usuario
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });
    }

    if (type === "buy") {
      // Verificar saldo
      if (total > user.balance) {
        return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
      }

      // Buscar posicao existente
      const existingPosition = await prisma.position.findUnique({
        where: {
          userId_marketId_outcome: { userId, marketId, outcome },
        },
      });

      if (existingPosition) {
        // Atualizar posicao existente
        const newShares = existingPosition.shares + shares;
        const newTotalInvested = existingPosition.totalInvested + total;
        const newAvgPrice = newTotalInvested / newShares;

        await prisma.position.update({
          where: { id: existingPosition.id },
          data: {
            shares: newShares,
            avgPrice: newAvgPrice,
            currentPrice: price,
            totalInvested: newTotalInvested,
          },
        });
      } else {
        // Criar nova posicao
        await prisma.position.create({
          data: {
            userId,
            marketId,
            marketQuestion: marketQuestion || "",
            outcome,
            shares,
            avgPrice: price,
            currentPrice: price,
            totalInvested: total,
          },
        });
      }

      // Registrar trade
      await prisma.trade.create({
        data: {
          userId,
          marketId,
          marketQuestion: marketQuestion || "",
          outcome,
          type: "buy",
          shares,
          price,
          total,
        },
      });

      // Atualizar saldo do usuario
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: total },
        },
      });

      return NextResponse.json({ success: true, message: "Compra realizada!" });
    } else {
      // SELL
      const position = await prisma.position.findUnique({
        where: {
          userId_marketId_outcome: { userId, marketId, outcome },
        },
      });

      if (!position || position.shares < shares) {
        return NextResponse.json({ error: "Shares insuficientes" }, { status: 400 });
      }

      const pnl = (price - position.avgPrice) * shares;

      // Registrar trade
      await prisma.trade.create({
        data: {
          userId,
          marketId,
          marketQuestion: position.marketQuestion,
          outcome,
          type: "sell",
          shares,
          price,
          total,
          pnl,
        },
      });

      if (position.shares === shares) {
        // Remover posicao completamente
        await prisma.position.delete({ where: { id: position.id } });
      } else {
        // Atualizar posicao parcial
        await prisma.position.update({
          where: { id: position.id },
          data: {
            shares: { decrement: shares },
            totalInvested: { decrement: shares * position.avgPrice },
          },
        });
      }

      // Atualizar saldo e stats do usuario
      const isWin = pnl > 0;
      await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: total },
          totalPnL: { increment: pnl },
          totalWins: isWin ? { increment: 1 } : undefined,
          totalLosses: !isWin ? { increment: 1 } : undefined,
        },
      });

      // Atualizar winRate
      const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
      if (updatedUser) {
        const totalTrades = updatedUser.totalWins + updatedUser.totalLosses;
        const winRate = totalTrades > 0 ? (updatedUser.totalWins / totalTrades) * 100 : 0;
        await prisma.user.update({
          where: { id: userId },
          data: { winRate },
        });
      }

      return NextResponse.json({ success: true, message: "Venda realizada!", pnl });
    }
  } catch (error) {
    console.error("Trade error:", error);
    return NextResponse.json(
      { error: "Erro ao processar trade" },
      { status: 500 }
    );
  }
}
