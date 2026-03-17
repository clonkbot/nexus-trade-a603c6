import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("bots")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("bots") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const bot = await ctx.db.get(args.id);
    if (!bot || bot.userId !== userId) return null;
    return bot;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    strategy: v.string(),
    tradingPair: v.string(),
    initialCapital: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const botId = await ctx.db.insert("bots", {
      userId,
      name: args.name,
      strategy: args.strategy,
      tradingPair: args.tradingPair,
      status: "active",
      initialCapital: args.initialCapital,
      currentCapital: args.initialCapital,
      profitLoss: 0,
      profitLossPercent: 0,
      totalTrades: 0,
      winRate: 0,
      createdAt: Date.now(),
    });

    // Update portfolio
    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (portfolio) {
      await ctx.db.patch(portfolio._id, {
        activeBots: portfolio.activeBots + 1,
        totalValue: portfolio.totalValue + args.initialCapital,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("portfolios", {
        userId,
        totalValue: args.initialCapital,
        totalProfit: 0,
        totalProfitPercent: 0,
        activeBots: 1,
        updatedAt: Date.now(),
      });
    }

    return botId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("bots"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const bot = await ctx.db.get(args.id);
    if (!bot || bot.userId !== userId) throw new Error("Bot not found");

    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("bots") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const bot = await ctx.db.get(args.id);
    if (!bot || bot.userId !== userId) throw new Error("Bot not found");

    // Delete associated trades
    const trades = await ctx.db
      .query("trades")
      .withIndex("by_bot", (q) => q.eq("botId", args.id))
      .collect();

    for (const trade of trades) {
      await ctx.db.delete(trade._id);
    }

    // Update portfolio
    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (portfolio) {
      await ctx.db.patch(portfolio._id, {
        activeBots: Math.max(0, portfolio.activeBots - 1),
        totalValue: portfolio.totalValue - bot.currentCapital,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(args.id);
  },
});

// Simulate a trade (for demo purposes)
export const simulateTrade = mutation({
  args: { botId: v.id("bots") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const bot = await ctx.db.get(args.botId);
    if (!bot || bot.userId !== userId) throw new Error("Bot not found");
    if (bot.status !== "active") throw new Error("Bot is not active");

    // Simulate trade outcome
    const isWin = Math.random() > 0.45; // 55% win rate
    const tradeType = Math.random() > 0.5 ? "buy" : "sell";
    const basePrice = 42000 + Math.random() * 5000;
    const amount = 0.01 + Math.random() * 0.1;
    const profitPercent = isWin ? (Math.random() * 5) : -(Math.random() * 3);
    const profit = bot.currentCapital * (profitPercent / 100);

    await ctx.db.insert("trades", {
      botId: args.botId,
      userId,
      type: tradeType,
      pair: bot.tradingPair,
      price: basePrice,
      amount,
      total: basePrice * amount,
      profit,
      timestamp: Date.now(),
    });

    const newCapital = bot.currentCapital + profit;
    const newProfitLoss = newCapital - bot.initialCapital;
    const newProfitLossPercent = (newProfitLoss / bot.initialCapital) * 100;
    const newTotalTrades = bot.totalTrades + 1;
    const newWinRate = ((bot.winRate * bot.totalTrades) + (isWin ? 100 : 0)) / newTotalTrades;

    await ctx.db.patch(args.botId, {
      currentCapital: newCapital,
      profitLoss: newProfitLoss,
      profitLossPercent: newProfitLossPercent,
      totalTrades: newTotalTrades,
      winRate: newWinRate,
      lastTradeAt: Date.now(),
    });

    // Update portfolio
    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (portfolio) {
      const allBots = await ctx.db
        .query("bots")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const totalValue = allBots.reduce((sum, b) => sum + b.currentCapital, 0);
      const totalInitial = allBots.reduce((sum, b) => sum + b.initialCapital, 0);
      const totalProfit = totalValue - totalInitial;
      const totalProfitPercent = totalInitial > 0 ? (totalProfit / totalInitial) * 100 : 0;

      await ctx.db.patch(portfolio._id, {
        totalValue,
        totalProfit,
        totalProfitPercent,
        updatedAt: Date.now(),
      });
    }

    return { profit, isWin };
  },
});
