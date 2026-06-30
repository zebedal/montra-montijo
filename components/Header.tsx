"use client";

import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/lib/supabase/useUser";
import { Routes } from "@/types";

export function Header() {
  const { user, loading } = useUser();

  console.log("user", user);

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="font-bold text-xl tracking-tight">
          Montra Montijo
        </Link>

        <div className="flex items-center gap-2">
          {/* CTA */}
          <Button
            asChild
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Link href={Routes.CRIAR_NEGOCIO}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Negócio
            </Link>
          </Button>

          {/* AUTH ICON */}
          {!loading && (
            <Button variant="ghost" asChild>
              <Link href={user ? Routes.DASHBOARD : Routes.LOGIN}>
                {user ? (
                  <>
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden sm:inline">Área de Cliente</span>
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Conta</span>
                  </>
                )}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
