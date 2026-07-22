import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { getSiteUrl } from "@/lib/site-url";

const TOKEN_DURATION_SECONDS = 60 * 60 * 24 * 365;

type MonthlyReportTokenPayload = {
  userId: string;
  expiresAt: number;
};

export function getMonthlyReportSiteUrl() {
  const siteUrl = getSiteUrl();

  return siteUrl.includes("localhost")
    ? "https://www.montramontijo.pt"
    : siteUrl;
}

function getSigningSecret() {
  const secret =
    process.env.REPORT_UNSUBSCRIBE_SECRET ?? process.env.CRON_SECRET;

  if (!secret) {
    throw new Error(
      "REPORT_UNSUBSCRIBE_SECRET ou CRON_SECRET não está configurado."
    );
  }

  return secret;
}

function sign(encodedPayload: string) {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createMonthlyReportUnsubscribeToken(userId: string) {
  const payload: MonthlyReportTokenPayload = {
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + TOKEN_DURATION_SECONDS
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyMonthlyReportUnsubscribeToken(token: string) {
  const [encodedPayload, providedSignature, ...extraParts] = token.split(".");

  if (!encodedPayload || !providedSignature || extraParts.length > 0) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<MonthlyReportTokenPayload>;

    if (
      typeof payload.userId !== "string" ||
      !payload.userId ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload as MonthlyReportTokenPayload;
  } catch {
    return null;
  }
}

export function hasUnsubscribedFromMonthlyReports(appMetadata: unknown) {
  if (!appMetadata || typeof appMetadata !== "object") {
    return false;
  }

  return (
    "monthly_business_reports_unsubscribed" in appMetadata &&
    appMetadata.monthly_business_reports_unsubscribed === true
  );
}
