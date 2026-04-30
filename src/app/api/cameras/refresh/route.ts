import { NextResponse } from "next/server";
import { cameras } from "@/data/cameras";
import {
  fetchWorldCamsIds,
  clearCache,
  getCacheStats,
} from "@/lib/cameraResolver";

export const dynamic = "force-dynamic";

// Forca refresh de todos os IDs de camera (limpa cache + re-scrape)
export async function POST() {
  clearCache();

  const results: any[] = [];

  for (const cam of cameras) {
    if (!cam.worldCamsUrl) {
      results.push({
        camera: cam.id,
        status: "skipped",
        reason: "no worldCamsUrl",
      });
      continue;
    }

    const ids = await fetchWorldCamsIds(cam.worldCamsUrl);
    results.push({
      camera: cam.id,
      name: cam.name,
      url: cam.worldCamsUrl,
      foundIds: ids,
      count: ids.length,
      status: ids.length > 0 ? "ok" : "no-ids-found",
    });
  }

  return NextResponse.json({
    refreshed: true,
    timestamp: new Date().toISOString(),
    cameras: results,
    cacheStats: getCacheStats(),
  });
}

// GET retorna status do cache
export async function GET() {
  return NextResponse.json({
    cacheStats: getCacheStats(),
    cameras: cameras.map((c) => ({
      id: c.id,
      name: c.name,
      hasScrapeUrl: !!c.worldCamsUrl,
      fallbackIdsCount: c.fallbackIds.length,
    })),
  });
}
