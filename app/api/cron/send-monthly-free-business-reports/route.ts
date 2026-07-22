import { NextRequest, NextResponse } from "next/server";

import { sendMonthlyFreeBusinessReportEmailOnce } from "@/lib/resend/sendMonthlyFreeBusinessReportEmailOnce";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BUSINESS_BATCH_SIZE = 100;
const SEND_CONCURRENCY = 3;

type FreeBusiness = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
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
  | "missing_email";

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

async function getAllEligibleBusinesses(): Promise<FreeBusiness[]> {
  const businesses: FreeBusiness[] = [];
  let from = 0;

  while (true) {
    const to = from + BUSINESS_BATCH_SIZE - 1;

    const { data, error } = await supabaseAdmin
      .from("businesses")
      .select("id, user_id, name, slug")
      .eq("plan", "free")
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
  const baseQuery = () =>
    supabaseAdmin
      .from("business_events")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("business_id", businessId)
      .gte("created_at", period.start.toISOString())
      .lt("created_at", period.end.toISOString());

  const [pageViewsResult, interactionsResult] = await Promise.all([
    baseQuery().eq("event_type", "page_view"),
    baseQuery().neq("event_type", "page_view")
  ]);

  if (pageViewsResult.error || interactionsResult.error) {
    console.error("Erro ao calcular atividade mensal:", {
      businessId,
      pageViewsError: pageViewsResult.error,
      interactionsError: interactionsResult.error
    });

    throw new Error("Não foi possível calcular a atividade mensal.");
  }

  return {
    pageViews: pageViewsResult.count ?? 0,
    interactions: interactionsResult.count ?? 0
  };
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
  const activity = await getBusinessActivity(business.id, period);

  if (activity.pageViews === 0 && activity.interactions === 0) {
    return "no_activity";
  }

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
    interactions: activity.interactions
  });

  return result.alreadySent ? "already_sent" : "sent";
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
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
