import assert from "node:assert/strict";
import test from "node:test";

import { isHoneypotTriggered } from "../lib/honeypot";
import { businessSchema } from "../lib/schemas/businessFormSchema";

test("o honeypot permite campos vazios e drafts anteriores sem o campo", () => {
  assert.equal(isHoneypotTriggered(""), false);
  assert.equal(isHoneypotTriggered("   "), false);
  assert.equal(isHoneypotTriggered(undefined), false);
});

test("o honeypot rejeita qualquer valor preenchido", () => {
  assert.equal(isHoneypotTriggered("351 212 345 678"), true);
  assert.equal(isHoneypotTriggered("spam"), true);
});

test("o schema aceita negócios antigos sem o campo honeypot", () => {
  const result = businessSchema.safeParse({
    name: "Negócio antigo",
    category_id: "categoria",
    specialtyIds: [],
    description: "Descrição válida com mais de vinte caracteres.",
    phone: "212345678",
    allowWhatsApp: false,
    whatsappPhone: "",
    email: "sergiopauloneves@gmail.com",
    website: "",
    facebook: "",
    instagram: "",
    hasPhysicalAddress: false,
    street: "",
    number: "",
    postalCode: "",
    city: "Montijo",
    servesAtCustomerLocation: false,
    serviceAreas: [],
    images: [],
    faqs: [],
    services: [],
    is24Hours: false,
    openingHours: []
  });

  assert.equal(result.success, true);
});
