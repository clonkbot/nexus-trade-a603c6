import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const portfolio = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return portfolio || {
      totalValue: 0,
      totalProfit: 0,
      totalProfitPercent: 0,
      activeBots: 0,
    };
  },
});
