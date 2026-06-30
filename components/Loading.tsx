import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({
  message = "A carregar...",
  fullScreen = false
}: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? "min-h-screen" : "min-h-[300px]"
      }`}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary-green" />

      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
