import assert from "node:assert/strict";
import test from "node:test";

import { getBusinessWhatsAppUrl } from "../lib/business-contact";

test("o WhatsApp acrescenta o indicativo português a números nacionais", () => {
  const url = new URL(getBusinessWhatsAppUrl("912 345 678", "Oficina Local"));

  assert.equal(url.origin + url.pathname, "https://wa.me/351912345678");
  assert.equal(
    url.searchParams.get("text"),
    "Olá! Encontrei Oficina Local na Montra Montijo e gostaria de pedir mais informações."
  );
});

test("o WhatsApp preserva números que já incluem indicativo", () => {
  const url = getBusinessWhatsAppUrl("+351 912 345 678", "Oficina Local");

  assert.match(url, /^https:\/\/wa\.me\/351912345678\?/);
});
