import { createClient } from "@/lib/supabase/server";

export type BusinessEventType =
  | "page_view"
  | "phone_click"
  | "email_click"
  | "website_click"
  | "instagram_click"
  | "facebook_click"
  | "directions_click";

type BusinessEvent = {
  event_type: BusinessEventType;
  created_at: string;
};

export type BusinessStatistics = {
  business: {
    id: string;
    name: string;
    plan: string;
    subscriptionStatus: string | null;
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

const EVENT_TO_TOTAL_KEY: Record<
  Exclude<BusinessEventType, "page_view">,
  | "phoneClicks"
  | "emailClicks"
  | "websiteClicks"
  | "instagramClicks"
  | "facebookClicks"
  | "directionsClicks"
> = {
  phone_click: "phoneClicks",
  email_click: "emailClicks",
  website_click: "websiteClicks",
  instagram_click: "instagramClicks",
  facebook_click: "facebookClicks",
  directions_click: "directionsClicks"
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
  businessId: string,
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
      user_id,
      plan,
      subscription_status
    `
    )
    .eq("id", businessId)
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
  if (business.plan !== "premium") {
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

  const { data: events, error: eventsError } = await supabase
    .from("business_events")
    .select("event_type, created_at")
    .eq("business_id", business.id)
    .gte("created_at", startDate.toISOString())
    .order("created_at", {
      ascending: true
    });

  if (eventsError) {
    console.error("Erro ao obter as estatísticas:", eventsError);

    throw new Error("Não foi possível obter as estatísticas do negócio.");
  }

  const typedEvents = (events ?? []) as BusinessEvent[];

  const totals = {
    pageViews: 0,
    phoneClicks: 0,
    emailClicks: 0,
    websiteClicks: 0,
    instagramClicks: 0,
    facebookClicks: 0,
    directionsClicks: 0,
    interactions: 0
  };

  const daily = createDailyRange(safeDays);

  const dailyMap = new Map(daily.map((item) => [item.date, item]));

  typedEvents.forEach((event) => {
    const eventDate = new Date(event.created_at);
    const dateKey = getDateKey(eventDate);
    const dailyItem = dailyMap.get(dateKey);

    if (event.event_type === "page_view") {
      totals.pageViews += 1;

      if (dailyItem) {
        dailyItem.pageViews += 1;
      }

      return;
    }

    const totalKey = EVENT_TO_TOTAL_KEY[event.event_type];

    totals[totalKey] += 1;
    totals.interactions += 1;

    if (dailyItem) {
      dailyItem.interactions += 1;
    }
  });

  const channels = [
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
      channel: "Como chegar",
      value: totals.directionsClicks
    }
  ];

  return {
    success: true,
    data: {
      business: {
        id: business.id,
        name: business.name,
        plan: business.plan,
        subscriptionStatus: business.subscription_status
      },

      period: {
        days: safeDays,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },

      totals,
      daily,
      channels
    }
  };
}
