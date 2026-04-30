export interface CameraSource {
  id: string;
  name: string;
  location: string;
  country: string;
  category: string;
  // Multiplos IDs - sera tentado em ordem ate achar um que funcione
  fallbackIds: string[];
  // URL do worldcams.tv pra scrape automatico de IDs frescos
  worldCamsUrl?: string;
  description: string;
  markets: CameraMarket[];
}

export interface CameraMarket {
  id: string;
  question: string;
  outcomes: string[];
  baseOdds: [number, number];
  duration: string;
  volume: number;
  liquidity: number;
}

// IDs sao auto-atualizados via scraping de worldcams.tv (cache 30min)
// fallbackIds servem como backup se o scrape falhar
export const cameras: CameraSource[] = [
  {
    id: "times-square",
    name: "Times Square",
    location: "Nova York, EUA",
    country: "US",
    category: "cidade",
    fallbackIds: ["rnXIjl_Rzy4", "iiBTWU2FyFo", "a9J1OP_x5Rg", "4qyZLflp-sI", "nVsDt8AvfCU"],
    worldCamsUrl: "https://worldcams.tv/united-states/new-york/times-square",
    description: "Camera ao vivo de Times Square, o coracao de Manhattan",
    markets: [
      {
        id: "ts-taxi-30s",
        question: "Um taxi amarelo vai passar nos proximos 30 segundos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.85, 0.15],
        duration: "30s",
        volume: 125400,
        liquidity: 48200,
      },
      {
        id: "ts-pessoas-20",
        question: "Mais de 20 pessoas visiveis na tela agora?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.7, 0.3],
        duration: "1min",
        volume: 89300,
        liquidity: 32100,
      },
      {
        id: "ts-policia-5min",
        question: "Um carro de policia vai aparecer em 5 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.35, 0.65],
        duration: "5min",
        volume: 67800,
        liquidity: 25400,
      },
      {
        id: "ts-onibus",
        question: "Um onibus vai parar no ponto em 2 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.6, 0.4],
        duration: "2min",
        volume: 54300,
        liquidity: 21800,
      },
    ],
  },
  {
    id: "shibuya",
    name: "Shibuya Crossing",
    location: "Toquio, Japao",
    country: "JP",
    category: "cidade",
    fallbackIds: ["dfVK7ld38Ys", "8H3nRCFVR6Y", "3Q5wZeTuttw"],
    worldCamsUrl: "https://worldcams.tv/japan/tokyo/shibuya-crossing",
    description: "O cruzamento mais movimentado do mundo em Shibuya",
    markets: [
      {
        id: "sb-sinal-verde",
        question: "O sinal vai abrir pra pedestres em 30 segundos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.45, 0.55],
        duration: "30s",
        volume: 156200,
        liquidity: 62300,
      },
      {
        id: "sb-guarda-chuva",
        question: "Alguem com guarda-chuva vai aparecer em 1 minuto?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.4, 0.6],
        duration: "1min",
        volume: 43200,
        liquidity: 18700,
      },
      {
        id: "sb-100-pessoas",
        question: "Mais de 100 pessoas vao cruzar na proxima abertura?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.6, 0.4],
        duration: "5min",
        volume: 201500,
        liquidity: 87600,
      },
      {
        id: "sb-delivery",
        question: "Uma moto de delivery vai cruzar em 1 minuto?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.55, 0.45],
        duration: "1min",
        volume: 38700,
        liquidity: 15400,
      },
    ],
  },
  {
    id: "jackson-hole",
    name: "Jackson Hole Town Square",
    location: "Wyoming, EUA",
    country: "US",
    category: "natureza",
    fallbackIds: ["1EiC9bvVGnk", "DoUOrTJbIu4", "B_waF26In9o"],
    worldCamsUrl: "https://worldcams.tv/united-states/jackson-hole/town-square",
    description: "Praca central de Jackson Hole com os famosos arcos de chifre de alce",
    markets: [
      {
        id: "jh-animal",
        question: "Um animal vai aparecer na praca em 10 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.2, 0.8],
        duration: "10min",
        volume: 34500,
        liquidity: 12800,
      },
      {
        id: "jh-bicicleta",
        question: "Alguem de bicicleta vai passar em 5 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.3, 0.7],
        duration: "5min",
        volume: 28900,
        liquidity: 11200,
      },
      {
        id: "jh-turista-foto",
        question: "Um turista vai parar pra tirar foto no arco em 3 min?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.65, 0.35],
        duration: "3min",
        volume: 45600,
        liquidity: 18900,
      },
    ],
  },
  {
    id: "venice-beach",
    name: "Venice Beach Boardwalk",
    location: "Los Angeles, EUA",
    country: "US",
    category: "praia",
    fallbackIds: ["EO_1LWqsCNE"],
    worldCamsUrl: "https://worldcams.tv/united-states/santa-monica/venice-beach",
    description: "O famoso calcadao de Venice Beach em LA",
    markets: [
      {
        id: "vb-skate",
        question: "Alguem de skate vai aparecer em 2 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.65, 0.35],
        duration: "2min",
        volume: 78400,
        liquidity: 31200,
      },
      {
        id: "vb-cachorro",
        question: "Um cachorro vai aparecer em 5 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.5, 0.5],
        duration: "5min",
        volume: 45600,
        liquidity: 19800,
      },
      {
        id: "vb-correndo",
        question: "Alguem correndo vai passar pela camera em 1 min?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.55, 0.45],
        duration: "1min",
        volume: 34200,
        liquidity: 14500,
      },
    ],
  },
  {
    id: "copacabana",
    name: "Praia de Copacabana",
    location: "Rio de Janeiro, Brasil",
    country: "BR",
    category: "praia",
    fallbackIds: ["kxD9qBk6WQ8", "VXLKruYjJec"],
    worldCamsUrl: "https://worldcams.tv/brazil/rio-de-janeiro/copacabana",
    description: "Vista aerea da praia de Copacabana no Rio de Janeiro",
    markets: [
      {
        id: "copa-onda",
        question: "Uma onda grande vai quebrar em 1 minuto?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.6, 0.4],
        duration: "1min",
        volume: 112300,
        liquidity: 45600,
      },
      {
        id: "copa-vendedor",
        question: "Um vendedor ambulante vai aparecer em 3 min?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.7, 0.3],
        duration: "3min",
        volume: 56700,
        liquidity: 22300,
      },
      {
        id: "copa-futebol",
        question: "Alguem jogando futebol na areia agora?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.55, 0.45],
        duration: "1min",
        volume: 89400,
        liquidity: 37800,
      },
      {
        id: "copa-barco",
        question: "Um barco vai aparecer no horizonte em 5 min?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.35, 0.65],
        duration: "5min",
        volume: 42300,
        liquidity: 17800,
      },
    ],
  },
  {
    id: "iss",
    name: "Estacao Espacial Internacional",
    location: "Orbita da Terra",
    country: "SPACE",
    category: "espaco",
    fallbackIds: ["zPH5KtjJFaQ", "86YLFOog4GM", "P9C25Un7xaM", "DIgkvm2nmHc"],
    worldCamsUrl: "https://earthlive24.com/camera/cam_037",
    description: "Vista ao vivo da Terra direto da ISS (NASA)",
    markets: [
      {
        id: "iss-noite",
        question: "A ISS vai estar no lado noturno da Terra agora?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.5, 0.5],
        duration: "1min",
        volume: 234500,
        liquidity: 98700,
      },
      {
        id: "iss-relampago",
        question: "Um relampago vai ser visivel em 10 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.25, 0.75],
        duration: "10min",
        volume: 67800,
        liquidity: 28900,
      },
      {
        id: "iss-aurora",
        question: "Uma aurora vai ser visivel na proxima orbita?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.3, 0.7],
        duration: "15min",
        volume: 145600,
        liquidity: 62300,
      },
    ],
  },
  {
    id: "amsterdam",
    name: "Dam Square",
    location: "Amsterdam, Holanda",
    country: "NL",
    category: "cidade",
    fallbackIds: ["R3YNscjcJOk", "5aJr16ylrmQ"],
    worldCamsUrl: "https://earthlive24.com/camera/cam_003",
    description: "A praca principal de Amsterdam ao vivo",
    markets: [
      {
        id: "dam-bike",
        question: "Mais de 5 bicicletas vao passar em 1 minuto?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.8, 0.2],
        duration: "1min",
        volume: 98700,
        liquidity: 41200,
      },
      {
        id: "dam-tram",
        question: "Um tram vai aparecer em 3 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.55, 0.45],
        duration: "3min",
        volume: 54300,
        liquidity: 21800,
      },
    ],
  },
  {
    id: "pinguins",
    name: "Pinguins ao Vivo",
    location: "Aquario / Zoo",
    country: "US",
    category: "natureza",
    fallbackIds: ["JJqXeRFsLjE"],
    description: "Camera ao vivo mostrando pinguins",
    markets: [
      {
        id: "ping-mergulho",
        question: "Um pinguim vai mergulhar na agua em 2 min?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.5, 0.5],
        duration: "2min",
        volume: 87600,
        liquidity: 35400,
      },
      {
        id: "ping-grupo",
        question: "Mais de 5 pinguins visiveis na camera agora?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.65, 0.35],
        duration: "1min",
        volume: 56300,
        liquidity: 22100,
      },
    ],
  },
  {
    id: "safari-africa",
    name: "Safari Africa",
    location: "Africa do Sul",
    country: "ZA",
    category: "natureza",
    fallbackIds: ["9VsZidtoO54", "ydYDqZQpim8"],
    worldCamsUrl: "https://earthlive24.com/camera/cam_041",
    description: "Camera ao vivo em reserva de vida selvagem",
    markets: [
      {
        id: "safari-animal",
        question: "Um animal selvagem vai aparecer em 10 min?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.45, 0.55],
        duration: "10min",
        volume: 167800,
        liquidity: 72300,
      },
      {
        id: "safari-passaro",
        question: "Um passaro vai voar pela camera em 5 min?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.6, 0.4],
        duration: "5min",
        volume: 34500,
        liquidity: 14200,
      },
      {
        id: "safari-elefante",
        question: "Um elefante vai aparecer em 30 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.2, 0.8],
        duration: "30min",
        volume: 198700,
        liquidity: 84500,
      },
    ],
  },
  {
    id: "koh-samui",
    name: "Koh Samui Beach",
    location: "Tailandia",
    country: "TH",
    category: "praia",
    fallbackIds: ["JooOzEUSPzY"],
    description: "Praia paradisiaca de Koh Samui na Tailandia",
    markets: [
      {
        id: "ks-barco",
        question: "Um barco vai aparecer no mar em 5 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.4, 0.6],
        duration: "5min",
        volume: 45600,
        liquidity: 18900,
      },
      {
        id: "ks-nadando",
        question: "Alguem vai entrar na agua em 3 minutos?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.5, 0.5],
        duration: "3min",
        volume: 67800,
        liquidity: 28400,
      },
    ],
  },
  {
    id: "windmills",
    name: "Moinhos de Vento",
    location: "Zaanse Schans, Holanda",
    country: "NL",
    category: "natureza",
    fallbackIds: ["FRIIwsXwyJw"],
    description: "Os famosos moinhos de vento holandeses ao vivo",
    markets: [
      {
        id: "wm-girando",
        question: "Os moinhos estao girando agora?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.6, 0.4],
        duration: "1min",
        volume: 34500,
        liquidity: 14200,
      },
      {
        id: "wm-barco-canal",
        question: "Um barco vai passar no canal em 5 min?",
        outcomes: ["Sim", "Nao"],
        baseOdds: [0.45, 0.55],
        duration: "5min",
        volume: 28900,
        liquidity: 11800,
      },
    ],
  },
];

// Helper: gera variacao de preco simulando mercado real
export function generateOdds(baseOdds: [number, number]): [string, string] {
  const variation = (Math.random() - 0.5) * 0.12;
  let yes = Math.max(0.05, Math.min(0.95, baseOdds[0] + variation));
  let no = 1 - yes;
  return [yes.toFixed(4), no.toFixed(4)];
}

// Helper: gera volume com variacao
export function generateVolume(base: number): string {
  const variation = 1 + (Math.random() - 0.5) * 0.3;
  return Math.floor(base * variation).toString();
}
