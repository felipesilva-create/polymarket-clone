export interface Market {
  id: string;
  question: string;
  description: string;
  slug: string;
  category: string;
  conditionId: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  liquidity: string;
  active: boolean;
  closed: boolean;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
  icon?: string;
  // Camera fields
  cameraId?: string;
  cameraName?: string;
  cameraLocation?: string;
  cameraCountry?: string;
  youtubeId?: string;
  youtubeIds?: string[];
  thumbnail?: string;
  duration?: string;
}

export interface MarketResponse {
  markets: Market[];
  total: number;
}

export type Category =
  | "all"
  | "cidade"
  | "praia"
  | "natureza"
  | "espaco"
  | "transito";

export interface FilterOptions {
  category: Category;
  sortBy: "volume" | "liquidity" | "endDate" | "newest";
  activeOnly: boolean;
}
