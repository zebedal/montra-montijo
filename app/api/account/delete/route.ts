import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const BLOCKED_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid"
]);

type DeleteAccountBody = {
  confirmation?: string;
};

type BusinessRow = {
  id: string;
  logo_url: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
};

type BusinessImageRow = {
  url: string | null;
};

function getStoragePaths(
  businesses: BusinessRow[],
  images: BusinessImageRow[]
) {
  const paths = [
    ...businesses.map((business) => business.logo_url),
    ...images.map((image) => image.url)
  ].filter((path): path is string => Boolean(path));

  return [...new Set(paths)];
}

export async function DELETE(request: Request) {
  let body: DeleteAccountBody;

  try {
    body = (await request.json()) as DeleteAccountBody;
  } catch {
    return NextResponse.json(
      {
        error: "O pedido de eliminação é inválido."
      },
      {
        status: 400
      }
    );
  }

  if (body.confirmation !== "ELIMINAR") {
    return NextResponse.json(
      {
        error: "A confirmação de eliminação não é válida."
      },
      {
        status: 400
      }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        error: "A sua sessão terminou. Inicie sessão novamente."
      },
      {
        status: 401
      }
    );
  }

  const { data: businessesData, error: businessesError } = await supabaseAdmin
    .from("businesses")
    .select(
      `
        id,
        logo_url,
        stripe_subscription_id,
        subscription_status
      `
    )
    .eq("user_id", user.id);

  if (businessesError) {
    console.error(
      "Erro ao obter os negócios antes de eliminar a conta:",
      businessesError
    );

    return NextResponse.json(
      {
        error: "Não foi possível verificar os dados associados à conta."
      },
      {
        status: 500
      }
    );
  }

  const businesses = (businessesData ?? []) as BusinessRow[];

  const hasBlockedSubscription = businesses.some((business) => {
    if (!business.stripe_subscription_id) {
      return false;
    }

    if (!business.subscription_status) {
      return false;
    }

    return BLOCKED_SUBSCRIPTION_STATUSES.has(business.subscription_status);
  });

  if (hasBlockedSubscription) {
    return NextResponse.json(
      {
        error:
          "Existe uma subscrição Premium ativa ou com pagamentos pendentes. Cancele e regularize a subscrição antes de eliminar a conta."
      },
      {
        status: 409
      }
    );
  }

  const businessIds = businesses.map((business) => business.id);

  let images: BusinessImageRow[] = [];

  if (businessIds.length > 0) {
    const { data: imagesData, error: imagesError } = await supabaseAdmin
      .from("business_images")
      .select("url")
      .in("business_id", businessIds);

    if (imagesError) {
      console.error(
        "Erro ao obter as imagens antes de eliminar a conta:",
        imagesError
      );

      return NextResponse.json(
        {
          error: "Não foi possível verificar os ficheiros associados à conta."
        },
        {
          status: 500
        }
      );
    }

    images = (imagesData ?? []) as BusinessImageRow[];
  }

  const storagePaths = getStoragePaths(businesses, images);

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage
      .from("business-media")
      .remove(storagePaths);

    if (storageError) {
      console.error("Erro ao eliminar os ficheiros da conta:", storageError);

      return NextResponse.json(
        {
          error: "Não foi possível eliminar os ficheiros associados à conta."
        },
        {
          status: 500
        }
      );
    }
  }

  if (businessIds.length > 0) {
    const { error: deleteBusinessesError } = await supabaseAdmin
      .from("businesses")
      .delete()
      .in("id", businessIds);

    if (deleteBusinessesError) {
      console.error(
        "Erro ao eliminar os negócios da conta:",
        deleteBusinessesError
      );

      return NextResponse.json(
        {
          error: "Não foi possível eliminar os negócios associados à conta."
        },
        {
          status: 500
        }
      );
    }
  }

  const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
    user.id
  );

  if (deleteUserError) {
    console.error(
      "Erro ao eliminar o utilizador do Supabase Auth:",
      deleteUserError
    );

    return NextResponse.json(
      {
        error:
          "Os dados foram removidos, mas não foi possível concluir a eliminação da conta. Contacte o suporte."
      },
      {
        status: 500
      }
    );
  }

  return NextResponse.json({
    success: true
  });
}
