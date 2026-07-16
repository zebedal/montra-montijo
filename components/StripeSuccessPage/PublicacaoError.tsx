import { AlertTriangle, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  title?: string;
  message?: string;
  sessionId?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  retryLabel?: string;
  variant?: "warning" | "error";
};

function PublicacaoError({
  title,
  message,
  sessionId,
  onRetry,
  isRetrying = false,
  retryLabel = "Tentar novamente",
  variant = "error"
}: Props) {
  const subject = encodeURIComponent("Problema na publicação do negócio");

  const body = encodeURIComponent(`Olá,

Ocorreu um problema durante a publicação do meu negócio.

Session ID:
${sessionId || "Não disponível"}

Obrigado.
`);

  const defaultTitle =
    variant === "warning"
      ? "Ainda estamos a confirmar a publicação"
      : "Não foi possível publicar o negócio";

  const defaultMessage =
    variant === "warning"
      ? "A confirmação está a demorar mais do que o esperado. Não volte a efetuar o pagamento."
      : "Ocorreu um erro ao concluir a publicação do negócio.";

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="space-y-6">
        <AlertTriangle
          className={
            variant === "warning"
              ? "mx-auto h-14 w-14 text-amber-500"
              : "mx-auto h-14 w-14 text-red-600"
          }
        />

        <div className="space-y-2">
          <h1 className="text-xl font-medium text-gray-900">
            {title || defaultTitle}
          </h1>

          <p className="mx-auto max-w-md text-gray-500">
            {message || defaultMessage}
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {onRetry && (
            <Button type="button" onClick={onRetry} disabled={isRetrying}>
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />A verificar...
                </>
              ) : (
                retryLabel
              )}
            </Button>
          )}

          <Button variant="outline" asChild>
            <a
              href={`mailto:geral@montramontijo.pt?subject=${subject}&body=${body}`}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contactar assistência
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PublicacaoError;
