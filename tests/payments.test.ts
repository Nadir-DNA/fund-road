import test from "node:test";
import assert from "node:assert/strict";
import { netReceived, refundBalance } from "../shared/payments.ts";
test("commission assise sur le cash hors taxe, remises déjà incluses", () => {
  assert.equal(netReceived(12000, 12000, 2000), 10000);
  assert.equal(netReceived(6000, 12000, 2000), 5000);
  assert.equal(netReceived(0, 12000, 2000), 0);
  assert.equal(netReceived(0, 0, 0), 0);
});
test("remboursements répétés et hors ordre ne recréditent pas une commission", () => {
  const first = refundBalance(10000, 0, 12000, 6000, 2000);
  assert.deepEqual(first, { refundedNet: 5000, amount: 1000 });
  assert.deepEqual(
    refundBalance(10000, first.refundedNet, 12000, 6000, 2000),
    first,
  );
  assert.deepEqual(
    refundBalance(10000, first.refundedNet, 12000, 3000, 2000),
    first,
  );
  assert.deepEqual(
    refundBalance(10000, first.refundedNet, 12000, 12000, 2000),
    { refundedNet: 10000, amount: 0 },
  );
});
test("montants invalides refusés", () => {
  assert.throws(() => netReceived(10, 0, 0));
  assert.throws(() => refundBalance(100, 0, 0, 0, 2000));
  assert.throws(() => refundBalance(100, 0, 100, 10, -1));
});
