import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
  sendMonthlyFreeBusinessReportEmail,
  type MonthlyReportInsights,
  type MonthlyReportRecommendation
} from "@/lib/resend/sendMonthlyFreeBusinessReportEmail";
import { sendMonthlyFreeBusinessReportEmailOnce } from "@/lib/resend/sendMonthlyFreeBusinessReportEmailOnce";
import { hasUnsubscribedFromMonthlyReports } from "@/lib/resend/monthlyReportPreferences";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BUSINESS_BATCH_SIZE = 100;
const SEND_CONCURRENCY = 3;

type FreeBusiness = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_24_hours: boolean;
  plan: "free" | "premium";
};

type TrackedEvent = {
  event_type: string;
  created_at: string;
};

const ACTION_LABELS: Record<string, string> = {
  phone_click: "Telefone e WhatsApp",
  email_click: "Email",
  website_click: "Website",
  instagram_click: "Instagram",
  facebook_click: "Facebook",
  directions_click: "Morada e indicações"
};

type MonthlyPeriod = {
  key: string;
  label: string;
  start: Date;
  end: Date;
};

type BusinessReportResult =
  | "sent"
  | "would_send"
  | "already_sent"
  | "no_activity"
  | "missing_email"
  | "unsubscribed";

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  return Boolean(
    cronSecret && request.headers.get("authorization") === `Bearer ${cronSecret}`
  );
}

function getPreviousMonthPeriod(referenceDate = new Date()): MonthlyPeriod {
  const end = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1)
  );

  const start = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, 1)
  );

  return {
    key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}`,
    label: new Intl.DateTimeFormat("pt-PT", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(start),
    start,
    end
  };
}

function getCurrentMonthToDatePeriod(
  referenceDate = new Date()
): MonthlyPeriod {
  const start = new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), 1)
  );

  return {
    key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}`,
    label: `${new Intl.DateTimeFormat("pt-PT", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(start)} (até ao momento)`,
    start,
    end: referenceDate
  };
}

async function getAllEligibleBusinesses(): Promise<FreeBusiness[]> {
  const businesses: FreeBusiness[] = [];
  let from = 0;

  while (true) {
    const to = from + BUSINESS_BATCH_SIZE - 1;

    const { data, error } = await supabaseAdmin
      .from("businesses")
      .select(
        "id, user_id, name, slug, description, logo_url, phone, email, website, is_24_hours, plan"
      )
      .eq("is_visible", true)
      .not("user_id", "is", null)
      .order("id", {
        ascending: true
      })
      .range(from, to);

    if (error) {
      console.error("Erro ao obter negócios gratuitos:", error);
      throw new Error("Não foi possível obter os negócios gratuitos.");
    }

    const page = (data ?? []) as FreeBusiness[];
    businesses.push(...page);

    if (page.length < BUSINESS_BATCH_SIZE) {
      break;
    }

    from += BUSINESS_BATCH_SIZE;
  }

  return businesses;
}

async function getBusinessActivity(
  businessId: string,
  period: MonthlyPeriod
) {
  const { data, error } = await supabaseAdmin
    .from("business_events")
    .select("event_type, created_at")
    .eq("business_id", businessId)
    .gte("created_at", period.start.toISOString())
    .lt("created_at", period.end.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao calcular atividade mensal:", {
      businessId,
      error
    });

    throw new Error("Não foi possível calcular a atividade mensal.");
  }

  const events = (data ?? []) as TrackedEvent[];
  const breakdown: Record<string, number> = Object.fromEntries(
    Object.keys(ACTION_LABELS).map((eventType) => [eventType, 0])
  );
  const weekdayTotals = new Map<string, number>();
  const weeklyPageViews = [0, 0, 0, 0, 0];
  let pageViews = 0;
  let interactions = 0;

  events.forEach((event) => {
    const date = new Date(event.created_at);
    const localParts = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      timeZone: "Europe/Lisbon"
    }).formatToParts(date);
    const dayOfMonth = Number(
      localParts.find((part) => part.type === "day")?.value ?? 1
    );
    const weekday = new Intl.DateTimeFormat("pt-PT", {
      weekday: "long",
      timeZone: "Europe/Lisbon"
    }).format(date);

    weekdayTotals.set(weekday, (weekdayTotals.get(weekday) ?? 0) + 1);

    if (event.event_type === "page_view") {
      pageViews += 1;
      const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 4);
      weeklyPageViews[weekIndex] += 1;
      return;
    }

    interactions += 1;
    breakdown[event.event_type] = (breakdown[event.event_type] ?? 0) + 1;
  });

  const topAction = Object.entries(breakdown).sort(
    ([, countA], [, countB]) => countB - countA
  )[0];
  const busiestDay = [...weekdayTotals.entries()].sort(
    ([, countA], [, countB]) => countB - countA
  )[0];

  return {
    pageViews,
    interactions,
    directionsClicks: breakdown.directions_click ?? 0,
    breakdown,
    topAction:
      topAction && topAction[1] > 0
        ? {
            label: ACTION_LABELS[topAction[0]] ?? topAction[0],
            count: topAction[1]
          }
        : null,
    busiestDay:
      busiestDay && busiestDay[1] > 0
        ? {
            label:
              busiestDay[0].charAt(0).toUpperCase() + busiestDay[0].slice(1),
            count: busiestDay[1]
          }
        : null,
    weeklyPageViews
  };
}

function getPreviousPeriod(period: MonthlyPeriod): MonthlyPeriod {
  const start = new Date(
    Date.UTC(period.start.getUTCFullYear(), period.start.getUTCMonth() - 1, 1)
  );
  const isCompleteCalendarMonth =
    period.end.getUTCDate() === 1 &&
    period.end.getUTCHours() === 0 &&
    period.end.getUTCMinutes() === 0;
  const elapsedTime = period.end.getTime() - period.start.getTime();
  const fullPreviousMonthEnd = period.start.getTime();
  const end = isCompleteCalendarMonth
    ? new Date(fullPreviousMonthEnd)
    : new Date(Math.min(start.getTime() + elapsedTime, fullPreviousMonthEnd));

  return {
    key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(
      2,
      "0"
    )}`,
    label: new Intl.DateTimeFormat("pt-PT", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(start),
    start,
    end
  };
}

function getChangePercent(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function buildInsights(
  activity: Awaited<ReturnType<typeof getBusinessActivity>>,
  previousActivity: Awaited<ReturnType<typeof getBusinessActivity>>
): MonthlyReportInsights {
  const milestone =
    activity.pageViews >= 500
      ? "Mais de 500 visualizações neste período"
      : activity.pageViews >= 100
        ? "Mais de 100 visualizações neste período"
        : activity.interactions >= 25
          ? "Mais de 25 ações de potenciais clientes"
          : activity.directionsClicks >= 10
            ? "10 ou mais consultas à localização"
            : null;

  return {
    previousPageViews: previousActivity.pageViews,
    previousInteractions: previousActivity.interactions,
    pageViewsChangePercent: getChangePercent(
      activity.pageViews,
      previousActivity.pageViews
    ),
    interactionsChangePercent: getChangePercent(
      activity.interactions,
      previousActivity.interactions
    ),
    engagementRate:
      activity.pageViews > 0
        ? Math.round((activity.interactions / activity.pageViews) * 1000) / 10
        : 0,
    breakdown: Object.entries(ACTION_LABELS).map(([eventType, label]) => ({
      label,
      count: activity.breakdown[eventType] ?? 0
    })),
    topAction: activity.topAction,
    busiestDay: activity.busiestDay,
    weeklyPageViews: activity.weeklyPageViews.map((count, index) => ({
      label: `Semana ${index + 1}`,
      count
    })),
    milestone
  };
}

async function getBusinessProfileRecommendations(
  business: FreeBusiness,
  activity?: Awaited<ReturnType<typeof getBusinessActivity>>
): Promise<MonthlyReportRecommendation[]> {
  const [imagesResult, hoursResult] = await Promise.all([
    supabaseAdmin
      .from("business_images")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("business_id", business.id),
    supabaseAdmin
      .from("business_hours")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("business_id", business.id)
  ]);

  if (imagesResult.error || hoursResult.error) {
    console.error("Erro ao verificar a completude do negócio:", {
      businessId: business.id,
      imagesError: imagesResult.error,
      hoursError: hoursResult.error
    });

    throw new Error("Não foi possível verificar a completude do negócio.");
  }

  const recommendations: MonthlyReportRecommendation[] = [];

  if (
    activity &&
    activity.pageViews >= 5 &&
    activity.interactions === 0
  ) {
    recommendations.push({
      title: "Facilite o próximo passo",
      description:
        "A página recebeu visualizações, mas ainda não gerou ações. Confirme os contactos e apresente claramente como o cliente pode falar consigo.",
      ctaLabel: "Rever contactos"
    });
  }

  if (
    activity?.topAction?.label === "Morada e indicações" &&
    (imagesResult.count ?? 0) < 2
  ) {
    recommendations.push({
      title: "Ajude os clientes a reconhecer o local",
      description:
        "A localização foi a ação mais procurada. Adicione uma fotografia da fachada ou da entrada do negócio.",
      ctaLabel: "Adicionar fotografia"
    });
  }

  if (
    activity?.topAction?.label === "Instagram" ||
    activity?.topAction?.label === "Facebook"
  ) {
    recommendations.push({
      title: "Aproveite o interesse nas redes sociais",
      description: `${activity.topAction.label} foi o canal mais procurado. Confirme que o endereço está atualizado e que o perfil apresenta informação recente.`,
      ctaLabel: "Rever redes sociais"
    });
  }

  if ((imagesResult.count ?? 0) === 0) {
    recommendations.push({
      title: "Adicione fotografias",
      description:
        "Mostre o espaço, os produtos ou os serviços para tornar a página mais apelativa a potenciais clientes.",
      ctaLabel: "Adicionar fotografias"
    });
  }

  if (!business.phone?.trim() && !business.email?.trim() && !business.website?.trim()) {
    recommendations.push({
      title: "Complete os contactos",
      description:
        "Facilite o próximo passo a potenciais clientes adicionando pelo menos uma forma de contacto.",
      ctaLabel: "Adicionar contactos"
    });
  }

  if (!business.is_24_hours && (hoursResult.count ?? 0) === 0) {
    recommendations.push({
      title: "Adicione o horário",
      description:
        "Indique quando está disponível para evitar que potenciais clientes desistam por falta de informação.",
      ctaLabel: "Adicionar horário"
    });
  }

  if ((business.description?.trim().length ?? 0) < 80) {
    recommendations.push({
      title: "Melhore a descrição",
      description:
        "Explique melhor os principais produtos ou serviços para ajudar quem ainda não conhece o negócio.",
      ctaLabel: "Completar descrição"
    });
  }

  if (!business.logo_url?.trim()) {
    recommendations.push({
      title: "Adicione o logótipo",
      description:
        "Um logótipo torna o perfil mais reconhecível nas listagens da Montra Montijo.",
      ctaLabel: "Adicionar logótipo"
    });
  }

  return recommendations.slice(0, 2);
}

async function processBusinessReport({
  business,
  period,
  dryRun
}: {
  business: FreeBusiness;
  period: MonthlyPeriod;
  dryRun: boolean;
}): Promise<BusinessReportResult> {
  const [activity, previousActivity] = await Promise.all([
    getBusinessActivity(business.id, period),
    getBusinessActivity(business.id, getPreviousPeriod(period))
  ]);

  if (activity.pageViews === 0 && activity.interactions === 0) {
    return "no_activity";
  }

  const recommendations = await getBusinessProfileRecommendations(
    business,
    activity
  );

  const {
    data: { user },
    error: userError
  } = await supabaseAdmin.auth.admin.getUserById(business.user_id);

  if (userError) {
    console.error("Erro ao obter o proprietário do negócio:", {
      businessId: business.id,
      error: userError
    });

    throw new Error("Não foi possível obter o proprietário do negócio.");
  }

  if (!user?.email) {
    return "missing_email";
  }

  if (hasUnsubscribedFromMonthlyReports(user.app_metadata)) {
    return "unsubscribed";
  }

  if (dryRun) {
    return "would_send";
  }

  const result = await sendMonthlyFreeBusinessReportEmailOnce({
    userId: user.id,
    businessId: business.id,
    email: user.email,
    businessName: business.name,
    businessSlug: business.slug,
    periodKey: period.key,
    periodLabel: period.label,
    pageViews: activity.pageViews,
    interactions: activity.interactions,
    directionsClicks: activity.directionsClicks,
    plan: business.plan,
    insights: buildInsights(activity, previousActivity),
    recommendations
  });

  return result.alreadySent ? "already_sent" : "sent";
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        error: "Não autorizado."
      },
      {
        status: 401
      }
    );
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "true";
  const period = getPreviousMonthPeriod();

  try {
    const businesses = await getAllEligibleBusinesses();
    const totals = {
      eligible: businesses.length,
      wouldSend: 0,
      sent: 0,
      alreadySent: 0,
      noActivity: 0,
      missingEmail: 0,
      unsubscribed: 0,
      failed: 0
    };

    const failures: { businessId: string; message: string }[] = [];

    for (let index = 0; index < businesses.length; index += SEND_CONCURRENCY) {
      const batch = businesses.slice(index, index + SEND_CONCURRENCY);

      const results = await Promise.allSettled(
        batch.map((business) =>
          processBusinessReport({
            business,
            period,
            dryRun
          })
        )
      );

      results.forEach((result, resultIndex) => {
        if (result.status === "rejected") {
          totals.failed += 1;
          failures.push({
            businessId: batch[resultIndex].id,
            message:
              result.reason instanceof Error
                ? result.reason.message
                : "Erro inesperado."
          });
          return;
        }

        if (result.value === "would_send") totals.wouldSend += 1;
        if (result.value === "sent") totals.sent += 1;
        if (result.value === "already_sent") totals.alreadySent += 1;
        if (result.value === "no_activity") totals.noActivity += 1;
        if (result.value === "missing_email") totals.missingEmail += 1;
        if (result.value === "unsubscribed") totals.unsubscribed += 1;
      });
    }

    return NextResponse.json({
      success: totals.failed === 0,
      dryRun,
      period: {
        key: period.key,
        label: period.label,
        start: period.start.toISOString(),
        end: period.end.toISOString()
      },
      totals,
      failures
    });
  } catch (error) {
    console.error("Erro ao enviar relatórios mensais:", error);

    return NextResponse.json(
      {
        error: "Não foi possível processar os relatórios mensais."
      },
      {
        status: 500
      }
    );
  }
}

export async function POST(request: NextRequest) {
  const isCronAuthorized = isAuthorized(request);
  const admin = isCronAuthorized ? null : await requireAdmin();
  const adminUserId = admin?.authorized ? admin.userId : null;

  if (!isCronAuthorized && !admin?.authorized) {
    return NextResponse.json(
      {
        error: "Não autorizado."
      },
      {
        status: 401
      }
    );
  }

  try {
    const body = (await request.json()) as {
      businessId?: unknown;
      email?: unknown;
    };

    const businessId =
      typeof body.businessId === "string" ? body.businessId.trim() : "";
    const requestedEmail =
      typeof body.email === "string" ? body.email.trim() : "";

    if (
      !businessId ||
      (isCronAuthorized &&
        (!requestedEmail || !/^\S+@\S+\.\S+$/.test(requestedEmail)))
    ) {
      return NextResponse.json(
        {
          error: isCronAuthorized
            ? "Indique um businessId e um email válidos."
            : "Indique um businessId válido."
        },
        {
          status: 400
        }
      );
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select(
        "id, user_id, name, slug, plan, is_visible, description, logo_url, phone, email, website, is_24_hours"
      )
      .eq("id", businessId)
      .maybeSingle();

    if (businessError) {
      throw new Error("Não foi possível obter o negócio de teste.");
    }

    if (!business) {
      return NextResponse.json(
        {
          error: "Negócio não encontrado."
        },
        {
          status: 404
        }
      );
    }

    if (!isCronAuthorized && business.user_id !== adminUserId) {
      return NextResponse.json(
        {
          error: "Este negócio não pertence ao administrador."
        },
        {
          status: 403
        }
      );
    }

    let recipientEmail = requestedEmail;

    if (!isCronAuthorized && admin?.authorized) {
      const {
        data: { user: adminUser },
        error: adminUserError
      } = await supabaseAdmin.auth.admin.getUserById(admin.userId);

      if (adminUserError || !adminUser?.email) {
        throw new Error("O administrador não tem um email válido.");
      }

      recipientEmail = adminUser.email;
    }

    // O teste deve permitir validar interações acabadas de realizar. O envio
    // mensal automático continua a usar o mês anterior, já encerrado.
    const period = getCurrentMonthToDatePeriod();
    const [activity, previousActivity] = await Promise.all([
      getBusinessActivity(business.id, period),
      getBusinessActivity(business.id, getPreviousPeriod(period))
    ]);
    const recommendations = await getBusinessProfileRecommendations(
      business as FreeBusiness,
      activity
    );

    await sendMonthlyFreeBusinessReportEmail({
      email: recipientEmail,
      businessName: business.name,
      businessSlug: business.slug,
      periodLabel: period.label,
      pageViews: activity.pageViews,
      interactions: activity.interactions,
      directionsClicks: activity.directionsClicks,
      businessId: business.id,
      plan: business.plan,
      insights: buildInsights(activity, previousActivity),
      recommendations,
      isTest: true
    });

    return NextResponse.json({
      success: true,
      test: true,
      recordedAsMonthlyDelivery: false,
      recipient: recipientEmail,
      business: {
        id: business.id,
        name: business.name,
        plan: business.plan,
        isVisible: business.is_visible
      },
      period: {
        key: period.key,
        label: period.label
      },
      activity,
      recommendations
    });
  } catch (error) {
    console.error("Erro ao enviar relatório mensal de teste:", error);

    return NextResponse.json(
      {
        error: "Não foi possível enviar o relatório mensal de teste."
      },
      {
        status: 500
      }
    );
  }
}
