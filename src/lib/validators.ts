import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  inviteCode: z.string().min(4),
});

export const tradeSchema = z.object({
  instrument: z.string().min(1),
  marketType: z.enum(["OPTIONS", "FUTURES", "EQUITY", "CRYPTO", "FOREX"]),
  direction: z.enum(["LONG", "SHORT"]),
  entryPrice: z.coerce.number().positive(),
  exitPrice: z.coerce.number().positive(),
  quantity: z.coerce.number().positive(),
  stopLoss: z.coerce.number().positive().optional().nullable(),
  target: z.coerce.number().positive().optional().nullable(),
  riskReward: z.coerce.number().optional().nullable(),
  brokerageCharges: z.coerce.number().min(0).default(0),
  setupType: z.string().optional().nullable(),
  timeframe: z.string().optional().nullable(),
  strategy: z.string().optional().nullable(),
  confidence: z.coerce.number().int().min(1).max(10).optional().nullable(),
  executionRating: z.coerce.number().int().min(1).max(10).optional().nullable(),
  tradedAt: z.string(),
  notes: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  psychology: z
    .object({
      moodBefore: z.coerce.number().int().min(1).max(10).optional().nullable(),
      energyBefore: z.coerce.number().int().min(1).max(10).optional().nullable(),
      confidenceBefore: z.coerce.number().int().min(1).max(10).optional().nullable(),
      sleepQuality: z.coerce.number().int().min(1).max(10).optional().nullable(),
      emotionalAfter: z.string().optional().nullable(),
      followedRules: z.boolean().optional().nullable(),
      mistake: z.string().optional().nullable(),
    })
    .optional(),
});

export const dailyLogSchema = z.object({
  date: z.string(),
  wakeUpTime: z.string().optional().nullable(),
  gym: z.boolean().default(false),
  meditation: z.boolean().default(false),
  reading: z.boolean().default(false),
  deepWorkMinutes: z.coerce.number().int().min(0).optional().nullable(),
  screenTimeMinutes: z.coerce.number().int().min(0).optional().nullable(),
  wentWell: z.string().optional().nullable(),
  wentWrong: z.string().optional().nullable(),
  marketObservations: z.string().optional().nullable(),
  lessonsLearned: z.string().optional().nullable(),
  journalCompleted: z.boolean().default(true),
});

export const goalSchema = z.object({
  type: z.enum(["TRADING", "PERSONAL"]),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  targetMetric: z.string().optional().nullable(),
  targetValue: z.coerce.number().optional().nullable(),
  currentValue: z.coerce.number().optional().nullable(),
  period: z.string().optional().nullable(),
  active: z.boolean().default(true),
});
