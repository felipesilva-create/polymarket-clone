import { Market } from "@/types/market";

export async function getMarkets(limit = 50, offset = 0): Promise<Market[]> {
  try {
    const response = await fetch(
      `/api/markets?limit=${limit}&offset=${offset}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch markets");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching markets:", error);
    return [];
  }
}

export async function getMarketBySlug(slug: string): Promise<Market | null> {
  try {
    const response = await fetch(`/api/markets?slug=${slug}`);

    if (!response.ok) {
      throw new Error("Failed to fetch market");
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error("Error fetching market:", error);
    return null;
  }
}

export async function searchMarkets(query: string): Promise<Market[]> {
  try {
    const response = await fetch(`/api/markets?search=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error("Failed to search markets");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching markets:", error);
    return [];
  }
}

export function formatVolume(volume: string | number): string {
  const num = typeof volume === "string" ? parseFloat(volume) : volume;

  if (isNaN(num)) return "$0";

  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}K`;
  }
  return `$${num.toFixed(0)}`;
}

export function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "0%";
  return `${(num * 100).toFixed(0)}%`;
}

export function getOutcomeColor(index: number): string {
  const colors = [
    "bg-green-500",
    "bg-red-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
  ];
  return colors[index % colors.length];
}
