import { Direction } from "@/generated/prisma";

export type TradePnLInput = {
  direction: Direction;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  brokerageCharges: number;
};

export function calculatePnL(trade: TradePnLInput): number {
  const sign = trade.direction === Direction.LONG ? 1 : -1;
  const gross =
    (trade.exitPrice - trade.entryPrice) * trade.quantity * sign;
  return gross - trade.brokerageCharges;
}

export function calculateRiskReward(
  direction: Direction,
  entry: number,
  stopLoss: number | null | undefined,
  target: number | null | undefined
): number | null {
  if (!stopLoss || !target || entry === stopLoss) return null;
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(target - entry);
  if (risk === 0) return null;
  return Number((reward / risk).toFixed(4));
}

export function decimalToNumber(value: { toNumber?: () => number } | number): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value && value.toNumber) {
    return value.toNumber();
  }
  return Number(value);
}
