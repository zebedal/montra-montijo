import Link from "next/link";

interface ErrorProps {
  message?: string;
}

import { AlertTriangle } from "lucide-react";

type Props = {
  message?: string;
  onRetry?: () => void;
};

function PublicacaoError({ message, onRetry }: Props) {
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

        <a href="/suporte" className="px-4 py-2 rounded-md border text-sm">
          Contactar suporte
        </a>
      </div>
    </div>
  );
}

export default PublicacaoError;
