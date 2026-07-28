"use client";

import {
  useEffect,
  useMemo,
  useState
} from "react";
import { LockKeyhole, MousePointerClick } from "lucide-react";

import {
  getPrimaryCtaOptions,
  PRIMARY_CTA_LABELS,
  type PrimaryCtaDestination,
  type PrimaryCtaType
} from "@/lib/business-primary-cta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  businessId: string;
  plan: "free" | "premium";
  categorySlug?: string | null;
  whatsappPhone?: string | null;
  initialValue: {
    enabled: boolean;
    type: PrimaryCtaType | null;
    destination: PrimaryCtaDestination | null;
    url: string | null;
    message: string | null;
  };
  onDirtyChange?: (dirty: boolean) => void;
  onSaveReady?: (save: () => Promise<void>) => void;
};

export function BusinessPrimaryCtaEditor({
  businessId,
  plan,
  categorySlug,
  whatsappPhone,
  initialValue,
  onDirtyChange,
  onSaveReady
}: Props) {
  const [enabled, setEnabled] = useState(initialValue.enabled);
  const [type, setType] = useState<PrimaryCtaType | null>(initialValue.type);
  const [destination, setDestination] =
    useState<PrimaryCtaDestination | null>(initialValue.destination);
  const [url, setUrl] = useState(initialValue.url ?? "");
  const [message, setMessage] = useState(initialValue.message ?? "");
  const [savedValue, setSavedValue] = useState(initialValue);
  const options = useMemo(
    () => getPrimaryCtaOptions(categorySlug),
    [categorySlug]
  );

  const currentValue = useMemo(
    () => ({
      enabled,
      type,
      destination,
      url: url.trim() || null,
      message: message.trim() || null
    }),
    [destination, enabled, message, type, url]
  );
  const isDirty = JSON.stringify(currentValue) !== JSON.stringify(savedValue);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    onSaveReady?.(async () => {
      if (plan !== "premium" || !isDirty) return;

      const response = await fetch(`/api/businesses/${businessId}/primary-cta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentValue)
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Não foi possível guardar.");
      }

      setSavedValue(currentValue);
      onDirtyChange?.(false);
    });
  }, [
    businessId,
    currentValue,
    isDirty,
    onDirtyChange,
    onSaveReady,
    plan
  ]);

  if (plan !== "premium") {
    return (
      <Card id="acao-principal" className="mx-auto max-w-4xl border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LockKeyhole className="h-5 w-5 text-muted-foreground" />
            Ação principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            No Plano Destaque pode adicionar um botão de reserva, marcação,
            orçamento ou compra e acompanhar os respetivos cliques.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      id="acao-principal"
      className="mx-auto max-w-4xl border-primary/20"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointerClick className="h-5 w-5 text-primary" />
          Ação principal
        </CardTitle>
        <p className="text-sm leading-6 text-muted-foreground">
          Destaque a ação comercial mais importante na página do negócio. Cada
          clique será contabilizado nas estatísticas.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
          <Checkbox
            checked={enabled}
            onCheckedChange={(checked) => setEnabled(checked === true)}
          />
          <span>
            <span className="block text-sm font-medium">Apresentar botão</span>
            <span className="block text-sm text-muted-foreground">
              Pode desativá-lo sem perder a configuração.
            </span>
          </span>
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ação</label>
            <Select
              value={type ?? undefined}
              onValueChange={(value) => setType(value as PrimaryCtaType)}
              disabled={!enabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolher ação" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {PRIMARY_CTA_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Encaminhar para</label>
            <Select
              value={destination ?? undefined}
              onValueChange={(value) =>
                setDestination(value as PrimaryCtaDestination)
              }
              disabled={!enabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolher destino" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="url">Link externo</SelectItem>
                <SelectItem value="whatsapp" disabled={!whatsappPhone}>
                  WhatsApp{!whatsappPhone ? " (não configurado)" : ""}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {enabled && destination === "url" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Link de destino</label>
            <Input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
        )}

        {enabled && destination === "whatsapp" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Mensagem inicial (opcional)
            </label>
            <Textarea
              maxLength={500}
              placeholder="Olá, gostaria de..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Será utilizado o número {whatsappPhone}.
            </p>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
