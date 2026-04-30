import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveExpiredPositions } from "@/lib/marketResolver";

export const dynamic = "force-dynamic";

// POST /api/markets/resolve - resolve posicoes expiradas do usuario logado
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const result = await resolveExpiredPositions(userId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Resolve error:", error);
    return NextResponse.json(
      { error: "Erro ao resolver mercados" },
      { status: 500 }
    );
  }
}
