import { useGetEconomicData, useGetEconomicTrends } from "@workspace/api-client-react";
import { CSVLink } from "react-csv";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, TrendingUp, TrendingDown } from "lucide-react";

function formatCurrency(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}T`;
  return `$${value.toFixed(0)}B`;
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

const REPORTS = [
  {
    id: "gdp-summary",
    title: "GDP Annual Summary",
    description: "Year-by-year breakdown of Gross Domestic Product with growth rates and absolute changes.",
    fields: ["year", "gdp", "gdpGrowthRate"],
    labels: { year: "Year", gdp: "GDP ($B)", gdpGrowthRate: "Growth Rate (%)" },
  },
  {
    id: "national-accounts",
    title: "National Accounts (GDP / GNP / NDP)",
    description: "Comparative view of GDP, GNP, and NDP alongside depreciation estimates.",
    fields: ["year", "gdp", "gnp", "ndp"],
    labels: { year: "Year", gdp: "GDP ($B)", gnp: "GNP ($B)", ndp: "NDP ($B)" },
  },
  {
    id: "price-labor",
    title: "Price & Labor Indicators",
    description: "Inflation rate and unemployment rate tracked over the full decade.",
    fields: ["year", "inflationRate", "unemploymentRate"],
    labels: { year: "Year", inflationRate: "Inflation (%)", unemploymentRate: "Unemployment (%)" },
  },
  {
    id: "full-dataset",
    title: "Complete Dataset Export",
    description: "All economic indicators for all available years in a single export.",
    fields: ["year", "gdp", "gnp", "ndp", "gdpGrowthRate", "inflationRate", "unemploymentRate"],
    labels: {},
  },
];

export function Reports() {
  const dataQuery = useGetEconomicData();
  const trendsQuery = useGetEconomicTrends();

  const data = dataQuery.data || [];
  const loading = dataQuery.isLoading || dataQuery.isFetching;

  const peakGrowth = data.reduce((best, d) => (d.gdpGrowthRate > best.gdpGrowthRate ? d : best), data[0] || { year: 0, gdpGrowthRate: 0 });
  const minGrowth = data.reduce((worst, d) => (d.gdpGrowthRate < worst.gdpGrowthRate ? d : worst), data[0] || { year: 0, gdpGrowthRate: 0 });
  const peakInflation = data.reduce((best, d) => (d.inflationRate > best.inflationRate ? d : best), data[0] || { year: 0, inflationRate: 0 });
  const lowestUnemployment = data.reduce((best, d) => (d.unemploymentRate < best.unemploymentRate ? d : best), data[0] || { year: 0, unemploymentRate: 999 });

  const highlights = loading ? [] : [
    { label: "Peak GDP Growth", value: formatPercent(peakGrowth.gdpGrowthRate), sub: `in ${peakGrowth.year}`, positive: true },
    { label: "Worst Contraction", value: formatPercent(minGrowth.gdpGrowthRate), sub: `in ${minGrowth.year}`, positive: false },
    { label: "Peak Inflation", value: formatPercent(peakInflation.inflationRate), sub: `in ${peakInflation.year}`, positive: false },
    { label: "Lowest Unemployment", value: formatPercent(lowestUnemployment.unemploymentRate), sub: `in ${lowestUnemployment.year}`, positive: true },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-bold text-foreground">Economic Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">Download structured data exports and review decade highlights.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-7 w-20 mb-1" /><Skeleton className="h-3 w-16" /></CardContent></Card>
            ))
          : highlights.map((h) => (
              <Card key={h.label}>
                <CardContent className="p-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{h.label}</p>
                  <div className="flex items-center gap-2">
                    {h.positive
                      ? <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0" />
                      : <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-500 shrink-0" />}
                    <span className={`text-2xl font-bold ${h.positive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>{h.value}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{h.sub}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Available Reports</h3>
        {REPORTS.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{report.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{data.length} rows &middot; CSV format</p>
                </div>
              </div>
              {!loading && data.length > 0 && (
                <CSVLink
                  data={data}
                  filename={`${report.id}-${new Date().getFullYear()}.csv`}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity shrink-0 print:hidden"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </CSVLink>
              )}
              {loading && <Skeleton className="w-32 h-9" />}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="px-5 pt-5 pb-3 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Full Data Preview</CardTitle>
            {!loading && data.length > 0 && (
              <CSVLink
                data={data}
                filename="national-accounts-full.csv"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border bg-background hover:bg-muted transition-colors print:hidden"
              >
                <Download className="w-3.5 h-3.5" />
                Export All
              </CSVLink>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  {["Year", "GDP", "GNP", "NDP", "Growth %", "Inflation %", "Unemployment %"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...data].reverse().map((row) => (
                  <tr key={row.year} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold">{row.year}</td>
                    <td className="px-4 py-3">{formatCurrency(row.gdp)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.gnp)}</td>
                    <td className="px-4 py-3">{formatCurrency(row.ndp)}</td>
                    <td className="px-4 py-3">
                      <span className={row.gdpGrowthRate >= 0 ? "text-green-600 dark:text-green-500 font-medium" : "text-red-600 dark:text-red-500 font-medium"}>
                        {row.gdpGrowthRate >= 0 ? "+" : ""}{formatPercent(row.gdpGrowthRate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatPercent(row.inflationRate)}</td>
                    <td className="px-4 py-3">{formatPercent(row.unemploymentRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
