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
}

export interface MarketResponse {
  markets: Market[];
  total: number;
}

export type Category =
  | "all"
  | "politics"
  | "crypto"
  | "sports"
  | "pop-culture"
  | "business"
  | "science";

export interface FilterOptions {
  category: Category;
  sortBy: "volume" | "liquidity" | "endDate" | "newest";
  activeOnly: boolean;
}
