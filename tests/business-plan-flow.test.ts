import assert from "node:assert/strict";
import test from "node:test";

import {
  getBusinessPlanStepUrl,
  getCampaignPrimaryCta,
  parsePaidBusinessPlan,
  shouldStartAutomaticCheckout
} from "../lib/business-plan";

test("a campanha abre diretamente a criação com Premium", () => {
  assert.deepEqual(
    getCampaignPrimaryCta({
      hasPremiumBusiness: false,
      isAuthenticated: true
    }),
    {
      href: "/criar-negocio?plan=premium",
      label: "Ativar o Plano Premium"
    }
  );
});

test("um negócio Premium abre a gestão de campanhas", () => {
  assert.equal(
    getCampaignPrimaryCta({
      hasPremiumBusiness: true,
      isAuthenticated: true
    }).href,
    "/area-cliente/campanhas"
  );
});

test("o plano escolhido acompanha o draft até ao passo de pagamento", () => {
  assert.equal(
    getBusinessPlanStepUrl("draft-123", "premium"),
    "/criar-negocio/plano?draft=draft-123&plan=premium"
  );
  assert.equal(
    getBusinessPlanStepUrl("draft-123", "featured"),
    "/criar-negocio/plano?draft=draft-123&plan=featured"
  );
});

test("sem plano escolhido, o URL mantém apenas o draft", () => {
  assert.equal(
    getBusinessPlanStepUrl("draft-123", null),
    "/criar-negocio/plano?draft=draft-123"
  );
});

test("apenas Premium e Destaque são aceites como planos pagos", () => {
  assert.equal(parsePaidBusinessPlan("premium"), "premium");
  assert.equal(parsePaidBusinessPlan("featured"), "featured");
  assert.equal(parsePaidBusinessPlan("free"), null);
  assert.equal(parsePaidBusinessPlan("desconhecido"), null);
  assert.equal(parsePaidBusinessPlan(undefined), null);
});

test("o checkout automático exige draft, plano e uma tentativa ainda não iniciada", () => {
  assert.equal(
    shouldStartAutomaticCheckout({
      draftId: "draft-123",
      plan: "premium",
      alreadyAttempted: false
    }),
    true
  );
  assert.equal(
    shouldStartAutomaticCheckout({
      draftId: "draft-123",
      plan: null,
      alreadyAttempted: false
    }),
    false
  );
  assert.equal(
    shouldStartAutomaticCheckout({
      draftId: "draft-123",
      plan: "premium",
      alreadyAttempted: true
    }),
    false
  );
});
