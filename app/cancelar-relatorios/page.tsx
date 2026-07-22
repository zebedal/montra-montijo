import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { verifyMonthlyReportUnsubscribeToken } from "@/lib/resend/monthlyReportPreferences";

export const metadata: Metadata = {
  title: "Cancelar relatórios mensais",
  robots: {
    index: false,
    follow: false
  }
};

type CancelMonthlyReportsPageProps = {
  searchParams: Promise<{
    token?: string;
    status?: string;
  }>;
};

export default async function CancelMonthlyReportsPage({
  searchParams
}: CancelMonthlyReportsPageProps) {
  const { token = "", status } = await searchParams;

  if (status === "success") {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-20">
        <section className="w-full rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-950">
            Relatórios mensais cancelados
          </h1>
          <p className="mt-4 text-gray-600">
            A preferência foi guardada. Não voltará a receber estes relatórios.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Voltar à Montra Montijo</Link>
          </Button>
        </section>
      </main>
    );
  }

  if (status === "test") {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-20">
        <section className="w-full rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-950">
            Link do email de teste
          </h1>
          <p className="mt-4 text-gray-600">
            Este email era apenas um teste, por isso nenhuma preferência foi alterada.
          </p>
        </section>
      </main>
    );
  }

  let validToken = false;

  try {
    validToken = Boolean(token && verifyMonthlyReportUnsubscribeToken(token));
  } catch (error) {
    console.error("Erro ao validar página de cancelamento:", error);
  }

  if (status === "invalid" || status === "error" || !validToken) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-20">
        <section className="w-full rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-950">
            Não foi possível cancelar os relatórios
          </h1>
          <p className="mt-4 text-gray-600">
            O link é inválido ou expirou. Contacte-nos através de
            {" "}
            <a className="underline" href="mailto:geral@montramontijo.pt">
              geral@montramontijo.pt
            </a>
            .
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-20">
      <section className="w-full rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-950">
          Cancelar relatórios mensais?
        </h1>
        <p className="mt-4 text-gray-600">
          Deixará de receber por email os resumos mensais de atividade dos seus
          negócios.
        </p>

        <form
          action="/api/email-preferences/monthly-reports/unsubscribe"
          method="post"
          className="mt-8"
        >
          <input type="hidden" name="token" value={token} />
          <Button type="submit" variant="destructive">
            Confirmar cancelamento
          </Button>
        </form>
      </section>
    </main>
  );
}
