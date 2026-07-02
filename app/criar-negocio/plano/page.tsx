"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateBusiness } from "@/contexts/CreateBusinessContext";
import { Routes } from "@/types";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/lib/supabase/client";

export default function BusinessPlanPage() {
  const router = useRouter();
  const { draft, clearDraft } = useCreateBusiness();
  const [isPublishing, setIsPublishing] = useState(false);

  const searchParams = useSearchParams();
  const urlDraftId = searchParams.get("draft");

  const [draftId, setDraftId] = useState<string | null>(urlDraftId);

  // Se não existir draft, significa que alguém entrou diretamente nesta página.
  /* if (!draft) {
    router.replace(Routes.CRIAR_NEGOCIO);
    return null;
  } */

  useEffect(() => {
    if (draftId) return;

    const load = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("business_drafts")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setDraftId(data.id);
      }
    };

    load();
  }, [draftId]);

  const publishFree = async () => {
    if (!draftId) return;

    try {
      setIsPublishing(true);

      const res = await fetch("/api/publish-business", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          draftId,
          isFeatured: false
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      clearDraft();

      toast.success("Negócio publicado com sucesso!", {
        position: "top-center"
      });

      router.replace(Routes.MEUS_NEGOCIOS);
    } catch (error) {
      console.error(error);

      toast.error("Houve um erro ao publicar o negócio.", {
        position: "top-center"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const choosePremium = async () => {
    if (!draftId) return;

    try {
      setIsPublishing(true);

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
      console.log("result", result);

      if (!response.ok) {
        throw new Error(result.error);
      }

      window.location.assign(result.url);
    } catch (error) {
      toast.error("Não foi possível iniciar o pagamento.", {
        position: "top-center"
      });
    } finally {
      setIsPublishing(false);
    }
  };

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
        {/* GRATUITO */}

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
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Perfil público
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Fotografias
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Contactos
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Horário de funcionamento
              </li>
            </ul>

            <Button
              onClick={publishFree}
              className="w-full"
              size="lg"
              disabled={isPublishing}
            >
              {isPublishing ? (
                <span className="flex items-center gap-2">
                  <Spinner /> A publicar negócio...
                </span>
              ) : (
                "Publicar gratuitamente"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* PREMIUM */}

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
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Tudo incluído no plano gratuito
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Destaque na página inicial
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Prioridade nos resultados de pesquisa
              </li>

              <li className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-green-600" />
                Badge <strong>&quot;Destaque&ldquo;</strong> no perfil
              </li>
            </ul>

            <div className="rounded-lg border border-primary-green/20 bg-primary-green/5 p-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary-green" />
                  Sem fidelização
                </li>

                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary-green" />
                  Cancela quando quiseres
                </li>

                <li className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary-green" />
                  Renovação mensal
                </li>
              </ul>
            </div>

            <Button
              onClick={choosePremium}
              className="w-full bg-primary-green hover:bg-primary-green/90"
              size="lg"
              disabled={isPublishing}
            >
              Ativar Plano Destaque
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
