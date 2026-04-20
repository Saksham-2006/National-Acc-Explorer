import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

const economicData = [
  { year: 2015, gdp: 18206.0, gnp: 18290.5, ndp: 16845.3, inflationRate: 0.12, unemploymentRate: 5.28, gdpGrowthRate: 3.08 },
  { year: 2016, gdp: 18695.1, gnp: 18780.2, ndp: 17281.3, inflationRate: 1.26, unemploymentRate: 4.87, gdpGrowthRate: 1.71 },
  { year: 2017, gdp: 19477.4, gnp: 19565.8, ndp: 18010.4, inflationRate: 2.13, unemploymentRate: 4.35, gdpGrowthRate: 2.33 },
  { year: 2018, gdp: 20533.0, gnp: 20634.2, ndp: 18987.3, inflationRate: 2.44, unemploymentRate: 3.90, gdpGrowthRate: 2.99 },
  { year: 2019, gdp: 21380.8, gnp: 21490.5, ndp: 19756.4, inflationRate: 1.81, unemploymentRate: 3.67, gdpGrowthRate: 2.29 },
  { year: 2020, gdp: 20936.6, gnp: 21040.1, ndp: 19354.7, inflationRate: 1.23, unemploymentRate: 8.05, gdpGrowthRate: -2.77 },
  { year: 2021, gdp: 23315.1, gnp: 23432.8, ndp: 21557.1, inflationRate: 4.70, unemploymentRate: 5.35, gdpGrowthRate: 5.95 },
  { year: 2022, gdp: 25744.1, gnp: 25875.3, ndp: 23773.0, inflationRate: 8.00, unemploymentRate: 3.61, gdpGrowthRate: 1.94 },
  { year: 2023, gdp: 27360.9, gnp: 27506.7, ndp: 25287.6, inflationRate: 4.12, unemploymentRate: 3.74, gdpGrowthRate: 2.49 },
  { year: 2024, gdp: 28780.5, gnp: 28930.2, ndp: 26619.1, inflationRate: 2.90, unemploymentRate: 4.05, gdpGrowthRate: 2.62 },
  { year: 2025, gdp: 29950.0, gnp: 30108.3, ndp: 27680.4, inflationRate: 2.60, unemploymentRate: 3.90, gdpGrowthRate: 2.50 },
];

const sectorBaseData = [
  { year: 2015, agriculture: 1820.6, industry: 5461.8, services: 10923.6 },
  { year: 2016, agriculture: 1869.5, industry: 5608.5, services: 11217.1 },
  { year: 2017, agriculture: 1947.7, industry: 5843.2, services: 11686.5 },
  { year: 2018, agriculture: 2053.3, industry: 6159.9, services: 12319.8 },
  { year: 2019, agriculture: 2138.1, industry: 6414.2, services: 12828.5 },
  { year: 2020, agriculture: 2093.7, industry: 6280.1, services: 12562.8 },
  { year: 2021, agriculture: 2331.5, industry: 6994.5, services: 13989.1 },
  { year: 2022, agriculture: 2574.4, industry: 7723.2, services: 15446.5 },
  { year: 2023, agriculture: 2736.1, industry: 8208.3, services: 16416.5 },
  { year: 2024, agriculture: 2878.1, industry: 8634.2, services: 17268.3 },
  { year: 2025, agriculture: 2995.0, industry: 8985.0, services: 17970.0 },
];

function buildSectorRecords(yearData: typeof sectorBaseData) {
  const records = [];
  for (const row of yearData) {
    const total = row.agriculture + row.industry + row.services;
    records.push({ year: row.year, sector: "Agriculture", value: row.agriculture, percentage: parseFloat(((row.agriculture / total) * 100).toFixed(2)) });
    records.push({ year: row.year, sector: "Industry", value: row.industry, percentage: parseFloat(((row.industry / total) * 100).toFixed(2)) });
    records.push({ year: row.year, sector: "Services", value: row.services, percentage: parseFloat(((row.services / total) * 100).toFixed(2)) });
  }
  return records;
}

router.get("/economic-data", (req: Request, res: Response): void => {
  const startYear = req.query.startYear ? parseInt(req.query.startYear as string) : null;
  const endYear = req.query.endYear ? parseInt(req.query.endYear as string) : null;

  let filtered = economicData;
  if (startYear) filtered = filtered.filter(r => r.year >= startYear);
  if (endYear) filtered = filtered.filter(r => r.year <= endYear);

  res.json(filtered);
});

router.get("/economic-data/summary", (_req: Request, res: Response): void => {
  const latest = economicData[economicData.length - 1];
  const previous = economicData[economicData.length - 2];

  res.json({
    latestYear: latest.year,
    gdp: latest.gdp,
    gnp: latest.gnp,
    ndp: latest.ndp,
    inflationRate: latest.inflationRate,
    unemploymentRate: latest.unemploymentRate,
    gdpGrowthRate: latest.gdpGrowthRate,
    gdpChange: parseFloat((latest.gdp - previous.gdp).toFixed(1)),
    inflationChange: parseFloat((latest.inflationRate - previous.inflationRate).toFixed(2)),
    unemploymentChange: parseFloat((latest.unemploymentRate - previous.unemploymentRate).toFixed(2)),
  });
});

router.get("/economic-data/sectors", (req: Request, res: Response): void => {
  const year = req.query.year ? parseInt(req.query.year as string) : null;

  let filtered = sectorBaseData;
  if (year) filtered = filtered.filter(r => r.year === year);

  res.json(buildSectorRecords(filtered));
});

router.get("/economic-data/trends", (_req: Request, res: Response): void => {
  const allSectors = buildSectorRecords(sectorBaseData);
  res.json({
    gdpTrend: economicData,
    inflationTrend: economicData,
    sectorTrend: allSectors,
    availableYears: economicData.map(r => r.year),
  });
});

export default router;
