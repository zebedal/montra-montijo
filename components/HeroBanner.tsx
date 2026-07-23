"use client";

import Image from "next/image";

import SearchAutocomplete from "@/components/search/SearchAutoComplete";
import heroImage from "@/public/images/background.webp";

export function Hero() {
  return (
    <section className="relative flex h-125 w-full items-center justify-center text-center">
      <Image
        className="object-cover object-center"
        src={heroImage}
        alt="Comércio local no Montijo"
        fill
        preload
        placeholder="blur"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-3xl px-4 text-white">
        <h1 className="text-4xl font-bold md:text-5xl">
          Descobre o comércio local no Montijo
        </h1>

        <p className="mt-4 text-white/80">
          Pesquisa negócios e serviços perto de ti.
        </p>

        <SearchAutocomplete
          className="mt-6"
          suggestionsId="hero-search-suggestions"
        />
      </div>
    </section>
  );
}
