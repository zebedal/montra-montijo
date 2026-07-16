"use client";

import { ChevronDown, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { SiFacebook } from "react-icons/si";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type Props = {
  title: string;
  url: string;
  text: string;
  entityLabel?: string;
  iconOnly?: boolean;
};

export default function ShareButton({
  title,
  url,
  text,
  entityLabel = "conteúdo",
  iconOnly = false
}: Props) {
  async function shareNative() {
    if (!navigator.share) {
      toast.info("Escolha uma opção de partilha.");
      return;
    }

    try {
      await navigator.share({
        title,
        text,
        url
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error(`Não foi possível partilhar o ${entityLabel}.`);
      }
    }
  }

  function shareOnFacebook() {
    const facebookUrl = new URL("https://www.facebook.com/sharer/sharer.php");

    facebookUrl.searchParams.set("u", url);

    window.open(
      facebookUrl.toString(),
      "facebook-share-dialog",
      "width=680,height=520,resizable=yes,scrollbars=yes"
    );
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);

      toast.success("Ligação copiada.");
    } catch {
      toast.error("Não foi possível copiar a ligação.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={iconOnly ? "icon" : "default"}
          aria-label={`Partilhar ${entityLabel}`}
          title="Partilhar"
        >
          <Share2 className="h-4 w-4" />

          {!iconOnly && (
            <>
              <span className="ml-2">Partilhar</span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {typeof navigator !== "undefined" && "share" in navigator && (
          <DropdownMenuItem onClick={shareNative}>
            <Share2 className="mr-2 h-4 w-4" />
            Partilhar no dispositivo
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={shareOnFacebook}>
          <SiFacebook className="mr-2 h-4 w-4" />
          Partilhar no Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={copyLink}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar ligação
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
