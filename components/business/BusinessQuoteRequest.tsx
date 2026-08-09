"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, FileText, Phone, Send } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { trackAnalyticsEvent } from "@/lib/analytics/trackAnalyticsEvent";
import { trackBusinessEvent } from "@/lib/analytics/trackBusinessEvent";
import { getBusinessWhatsAppUrl } from "@/lib/business-contact";
import {
  QUOTE_REQUEST_TIMINGS,
  quoteRequestSchema,
  quoteRequestTimingLabels,
  type QuoteRequestInput
} from "@/lib/quote-request";

type Props = {
  businessId: string;
  businessName: string;
  phone: string | null;
  whatsappPhone: string | null;
};

const defaultValues: QuoteRequestInput = {
  businessId: "",
  name: "",
  phone: "",
  email: "",
  description: "",
  locality: "",
  timing: "flexible",
  consent: false,
  website: ""
};

export function BusinessQuoteRequest({
  businessId,
  businessName,
  phone,
  whatsappPhone
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: { ...defaultValues, businessId }
  });

  function openQuoteRequest() {
    trackAnalyticsEvent("quote_request_open", {
      business_id: businessId
    });
    setOpen(true);
  }

  useEffect(() => {
    function handleServiceQuoteRequest(event: Event) {
      const serviceName = (event as CustomEvent<{ serviceName?: string }>).detail
        ?.serviceName;

      if (serviceName) {
        setValue("description", `Pretendo pedir orçamento para: ${serviceName}. `);
      }

      openQuoteRequest();
    }

    window.addEventListener("business:request-quote", handleServiceQuoteRequest);
    return () =>
      window.removeEventListener(
        "business:request-quote",
        handleServiceQuoteRequest
      );
  // A função depende apenas dos identificadores estáveis desta ficha.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, setValue]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmitted(false);
      reset({ ...defaultValues, businessId });
    }
  }

  async function submitQuoteRequest(values: QuoteRequestInput) {
    const response = await fetch("/api/quote-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Não foi possível enviar o pedido.");
    }

    trackAnalyticsEvent("generate_lead", {
      lead_source: "quote_request",
      business_id: businessId
    });
    setSubmitted(true);
  }

  return (
    <>
      <Card
        id="pedir-orcamento"
        tabIndex={-1}
        className="scroll-mt-32 overflow-hidden border-green-200 bg-green-50/70 outline-none"
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold">Precisa de um orçamento?</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Explique o que precisa e envie o pedido diretamente a {businessName}.
              </p>
            </div>
          </div>
          <Button
            type="button"
            className="mt-5 w-full"
            onClick={openQuoteRequest}
          >
            Pedir orçamento
            <Send className="size-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 rounded-2xl border bg-background/95 p-2 shadow-2xl backdrop-blur lg:hidden">
        {(whatsappPhone || phone) && (
          <Button asChild size="lg" variant="outline" className="min-w-0">
            <a
              href={
                whatsappPhone
                  ? getBusinessWhatsAppUrl(whatsappPhone, businessName)
                  : `tel:${phone}`
              }
              target={whatsappPhone ? "_blank" : undefined}
              rel={whatsappPhone ? "noopener noreferrer" : undefined}
              onClick={() => trackBusinessEvent(businessId, "phone_click")}
            >
              {whatsappPhone ? <SiWhatsapp /> : <Phone />}
              <span className="truncate">
                {whatsappPhone ? "WhatsApp" : "Ligar"}
              </span>
            </a>
          </Button>
        )}
        <Button
          type="button"
          size="lg"
          className={whatsappPhone || phone ? "min-w-0" : "col-span-2"}
          onClick={openQuoteRequest}
        >
          <FileText />
          <span className="truncate">Pedir orçamento</span>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto size-12 text-green-700" />
              <DialogTitle className="mt-5 text-2xl">
                Pedido enviado
              </DialogTitle>
              <DialogDescription className="mx-auto mt-3 max-w-sm leading-6">
                {businessName} recebeu os seus dados e poderá entrar em contacto consigo.
              </DialogDescription>
              <Button className="mt-7" onClick={() => handleOpenChange(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Pedir orçamento</DialogTitle>
                <DialogDescription>
                  Envie os detalhes a {businessName}. O envio não representa um compromisso de contratação.
                </DialogDescription>
              </DialogHeader>

              <form
                onSubmit={handleSubmit(async (values) => {
                  try {
                    await submitQuoteRequest(values);
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Não foi possível enviar o pedido."
                    );
                  }
                })}
                className="space-y-5"
              >
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                  {...register("website")}
                />

                <div>
                  <label htmlFor="quote-name" className="text-sm font-medium">Nome</label>
                  <Input id="quote-name" className="mt-2" autoComplete="name" {...register("name")} />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quote-phone" className="text-sm font-medium">Telefone</label>
                    <Input id="quote-phone" className="mt-2" type="tel" autoComplete="tel" {...register("phone")} />
                    {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="quote-email" className="text-sm font-medium">Email</label>
                    <Input id="quote-email" className="mt-2" type="email" autoComplete="email" {...register("email")} />
                    {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                </div>
                <p className="-mt-3 text-xs text-muted-foreground">Indique pelo menos um contacto.</p>

                <div>
                  <label htmlFor="quote-description" className="text-sm font-medium">O que precisa?</label>
                  <Textarea id="quote-description" className="mt-2 min-h-28" placeholder="Descreva brevemente o trabalho ou serviço pretendido." {...register("description")} />
                  {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="quote-locality" className="text-sm font-medium">Localidade</label>
                    <Input id="quote-locality" className="mt-2" autoComplete="address-level2" {...register("locality")} />
                    {errors.locality && <p className="mt-1 text-xs text-destructive">{errors.locality.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quando pretende o serviço?</label>
                    <Controller
                      control={control}
                      name="timing"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {QUOTE_REQUEST_TIMINGS.map((timing) => (
                              <SelectItem key={timing} value={timing}>{quoteRequestTimingLabels[timing]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <Controller
                  control={control}
                  name="consent"
                  render={({ field }) => (
                    <div>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm leading-6">
                        <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} className="mt-0.5" />
                        <span>Autorizo a Montra Montijo a partilhar estes dados com {businessName} para resposta ao pedido.</span>
                      </label>
                      {errors.consent && <p className="mt-1 text-xs text-destructive">{errors.consent.message}</p>}
                    </div>
                  )}
                />

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Spinner />A enviar pedido...</> : <>Enviar pedido<Send className="size-4" /></>}
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
