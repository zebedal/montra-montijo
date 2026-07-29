"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

import { Button } from "@/components/ui/button";

const CONSENT_KEY = "montra-analytics-consent";
const OPEN_CONSENT_EVENT = "montra:open-cookie-settings";

type AnalyticsConsent = "accepted" | "rejected" | null;

function readConsent(): AnalyticsConsent {
  const consent = window.localStorage.getItem(CONSENT_KEY);
  return consent === "accepted" || consent === "rejected" ? consent : null;
}

function removeAnalyticsCookies() {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0]?.trim();

    if (name === "_ga" || name?.startsWith("_ga_")) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${window.location.hostname}; SameSite=Lax`;
    }
  });
}

export function GoogleAnalytics({ measurementId }: { measurementId?: string }) {
  const [consent, setConsent] = useState<AnalyticsConsent>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const initialConsentTimer = window.setTimeout(() => {
      setConsent(readConsent());
      setIsInitialized(true);
    }, 0);

    const openSettings = () => setIsSettingsOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, openSettings);

    return () => {
      window.clearTimeout(initialConsentTimer);
      window.removeEventListener(OPEN_CONSENT_EVENT, openSettings);
    };
  }, []);

  if (!measurementId || process.env.NODE_ENV !== "production") return null;

  const shouldAsk = isInitialized && (consent === null || isSettingsOpen);

  function saveConsent(nextConsent: Exclude<AnalyticsConsent, null>) {
    const wasAccepted = consent === "accepted";

    window.localStorage.setItem(CONSENT_KEY, nextConsent);
    setConsent(nextConsent);
    setIsSettingsOpen(false);

    if (nextConsent === "rejected") {
      removeAnalyticsCookies();

      // Depois de o script ter sido carregado, uma atualização garante que
      // deixa de recolher dados durante o resto da sessão.
      if (wasAccepted) window.location.reload();
    }
  }

  return (
    <>
      {consent === "accepted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', ${JSON.stringify(measurementId)});
            `}
          </Script>
        </>
      ) : null}

      {shouldAsk ? (
        <aside
          aria-label="Preferências de cookies"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-3xl border border-white/10 bg-text-primary p-5 text-white shadow-2xl sm:p-6"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <p className="font-semibold">Ajude-nos a melhorar a Montra</p>
              <p className="mt-1 text-sm leading-6 text-white/70">
                Utilizamos o Google Analytics para perceber como a plataforma é
                utilizada. Só será ativado com a sua autorização. Consulte a{" "}
                <Link
                  href="/politica-de-cookies"
                  className="font-medium text-white underline underline-offset-4"
                >
                  Política de Cookies
                </Link>
                .
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => saveConsent("rejected")}
              >
                Recusar
              </Button>
              <Button
                type="button"
                className="bg-white text-text-primary hover:bg-white/90"
                onClick={() => saveConsent("accepted")}
              >
                Aceitar
              </Button>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="text-muted-foreground transition-colors hover:text-primary"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
    >
      Gerir cookies
    </button>
  );
}
