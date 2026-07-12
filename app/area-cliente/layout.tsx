import { ReactNode } from "react";

import ClientAreaSidebar from "@/components/area-cliente/ClientAreaSidebar";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

type Props = {
  children: ReactNode;
};

export default async function ClientAreaLayout({ children }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }
  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr] ">
        <ClientAreaSidebar />

        <main>{children}</main>
      </div>
    </div>
  );
}
