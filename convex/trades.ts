import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByBot = query({
  args: { botId: v.id("bots") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("trades")
      .withIndex("by_bot", (q) => q.eq("botId", args.botId))
      .order("desc")
      .take(50);
  },
});

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("trades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const trades = await ctx.db
      .query("trades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        avgProfit: 0,
        bestTrade: 0,
        worstTrade: 0,
      };
    }

    const profits = trades.map((t) => t.profit || 0);
    const winningTrades = profits.filter((p) => p > 0).length;
    const losingTrades = profits.filter((p) => p < 0).length;
    const totalProfit = profits.reduce((sum, p) => sum + p, 0);

    return {
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      totalProfit,
      avgProfit: totalProfit / trades.length,
      bestTrade: Math.max(...profits),
      worstTrade: Math.min(...profits),
    };
  },
});
