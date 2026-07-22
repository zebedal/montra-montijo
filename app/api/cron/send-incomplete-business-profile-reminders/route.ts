import { NextRequest, NextResponse } from "next/server";

import { hasUnsubscribedFromMonthlyReports } from "@/lib/resend/monthlyReportPreferences";
import { sendIncompleteBusinessProfileEmailOnce } from "@/lib/resend/sendIncompleteBusinessProfileEmailOnce";
import { supabaseAdmin } from "@/lib/supabase/admin";

const BUSINESS_BATCH_SIZE = 100;
const SEND_CONCURRENCY = 3;
const MINIMUM_PROFILE_AGE_DAYS = 7;
const MAXIMUM_PROFILE_AGE_DAYS = 9;

type Business = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
};

type Result =
  | "sent"
  | "already_sent"
  | "complete"
  | "missing_email"
  | "unsubscribed";

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  return Boolean(
    cronSecret && request.headers.get("authorization") === `Bearer ${cronSecret}`
  );
}

async function getEligibleBusinesses(windowStart: string, cutoff: string) {
  const businesses: Business[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabaseAdmin
      .from("businesses")
      .select("id, user_id, name, description")
      .eq("is_visible", true)
      .not("user_id", "is", null)
      .gt("created_at", windowStart)
      .lte("created_at", cutoff)
      .order("id", {
        ascending: true
      })
      .range(from, from + BUSINESS_BATCH_SIZE - 1);

    if (error) {
      throw new Error("Não foi possível obter os negócios elegíveis.");
    }

    const page = (data ?? []) as Business[];
    businesses.push(...page);

    if (page.length < BUSINESS_BATCH_SIZE) {
      break;
    }

    from += BUSINESS_BATCH_SIZE;
  }

  return businesses;
}

async function getMissingItems(business: Business) {
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
    throw new Error("Não foi possível verificar o perfil do negócio.");
  }

  const missingItems: string[] = [];

  if ((imagesResult.count ?? 0) === 0) {
    missingItems.push("Fotografias do espaço, produtos ou serviços");
  }

  if ((hoursResult.count ?? 0) === 0) {
    missingItems.push("Horário de funcionamento");
  }

  if ((business.description?.trim().length ?? 0) < 80) {
    missingItems.push("Uma descrição mais completa do negócio");
  }

  return missingItems;
}

async function processBusiness(business: Business): Promise<Result> {
  const { data: previousDelivery, error: deliveryError } = await supabaseAdmin
    .from("transactional_email_deliveries")
    .select("sent_at")
    .eq("business_id", business.id)
    .eq("email_type", "incomplete_business_profile_reminder")
    .maybeSingle();

  if (deliveryError) {
    throw new Error("Não foi possível verificar o histórico de envios.");
  }

  if (previousDelivery?.sent_at) {
    return "already_sent";
  }

  const missingItems = await getMissingItems(business);

  if (missingItems.length === 0) {
    return "complete";
  }

  const {
    data: { user },
    error: userError
  } = await supabaseAdmin.auth.admin.getUserById(business.user_id);

  if (userError) {
    throw new Error("Não foi possível obter o proprietário do negócio.");
  }

  if (!user?.email) {
    return "missing_email";
  }

  if (hasUnsubscribedFromMonthlyReports(user.app_metadata)) {
    return "unsubscribed";
  }

  const result = await sendIncompleteBusinessProfileEmailOnce({
    userId: user.id,
    businessId: business.id,
    email: user.email,
    businessName: business.name,
    missingItems
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

  const cutoff = new Date(
    Date.now() - MINIMUM_PROFILE_AGE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
  const windowStart = new Date(
    Date.now() - MAXIMUM_PROFILE_AGE_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  try {
    const businesses = await getEligibleBusinesses(windowStart, cutoff);
    const totals = {
      eligible: businesses.length,
      sent: 0,
      alreadySent: 0,
      complete: 0,
      missingEmail: 0,
      unsubscribed: 0,
      failed: 0
    };

    const failures: { businessId: string; message: string }[] = [];

    for (let index = 0; index < businesses.length; index += SEND_CONCURRENCY) {
      const batch = businesses.slice(index, index + SEND_CONCURRENCY);
      const results = await Promise.allSettled(batch.map(processBusiness));

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

        if (result.value === "sent") totals.sent += 1;
        if (result.value === "already_sent") totals.alreadySent += 1;
        if (result.value === "complete") totals.complete += 1;
        if (result.value === "missing_email") totals.missingEmail += 1;
        if (result.value === "unsubscribed") totals.unsubscribed += 1;
      });
    }

    return NextResponse.json({
      success: totals.failed === 0,
      windowStart,
      cutoff,
      totals,
      failures
    });
  } catch (error) {
    console.error("Erro ao enviar lembretes de perfil incompleto:", error);

    return NextResponse.json(
      {
        error: "Não foi possível processar os lembretes."
      },
      {
        status: 500
      }
    );
  }
}
