import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Buscar usuarios que tem trades OU que tem saldo diferente do inicial
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { trades: { some: {} } },
          { NOT: { balance: 1000 } },
          { NOT: { totalPnL: 0 } },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
        balance: true,
        totalPnL: true,
        totalWins: true,
        totalLosses: true,
        winRate: true,
        _count: {
          select: { trades: true },
        },
      },
      orderBy: [
        { totalPnL: "desc" },
        { balance: "desc" },
      ],
      take: 100,
    });

    // Se nao tem traders com trades, buscar todos os usuarios
    let rankedUsers;
    if (users.length === 0) {
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          balance: true,
          totalPnL: true,
          totalWins: true,
          totalLosses: true,
          winRate: true,
          _count: {
            select: { trades: true },
          },
        },
        orderBy: [
          { balance: "desc" },
        ],
        take: 100,
      });

      rankedUsers = allUsers.map((user, index) => ({
        ...user,
        rank: index + 1,
        totalTrades: user._count.trades,
      }));
    } else {
      rankedUsers = users.map((user, index) => ({
        ...user,
        rank: index + 1,
        totalTrades: user._count.trades,
      }));
    }

    return NextResponse.json(rankedUsers);
  } catch (error) {
    console.error("Error fetching ranking:", error);
    return NextResponse.json([], { status: 500 });
  }
}
