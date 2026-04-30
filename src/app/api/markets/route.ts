import { NextResponse } from "next/server";
import { cameras, generateOdds, generateVolume } from "@/data/cameras";
import { resolveCameraIds } from "@/lib/cameraResolver";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  try {
    const now = new Date();

    // Resolve IDs em paralelo pra todas as cameras (com cache de 30min)
    const camerasWithIds = await Promise.all(
      cameras.map(async (cam) => {
        const ids = await resolveCameraIds(cam.fallbackIds, cam.worldCamsUrl);
        return {
          ...cam,
          resolvedIds: ids.length > 0 ? ids : cam.fallbackIds,
        };
      })
    );

    const markets: any[] = [];

    for (const cam of camerasWithIds) {
      // ID primario = primeiro da lista resolvida
      const primaryId = cam.resolvedIds[0];

      for (const market of cam.markets) {
        const odds = generateOdds(market.baseOdds);
        const durationMs = parseDuration(market.duration);
        const endDate = new Date(now.getTime() + durationMs);

        markets.push({
          id: market.id,
          question: market.question,
          description: `${cam.description} | ${cam.location}`,
          slug: market.id,
          category: cam.category,
          conditionId: market.id,
          outcomes: market.outcomes,
          outcomePrices: odds,
          volume: generateVolume(market.volume),
          liquidity: generateVolume(market.liquidity),
          active: true,
          closed: false,
          endDate: endDate.toISOString(),
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          // Camera data
          cameraId: cam.id,
          cameraName: cam.name,
          cameraLocation: cam.location,
          cameraCountry: cam.country,
          youtubeId: primaryId,
          youtubeIds: cam.resolvedIds, // todos os IDs (pra fallback no client)
          thumbnail: `https://img.youtube.com/vi/${primaryId}/hqdefault.jpg`,
          duration: market.duration,
        });
      }
    }

    // Filtrar por busca
    let filtered = markets;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.question.toLowerCase().includes(q) ||
          m.cameraName.toLowerCase().includes(q) ||
          m.cameraLocation.toLowerCase().includes(q)
      );
    }

    // Filtrar por categoria
    if (category && category !== "all") {
      filtered = filtered.filter((m) => m.category === category);
    }

    // Ordenar por volume
    filtered.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch camera markets" },
      { status: 500 }
    );
  }
}

function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)(s|min|m|h)/);
  if (!match) return 60000;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "min":
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      return 60000;
  }
}
