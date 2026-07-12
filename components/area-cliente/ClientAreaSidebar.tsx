"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Building2, CreditCard, User } from "lucide-react";

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
    href: Routes.PERFIL,
    label: "Perfil",
    icon: User
  },
  {
    href: Routes.PLANO,
    label: "Plano Premium",
    icon: CreditCard
  }
];

export default function ClientAreaSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-xl border bg-card p-4 lg:sticky lg:top-18 self-start">
      <h2 className="mb-6 text-lg font-semibold">Área de Cliente</h2>

      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
