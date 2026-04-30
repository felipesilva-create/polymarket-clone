import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ rank: null }, { status: 200 });
    }

    const userId = (session.user as any).id;

    // Pega user atual
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        balance: true,
        totalPnL: true,
        totalWins: true,
        totalLosses: true,
        winRate: true,
      },
    });

    if (!me) {
      return NextResponse.json({ rank: null }, { status: 200 });
    }

    // Conta quantos usuarios tem totalPnL maior (ranking principal)
    const usersAbove = await prisma.user.count({
      where: {
        OR: [
          { totalPnL: { gt: me.totalPnL } },
          {
            AND: [
              { totalPnL: me.totalPnL },
              { balance: { gt: me.balance } },
            ],
          },
        ],
      },
    });

    // Total de usuarios participantes
    const totalUsers = await prisma.user.count({
      where: {
        OR: [
          { trades: { some: {} } },
          { NOT: { balance: 1000 } },
          { NOT: { totalPnL: 0 } },
        ],
      },
    });

    const rank = usersAbove + 1;

    return NextResponse.json({
      rank,
      totalUsers,
      inPrizeZone: rank <= 10,
      user: me,
    });
  } catch (error) {
    console.error("Ranking me error:", error);
    return NextResponse.json({ rank: null }, { status: 500 });
  }
}
