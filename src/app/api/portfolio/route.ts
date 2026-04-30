import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveExpiredPositions } from "@/lib/marketResolver";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Resolve mercados expirados antes de retornar o portfolio
    const resolveResult = await resolveExpiredPositions(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        initialBalance: true,
        totalPnL: true,
        totalWins: true,
        totalLosses: true,
        winRate: true,
      },
    });

    const positions = await prisma.position.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      user,
      positions,
      trades,
      resolutions: resolveResult.resolutions,
      resolvedCount: resolveResult.resolvedCount,
    });
  } catch (error) {
    console.error("Portfolio error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar portfolio" },
      { status: 500 }
    );
  }
}
