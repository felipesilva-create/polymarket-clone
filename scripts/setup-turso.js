const { createClient } = require("@libsql/client");

const client = createClient({
  url: "libsql://polyclone-silvalipe777.aws-ap-northeast-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk0MzM5MzYsImlkIjoiMWIzNGMyZGUtZDA3ZC00ZWMwLTkyMWUtOTU1ZTdiN2Y1NDVhIiwicmlkIjoiZmY1OGNkMGEtNzM0YS00ZDNhLThhNGMtODYzODdhZmU1OTc0In0.-TfOLZmLIvWPalP0XMYpwZt5MhmbeO0TWJp7Z0cCnlQS1W2rwVnkOGVyX9IPFW6943JvmYY6kSBT_suubLL9DQ",
});

async function setup() {
  console.log("Criando tabelas no Turso...");

  const statements = [
    // User table
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT,
      "email" TEXT UNIQUE,
      "emailVerified" TEXT,
      "image" TEXT,
      "password" TEXT,
      "balance" REAL NOT NULL DEFAULT 1000,
      "initialBalance" REAL NOT NULL DEFAULT 1000,
      "totalPnL" REAL NOT NULL DEFAULT 0,
      "totalWins" INTEGER NOT NULL DEFAULT 0,
      "totalLosses" INTEGER NOT NULL DEFAULT 0,
      "winRate" REAL NOT NULL DEFAULT 0,
      "rank" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // Account table
    `CREATE TABLE IF NOT EXISTS "Account" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token" TEXT,
      "access_token" TEXT,
      "expires_at" INTEGER,
      "token_type" TEXT,
      "scope" TEXT,
      "id_token" TEXT,
      "session_state" TEXT,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,

    // Session table
    `CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionToken" TEXT NOT NULL UNIQUE,
      "userId" TEXT NOT NULL,
      "expires" TEXT NOT NULL,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,

    // VerificationToken table
    `CREATE TABLE IF NOT EXISTS "VerificationToken" (
      "identifier" TEXT NOT NULL,
      "token" TEXT NOT NULL UNIQUE,
      "expires" TEXT NOT NULL
    )`,

    // Position table
    `CREATE TABLE IF NOT EXISTS "Position" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "marketId" TEXT NOT NULL,
      "marketQuestion" TEXT NOT NULL,
      "outcome" TEXT NOT NULL,
      "shares" REAL NOT NULL,
      "avgPrice" REAL NOT NULL,
      "currentPrice" REAL NOT NULL,
      "totalInvested" REAL NOT NULL,
      "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,

    // Trade table
    `CREATE TABLE IF NOT EXISTS "Trade" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "marketId" TEXT NOT NULL,
      "marketQuestion" TEXT NOT NULL,
      "outcome" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "shares" REAL NOT NULL,
      "price" REAL NOT NULL,
      "total" REAL NOT NULL,
      "pnl" REAL,
      "resolved" INTEGER NOT NULL DEFAULT 0,
      "won" INTEGER,
      "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
    )`,

    // Indexes
    `CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Position_userId_marketId_outcome_key" ON "Position"("userId", "marketId", "outcome")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token")`,
  ];

  for (const sql of statements) {
    try {
      await client.execute(sql);
      console.log("✓ Executado com sucesso");
    } catch (err) {
      console.error("Erro:", err.message);
    }
  }

  console.log("\n✅ Setup concluido!");
}

setup().catch(console.error);
