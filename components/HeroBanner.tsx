"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch() {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <section className="relative w-full h-125 flex items-center justify-center text-center">
      {/* Background image */}
      <Image
        className="absolute inset-0 bg-cover bg-center"
        src="/images/background.jpg"
        loading="eager"
        alt="Background"
        fill
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl px-4 text-white">
        <h1 className="text-4xl md:text-5xl font-bold">
          Descobre o comércio local no Montijo
        </h1>

        <p className="mt-4 text-white/80">
          Pesquisa restaurantes, serviços e negócios perto de ti
        </p>

        {/* Search */}
        <div className="mt-6 flex gap-2 bg-white p-2 rounded-xl">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: cabeleireiro, restaurante..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="border-0 focus-visible:ring-0"
          />

          <Button onClick={handleSearch}>Pesquisar</Button>
        </div>
      </div>
    </section>
  );
}
