import { supabaseAdmin } from "@/lib/supabase/admin";

export type PendingBusinessClaim = {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  businessPlan: string;
  claimantUserId: string;
  claimantEmail: string | null;
  currentOwnerUserId: string | null;
  currentOwnerEmail: string | null;
  fullName: string;
  roleInBusiness: string;
  phone: string | null;
  message: string | null;
  createdAt: string;
};

type BusinessClaimRow = {
  id: string;
  business_id: string;
  claimant_user_id: string;
  current_owner_user_id: string | null;
  full_name: string;
  role_in_business: string;
  phone: string | null;
  message: string | null;
  created_at: string;

  business:
    | {
        id: string;
        name: string;
        slug: string;
        plan: string;
      }
    | {
        id: string;
        name: string;
        slug: string;
        plan: string;
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

async function getUserEmail(userId: string | null) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error) {
    console.error(`Erro ao obter utilizador ${userId}:`, error);

    return null;
  }

  return data.user?.email ?? null;
}

export async function getPendingBusinessClaims(): Promise<
  PendingBusinessClaim[]
> {
  const { data, error } = await supabaseAdmin
    .from("business_claims")
    .select(
      `
        id,
        business_id,
        claimant_user_id,
        current_owner_user_id,
        full_name,
        role_in_business,
        phone,
        message,
        created_at,
        business:businesses (
          id,
          name,
          slug,
          plan
        )
      `
    )
    .eq("status", "pending")
    .order("created_at", {
      ascending: true
    });

  if (error) {
    console.error("Erro ao obter pedidos de reivindicação:", error);

    return [];
  }

  const rows = (data ?? []) as unknown as BusinessClaimRow[];

  const claims = await Promise.all(
    rows.map(async (claim) => {
      const business = normalizeBusiness(claim.business);

      if (!business) {
        return null;
      }

      const [claimantEmail, currentOwnerEmail] = await Promise.all([
        getUserEmail(claim.claimant_user_id),
        getUserEmail(claim.current_owner_user_id)
      ]);

      return {
        id: claim.id,
        businessId: business.id,
        businessName: business.name,
        businessSlug: business.slug,
        businessPlan: business.plan,
        claimantUserId: claim.claimant_user_id,
        claimantEmail,
        currentOwnerUserId: claim.current_owner_user_id,
        currentOwnerEmail,
        fullName: claim.full_name,
        roleInBusiness: claim.role_in_business,
        phone: claim.phone,
        message: claim.message,
        createdAt: claim.created_at
      };
    })
  );

  return claims.filter(
    (claim): claim is PendingBusinessClaim => claim !== null
  );
}
