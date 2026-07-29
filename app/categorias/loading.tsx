import { Skeleton } from "@/components/ui/skeleton";

function SectorCardSkeleton() {
  return (
    <div className="min-h-[390px] overflow-hidden rounded-3xl border border-black/[0.06] bg-[#fffdfa] shadow-[0_12px_32px_rgba(58,45,31,0.05)]">
      <div className="relative h-36 bg-[#e9e3da]">
        <Skeleton className="h-full w-full rounded-none bg-[#ddd6cb]" />
        <Skeleton className="absolute -bottom-1 left-5 size-12 rounded-2xl border-4 border-[#fffdfa] bg-[#efe4d1]" />
        <Skeleton className="absolute right-4 top-4 h-7 w-24 rounded-full bg-white/75" />
      </div>

      <div className="flex min-h-[246px] flex-col p-5 pt-6">
        <Skeleton className="h-3 w-12 bg-[#e8ded0]" />
        <Skeleton className="mt-3 h-6 w-2/3 bg-[#deded9]" />

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full bg-[#e8e7e2]" />
          <Skeleton className="h-4 w-5/6 bg-[#e8e7e2]" />
        </div>

        <div className="mt-5 space-y-2">
          <Skeleton className="h-3.5 w-4/5 bg-[#efede8]" />
          <Skeleton className="h-3.5 w-3/5 bg-[#efede8]" />
        </div>

        <Skeleton className="mt-auto h-4 w-32 bg-[#dfe8e1]" />
      </div>
    </div>
  );
}

export default function CategoriesLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="py-2 sm:py-4">
        <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,#123c2b_0%,#1d523c_58%,#2f6a50_100%)] px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
          <div className="absolute -right-24 -top-28 size-80 rounded-full bg-[#f4c95d]/15 blur-3xl" />
          <div className="absolute -bottom-36 left-[38%] size-72 rounded-full bg-[#9ec5b2]/15 blur-3xl" />

          <div className="relative max-w-3xl">
            <Skeleton className="h-4 w-52 bg-white/22" />
            <Skeleton className="mt-5 h-11 w-full max-w-xl bg-white/24 sm:h-14" />
            <Skeleton className="mt-3 h-11 w-56 bg-amber-200/35 sm:h-14" />

            <div className="mt-6 space-y-2">
              <Skeleton className="h-5 w-full max-w-2xl bg-white/18" />
              <Skeleton className="h-5 w-4/5 max-w-xl bg-white/18" />
            </div>

            <Skeleton className="mt-7 h-14 w-full max-w-2xl rounded-2xl bg-white/80 shadow-sm" />

            <div className="mt-5 flex gap-6">
              <Skeleton className="h-4 w-20 bg-white/18" />
              <Skeleton className="h-4 w-24 bg-white/18" />
              <Skeleton className="h-4 w-20 bg-white/18" />
            </div>
          </div>
        </section>

        <div className="mt-14 sm:mt-16">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-3 h-8 w-72 max-w-full" />
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SectorCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
