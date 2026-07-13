import Link from "next/link";

import { Building2, Mail, MapPin } from "lucide-react";
import { SiFacebook, SiInstagram } from "react-icons/si";

import PageContainer from "@/components/PageContainer";

const exploreLinks = [
  {
    label: "Negócios",
    href: "/negocios"
  },
  {
    label: "Categorias",
    href: "/categorias"
  },
  {
    label: "Pesquisar",
    href: "/search"
  }
];

const businessLinks = [
  {
    label: "Adicionar negócio",
    href: "/criar-negocio"
  },
  {
    label: "Área de cliente",
    href: "/area-cliente"
  },
  {
    label: "Entrar",
    href: "/login"
  }
];

const informationLinks = [
  {
    label: "Sobre",
    href: "/sobre"
  },
  {
    label: "Contacto",
    href: "/contacto"
  },
  {
    label: "Política de Privacidade",
    href: "/politica-privacidade"
  },
  {
    label: "Termos e Condições",
    href: "/termos"
  }
];

export default function Footer() {
  return (
    <footer className="border-t bg-[#f8faf8]">
      <PageContainer className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold">Montra Montijo</h2>

                <p className="text-sm text-muted-foreground">Comércio Local</p>
              </div>
            </div>

            <p className="mt-6 leading-7 text-muted-foreground">
              A Montra Montijo é um diretório dedicado ao comércio local do
              concelho, ajudando a aproximar pessoas, empresas e serviços da
              região.
            </p>

            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />

                <span>Montijo, Portugal</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />

                <a
                  href="mailto:geral@montramontijo.pt"
                  className="transition-colors hover:text-primary"
                >
                  geral@montramontijo.pt
                </a>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Link
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <SiFacebook className="h-4 w-4" />
              </Link>

              <Link
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-colors hover:border-primary hover:text-primary"
              >
                <SiInstagram className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Explorar</h3>

            <ul className="mt-5 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Empresas</h3>

            <ul className="mt-5 space-y-3">
              {businessLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Informação</h3>

            <ul className="mt-5 space-y-3">
              {informationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t pt-6">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} Montra Montijo. Todos os direitos
              reservados.
            </p>

            <p>Criado para promover o comércio local do concelho do Montijo.</p>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
