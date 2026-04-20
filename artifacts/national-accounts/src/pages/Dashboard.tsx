import { useState, useMemo } from "react";
import {
  useGetEconomicData,
  useGetEconomicSummary,
  useGetSectorData,
  useGetEconomicTrends,
} from "@workspace/api-client-react";
import { CSVLink } from "react-csv";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon, Download, Filter } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { EconomicRecord } from "@workspace/api-client-react/src/generated/api.schemas";

const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  red: "#A60808",
  pink: "#ec4899",
  orange: "#f97316",
  teal: "#14b8a6",
};

const CHART_COLOR_LIST = [
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.green,
  CHART_COLORS.red,
  CHART_COLORS.pink,
];

function formatCurrency(value: number) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}T`;
  }
  return `$${value.toFixed(0)}B`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatChange(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}

function KPICard({ 
  title, 
  value, 
  change, 
  trend,
  isLoading 
}: { 
  title: string; 
  value: string; 
  change: number; 
  trend: "up" | "down" | "neutral";
  isLoading: boolean;
}) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";
  
  // By default, blue. Green/red only if semantic meaning applies. For inflation/unemployment, down is good (usually).
  // But let's just stick to the rule: blue for value, red/green for change.
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1" style={{ color: CHART_COLORS.blue }}>{value}</p>
        <div className="flex items-center gap-1 mt-2">
          {change !== 0 && (
            isPositive ? 
              <ArrowUpIcon className="w-4 h-4 text-green-600 dark:text-green-500" /> : 
              <ArrowDownIcon className="w-4 h-4 text-red-600 dark:text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? "text-green-600 dark:text-green-500" : isNegative ? "text-red-600 dark:text-red-500" : "text-muted-foreground"}`}>
            {formatChange(change)}
          </span>
          <span className="text-xs text-muted-foreground ml-1">vs last year</span>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "6px",
        padding: "10px 14px",
        border: "1px solid #e0e0e0",
        color: "#1a1a1a",
        fontSize: "13px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
    >
      <div style={{ marginBottom: "6px", fontWeight: 600, borderBottom: "1px solid #f0f0f0", paddingBottom: "4px" }}>
        {label}
      </div>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
          {entry.color && entry.color !== "#ffffff" && (
            <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          )}
          <span style={{ color: "#444" }}>{entry.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            {entry.name.includes("Rate") || entry.name.includes("%") || entry.name.includes("Inflation") || entry.name.includes("Unemployment") || entry.name.includes("Growth")
              ? formatPercent(entry.value)
              : typeof entry.value === "number" ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function CustomLegend({ payload }: any) {
  if (!payload || payload.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 16px", fontSize: "13px", marginTop: "8px" }}>
      {payload.map((entry: any, index: number) => (
        <div key={index} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "2px", backgroundColor: entry.color, flexShrink: 0 }} />
          <span className="text-muted-foreground font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  const [startYear, setStartYear] = useState<number | undefined>(undefined);
  const [endYear, setEndYear] = useState<number | undefined>(undefined);
  const [sectorFilter, setSectorFilter] = useState<string>("all");

  const summaryQuery = useGetEconomicSummary();
  const trendsQuery = useGetEconomicTrends();
  const dataQuery = useGetEconomicData({ startYear, endYear });
  
  // For sector data, we can just use the latest year from summary or just get all and filter
  const latestYear = summaryQuery.data?.latestYear;
  const sectorQuery = useGetSectorData({ year: latestYear });

  const loading = summaryQuery.isLoading || summaryQuery.isFetching || 
                  trendsQuery.isLoading || trendsQuery.isFetching || 
                  dataQuery.isLoading || dataQuery.isFetching ||
                  sectorQuery.isLoading || sectorQuery.isFetching;

  const availableYears = trendsQuery.data?.availableYears || [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  // Filter trends based on start/end year locally if needed, or rely on dataQuery for the table and trendsQuery for charts
  // The prompt says: "When changed, refetch useGetEconomicData with those params and filter the charts accordingly."
  // Wait, trendsQuery doesn't take params. So we filter trends locally or just use dataQuery for charts.
  // Actually, dataQuery returns EconomicRecord[], which has all the data we need for GDP and Inflation charts.
  const chartData = dataQuery.data || trendsQuery.data?.gdpTrend || [];
  
  const gdpChartData = chartData;
  const inflationChartData = chartData;

  const sectorDataRaw = sectorQuery.data || [];
  const sectorChartData = sectorFilter === "all" 
    ? sectorDataRaw 
    : sectorDataRaw.filter(s => s.sector === sectorFilter);

  const [sorting, setSorting] = useState<SortingState>([{ id: "year", desc: true }]);

  const columns = useMemo<ColumnDef<EconomicRecord>[]>(() => [
    { accessorKey: "year", header: "Year" },
    { 
      accessorKey: "gdp", 
      header: "GDP",
      cell: ({ row }) => formatCurrency(row.original.gdp)
    },
    { 
      accessorKey: "gnp", 
      header: "GNP",
      cell: ({ row }) => formatCurrency(row.original.gnp)
    },
    { 
      accessorKey: "ndp", 
      header: "NDP",
      cell: ({ row }) => formatCurrency(row.original.ndp)
    },
    { 
      accessorKey: "gdpGrowthRate", 
      header: "Growth",
      cell: ({ row }) => {
        const val = row.original.gdpGrowthRate;
        const color = val > 0 ? "text-green-600 dark:text-green-500" : val < 0 ? "text-red-600 dark:text-red-500" : "";
        return <span className={`font-medium ${color}`}>{formatPercent(val)}</span>;
      }
    },
    { 
      accessorKey: "inflationRate", 
      header: "Inflation",
      cell: ({ row }) => formatPercent(row.original.inflationRate)
    },
    { 
      accessorKey: "unemploymentRate", 
      header: "Unemployment",
      cell: ({ row }) => formatPercent(row.original.unemploymentRate)
    },
  ], []);

  const table = useReactTable({
    data: dataQuery.data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2 bg-card p-4 border rounded-xl shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-[180px]">
            <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider font-semibold">Start Year</Label>
            <Select value={startYear?.toString() || "all"} onValueChange={(v) => setStartYear(v === "all" ? undefined : parseInt(v))}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(y => (
                  <SelectItem key={`start-${y}`} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Label className="text-xs text-muted-foreground mb-1.5 block uppercase tracking-wider font-semibold">End Year</Label>
            <Select value={endYear?.toString() || "all"} onValueChange={(v) => setEndYear(v === "all" ? undefined : parseInt(v))}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(y => (
                  <SelectItem key={`end-${y}`} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Gross Domestic Product"
          value={summaryQuery.data ? formatCurrency(summaryQuery.data.gdp) : "$--"}
          change={summaryQuery.data?.gdpChange || 0}
          trend={summaryQuery.data && summaryQuery.data.gdpChange >= 0 ? "up" : "down"}
          isLoading={loading}
        />
        <KPICard
          title="Gross National Product"
          value={summaryQuery.data ? formatCurrency(summaryQuery.data.gnp) : "$--"}
          change={summaryQuery.data?.gdpChange || 0} 
          trend={summaryQuery.data && summaryQuery.data.gdpChange >= 0 ? "up" : "down"}
          isLoading={loading}
        />
        <KPICard
          title="Net Domestic Product"
          value={summaryQuery.data ? formatCurrency(summaryQuery.data.ndp) : "$--"}
          change={summaryQuery.data?.gdpChange || 0} 
          trend={summaryQuery.data && summaryQuery.data.gdpChange >= 0 ? "up" : "down"}
          isLoading={loading}
        />
        <KPICard
          title="Inflation Rate"
          value={summaryQuery.data ? formatPercent(summaryQuery.data.inflationRate) : "--"}
          change={summaryQuery.data?.inflationChange || 0}
          trend={summaryQuery.data && summaryQuery.data.inflationChange <= 0 ? "up" : "down"} // lower inflation is better (up arrow for improvement = green)
          isLoading={loading}
        />
        <KPICard
          title="Unemployment Rate"
          value={summaryQuery.data ? formatPercent(summaryQuery.data.unemploymentRate) : "--"}
          change={summaryQuery.data?.unemploymentChange || 0}
          trend={summaryQuery.data && summaryQuery.data.unemploymentChange <= 0 ? "up" : "down"} // lower unemployment is better
          isLoading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="px-5 pt-5 pb-2 flex flex-row items-center justify-between border-b bg-muted/20">
            <CardTitle className="text-base font-semibold text-foreground">GDP Growth Trend</CardTitle>
            {!loading && gdpChartData.length > 0 && (
              <CSVLink
                data={gdpChartData}
                filename="gdp-growth.csv"
                className="print:hidden flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground border bg-background"
                title="Export to CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent className="pt-4 px-2 pb-4">
            {loading ? (
              <Skeleton className="w-full h-[320px] rounded-lg mx-4" />
            ) : gdpChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320} debounce={0}>
                <AreaChart data={gdpChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={10} axisLine={false} />
                  <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}T`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)', stroke: 'none' }} />
                  <Legend content={<CustomLegend />} verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="gdp" name="GDP" stroke={CHART_COLORS.blue} fillOpacity={1} fill="url(#colorGdp)" strokeWidth={2} isAnimationActive={false} activeDot={{ r: 6, fill: CHART_COLORS.blue, stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-[320px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="px-5 pt-5 pb-2 flex flex-row items-center justify-between border-b bg-muted/20">
            <CardTitle className="text-base font-semibold text-foreground">Inflation vs Unemployment</CardTitle>
            {!loading && inflationChartData.length > 0 && (
              <CSVLink
                data={inflationChartData}
                filename="inflation-unemployment.csv"
                className="print:hidden flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground border bg-background"
                title="Export to CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent className="pt-4 px-2 pb-4">
            {loading ? (
              <Skeleton className="w-full h-[320px] rounded-lg mx-4" />
            ) : inflationChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320} debounce={0}>
                <ComposedChart data={inflationChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={10} axisLine={false} />
                  <YAxis tickFormatter={(val) => `${val}%`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                  <Legend content={<CustomLegend />} verticalAlign="top" height={36} />
                  <Bar dataKey="inflationRate" name="Inflation" fill={CHART_COLORS.purple} radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} isAnimationActive={false} />
                  <Line type="monotone" dataKey="unemploymentRate" name="Unemployment" stroke={CHART_COLORS.orange} strokeWidth={3} dot={{ r: 4, fill: CHART_COLORS.orange }} activeDot={{ r: 6, strokeWidth: 0 }} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-[320px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 shadow-sm flex flex-col">
          <CardHeader className="px-5 pt-5 pb-2 flex flex-row items-center justify-between border-b bg-muted/20">
            <CardTitle className="text-base font-semibold text-foreground">Sector Breakdown</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="h-7 w-[110px] text-xs bg-background">
                  <Filter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Industry">Industry</SelectItem>
                  <SelectItem value="Agriculture">Agriculture</SelectItem>
                </SelectContent>
              </Select>
              {!loading && sectorChartData.length > 0 && (
                <CSVLink
                  data={sectorChartData}
                  filename="sector-breakdown.csv"
                  className="print:hidden flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground border bg-background"
                  title="Export to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </CSVLink>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col items-center justify-center">
            {loading ? (
              <Skeleton className="w-[240px] h-[240px] rounded-full" />
            ) : sectorChartData.length > 0 ? (
              <>
                <div className="text-sm font-medium text-muted-foreground mb-2 text-center w-full">
                  Data for {latestYear || "latest year"}
                </div>
                <ResponsiveContainer width="100%" height={260} debounce={0}>
                  <PieChart>
                    <Pie 
                      data={sectorChartData} 
                      dataKey="value" 
                      nameKey="sector" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={100} 
                      paddingAngle={2} 
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {sectorChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLOR_LIST[index % CHART_COLOR_LIST.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                    <Legend content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="w-full h-[260px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader className="px-5 pt-5 pb-4 border-b bg-muted/20">
            <CardTitle className="text-base font-semibold text-foreground">Economic History Table</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto max-h-[400px]">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-10 w-full" />
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : dataQuery.data && dataQuery.data.length > 0 ? (
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 backdrop-blur-md">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id} 
                          onClick={header.column.getToggleSortingHandler()} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors whitespace-nowrap h-10 text-xs uppercase tracking-wider font-semibold"
                        >
                          <div className="flex items-center gap-1.5">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{ asc: "↑", desc: "↓" }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/20">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-10 text-center text-muted-foreground">
                No records found for the selected range.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
