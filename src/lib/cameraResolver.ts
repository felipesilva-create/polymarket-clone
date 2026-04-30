// Resolver que busca IDs de YouTube ao vivo direto do worldcams.tv
// IDs do YouTube quebram quando a live acaba, entao precisamos atualizar dinamicamente

interface CacheEntry {
  ids: string[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const YT_ID_PATTERNS = [
  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g,
  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g,
  /youtu\.be\/([a-zA-Z0-9_-]{11})/g,
  /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g,
];

/**
 * Faz scrape de uma pagina do worldcams.tv e extrai todos os IDs de YouTube
 */
export async function fetchWorldCamsIds(url: string): Promise<string[]> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.ids;
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      console.warn(`fetchWorldCamsIds: ${url} returned ${res.status}`);
      return cached?.ids || [];
    }

    const html = await res.text();
    const ids = new Set<string>();

    for (const pattern of YT_ID_PATTERNS) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(html)) !== null) {
        const id = match[1];
        // Filtrar IDs que parecem placeholder ou genericos
        if (id && id !== "videoseries" && !id.startsWith("PL")) {
          ids.add(id);
        }
      }
    }

    const result = Array.from(ids);
    cache.set(url, { ids: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error(`fetchWorldCamsIds error for ${url}:`, error);
    return cached?.ids || [];
  }
}

/**
 * Verifica se um video do YouTube existe usando o oembed (publico, sem chave)
 */
export async function verifyYoutubeId(id: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      {
        headers: { "User-Agent": USER_AGENT },
        next: { revalidate: 600 },
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Resolve os IDs de uma camera: tenta scraping, com fallback pros IDs hardcoded
 */
export async function resolveCameraIds(
  fallbackIds: string[],
  worldCamsUrl?: string
): Promise<string[]> {
  if (!worldCamsUrl) return fallbackIds;

  const scraped = await fetchWorldCamsIds(worldCamsUrl);

  // Combina: prioriza scraped, mas mantem fallbacks que nao apareceram
  const combined = new Set([...scraped, ...fallbackIds]);
  return Array.from(combined);
}

/**
 * Limpa o cache (util pro endpoint de refresh manual)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Estatisticas do cache (util pra debug)
 */
export function getCacheStats() {
  const now = Date.now();
  return Array.from(cache.entries()).map(([url, entry]) => ({
    url,
    idsCount: entry.ids.length,
    ageMinutes: Math.floor((now - entry.timestamp) / 60000),
  }));
}
