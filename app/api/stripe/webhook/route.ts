import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import {
  getBusinessDraft,
  moveDraftAssets,
  publishBusiness
} from "@/lib/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  console.log("WEBHOOK RECEIVED");
  const supabase = await createClient();

  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Invalid signature", err);
    return new NextResponse("Webhook error", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      const { data: checkout, error } = await supabase
        .from("stripe_checkouts")
        .select("*")
        .eq("session_id", session.id)
        .single();

      if (error || !checkout) {
        console.error("Checkout not found");
        return new NextResponse("Not found", { status: 404 });
      }

      if (checkout.business_id) {
        return NextResponse.json({ ok: true });
      }
      console.log("1 - Checkout encontrado");
      const { userId, draft } = await getBusinessDraft(
        supabase,
        checkout.draft_id
      );
      console.log("2 - Draft obtido");
      const businessId = crypto.randomUUID();

      const assets = await moveDraftAssets({
        supabaseAdmin,
        draftId: checkout.draft_id,
        businessId,
        draft
      });
      console.log("3 - Assets movidos");
      await publishBusiness({
        supabaseAdmin,
        businessId,
        userId,
        draft: {
          ...draft,
          logoUrl: assets.logoUrl,
          imageUrls: assets.imageUrls
        },
        isFeatured: true
      });
      console.log("4 - Business publicado");
      await supabase
        .from("stripe_checkouts")
        .update({
          status: "completed",
          business_id: businessId,
          processed_at: new Date().toISOString()
        })
        .eq("session_id", session.id);
      console.log("5 - Checkout atualizado");

      return NextResponse.json({ ok: true });
    }
    default: {
      console.log("Ignoring event:", event.type);

      return NextResponse.json({
        received: true
      });
    }
  }
}
