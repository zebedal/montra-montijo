import { AlertTriangle, Mail } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
  message?: string;
  sessionId?: string;
  onRetry?: () => void;
};

function PublicacaoError({ message, sessionId, onRetry }: Props) {
  const subject = encodeURIComponent("Problema na publicação do negócio");

  const body = encodeURIComponent(`
Olá,

Ocorreu um problema durante a publicação do meu negócio.

Session ID:
${sessionId}

Obrigado.
`);
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
      <AlertTriangle className="h-14 w-14 text-red-600" />

      <div className="space-y-2">
        <h1 className="text-xl font-medium text-gray-900">
          Não foi possível publicar o negócio
        </h1>

        <p className="text-gray-500 max-w-md">
          {message ||
            "O pagamento foi recebido, mas ocorreu um erro ao concluir a publicação."}
        </p>
      </div>

      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-md bg-black text-white text-sm"
          >
            Tentar novamente
          </button>
        )}

        <Button>
          <a
            href={`mailto:suporte@montramontijo.pt?subject=${subject}&body=${body}`}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Contactar assistência
          </a>
        </Button>
      </div>
    </div>
  );
}

export default PublicacaoError;
