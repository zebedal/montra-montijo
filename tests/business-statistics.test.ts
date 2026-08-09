import assert from "node:assert/strict";
import test from "node:test";

import { calculateBusinessEventTotals } from "../lib/business-statistics-core";

test("as visualizações não são contabilizadas como interações", () => {
  const totals = calculateBusinessEventTotals([
    { event_type: "page_view" },
    { event_type: "page_view" },
    { event_type: "phone_click" }
  ]);

  assert.equal(totals.pageViews, 2);
  assert.equal(totals.phoneClicks, 1);
  assert.equal(totals.interactions, 1);
});

test("as métricas atuais distinguem campanha, ação principal e canais", () => {
  const totals = calculateBusinessEventTotals([
    { event_type: "campaign_view" },
    { event_type: "campaign_click" },
    { event_type: "campaign_cta_click" },
    { event_type: "primary_cta_click" },
    { event_type: "email_click" },
    { event_type: "directions_click" }
  ]);

  assert.equal(totals.campaignViews, 1);
  assert.equal(totals.campaignClicks, 1);
  assert.equal(totals.campaignCtaClicks, 1);
  assert.equal(totals.primaryCtaClicks, 1);
  assert.equal(totals.emailClicks, 1);
  assert.equal(totals.directionsClicks, 1);
  assert.equal(totals.interactions, 5);
});
