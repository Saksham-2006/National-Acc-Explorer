import { useState } from "react";
import { useGetSectorData, useGetEconomicTrends } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

function formatCurrency(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`;
  return `$${v.toFixed(0)}B`;
}
function formatPercent(v: number) { return `${v.toFixed(1)}%`; }

const CHART_COLORS = ["#0079F2", "#795EFF", "#009118"];
const SECTORS = ["Agriculture", "Industry", "Services"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 6, padding: "10px 14px", fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid var(--color-border)" }}>{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: entry.color, display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: "var(--color-muted-foreground)" }}>{entry.name}</span>
          <span style={{ marginLeft: "auto", fontWeight: 600, color: "var(--color-foreground)" }}>
            {typeof entry.value === "number" && (entry.name.includes("%") || entry.name.includes("Share"))
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
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px 16px", fontSize: 13, marginTop: 8 }}>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: entry.color, display: "inline-block" }} />
          <span className="text-muted-foreground font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Regions() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const trendsQuery = useGetEconomicTrends();
  const sectorQuery = useGetSectorData({ year: selectedYear });

  const loading = sectorQuery.isLoading || sectorQuery.isFetching || trendsQuery.isLoading;
  const availableYears = trendsQuery.data?.availableYears || [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const sectorData = sectorQuery.data || [];

  const allSectorTrend = trendsQuery.data?.sectorTrend || [];
  const trendByYear: Record<number, Record<string, number>> = {};
  allSectorTrend.forEach((s) => {
    if (!trendByYear[s.year]) trendByYear[s.year] = {};
    trendByYear[s.year][s.sector] = s.value;
  });
  const stackedTrendData = Object.entries(trendByYear)
    .map(([year, sectors]) => ({ year: parseInt(year), ...sectors }))
    .sort((a, b) => a.year - b.year);

  const percentTrendData = allSectorTrend.length > 0
    ? Object.entries(trendByYear).map(([year, sectors]) => {
        const total = Object.values(sectors).reduce((s, v) => s + v, 0);
        return {
          year: parseInt(year),
          Agriculture: parseFloat(((sectors["Agriculture"] || 0) / total * 100).toFixed(1)),
          Industry: parseFloat(((sectors["Industry"] || 0) / total * 100).toFixed(1)),
          Services: parseFloat(((sectors["Services"] || 0) / total * 100).toFixed(1)),
        };
      }).sort((a, b) => a.year - b.year)
    : [];

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-bold text-foreground">Sector Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">Contribution of Agriculture, Industry, and Services across the decade.</p>
      </div>

      <div className="flex items-end gap-4 bg-card border rounded-xl p-4">
        <div className="w-[180px]">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Selected Year</Label>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-20 mb-1" /><Skeleton className="h-3 w-28" /></CardContent></Card>
            ))
          : SECTORS.map((sector, i) => {
              const s = sectorData.find((d) => d.sector === sector);
              return (
                <Card key={sector}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART_COLORS[i] }} />
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{sector}</p>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: CHART_COLORS[i] }}>
                      {s ? formatCurrency(s.value) : "--"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {s ? `${s.percentage}% of GDP` : "--"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="px-5 pt-5 pb-2 flex flex-row items-center justify-between border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Sector Share for {selectedYear}</CardTitle>
            {!loading && sectorData.length > 0 && (
              <CSVLink data={sectorData} filename={`sector-${selectedYear}.csv`} className="print:hidden flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground border bg-background" title="Export CSV">
                <Download className="w-3.5 h-3.5" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent className="pt-4 px-2 pb-4">
            {loading ? <Skeleton className="w-full h-[280px] rounded-lg" /> : (
              <ResponsiveContainer width="100%" height={280} debounce={0}>
                <PieChart>
                  <Pie data={sectorData} dataKey="value" nameKey="sector" cx="50%" cy="50%" innerRadius={65} outerRadius={105} paddingAngle={2} stroke="none" isAnimationActive={false}>
                    {sectorData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-5 pt-5 pb-2 flex flex-row items-center justify-between border-b bg-muted/20">
            <CardTitle className="text-sm font-semibold">Sector Share Over Time (%)</CardTitle>
            {!loading && percentTrendData.length > 0 && (
              <CSVLink data={percentTrendData} filename="sector-share-trend.csv" className="print:hidden flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground border bg-background" title="Export CSV">
                <Download className="w-3.5 h-3.5" />
              </CSVLink>
            )}
          </CardHeader>
          <CardContent className="pt-4 px-2 pb-4">
            {loading ? <Skeleton className="w-full h-[280px] rounded-lg" /> : (
              <ResponsiveContainer width="100%" height={280} debounce={0}>
                <LineChart data={percentTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                  <Legend content={<CustomLegend />} verticalAlign="top" height={36} />
                  <Line type="monotone" dataKey="Agriculture" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="Industry" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                  <Line type="monotone" dataKey="Services" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-2 flex flex-row items-center justify-between border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold">Absolute Sector Value Over Time</CardTitle>
          {!loading && stackedTrendData.length > 0 && (
            <CSVLink data={stackedTrendData} filename="sector-absolute-trend.csv" className="print:hidden flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground border bg-background" title="Export CSV">
              <Download className="w-3.5 h-3.5" />
            </CSVLink>
          )}
        </CardHeader>
        <CardContent className="pt-4 px-2 pb-4">
          {loading ? <Skeleton className="w-full h-[280px] rounded-lg" /> : (
            <ResponsiveContainer width="100%" height={280} debounce={0}>
              <BarChart data={stackedTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Legend content={<CustomLegend />} verticalAlign="top" height={36} />
                <Bar dataKey="Agriculture" stackId="a" fill={CHART_COLORS[0]} isAnimationActive={false} />
                <Bar dataKey="Industry" stackId="a" fill={CHART_COLORS[1]} isAnimationActive={false} />
                <Bar dataKey="Services" stackId="a" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
