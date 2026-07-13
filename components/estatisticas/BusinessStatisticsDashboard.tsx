"use client";

import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ExternalLink,
  Eye,
  Globe,
  MapPinned,
  MousePointerClick,
  Phone
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import type { BusinessStatistics } from "@/lib/queries/getBusinessStatistics";

type Props = {
  statistics: BusinessStatistics;
};

const availablePeriods = [
  {
    label: "7 dias",
    value: 7
  },
  {
    label: "30 dias",
    value: 30
  },
  {
    label: "90 dias",
    value: 90
  }
] as const;

const evolutionChartConfig = {
  pageViews: {
    label: "Visualizações",
    color: "var(--chart-1)"
  },
  interactions: {
    label: "Interações",
    color: "var(--chart-2)"
  }
} satisfies ChartConfig;

const channelsChartConfig = {
  value: {
    label: "Cliques",
    color: "var(--chart-1)"
  }
} satisfies ChartConfig;

function formatPeriod(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  return `${formatter.format(new Date(startDate))} — ${formatter.format(
    new Date(endDate)
  )}`;
}

export function BusinessStatisticsDashboard({ statistics }: Props) {
  const { business, totals, daily, channels, period } = statistics;

  const interactionRate =
    totals.pageViews > 0 ? (totals.interactions / totals.pageViews) * 100 : 0;

  const cards = [
    {
      label: "Visualizações",
      value: totals.pageViews.toLocaleString("pt-PT"),
      description: "Visitas à página do negócio",
      icon: Eye,
      iconClass: "bg-blue-100 text-blue-700"
    },
    {
      label: "Cliques totais",
      value: totals.interactions.toLocaleString("pt-PT"),
      description: "Ações efetuadas pelos visitantes",
      icon: MousePointerClick,
      iconClass: "bg-violet-100 text-violet-700"
    },
    {
      label: "Taxa de interação",
      value: `${interactionRate.toLocaleString("pt-PT", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      })}%`,
      description: "Cliques em relação às visualizações",
      icon: BarChart3,
      iconClass: "bg-emerald-100 text-emerald-700"
    },
    {
      label: "Como chegar",
      value: totals.directionsClicks.toLocaleString("pt-PT"),
      description: "Pedidos de direções",
      icon: MapPinned,
      iconClass: "bg-orange-100 text-orange-700"
    }
  ];

  const hasAnyEvents = totals.pageViews > 0 || totals.interactions > 0;

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <BarChart3 className="h-7 w-7 shrink-0 text-primary" />

              <h1 className="truncate text-3xl font-bold tracking-tight">
                Estatísticas
              </h1>
            </div>

            <p className="mt-2 text-md wrap-break-word text-muted-foreground">
              Acompanhe o desempenho de{" "}
              <span className="font-medium text-foreground">
                {business.name}
              </span>
              .
            </p>

            <div className="mt-12 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0" />

              <span>{formatPeriod(period.startDate, period.endDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">Período</p>

          <div className="grid grid-cols-3 gap-2 sm:flex">
            {availablePeriods.map(({ label, value }) => {
              const active = period.days === value;

              return (
                <Button
                  key={value}
                  asChild
                  size="sm"
                  variant={active ? "default" : "outline"}
                  className={cn(
                    "w-full sm:w-auto",
                    active && "pointer-events-none"
                  )}
                >
                  <Link
                    href={`/area-cliente/negocio/${business.slug}/estatisticas?days=${value}`}
                    scroll={false}
                    aria-current={active ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        <Button asChild variant="fat" className="w-full md:w-auto">
          <Link
            href={`/negocio/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver página pública
          </Link>
        </Button>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, description, icon: Icon, iconClass }) => (
          <Card key={label} className="min-w-0">
            <CardContent className="flex min-w-0 items-start justify-between gap-4 p-6">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>

                <p className="mt-2 text-3xl font-bold">{value}</p>

                <p className="mt-1 break-words text-xs text-muted-foreground">
                  {description}
                </p>
              </div>

              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                  iconClass
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!hasAnyEvents ? (
        <Card className="min-w-0 border-dashed">
          <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-7 w-7 text-primary" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Ainda não existem estatísticas
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Não foram registadas visualizações nem interações durante os
              últimos {period.days} dias.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Evolução diária</CardTitle>

              <CardDescription>
                Visualizações e interações nos últimos {period.days} dias.
              </CardDescription>
            </CardHeader>

            <CardContent className="min-w-0 px-2 sm:px-6">
              <ChartContainer
                config={evolutionChartConfig}
                className="aspect-auto h-[320px] w-full max-w-full min-w-0"
              >
                <LineChart
                  accessibilityLayer
                  data={daily}
                  margin={{
                    top: 8,
                    right: 8,
                    bottom: 0,
                    left: 0
                  }}
                >
                  <CartesianGrid vertical={false} />

                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={32}
                    fontSize={11}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={26}
                    fontSize={11}
                  />

                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.date
                            ? new Intl.DateTimeFormat("pt-PT", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              }).format(
                                new Date(`${payload[0].payload.date}T12:00:00`)
                              )
                            : ""
                        }
                      />
                    }
                  />

                  <ChartLegend content={<ChartLegendContent />} />

                  <Line
                    dataKey="pageViews"
                    type="monotone"
                    stroke="var(--color-pageViews)"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Line
                    dataKey="interactions"
                    type="monotone"
                    stroke="var(--color-interactions)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Interações por canal</CardTitle>

              <CardDescription>
                Distribuição dos cliques efetuados pelos visitantes nos últimos{" "}
                {period.days} dias.
              </CardDescription>
            </CardHeader>

            <CardContent className="min-w-0 px-2 sm:px-6">
              <ChartContainer
                config={channelsChartConfig}
                className="aspect-auto h-[340px] w-full max-w-full min-w-0"
              >
                <BarChart
                  accessibilityLayer
                  data={channels}
                  layout="vertical"
                  margin={{
                    top: 8,
                    right: 8,
                    bottom: 0,
                    left: 0
                  }}
                >
                  <CartesianGrid horizontal={false} />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />

                  <YAxis
                    dataKey="channel"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={74}
                    fontSize={11}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />

                  <Bar dataKey="value" fill="var(--color-value)" radius={5} />
                </BarChart>
              </ChartContainer>

              <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-3">
                <div className="flex min-w-0 items-center gap-3 rounded-lg border p-3">
                  <Globe className="h-5 w-5 shrink-0 text-slate-600" />

                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      Website
                    </p>

                    <p className="font-semibold">
                      {totals.websiteClicks.toLocaleString("pt-PT")}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3 rounded-lg border p-3">
                  <Phone className="h-5 w-5 shrink-0 text-green-700" />

                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      Telefone
                    </p>

                    <p className="font-semibold">
                      {totals.phoneClicks.toLocaleString("pt-PT")}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-3 rounded-lg border p-3">
                  <MapPinned className="h-5 w-5 shrink-0 text-orange-700" />

                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      Como chegar
                    </p>

                    <p className="font-semibold">
                      {totals.directionsClicks.toLocaleString("pt-PT")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
