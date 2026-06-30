import { Card, CardContent } from "@/components/ui/card";
import { PartyPopper } from "lucide-react";

export default function Hero() {
  return (
    <Card className="w-full">
      <CardContent className="py-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-green/10">
          <PartyPopper className="h-7 w-7 text-primary-green" />
        </div>

        <h1 className="text-3xl font-bold">Bem-vindo à Montra Montijo</h1>

        <p className="mt-3 text-muted-foreground">
          “O portal que ajuda o comércio local do Montijo a ganhar visibilidade
          online em minutos.”
        </p>
      </CardContent>
    </Card>
  );
}
