"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Heart, LayoutDashboard, LogOut, Plus, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";
import { Routes } from "@/types";

export function Header() {
  const { user, loading } = useUser();

  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace(Routes.LOGIN);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          <Image
            src="/images/logo.svg"
            alt="logo montra montijo"
            width={128}
            height={64}
          />
        </Link>

        <div className="flex items-center gap-2">
          {/* CTA */}
          <Button
            asChild
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Link href={Routes.CRIAR_NEGOCIO}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Negócio
            </Link>
          </Button>

          {!loading &&
            (!user ? (
              <Button variant="ghost" asChild>
                <Link href={Routes.LOGIN}>
                  <User className="mr-2 h-5 w-5" />
                  <span className="hidden sm:inline">Conta</span>
                </Link>
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">
                    <User className="mr-2 h-5 w-5" />

                    <span className="hidden sm:inline">Conta</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-semibold">Conta</span>

                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href={Routes.AREA_CLIENTE} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Área de Cliente
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/area-cliente/favoritos">
                      <Heart className="mr-2 h-4 w-4" />
                      Favoritos
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Terminar sessão
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
        </div>
      </div>
    </header>
  );
}
