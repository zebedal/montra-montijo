import { createClient } from "@/lib/supabase/server";

export type MyBusinessClaim = {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  fullName: string;
  roleInBusiness: string;
  phone: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

type BusinessClaimRow = {
  id: string;
  business_id: string;
  full_name: string;
  role_in_business: string;
  phone: string | null;
  message: string | null;
  status: MyBusinessClaim["status"];
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;

  business:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | {
        id: string;
        name: string;
        slug: string;
      }[]
    | null;
};

function normalizeBusiness(business: BusinessClaimRow["business"]) {
  if (!business) {
    return null;
  }

  if (Array.isArray(business)) {
    return business[0] ?? null;
  }

  return business;
}

export async function getMyBusinessClaims(): Promise<MyBusinessClaim[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_claims")
    .select(
      `
        id,
        business_id,
        full_name,
        role_in_business,
        phone,
        message,
        status,
        rejection_reason,
        created_at,
        reviewed_at,
        business:businesses (
          id,
          name,
          slug
        )
      `
    )
    .eq("claimant_user_id", user.id)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error("Erro ao obter as reivindicações do utilizador:", error);

    return [];
  }

  const rows = (data ?? []) as unknown as BusinessClaimRow[];

  const claims = rows
    .map((claim) => {
      const business = normalizeBusiness(claim.business);

      if (!business) {
        return null;
      }

      return {
        id: claim.id,
        businessId: business.id,
        businessName: business.name,
        businessSlug: business.slug,
        fullName: claim.full_name,
        roleInBusiness: claim.role_in_business,
        phone: claim.phone,
        message: claim.message,
        status: claim.status,
        rejectionReason: claim.rejection_reason,
        createdAt: claim.created_at,
        reviewedAt: claim.reviewed_at
      };
    })
    .filter((claim): claim is MyBusinessClaim => claim !== null);

  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  return claims.filter((claim) => {
    if (claim.status === "pending") {
      return true;
    }

    const referenceDate = claim.reviewedAt ?? claim.createdAt;

    return now - new Date(referenceDate).getTime() <= THIRTY_DAYS;
  });
}
