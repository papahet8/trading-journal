# TradeJournal

Personal trading journal and dashboard: trades, psychology, habits, analytics, and gamification. Built with Next.js, Prisma, PostgreSQL (Neon), and Auth.js.

## Features

- **Trade logging** — instrument, market, direction, prices, risk/reward, tags, screenshots
- **Psychology** — pre/post trade mood, sleep, rules, mistakes
- **Daily journal** — reflections, market notes, routine tracking
- **Dashboard** — P&L cards, equity curve, GitHub-style heatmap, discipline score, streaks
- **Analytics** — setup performance, weekday stats, mistake tags, correlations
- **Goals** — trading and personal targets
- **Invite-only auth** — for you and a few friends

## P&L formula

```
(exitPrice - entryPrice) × quantity × directionSign − brokerageCharges
```

`directionSign`: +1 for LONG, −1 for SHORT

## Local setup

1. **Clone & install**

   ```bash
   cd trading-journal
   npm install
   ```

2. **Database** — create a free [Neon](https://neon.tech) Postgres database and copy the connection string.

3. **Environment**

   ```bash
   cp .env.example .env
   ```

   Set `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL=http://localhost:3000`.

4. **Migrate & seed**

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

5. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Default credentials (after seed)

- **Admin:** `admin@tradejournal.local` / `admin123456`
- **Invite codes:** `FRIEND-001` … `FRIEND-004`

## Deploy to Vercel + Neon

1. Push repo to GitHub.
2. Create Neon project → copy `DATABASE_URL`.
3. Import project in Vercel.
4. Set environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
   - `AUTH_URL` = `https://your-app.vercel.app`
   - `BLOB_READ_WRITE_TOKEN` (enable Blob in Vercel Storage)
5. Deploy — build runs `prisma generate`, `prisma migrate deploy`, and `next build`.
6. Run seed once locally against production DB or use Vercel CLI:

   ```bash
   DATABASE_URL="..." npm run db:seed
   ```

## Admin

- Sign in as admin → **Admin invites** in sidebar to generate codes.
- `POST /api/admin/invites` also creates codes programmatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply migrations (deploy) |
| `npm run db:seed` | Seed tags, admin, invite codes |
