import assert from "node:assert/strict";
import test from "node:test";

import { canUseStickyBusinessHours } from "../lib/sticky-business-hours";

test("ativa o horário sticky em desktop quando o card cabe na janela", () => {
  assert.equal(
    canUseStickyBusinessHours({
      viewportWidth: 1440,
      viewportHeight: 900,
      contentHeight: 560,
      topOffset: 136
    }),
    true
  );
});

test("mantém o horário no fluxo normal em mobile", () => {
  assert.equal(
    canUseStickyBusinessHours({
      viewportWidth: 390,
      viewportHeight: 844,
      contentHeight: 500,
      topOffset: 136
    }),
    false
  );
});

test("mantém o horário no fluxo quando o card não cabe completamente", () => {
  assert.equal(
    canUseStickyBusinessHours({
      viewportWidth: 1440,
      viewportHeight: 700,
      contentHeight: 560,
      topOffset: 136
    }),
    false
  );
});
