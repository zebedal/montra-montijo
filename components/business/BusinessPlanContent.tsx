"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BadgeCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { useCreateBusiness } from "@/contexts/CreateBusinessContext";
import { supabase } from "@/lib/supabase/client";

type Props = {
  initialDraftId: string | null;
  canPublishTestBusiness?: boolean;
};

export default function BusinessPlanContent({
  initialDraftId,
  canPublishTestBusiness = false
}: Props) {
  const router = useRouter();
  const { clearDraft } = useCreateBusiness();

  const [draftId, setDraftId] = useState<string | null>(initialDraftId);

  const [isPublishingFree, setIsPublishingFree] = useState(false);

  const [isStartingPremium, setIsStartingPremium] = useState(false);
  const [isPublishingTest, setIsPublishingTest] = useState(false);

  const isSubmitting =
    isPublishingFree || isStartingPremium || isPublishingTest;

  useEffect(() => {
    if (draftId) {
      return;
    }

    let cancelled = false;

    async function loadLatestDraft() {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Erro ao obter o utilizador:", userError);

        return;
      }

      if (!user || cancelled) {
        return;
      }

      const { data, error } = await supabase
        .from("business_drafts")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Erro ao obter o rascunho:", error);

        return;
      }

      if (!cancelled && data?.id) {
        setDraftId(data.id);
      }
    }

    loadLatestDraft();

    return () => {
      cancelled = true;
    };
  }, [draftId]);

  async function publishFree() {
    if (!draftId || isSubmitting) {
      return;
    }

    try {
      setIsPublishingFree(true);

      const response = await fetch("/api/publish-business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftId,
          isFeatured: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível publicar o negócio.");
      }

      clearDraft();

      toast.success("Negócio publicado com sucesso!", {
        position: "top-center"
      });

      router.replace(
        `/criar-negocio/sucesso?slug=${encodeURIComponent(data.businessSlug)}&business_id=${encodeURIComponent(data.businessId)}`
      );
    } catch (error) {
      console.error("Erro ao publicar o negócio:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Houve um erro ao publicar o negócio.",
        {
          position: "top-center"
        }
      );
    } finally {
      setIsPublishingFree(false);
    }
  }

  async function choosePremium() {
    if (!draftId || isSubmitting) {
      return;
    }

    try {
      setIsStartingPremium(true);

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftId,
          isFeatured: true
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Não foi possível iniciar o pagamento."
        );
      }

      if (!result.sessionId || !result.url) {
        throw new Error("A sessão de pagamento é inválida.");
      }

      localStorage.setItem("pendingCheckoutSession", result.sessionId);

      window.location.assign(result.url);
    } catch (error) {
      console.error("Erro ao iniciar pagamento:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar o pagamento.",
        {
          position: "top-center"
        }
      );

      setIsStartingPremium(false);
    }
  }

  async function publishHiddenTestBusiness() {
    if (!draftId || isSubmitting || !canPublishTestBusiness) {
      return;
    }

    try {
      setIsPublishingTest(true);

      const response = await fetch("/api/publish-business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftId,
          isFeatured: false,
          isTest: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Não foi possível criar o negócio de teste."
        );
      }

      clearDraft();

      toast.success("Negócio de teste criado e mantido oculto.", {
        position: "top-center"
      });

      router.replace("/area-cliente");
    } catch (error) {
      console.error("Erro ao criar negócio de teste:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o negócio de teste.",
        {
          position: "top-center"
        }
      );
    } finally {
      setIsPublishingTest(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-10">
      <div className="mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-bold">
          Como queres publicar o teu negócio?
        </h1>

        <p className="mt-3 text-muted-foreground">
          Podes publicar gratuitamente ou escolher o Plano Destaque para obter
          mais visibilidade desde o primeiro dia.
        </p>
      </div>

      <div className="grid w-full gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plano Gratuito</CardTitle>

            <p className="text-sm text-muted-foreground">
              Ideal para começares.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
                Perfil público
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
                Fotografias
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
                Contactos
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
                Horário de funcionamento
              </li>
            </ul>

            <Button
              type="button"
              onClick={publishFree}
              className="w-full"
              size="lg"
              disabled={!draftId || isSubmitting}
            >
              {isPublishingFree ? (
                <span className="flex items-center gap-2">
                  <Spinner />A publicar negócio...
                </span>
              ) : (
                "Publicar gratuitamente"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary-green shadow-lg">
          <CardHeader className="space-y-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-green" />
              Plano Destaque
            </CardTitle>

            <div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">4,99€</span>

                <span className="pb-1 text-muted-foreground">/ mês</span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                Mais visibilidade para o teu negócio desde o primeiro dia.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
                Tudo incluído no plano gratuito
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
                Destaque na página inicial
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
                Prioridade nos resultados de pesquisa
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
                Acesso a estatísticas do negócio
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 shrink-0 text-green-600" />
                <span>
                  Badge <strong>“Destaque”</strong> no perfil
                </span>
              </li>
            </ul>

            <div className="rounded-lg border border-primary-green/20 bg-primary-green/5 p-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary-green" />
                  Sem fidelização
                </li>

                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary-green" />
                  Cancela quando quiseres
                </li>

                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary-green" />
                  Renovação mensal
                </li>
              </ul>
            </div>

            <Button
              type="button"
              onClick={choosePremium}
              className="w-full bg-primary-green hover:bg-primary-green/90"
              size="lg"
              disabled={!draftId || isSubmitting}
            >
              {isStartingPremium ? (
                <span className="flex items-center gap-2">
                  <Spinner />A preparar pagamento...
                </span>
              ) : (
                "Ativar Plano Destaque"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {canPublishTestBusiness && (
        <div className="mt-6 w-full rounded-xl border border-dashed border-amber-400 bg-amber-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-amber-950">
                Ferramenta de administrador
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Cria este negócio no plano gratuito, mas mantém-no fora das
                páginas públicas, pesquisas e sitemap.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={publishHiddenTestBusiness}
              disabled={!draftId || isSubmitting}
              className="shrink-0 border-amber-500 bg-white text-amber-950 hover:bg-amber-100"
            >
              {isPublishingTest ? (
                <span className="flex items-center gap-2">
                  <Spinner />A criar teste...
                </span>
              ) : (
                "Criar negócio de teste (oculto)"
              )}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
