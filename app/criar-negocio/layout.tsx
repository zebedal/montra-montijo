import { CreateBusinessProvider } from "@/contexts/CreateBusinessContext";

export default function CriarNegocioLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <CreateBusinessProvider>{children}</CreateBusinessProvider>;
}
