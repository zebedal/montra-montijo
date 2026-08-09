import type { Metadata } from "next";

import QuoteRequestsInbox from "@/components/area-cliente/QuoteRequestsInbox";
import { getMyQuoteRequests } from "@/lib/queries/getMyQuoteRequests";

export const metadata: Metadata = {
  title: "Pedidos de orçamento"
};

export default async function QuoteRequestsPage() {
  const requests = await getMyQuoteRequests();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Pedidos de orçamento</h1>
        <p className="mt-2 text-muted-foreground">
          Consulte e acompanhe os pedidos recebidos através das páginas dos seus negócios.
        </p>
      </header>
      <QuoteRequestsInbox initialRequests={requests} />
    </div>
  );
}
