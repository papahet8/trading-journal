import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { prisma } from "@/lib/db";
import { calculatePnL, decimalToNumber } from "@/lib/trade";
import type { Trade, TradePsychology, Tag, TradeTag } from "@/generated/prisma";

export type TradeWithPnL = Trade & {
  pnl: number;
  psychology?: TradePsychology | null;
  tags?: (TradeTag & { tag: Tag })[];
};

function enrichTrades(trades: Trade[]): TradeWithPnL[] {
  return trades.map((t) => ({
    ...t,
    pnl: calculatePnL({
      direction: t.direction,
      entryPrice: decimalToNumber(t.entryPrice),
      exitPrice: decimalToNumber(t.exitPrice),
      quantity: decimalToNumber(t.quantity),
      brokerageCharges: decimalToNumber(t.brokerageCharges),
    }),
  }));
}

export async function getUserTrades(userId: string, from?: Date, to?: Date) {
  const trades = await prisma.trade.findMany({
    where: {
      userId,
      ...(from || to
        ? {
            tradedAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    include: { tags: { include: { tag: true } }, psychology: true },
    orderBy: { tradedAt: "asc" },
  });
  return enrichTrades(trades);
}

export function getPeriodPnL(trades: TradeWithPnL[], from: Date, to: Date) {
  return trades
    .filter((t) => t.tradedAt >= from && t.tradedAt <= to)
    .reduce((sum, t) => sum + t.pnl, 0);
}

export function getWinRate(trades: TradeWithPnL[]) {
  if (trades.length === 0) return 0;
  const wins = trades.filter((t) => t.pnl > 0).length;
  return wins / trades.length;
}

export function getProfitFactor(trades: TradeWithPnL[]) {
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(
    trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0)
  );
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

export function getAverageRR(trades: TradeWithPnL[]) {
  const withRR = trades.filter((t) => t.riskReward != null);
  if (withRR.length === 0) return 0;
  return (
    withRR.reduce((s, t) => s + decimalToNumber(t.riskReward!), 0) / withRR.length
  );
}

export function getMaxDrawdown(trades: TradeWithPnL[]) {
  let peak = 0;
  let equity = 0;
  let maxDd = 0;
  for (const t of trades) {
    equity += t.pnl;
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDd) maxDd = dd;
  }
  return maxDd;
}

export function getEquityCurve(trades: TradeWithPnL[]) {
  let cumulative = 0;
  return trades.map((t) => {
    cumulative += t.pnl;
    return {
      date: format(t.tradedAt, "yyyy-MM-dd"),
      pnl: t.pnl,
      equity: cumulative,
    };
  });
}

export function getDailyPnLMap(trades: TradeWithPnL[]) {
  const map = new Map<string, number>();
  for (const t of trades) {
    const key = format(t.tradedAt, "yyyy-MM-dd");
    map.set(key, (map.get(key) ?? 0) + t.pnl);
  }
  return map;
}

export function getHeatmapData(trades: TradeWithPnL[], year: number) {
  const daily = getDailyPnLMap(trades);
  const data: { date: string; value: number; level: number }[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = format(d, "yyyy-MM-dd");
    const pnl = daily.get(key);
    let level = 0;
    if (pnl !== undefined) {
      if (pnl > 0) level = 1;
      else if (pnl < 0) level = -1;
      else level = 0.5;
    }
    data.push({ date: key, value: pnl ?? 0, level });
  }
  return data;
}

export function getSetupStats(trades: TradeWithPnL[]) {
  const groups = new Map<string, TradeWithPnL[]>();
  for (const t of trades) {
    const key = t.setupType || t.strategy || "Unspecified";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return Array.from(groups.entries()).map(([name, list]) => ({
    name,
    count: list.length,
    winRate: getWinRate(list),
    avgRR: getAverageRR(list),
    totalPnL: list.reduce((s, t) => s + t.pnl, 0),
  }));
}

export function getWeekdayPerformance(trades: TradeWithPnL[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const groups = new Map<number, TradeWithPnL[]>();
  for (const t of trades) {
    const d = getDay(t.tradedAt);
    if (!groups.has(d)) groups.set(d, []);
    groups.get(d)!.push(t);
  }
  return days.map((name, i) => {
    const list = groups.get(i) ?? [];
    return {
      day: name,
      count: list.length,
      totalPnL: list.reduce((s, t) => s + t.pnl, 0),
      winRate: getWinRate(list),
    };
  });
}

export async function getTagStats(userId: string) {
  const tradeTags = await prisma.tradeTag.findMany({
    where: { trade: { userId } },
    include: {
      tag: true,
      trade: true,
    },
  });
  const groups = new Map<string, { tag: string; trades: TradeWithPnL[] }>();
  for (const tt of tradeTags) {
    const pnl = calculatePnL({
      direction: tt.trade.direction,
      entryPrice: decimalToNumber(tt.trade.entryPrice),
      exitPrice: decimalToNumber(tt.trade.exitPrice),
      quantity: decimalToNumber(tt.trade.quantity),
      brokerageCharges: decimalToNumber(tt.trade.brokerageCharges),
    });
    const enriched = { ...tt.trade, pnl } as TradeWithPnL;
    if (!groups.has(tt.tagId)) {
      groups.set(tt.tagId, { tag: tt.tag.name, trades: [] });
    }
    groups.get(tt.tagId)!.trades.push(enriched);
  }
  return Array.from(groups.values()).map((g) => ({
    tag: g.tag,
    count: g.trades.length,
    winRate: getWinRate(g.trades),
    totalPnL: g.trades.reduce((s, t) => s + t.pnl, 0),
  }));
}

export async function getCorrelations(userId: string) {
  const logs = await prisma.dailyLog.findMany({ where: { userId } });
  const trades = await getUserTrades(userId);
  const dailyPnL = getDailyPnLMap(trades);

  const points: {
    date: string;
    sleepQuality?: number;
    gym: boolean;
    pnl: number;
    tradeCount: number;
  }[] = [];

  for (const log of logs) {
    const key = format(log.date, "yyyy-MM-dd");
    const dayTrades = trades.filter((t) => format(t.tradedAt, "yyyy-MM-dd") === key);
    const avgSleep =
      dayTrades.length > 0
        ? dayTrades.reduce((s, t) => s + (t.psychology?.sleepQuality ?? 0), 0) /
          dayTrades.length
        : undefined;
    points.push({
      date: key,
      sleepQuality: avgSleep,
      gym: log.gym,
      pnl: dailyPnL.get(key) ?? 0,
      tradeCount: dayTrades.length,
    });
  }

  const gymDays = points.filter((p) => p.gym);
  const noGymDays = points.filter((p) => !p.gym);
  const avgGymPnL =
    gymDays.length > 0 ? gymDays.reduce((s, p) => s + p.pnl, 0) / gymDays.length : 0;
  const avgNoGymPnL =
    noGymDays.length > 0
      ? noGymDays.reduce((s, p) => s + p.pnl, 0) / noGymDays.length
      : 0;

  return { points, avgGymPnL, avgNoGymPnL };
}

export async function getDashboardStats(userId: string) {
  const now = new Date();
  const trades = await getUserTrades(userId);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const dailyPnL = getPeriodPnL(trades, todayStart, todayEnd);
  const weeklyPnL = getPeriodPnL(trades, weekStart, weekEnd);
  const monthlyPnL = getPeriodPnL(trades, monthStart, monthEnd);

  return {
    dailyPnL,
    weeklyPnL,
    monthlyPnL,
    winRate: getWinRate(trades),
    profitFactor: getProfitFactor(trades),
    maxDrawdown: getMaxDrawdown(trades),
    avgRR: getAverageRR(trades),
    totalTrades: trades.length,
    equityCurve: getEquityCurve(trades),
    heatmap: getHeatmapData(trades, now.getFullYear()),
  };
}

export async function computeDisciplineScore(userId: string, date: Date) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const trades = await prisma.trade.findMany({
    where: { userId, tradedAt: { gte: dayStart, lte: dayEnd } },
    include: { tags: { include: { tag: true } }, psychology: true },
  });
  const log = await prisma.dailyLog.findUnique({
    where: { userId_date: { userId, date: dayStart } },
  });

  let score = 0;
  const breakdown: Record<string, boolean> = {};

  breakdown.journalCompleted = log?.journalCompleted ?? false;
  if (breakdown.journalCompleted) score += 25;

  breakdown.withinTradeLimit = trades.length <= 2;
  if (breakdown.withinTradeLimit) score += 25;

  const revengeTags = ["Revenge trade", "Overtrading", "FOMO"];
  const hasBadTag = trades.some((t) =>
    t.tags.some((tt) => revengeTags.includes(tt.tag.name))
  );
  breakdown.noRevengeTrading = !hasBadTag;
  if (breakdown.noRevengeTrading) score += 25;

  const followedRules =
    trades.length === 0 ||
    trades.every((t) => t.psychology?.followedRules !== false);
  breakdown.followedRules = followedRules;
  if (breakdown.followedRules) score += 25;

  return { score, breakdown };
}

export async function saveDisciplineScore(userId: string, date: Date) {
  const { score, breakdown } = await computeDisciplineScore(userId, date);
  const dayStart = startOfDay(date);
  await prisma.disciplineScore.upsert({
    where: { userId_date: { userId, date: dayStart } },
    create: { userId, date: dayStart, score, breakdown },
    update: { score, breakdown },
  });
  return { score, breakdown };
}

export async function getStreaks(userId: string) {
  const scores = await prisma.disciplineScore.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 365,
  });

  let disciplineStreak = 0;
  for (const s of scores) {
    if (s.score >= 75) disciplineStreak++;
    else break;
  }

  const logs = await prisma.dailyLog.findMany({
    where: { userId, journalCompleted: true },
    orderBy: { date: "desc" },
    take: 365,
  });
  let journalStreak = 0;
  let expected = startOfDay(new Date());
  for (const log of logs) {
    const logDate = startOfDay(log.date);
    if (logDate.getTime() === expected.getTime()) {
      journalStreak++;
      expected = subDays(expected, 1);
    } else break;
  }

  return { disciplineStreak, journalStreak };
}
