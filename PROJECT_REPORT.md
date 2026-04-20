# National Accounts Explorer — Project Report

**Project Title:** National Accounts Explorer (EconDash)  
**Version:** 2.4.1 (Stable)  
**Date:** April 2026  
**Data Coverage:** 2015–2025  

---

## 1. Introduction

### 1.1 Project Overview

The **National Accounts Explorer** is a full-stack, interactive web application designed to visualize and analyze key macroeconomic indicators for a national economy. The application provides an intuitive dashboard interface that enables users to explore trends in Gross Domestic Product (GDP), Gross National Product (GNP), Net Domestic Product (NDP), Inflation Rate, and Unemployment Rate over an 11-year period (2015–2025).

### 1.2 Objectives

- **Primary Objective:** Build an interactive economic data visualization platform that presents national accounting data in an accessible, visually appealing manner.
- **Secondary Objectives:**
  - Enable comparative analysis of economic indicators across time periods
  - Provide sector-wise breakdown of GDP (Agriculture, Industry, Services)
  - Support data export capabilities (CSV) for further analysis
  - Implement a modern, responsive user interface with dark/light mode support

### 1.3 Scope

The project covers:
- A RESTful API server serving economic data
- A React-based single-page application (SPA) with 5 distinct views
- Interactive charts (area, bar, line, pie, composed) with filtering
- Sortable data tables with year-range filtering
- CSV export functionality for all data views
- Dark mode and user preference settings

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │         React SPA (Vite Dev Server :5173)       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐    │    │
│  │  │Dashboard │ │ Reports  │ │  Indicators  │    │    │
│  │  │  Page    │ │  Page    │ │    Page      │    │    │
│  │  └──────────┘ └──────────┘ └──────────────┘    │    │
│  │  ┌──────────┐ ┌──────────┐                      │    │
│  │  │ Regions  │ │ Settings │                      │    │
│  │  │  Page    │ │  Page    │                      │    │
│  │  └──────────┘ └──────────┘                      │    │
│  │           │                                      │    │
│  │   TanStack React Query (Data Fetching Layer)     │    │
│  └───────────┬─────────────────────────────────────┘    │
│              │  /api/* proxy                             │
└──────────────┼───────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────┐
│              Express API Server (:8080)                    │
│  ┌─────────────────────────────────────────────────┐     │
│  │  Routes                                          │     │
│  │  ├── GET /api/economic-data                     │     │
│  │  ├── GET /api/economic-data/summary             │     │
│  │  ├── GET /api/economic-data/sectors             │     │
│  │  ├── GET /api/economic-data/trends              │     │
│  │  └── GET /api/healthz                           │     │
│  └─────────────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────────────┐     │
│  │  In-Memory Data Store (Mock Economic Data)       │     │
│  └─────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Monorepo Manager | pnpm Workspaces | 10.x |
| Runtime | Node.js | 24.x |
| Language | TypeScript | 5.9 |
| Frontend Framework | React | 19.1 |
| Build Tool | Vite | 7.3 |
| CSS Framework | Tailwind CSS | 4.x |
| UI Library | Radix UI + shadcn/ui | Latest |
| Charting | Recharts | 2.15 |
| Data Tables | TanStack React Table | 8.21 |
| Data Fetching | TanStack React Query | 5.90 |
| Client Routing | Wouter | 3.3 |
| Backend Framework | Express | 5.x |
| Schema Validation | Zod | 3.25 |
| API Specification | OpenAPI 3.0 (YAML) | — |
| API Client Codegen | Orval | — |
| Server Bundler | esbuild | 0.27 |
| Logging | Pino + pino-pretty | 9.x / 13.x |

### 2.3 Monorepo Structure

The project uses a **pnpm workspace monorepo** with the following packages:

| Package | Path | Purpose |
|---------|------|---------|
| `@workspace/api-server` | `artifacts/api-server/` | Express REST API server |
| `@workspace/national-accounts` | `artifacts/national-accounts/` | React frontend dashboard |
| `@workspace/api-spec` | `lib/api-spec/` | OpenAPI specification + Orval codegen config |
| `@workspace/api-zod` | `lib/api-zod/` | Auto-generated Zod validation schemas |
| `@workspace/api-client-react` | `lib/api-client-react/` | Auto-generated React Query hooks |
| `@workspace/db` | `lib/db/` | Drizzle ORM database schema (available, not active) |
| `@workspace/scripts` | `scripts/` | Utility scripts |

---

## 3. Module Description

### 3.1 Frontend Modules

#### 3.1.1 Dashboard (`/`)
The main dashboard page is the primary view of the application. It includes:

- **5 KPI Cards**: Display the latest values for GDP, GNP, NDP, Inflation Rate, and Unemployment Rate. Each card shows the current value, year-over-year change (absolute), and a directional arrow indicator (green for improvement, red for deterioration).
- **GDP Growth Trend Chart**: An area chart showing GDP values from 2015–2025 with gradient fill, interactive tooltips, and custom legends.
- **Inflation vs Unemployment Chart**: A composed chart overlaying inflation as bar chart and unemployment as a line chart for direct comparison.
- **Sector Breakdown**: A donut/pie chart showing the GDP contribution split between Agriculture (~10%), Industry (~30%), and Services (~60%).
- **Economic History Table**: A fully sortable data table powered by TanStack React Table displaying all indicators for all years. Supports ascending/descending sort on every column.
- **Year Range Filters**: Start Year and End Year dropdown selectors that dynamically filter all charts and the data table via API query parameters.
- **CSV Export**: Download buttons on each chart card to export the underlying data as CSV files.

#### 3.1.2 Reports (`/reports`)
Provides pre-built report templates with CSV export:
- GDP Annual Summary
- National Accounts (GDP/GNP/NDP)
- Price & Labor Indicators
- Complete Dataset Export

Also displays **decade highlight cards**: Peak GDP Growth (5.95% in 2021), Worst Contraction (-2.77% in 2020), Peak Inflation (8.00% in 2022), and Lowest Unemployment (3.61% in 2022).

#### 3.1.3 Indicators (`/indicators`)
Individual trend charts for each key economic indicator:
- GDP Growth Rate (bar chart with color-coded positive/negative bars)
- Inflation Rate (line chart)
- Unemployment Rate (line chart)
- Net Domestic Product (line chart)
- Combined All-Indicators overlay (multi-line chart)

#### 3.1.4 Sector Analysis (`/regions`)
Deep dive into GDP sector composition:
- Year selector for sector breakdown
- 3 sector KPI cards (Agriculture, Industry, Services) with value and percentage
- Pie chart for selected year's sector share
- Line chart showing percentage share trends over the decade
- Stacked bar chart showing absolute sector values over time

#### 3.1.5 Settings (`/settings`)
User preference management:
- Dark/Light mode toggle (persisted to localStorage)
- Compact mode toggle
- Chart animations toggle
- Currency display preference (USD, EUR, GBP, JPY)
- Default year range selection
- Application version and metadata info

### 3.2 Backend Modules

#### 3.2.1 API Server
Express 5 server providing RESTful endpoints:

| Endpoint | Method | Parameters | Response |
|----------|--------|-----------|----------|
| `/api/economic-data` | GET | `startYear`, `endYear` (optional) | Array of economic records |
| `/api/economic-data/summary` | GET | None | Latest year summary with YoY changes |
| `/api/economic-data/sectors` | GET | `year` (optional) | Sector breakdown records |
| `/api/economic-data/trends` | GET | None | All trend data + available years |
| `/api/healthz` | GET | None | Health status |

#### 3.2.2 Data Model

**Economic Record:**
```typescript
{
  year: number;          // 2015–2025
  gdp: number;           // Gross Domestic Product in billions USD
  gnp: number;           // Gross National Product in billions USD
  ndp: number;           // Net Domestic Product in billions USD
  inflationRate: number;  // Annual consumer price inflation (%)
  unemploymentRate: number; // Labor force unemployment (%)
  gdpGrowthRate: number;  // Year-over-year GDP change (%)
}
```

**Sector Record:**
```typescript
{
  year: number;
  sector: "Agriculture" | "Industry" | "Services";
  value: number;         // Sector GDP contribution in billions USD
  percentage: number;    // Share of total GDP (%)
}
```

### 3.3 UI Component Library

The frontend uses **55 shadcn/ui components** built on top of Radix UI primitives, including:

| Category | Components |
|----------|-----------|
| Layout | Card, Separator, Tabs, Accordion, Collapsible, Resizable Panels |
| Forms | Input, Select, Checkbox, Radio Group, Switch, Slider, Label, Textarea |
| Feedback | Toast, Alert, Skeleton, Progress, Spinner |
| Overlay | Dialog, Sheet, Drawer, Popover, Tooltip, Hover Card |
| Navigation | Sidebar, Navigation Menu, Menubar, Breadcrumb, Pagination |
| Data Display | Table, Badge, Avatar, Calendar, Carousel, Command Palette |
| Actions | Button, Button Group, Toggle, Toggle Group, Dropdown Menu, Context Menu |

---

## 4. Data Analysis

### 4.1 Economic Data Summary (2015–2025)

| Year | GDP ($B) | GNP ($B) | NDP ($B) | Growth % | Inflation % | Unemployment % |
|------|---------|---------|---------|----------|-------------|----------------|
| 2015 | 18,206.0 | 18,290.5 | 16,845.3 | 3.08 | 0.12 | 5.28 |
| 2016 | 18,695.1 | 18,780.2 | 17,281.3 | 1.71 | 1.26 | 4.87 |
| 2017 | 19,477.4 | 19,565.8 | 18,010.4 | 2.33 | 2.13 | 4.35 |
| 2018 | 20,533.0 | 20,634.2 | 18,987.3 | 2.99 | 2.44 | 3.90 |
| 2019 | 21,380.8 | 21,490.5 | 19,756.4 | 2.29 | 1.81 | 3.67 |
| 2020 | 20,936.6 | 21,040.1 | 19,354.7 | **-2.77** | 1.23 | **8.05** |
| 2021 | 23,315.1 | 23,432.8 | 21,557.1 | **5.95** | 4.70 | 5.35 |
| 2022 | 25,744.1 | 25,875.3 | 23,773.0 | 1.94 | **8.00** | **3.61** |
| 2023 | 27,360.9 | 27,506.7 | 25,287.6 | 2.49 | 4.12 | 3.74 |
| 2024 | 28,780.5 | 28,930.2 | 26,619.1 | 2.62 | 2.90 | 4.05 |
| 2025 | 29,950.0 | 30,108.3 | 27,680.4 | 2.50 | 2.60 | 3.90 |

### 4.2 Key Findings

1. **GDP Growth**: GDP grew from $18.2T (2015) to $29.9T (2025), a **64.5% increase** over the decade.
2. **COVID-19 Impact (2020)**: The only year of negative growth (-2.77%) with unemployment spiking to 8.05%.
3. **Post-COVID Recovery (2021)**: Strongest growth year at 5.95%, with GDP jumping from $20.9T to $23.3T.
4. **Inflation Surge (2022)**: Inflation peaked at 8.00%, the highest in the dataset, before declining to 2.60% by 2025.
5. **Employment Recovery**: Unemployment fell from the 2020 peak of 8.05% to a decade-low of 3.61% in 2022.
6. **Sector Stability**: The Agriculture/Industry/Services split remained remarkably stable at approximately 10%/30%/60% throughout the decade.

### 4.3 Sector Composition (2025)

| Sector | Value ($B) | Share (%) |
|--------|-----------|-----------|
| Agriculture | 2,995.0 | 10.0% |
| Industry | 8,985.0 | 30.0% |
| Services | 17,970.0 | 60.0% |
| **Total GDP** | **29,950.0** | **100%** |

---

## 5. Implementation Details

### 5.1 API Layer — Code Generation Pipeline

The project uses an **OpenAPI-first** approach:

1. **OpenAPI Specification** (`lib/api-spec/openapi.yaml`) defines all endpoints, request/response schemas
2. **Orval** generates TypeScript React Query hooks automatically from the spec
3. **Generated Outputs:**
   - `lib/api-zod/` — Zod validation schemas matching the OpenAPI types
   - `lib/api-client-react/` — Ready-to-use React hooks (`useGetEconomicData()`, `useGetEconomicSummary()`, etc.)

This ensures **type-safe, fully-typed API communication** between frontend and backend with zero manual HTTP code.

### 5.2 State Management

- **Server State**: TanStack React Query manages all API data fetching, caching, and refetching. Configured with `refetchOnWindowFocus: false` for stable dashboard experience.
- **Client State**: React `useState` for UI state (filters, sort state, theme preferences). Theme preference persisted via `localStorage`.

### 5.3 Chart Implementation

All charts use **Recharts** with:
- Custom tooltip components with styled formatting (currency/percentage-aware)
- Custom legend components matching the design system
- Responsive containers for all chart types
- Dark mode-aware grid and tick colors
- Disabled animations for performance (`isAnimationActive={false}`)

### 5.4 Data Table

The Economic History Table uses **TanStack React Table** v8 with:
- Client-side sorting on all columns
- Custom cell renderers for currency and percentage formatting
- Color-coded growth rate cells (green for positive, red for negative)
- Sticky header with backdrop blur

### 5.5 Build & Deployment

- **Frontend**: Vite builds to `dist/public/` with tree-shaking and code splitting
- **Backend**: esbuild bundles the Express server into a single ESM file (`dist/index.mjs`) with source maps
- **Deployment**: Configured for Vercel (see `vercel.json`) with API routes proxied to the Express server

---

## 6. Screenshots

### 6.1 Dashboard — KPI Cards & Charts
![Dashboard Overview](docs/screenshots/dashboard_top.png)

### 6.2 Dashboard — Sector Breakdown & Data Table
![Dashboard Data Section](docs/screenshots/dashboard_bottom.png)

---

## 7. How to Run

### Prerequisites
- Node.js ≥ 24.x
- pnpm ≥ 10.x

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Start API server (Terminal 1)
pnpm --filter @workspace/api-server run dev

# 3. Start frontend (Terminal 2)
pnpm --filter @workspace/national-accounts run dev

# 4. Open http://localhost:5173 in your browser
```

---

## 8. Future Enhancements

1. **Database Integration**: The Drizzle ORM schema is already defined in `lib/db/` — connecting to a real PostgreSQL database would enable persistent, dynamic data storage.
2. **PDF Export**: Add client-side PDF generation for reports using html2canvas or jsPDF.
3. **Real-time Data**: WebSocket integration for live economic data updates.
4. **Historical Comparison**: Side-by-side comparison of two different year ranges.
5. **User Authentication**: Role-based access for data editing and administration.
6. **Mobile App**: Leverage the existing API to build a React Native / Expo mobile companion app.

---

## 9. Conclusion

The National Accounts Explorer successfully delivers an interactive, visually rich dashboard for economic data analysis. The monorepo architecture with shared TypeScript types and auto-generated API clients ensures type safety across the full stack. The application demonstrates modern web development practices including:

- OpenAPI-first API design with automated code generation
- Component-driven UI with a comprehensive design system (55+ components)
- Efficient data fetching with caching via React Query
- Responsive, accessible design with dark mode support
- Export capabilities for data portability

The modular architecture makes it straightforward to extend with additional data sources, indicators, or visualization types.

---

*Generated: April 2026 | Version 2.4.1 (Stable)*
