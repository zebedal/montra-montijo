import assert from "node:assert/strict";
import test from "node:test";

import { getBusinessOpeningStatus } from "../lib/business-opening-status";

const hours = [
  { day: "Segunda", open_time: "09:00", close_time: "13:00", is_closed: false },
  { day: "Segunda", open_time: "15:00", close_time: "19:00", is_closed: false },
  { day: "Terça", open_time: "09:00", close_time: "18:00", is_closed: false }
];

test("indica a próxima abertura em vez de repetir que está encerrado", () => {
  const status = getBusinessOpeningStatus(
    hours,
    new Date("2026-08-09T12:00:00.000Z")
  );

  assert.equal(status.open, false);
  assert.equal(status.message, "Abre amanhã às 09:00");
  assert.equal(status.today, "Domingo");
});

test("indica quando o negócio reabre após a pausa", () => {
  const status = getBusinessOpeningStatus(
    hours,
    new Date("2026-08-10T13:30:00.000Z")
  );

  assert.equal(status.open, false);
  assert.equal(status.message, "Reabre às 15:00");
});
