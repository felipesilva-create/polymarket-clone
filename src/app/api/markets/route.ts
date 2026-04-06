import { NextResponse } from "next/server";

const API_BASE_URL = "https://gamma-api.polymarket.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "200";
  const offset = searchParams.get("offset") || "0";

  try {
    const response = await fetch(
      `${API_BASE_URL}/markets?limit=500&offset=${offset}&active=true&closed=false`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Polymarket API");
    }

    const data = await response.json();
    const now = new Date();

    // Parse, filtrar mercados ativos e com data futura
    const parsedData = data
      .filter((m: any) => {
        // Filtrar mercados fechados
        if (m.closed) return false;

        // Filtrar mercados com data de encerramento no passado
        if (m.endDate) {
          const endDate = new Date(m.endDate);
          if (endDate < now) return false;
        }

        return true;
      })
      .map((market: any) => {
        let outcomes = ["Yes", "No"];
        let outcomePrices = ["0.5", "0.5"];

        try {
          if (typeof market.outcomes === "string") {
            outcomes = JSON.parse(market.outcomes);
          } else if (Array.isArray(market.outcomes)) {
            outcomes = market.outcomes;
          }
        } catch {
          outcomes = ["Yes", "No"];
        }

        try {
          if (typeof market.outcomePrices === "string") {
            outcomePrices = JSON.parse(market.outcomePrices);
          } else if (Array.isArray(market.outcomePrices)) {
            outcomePrices = market.outcomePrices;
          }
        } catch {
          outcomePrices = ["0.5", "0.5"];
        }

        // Normalizar categoria para lowercase
        const category = (market.category || "").toLowerCase();

        return {
          ...market,
          outcomes,
          outcomePrices,
          category,
        };
      })
      // Ordenar por volume (maior primeiro)
      .sort((a: any, b: any) => {
        const volA = parseFloat(a.volume || "0");
        const volB = parseFloat(b.volume || "0");
        return volB - volA;
      });

    console.log(`Fetched ${data.length} markets, filtered to ${parsedData.length} active markets`);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch markets" },
      { status: 500 }
    );
  }
}
