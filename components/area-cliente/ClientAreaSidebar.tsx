"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Building2,
  Heart,
  Megaphone,
  Settings,
  User,
  FileQuestion,
  ClipboardList
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Routes } from "@/types";

const links = [
  {
    href: Routes.AREA_CLIENTE,
    label: "Os meus negócios",
    icon: Building2,
    exact: true
  },
  {
    href: Routes.CAMPANHAS,
    label: "Campanhas",
    icon: Megaphone
  },
  {
    href: Routes.PEDIDOS_ORCAMENTO,
    label: "Orçamentos",
    icon: ClipboardList
  },
  {
    href: Routes.FAVORITOS,
    label: "Favoritos",
    icon: Heart,
    exact: true
  },
  {
    href: Routes.PERFIL,
    label: "Perfil",
    icon: User
  },
  {
    href: Routes.DEFINICOES,
    label: "Definições",
    icon: Settings
  },
  {
    label: "Reivindicações",
    href: Routes.REIVINDICACOES,
    icon: FileQuestion
  }
];

export default function ClientAreaSidebar() {
  const pathname = usePathname();
  const [pendingNavigation, setPendingNavigation] = useState<{
    from: string;
    to: string;
  } | null>(null);

  // Mantém o item selecionado imediatamente após o clique. Quando o pathname
  // muda, a seleção volta automaticamente a ser determinada pela rota real.
  const selectedPathname =
    pendingNavigation?.from === pathname ? pendingNavigation.to : pathname;

  return (
    <aside className="rounded-xl border bg-card p-3 lg:self-start lg:sticky lg:top-28 lg:p-4">
      <h2 className="mb-6 hidden text-lg font-semibold lg:block">
        Área de Cliente
      </h2>

      <nav className="grid grid-cols-3 gap-2 lg:block lg:space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? selectedPathname === href
            : selectedPathname === href ||
              selectedPathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              aria-current={active ? "page" : undefined}
              onNavigate={() =>
                setPendingNavigation({ from: pathname, to: href })
              }
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg p-3 text-center text-xs transition-colors lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2 lg:text-sm",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <Icon className="h-5 w-5 shrink-0 lg:h-4 lg:w-4" />

              <span className="leading-tight">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
