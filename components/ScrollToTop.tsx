"use client";

import { useEffect, useState } from "react";

import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.7);
    }

    window.addEventListener("scroll", handleScroll, {
      passive: true
    });

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  return (
    <Button
      type="button"
      size="icon"
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={[
        "fixed bottom-6 right-6 z-50",
        "h-12 w-12 rounded-full",
        "bg-primary-green text-white",
        "shadow-xl shadow-black/20",
        "transition-all duration-300",
        "hover:bg-[#15803d]",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      ].join(" ")}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
