import { Loader2 } from "lucide-react";

function Processing() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
      <div className="h-12 w-12 border-2 border-gray-300 border-t-black rounded-full animate-spin" />

      <div className="space-y-2">
        <h1 className="text-xl font-medium text-gray-900">
          A publicar o teu negócio
        </h1>

        <p className="text-gray-500 max-w-md">
          Estamos a concluir o processo. Isto pode demorar alguns segundos.
        </p>
      </div>

      <p className="text-sm text-gray-400">Não feches esta página</p>
    </div>
  );
}
export default Processing;
