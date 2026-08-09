import assert from "node:assert/strict";
import test from "node:test";

import { getBusinessTrustSignals } from "../lib/business-trust-signals";

test("apresenta apenas sinais suportados pelos dados do negócio", () => {
  const signals = getBusinessTrustSignals({
    managedByOwner: true,
    updatedAt: "2026-08-09T15:00:00.000Z",
    hasWhatsApp: true,
    is24Hours: false,
    servesAtCustomerLocation: true,
    acceptsQuoteRequests: true
  });

  assert.deepEqual(
    signals.map((signal) => signal.id),
    [
      "owner_managed",
      "updated",
      "whatsapp",
      "at_customer_location",
      "quote_requests"
    ]
  );
  assert.equal(
    signals.find((signal) => signal.id === "updated")?.label,
    "Informação atualizada em agosto de 2026"
  );
});

test("não inventa sinais de confiança quando os dados não os confirmam", () => {
  const signals = getBusinessTrustSignals({
    managedByOwner: false,
    updatedAt: null,
    hasWhatsApp: false,
    is24Hours: false,
    servesAtCustomerLocation: false,
    acceptsQuoteRequests: false
  });

  assert.deepEqual(signals, []);
});
