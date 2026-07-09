"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Building2, CreditCard, LayoutDashboard, User } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  {
    href: "/area-cliente",
    label: "Os meus negócios",
    icon: Building2
  },
  {
    href: "/area-cliente/perfil",
    label: "Perfil",
    icon: User
  },
  {
    href: "/area-cliente/plano",
    label: "Plano Premium",
    icon: CreditCard
  }
];

export default function ClientAreaSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-xl border bg-card p-4">
      <h2 className="mb-6 text-lg font-semibold">Área de Cliente</h2>

      <nav className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

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
