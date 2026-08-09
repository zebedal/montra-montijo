import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateQuoteRequestConversion,
  quoteRequestSchema,
  summarizeQuoteRequests
} from "../lib/quote-request";

const validRequest = {
  businessId: "11b70401-46bd-41f2-9db6-e6cfe02fdf6f",
  name: "Maria Silva",
  phone: "912 345 678",
  email: "",
  description: "Preciso de instalar novas tomadas na sala.",
  locality: "Montijo",
  timing: "this_week" as const,
  consent: true,
  website: ""
};

test("um pedido válido pode usar apenas telefone", () => {
  assert.equal(quoteRequestSchema.safeParse(validRequest).success, true);
});

test("um pedido válido pode usar apenas email", () => {
  assert.equal(
    quoteRequestSchema.safeParse({
      ...validRequest,
      phone: "",
      email: "maria@example.com"
    }).success,
    true
  );
});

test("o pedido exige pelo menos um contacto e consentimento", () => {
  const withoutContact = quoteRequestSchema.safeParse({
    ...validRequest,
    phone: "",
    email: ""
  });
  const withoutConsent = quoteRequestSchema.safeParse({
    ...validRequest,
    consent: false
  });

  assert.equal(withoutContact.success, false);
  assert.equal(withoutConsent.success, false);
});

test("as localidades são agregadas sem distinguir maiúsculas", () => {
  const summary = summarizeQuoteRequests([
    { locality: "Montijo" },
    { locality: "montijo" },
    { locality: "Alcochete" }
  ]);

  assert.deepEqual(summary.localities[0], {
    label: "Montijo",
    value: 2
  });
});

test("a conversão de pedidos usa as visualizações da página", () => {
  assert.equal(calculateQuoteRequestConversion(2, 40), 5);
  assert.equal(calculateQuoteRequestConversion(2, 0), 0);
});
