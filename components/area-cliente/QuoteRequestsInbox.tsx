"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ExternalLink, Inbox, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  QUOTE_REQUEST_STATUSES,
  quoteRequestStatusLabels,
  quoteRequestTimingLabels,
  type QuoteRequestStatus
} from "@/lib/quote-request";
import type { MyQuoteRequest } from "@/lib/queries/getMyQuoteRequests";

type Props = {
  initialRequests: MyQuoteRequest[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default function QuoteRequestsInbox({ initialRequests }: Props) {
  const [requests, setRequests] = useState(initialRequests);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: QuoteRequestStatus) {
    const previous = requests;
    setUpdatingId(id);
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status } : request
      )
    );

    try {
      const response = await fetch(`/api/quote-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Não foi possível atualizar o pedido.");
      }
    } catch (error) {
      setRequests(previous);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o pedido."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (requests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <Inbox className="size-10 text-muted-foreground" />
          <h2 className="mt-5 text-xl font-semibold">Ainda não recebeu pedidos</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Os pedidos enviados através das páginas dos seus negócios aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {requests.map((request) => (
        <Card key={request.id} className={request.status === "new" ? "border-green-300 shadow-sm" : ""}>
          <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-xl">
                  Pedido de {request.requester_name}
                </CardTitle>
                {request.status === "new" && <Badge className="bg-green-700">Novo</Badge>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Para <Link href={`/negocio/${request.business.slug}`} target="_blank" className="font-medium text-foreground hover:underline">{request.business.name}<ExternalLink className="ml-1 inline size-3" /></Link>
              </p>
            </div>
            <Select value={request.status} disabled={updatingId === request.id} onValueChange={(value) => updateStatus(request.id, value as QuoteRequestStatus)}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUOTE_REQUEST_STATUSES.map((status) => <SelectItem key={status} value={status}>{quoteRequestStatusLabels[status]}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Cliente</p><p className="mt-1 font-medium">{request.requester_name}</p></div>
              <div className="min-w-0"><p className="text-xs uppercase tracking-wide text-muted-foreground">Contacto</p><div className="mt-1 space-y-1">
                {request.requester_phone && <a href={`tel:${request.requester_phone}`} className="flex items-center gap-2 break-all hover:underline"><Phone className="size-3.5 shrink-0" />{request.requester_phone}</a>}
                {request.requester_email && <a href={`mailto:${request.requester_email}`} className="flex items-center gap-2 break-all hover:underline"><Mail className="size-3.5 shrink-0" />{request.requester_email}</a>}
              </div></div>
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Localidade</p><p className="mt-1 flex items-center gap-2"><MapPin className="size-3.5" />{request.locality}</p></div>
              <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Quando</p><p className="mt-1">{quoteRequestTimingLabels[request.timing]}</p></div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 text-sm leading-7">{request.description}</div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />Recebido em {formatDate(request.created_at)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
