import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Bot configurations
  bots: defineTable({
    userId: v.id("users"),
    name: v.string(),
    strategy: v.string(), // "momentum", "mean_reversion", "grid", "dca"
    tradingPair: v.string(),
    status: v.string(), // "active", "paused", "stopped"
    initialCapital: v.number(),
    currentCapital: v.number(),
    profitLoss: v.number(),
    profitLossPercent: v.number(),
    totalTrades: v.number(),
    winRate: v.number(),
    createdAt: v.number(),
    lastTradeAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Trade history
  trades: defineTable({
    botId: v.id("bots"),
    userId: v.id("users"),
    type: v.string(), // "buy", "sell"
    pair: v.string(),
    price: v.number(),
    amount: v.number(),
    total: v.number(),
    profit: v.optional(v.number()),
    timestamp: v.number(),
  }).index("by_bot", ["botId"])
    .index("by_user", ["userId"]),

  // Market data snapshots
  marketData: defineTable({
    pair: v.string(),
    price: v.number(),
    change24h: v.number(),
    volume24h: v.number(),
    high24h: v.number(),
    low24h: v.number(),
    updatedAt: v.number(),
  }).index("by_pair", ["pair"]),

  // User portfolio
  portfolios: defineTable({
    userId: v.id("users"),
    totalValue: v.number(),
    totalProfit: v.number(),
    totalProfitPercent: v.number(),
    activeBots: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
