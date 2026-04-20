# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a National Accounts Dashboard — a full-stack economic data visualization app.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (available but not used — data is in-memory mock)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4
- **Charts**: Recharts
- **Data tables**: @tanstack/react-table
- **CSV export**: react-csv

## Artifacts

### National Accounts Dashboard (`artifacts/national-accounts`)
- **Preview path**: `/`
- **Purpose**: Interactive economic indicators dashboard (GDP, GNP, NDP, Inflation, Unemployment)
- **Features**: KPI cards, GDP trend chart, sector pie chart, inflation/unemployment bar chart, year range filters, data table, dark/light mode, CSV export, PDF export

### API Server (`artifacts/api-server`)
- **Preview path**: `/api`
- **Routes**:
  - `GET /api/economic-data` — all economic records, filterable by startYear/endYear
  - `GET /api/economic-data/summary` — latest year KPI summary with changes
  - `GET /api/economic-data/sectors` — sector breakdown (Agriculture/Industry/Services)
  - `GET /api/economic-data/trends` — all trend data for charts
  - `GET /api/healthz` — health check

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/national-accounts run dev` — run dashboard frontend locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
