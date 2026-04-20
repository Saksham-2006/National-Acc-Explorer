import { useGetEconomicTrends } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CSVLink } from "react-csv";
import { Download } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

function formatPercent(v: number) { return `${v.toFixed(2)}%`; }
function formatCurrency(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`;
  return `$${v.toFixed(0)}B`;
}

const CHART_COLORS = {
  blue: "#0079F2",
  purple: "#795EFF",
  green: "#009118",
  orange: "#f97316",
  pink: "#ec4899",
};

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
            {typeof entry.value === "number"
              ? entry.name.includes("GDP") || entry.name.includes("GNP") || entry.name.includes("NDP")
                ? formatCurrency(entry.value)
                : formatPercent(entry.value)
              : entry.value}
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

const INDICATORS = [
  {
    key: "gdpGrowthRate",
    title: "GDP Growth Rate",
    description: "Year-over-year change in Gross Domestic Product as a percentage.",
    unit: "%",
    color: CHART_COLORS.blue,
    type: "bar" as const,
  },
  {
    key: "inflationRate",
    title: "Inflation Rate",
    description: "Annual consumer price inflation as a percentage.",
    unit: "%",
    color: CHART_COLORS.purple,
    type: "line" as const,
  },
  {
    key: "unemploymentRate",
    title: "Unemployment Rate",
    description: "Percentage of the labor force that is unemployed and actively seeking employment.",
    unit: "%",
    color: CHART_COLORS.orange,
    type: "line" as const,
  },
  {
    key: "ndp",
    title: "Net Domestic Product",
    description: "GDP minus depreciation of fixed capital — a cleaner measure of sustainable output.",
    unit: "$B",
    color: CHART_COLORS.green,
    type: "line" as const,
  },
];

export function Indicators() {
  const trendsQuery = useGetEconomicTrends();
  const data = trendsQuery.data?.gdpTrend || [];
  const loading = trendsQuery.isLoading || trendsQuery.isFetching;

  const isDark = document.documentElement.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5";
  const tickColor = isDark ? "#98999C" : "#71717a";

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-bold text-foreground">Key Economic Indicators</h2>
        <p className="text-sm text-muted-foreground mt-1">Detailed trend charts for each macro indicator over the 2015–2025 period.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {INDICATORS.map((ind) => {
          const csvData = data.map((d: any) => ({ year: d.year, [ind.key]: d[ind.key] }));
          return (
            <Card key={ind.key}>
              <CardHeader className="px-5 pt-5 pb-2 flex flex-row items-center justify-between border-b bg-muted/20">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">{ind.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{ind.description}</p>
                </div>
                {!loading && data.length > 0 && (
                  <CSVLink
                    data={csvData}
                    filename={`${ind.key}.csv`}
                    className="print:hidden flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground border bg-background shrink-0"
                    title="Export to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </CSVLink>
                )}
              </CardHeader>
              <CardContent className="pt-4 px-2 pb-4">
                {loading ? (
                  <Skeleton className="w-full h-[260px] rounded-lg" />
                ) : data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260} debounce={0}>
                    {ind.type === "bar" ? (
                      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} />
                        <YAxis
                          tickFormatter={(v) => ind.unit === "%" ? `${v}%` : formatCurrency(v)}
                          tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} isAnimationActive={false} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                        <Legend content={<CustomLegend />} verticalAlign="top" height={32} />
                        <Bar
                          dataKey={ind.key}
                          name={ind.title}
                          fill={ind.color}
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={false}
                          // color positive growth green and negative red
                          label={false}
                        >
                          {data.map((entry: any, index: number) => (
                            <rect
                              key={index}
                              fill={(entry[ind.key] ?? 0) >= 0 ? ind.color : CHART_COLORS.pink}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} />
                        <YAxis
                          tickFormatter={(v) => ind.unit === "%" ? `${v}%` : formatCurrency(v)}
                          tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                        <Legend content={<CustomLegend />} verticalAlign="top" height={32} />
                        <Line
                          type="monotone"
                          dataKey={ind.key}
                          name={ind.title}
                          stroke={ind.color}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: ind.color, stroke: "none" }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">All Indicators — Combined View</CardTitle>
            {!loading && data.length > 0 && (
              <CSVLink
                data={data}
                filename="all-indicators.csv"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border bg-background hover:bg-muted transition-colors print:hidden"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </CSVLink>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-2 pb-4">
          {loading ? (
            <Skeleton className="w-full h-[300px] rounded-lg" />
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} debounce={0}>
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.08)" : "#e5e5e5"} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: tickColor }} stroke={tickColor} tickMargin={8} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                <Legend content={<CustomLegend />} verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="gdpGrowthRate" name="GDP Growth" stroke={CHART_COLORS.blue} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="inflationRate" name="Inflation" stroke={CHART_COLORS.purple} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
                <Line type="monotone" dataKey="unemploymentRate" name="Unemployment" stroke={CHART_COLORS.orange} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
