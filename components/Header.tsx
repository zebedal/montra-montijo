"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Building2,
  CalendarDays,
  CircleUserRound,
  Crown,
  Grid2X2,
  Heart,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
  Menu,
  Plus,
  ShieldQuestion,
  User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

import { supabase } from "@/lib/supabase/client";
import { useUser } from "@/lib/supabase/useUser";
import { Routes } from "@/types";

type MobileNavLinkProps = {
  href: string;
  icon?: React.ElementType;
  children: React.ReactNode;
};

function MobileNavLink({ href, icon: Icon, children }: MobileNavLinkProps) {
  return (
    <SheetClose asChild>
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
      >
        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/8 transition-colors group-hover:bg-white/12">
            <Icon className="h-4 w-4 text-emerald-300" />
          </span>
        )}

        <span>{children}</span>
      </Link>
    </SheetClose>
  );
}

export function Header() {
  const { user, loading } = useUser();

  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace(Routes.LOGIN);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="Montra Montijo">
          <Image
            src="/images/new-logo.png"
            alt="Montra Montijo"
            width={160}
            height={80}
            priority
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-1 lg:flex"
        >
          <Button asChild variant="ghost">
            <Link href={Routes.NEGOCIOS}>Negócios</Link>
          </Button>

          <Button asChild variant="ghost">
            <Link href="/categorias">Categorias</Link>
          </Button>

          <Button asChild variant="ghost">
            <Link href="/eventos">Agenda</Link>
          </Button>

          <Button asChild variant="ghost">
            <Link href="/plano-destaque">Plano Destaque</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            asChild
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Link href={Routes.CRIAR_NEGOCIO}>
              <Plus className="h-4 w-4 sm:mr-2" />

              <span className="hidden sm:inline">Criar negócio</span>
            </Link>
          </Button>

          <div className="hidden lg:block">
            {!loading &&
              (!user ? (
                <Button variant="ghost" asChild>
                  <Link href={Routes.LOGIN}>
                    <User className="mr-2 h-5 w-5" />
                    Conta
                  </Link>
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <User className="mr-2 h-5 w-5" />
                      Conta
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
                      <Link
                        href={Routes.AREA_CLIENTE}
                        className="cursor-pointer"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Área de cliente
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/area-cliente/favoritos"
                        className="cursor-pointer"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        Favoritos
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link
                        href="/area-cliente/reivindicacoes"
                        className="cursor-pointer"
                      >
                        <ShieldQuestion className="mr-2 h-4 w-4" />
                        Reivindicações
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

          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[88vw] overflow-y-auto border-l border-white/10 bg-[#10281e] p-0 text-white sm:max-w-sm"
            >
              <div className="flex min-h-full flex-col">
                <div className="relative border-b border-white/10 px-6 pb-6 pt-7">
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl"
                  />

                  <div
                    aria-hidden="true"
                    className="absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-white/5 blur-3xl"
                  />

                  <div className="relative">
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="block w-fit"
                        aria-label="Montra Montijo"
                      >
                        <Image
                          src="/images/logo-darker.png"
                          alt="Montra Montijo"
                          width={120}
                          height={80}
                          priority
                        />
                      </Link>
                    </SheetClose>
                  </div>
                </div>

                <nav className="flex-1 space-y-7 px-4 py-7">
                  <section>
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-300/75">
                      Explorar
                    </p>

                    <div className="space-y-1">
                      <MobileNavLink href={Routes.NEGOCIOS} icon={Building2}>
                        Negócios
                      </MobileNavLink>

                      <MobileNavLink href={Routes.CATEGORIAS} icon={Grid2X2}>
                        Categorias
                      </MobileNavLink>

                      <MobileNavLink href={Routes.EVENTOS} icon={CalendarDays}>
                        Agenda
                      </MobileNavLink>
                    </div>
                  </section>

                  <section>
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-300/75">
                      Para comerciantes
                    </p>

                    <div className="space-y-1">
                      <MobileNavLink href={Routes.CRIAR_NEGOCIO} icon={Plus}>
                        Criar negócio
                      </MobileNavLink>

                      <MobileNavLink href="/plano-destaque" icon={Crown}>
                        Plano Destaque
                      </MobileNavLink>
                    </div>
                  </section>

                  {!loading && (
                    <section>
                      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-emerald-300/75">
                        Conta
                      </p>

                      {!user ? (
                        <div className="space-y-1">
                          <MobileNavLink href={Routes.LOGIN} icon={LogIn}>
                            Entrar ou criar conta
                          </MobileNavLink>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                                <CircleUserRound className="h-5 w-5 text-emerald-300" />
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white">
                                  Conta
                                </p>

                                <p className="truncate text-xs text-white/45">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          <MobileNavLink
                            href={Routes.AREA_CLIENTE}
                            icon={LayoutDashboard}
                          >
                            Área de cliente
                          </MobileNavLink>

                          <MobileNavLink href={Routes.FAVORITOS} icon={Heart}>
                            Favoritos
                          </MobileNavLink>

                          <MobileNavLink
                            href={Routes.REIVINDICACOES}
                            icon={ShieldQuestion}
                          >
                            Reivindicações
                          </MobileNavLink>

                          <SheetClose asChild>
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="group mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                            >
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                                <LogOut className="h-4 w-4" />
                              </span>

                              <span>Terminar sessão</span>
                            </button>
                          </SheetClose>
                        </div>
                      )}
                    </section>
                  )}
                </nav>

                <div className="border-t border-white/10 px-7 py-5">
                  <p className="text-xs text-white/30">© 2026 Montra Montijo</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
