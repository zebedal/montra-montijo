import { createClient } from "@/lib/supabase/server";
import { getPrimaryCtaLabel } from "@/lib/business-primary-cta";
import {
  calculateBusinessEventTotals,
  type BusinessEventType
} from "@/lib/business-statistics-core";
import {
  summarizeQuoteRequests,
  type QuoteRequestSummaryItem
} from "@/lib/quote-request";

type BusinessEvent = {
  event_type: BusinessEventType;
  created_at: string;
};

export type BusinessStatistics = {
  business: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    subscriptionStatus: string | null;
    primaryCtaLabel: string | null;
  };

  period: {
    days: number;
    startDate: string;
    endDate: string;
  };

  totals: {
    pageViews: number;
    phoneClicks: number;
    emailClicks: number;
    websiteClicks: number;
    instagramClicks: number;
    facebookClicks: number;
    directionsClicks: number;
    primaryCtaClicks: number;
    campaignCtaClicks: number;
    campaignViews: number;
    campaignClicks: number;
    quoteRequests: number;
    interactions: number;
  };

  daily: {
    date: string;
    label: string;
    pageViews: number;
    interactions: number;
  }[];

  channels: {
    channel: string;
    value: number;
  }[];

  quoteRequests: {
    localities: QuoteRequestSummaryItem[];
  };
};

type GetBusinessStatisticsResult =
  | {
      success: true;
      data: BusinessStatistics;
    }
  | {
      success: false;
      reason: "unauthenticated" | "not_found" | "premium_required";
    };

function getDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Europe/Lisbon",
    day: "2-digit",
    month: "short"
  }).format(date);
}

function createDailyRange(days: number) {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);

    date.setUTCDate(today.getUTCDate() - (days - 1 - index));
    date.setUTCHours(0, 0, 0, 0);

    return {
      date: getDateKey(date),
      label: formatDayLabel(date),
      pageViews: 0,
      interactions: 0
    };
  });
}

export async function getBusinessStatistics(
  businessSlug: string,
  days = 30
): Promise<GetBusinessStatisticsResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      reason: "unauthenticated"
    };
  }

  /*
   * Confirmar que o negócio pertence ao utilizador.
   */
  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      `
    id,
    name,
    slug,
    user_id,
    plan,
    subscription_status,
    primary_cta_type
  `
    )
    .eq("slug", businessSlug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (businessError) {
    console.error("Erro ao obter o negócio:", businessError);

    return {
      success: false,
      reason: "not_found"
    };
  }

  if (!business) {
    return {
      success: false,
      reason: "not_found"
    };
  }

  /*
   * O campo plan permanece premium até ao fim do período pago,
   * mesmo que cancel_at_period_end seja true.
   */
  if (business.plan === "free") {
    return {
      success: false,
      reason: "premium_required"
    };
  }

  const safeDays = [7, 30, 90].includes(days) ? days : 30;

  const startDate = new Date();

  startDate.setUTCDate(startDate.getUTCDate() - (safeDays - 1));
  startDate.setUTCHours(0, 0, 0, 0);

  const endDate = new Date();

  const [eventsResult, quoteRequestsResult] = await Promise.all([
    supabase
      .from("business_events")
      .select("event_type, created_at")
      .eq("business_id", business.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("business_quote_requests")
      .select("locality, created_at")
      .eq("business_id", business.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })
  ]);

  const { data: events, error: eventsError } = eventsResult;

  if (eventsError) {
    console.error("Erro ao obter as estatísticas:", eventsError);

    throw new Error("Não foi possível obter as estatísticas do negócio.");
  }

  const typedEvents = (events ?? []) as BusinessEvent[];
  const quoteRequestRows = quoteRequestsResult.error
    ? []
    : (quoteRequestsResult.data ?? []) as {
        locality: string;
        created_at: string;
      }[];

  if (
    quoteRequestsResult.error &&
    quoteRequestsResult.error.code !== "PGRST205" &&
    quoteRequestsResult.error.code !== "42P01"
  ) {
    console.error(
      "Erro ao obter pedidos de orçamento nas estatísticas:",
      quoteRequestsResult.error
    );
  }

  const totals = calculateBusinessEventTotals(typedEvents);
  totals.quoteRequests = quoteRequestRows.length;
  totals.interactions += quoteRequestRows.length;

  const daily = createDailyRange(safeDays);

  const dailyMap = new Map(daily.map((item) => [item.date, item]));

  typedEvents.forEach((event) => {
    const eventDate = new Date(event.created_at);
    const dateKey = getDateKey(eventDate);
    const dailyItem = dailyMap.get(dateKey);

    if (event.event_type === "page_view") {
      if (dailyItem) {
        dailyItem.pageViews += 1;
      }

      return;
    }

    if (event.event_type === "campaign_view") {
      return;
    }

    if (dailyItem) {
      dailyItem.interactions += 1;
    }
  });

  quoteRequestRows.forEach((request) => {
    const dailyItem = dailyMap.get(getDateKey(new Date(request.created_at)));
    if (dailyItem) dailyItem.interactions += 1;
  });

  const quoteRequestSummary = summarizeQuoteRequests(quoteRequestRows);

  const channels = [
    {
      channel: "Orçamentos",
      value: totals.quoteRequests
    },
    ...(business.primary_cta_type
      ? [
          {
            channel:
              getPrimaryCtaLabel(business.primary_cta_type) ?? "Ação principal",
            value: totals.primaryCtaClicks
          }
        ]
      : []),
    {
      channel: "Abrir campanha",
      value: totals.campaignClicks
    },
    {
      channel: "Ação da campanha",
      value: totals.campaignCtaClicks
    },
    {
      channel: "Telefone",
      value: totals.phoneClicks
    },
    {
      channel: "Email",
      value: totals.emailClicks
    },
    {
      channel: "Website",
      value: totals.websiteClicks
    },
    {
      channel: "Instagram",
      value: totals.instagramClicks
    },
    {
      channel: "Facebook",
      value: totals.facebookClicks
    },
    {
      channel: "Morada",
      value: totals.directionsClicks
    }
  ];

  return {
    success: true,
    data: {
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        plan: business.plan,
        subscriptionStatus: business.subscription_status,
        primaryCtaLabel: getPrimaryCtaLabel(business.primary_cta_type)
      },

      period: {
        days: safeDays,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },

      totals,
      daily,
      channels,
      quoteRequests: quoteRequestSummary
    }
  };
}
