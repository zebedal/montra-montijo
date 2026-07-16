import PublicacaoStatus from "@/components/StripeSuccessPage/PublicacaoStatus";

type Props = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function PublicacaoPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  return <PublicacaoStatus initialSessionId={session_id ?? null} />;
}
