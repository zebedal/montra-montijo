import { Building2 } from "lucide-react";

import MyBusinessCard from "@/components/area-cliente/MyBusinessCard";
import { getMyBusinesses } from "@/lib/queries/getMyBusinesses";
import PremiumCheckoutToast from "@/components/area-cliente/PremiumCheckoutToast";
import { Metadata } from "next";
import PremiumCheckoutDialog from "@/components/area-cliente/PremiumCheckoutDialog";

export const metadata: Metadata = {
  title: "Os meus negócios",
  robots: {
    index: false,
    follow: false
  }
};

export default async function ClientAreaPage() {
  const businesses = await getMyBusinesses();

  if (!businesses || businesses.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Os meus negócios</h1>

          <p className="mt-2 text-muted-foreground">
            Aqui pode consultar e gerir todos os negócios associados à sua
            conta.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed bg-muted/30 px-8 py-20">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary-green" />
            </div>

            <h2 className="mt-6 text-xl font-bold">
              Ainda não tem nenhum negócio
            </h2>

            <p className="mt-3 text-muted-foreground">
              Quando adicionar o seu primeiro negócio, ele será apresentado
              aqui. Poderá editar as informações, gerir fotografias, horários e
              muito mais.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PremiumCheckoutDialog />
      <div>
        <h1 className="text-3xl font-bold">Os meus negócios</h1>

        <p className="mt-2 text-muted-foreground">
          Aqui pode consultar e gerir todos os negócios associados à sua conta.
        </p>
      </div>

      <div className="space-y-4">
        {businesses.map((business) => (
          <MyBusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );
}
