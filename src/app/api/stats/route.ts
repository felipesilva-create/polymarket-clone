import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalUsers = await prisma.user.count();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tradesToday = await prisma.trade.count({
      where: {
        createdAt: { gte: todayStart },
      },
    });

    const totalTrades = await prisma.trade.count();

    return NextResponse.json({
      totalUsers,
      tradesToday,
      totalTrades,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { totalUsers: 0, tradesToday: 0, totalTrades: 0 },
      { status: 500 }
    );
  }
}
