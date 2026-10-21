// All amounts are integer cents. A reward is based on cash received after tax.
export function netReceived(paid: number, total: number, tax: number) {
  if (paid === 0 && total === 0 && tax === 0) return 0;
  if (
    ![paid, total, tax].every(Number.isSafeInteger) ||
    paid < 0 ||
    total <= 0 ||
    tax < 0 ||
    tax > total
  )
    throw new Error("Montants de paiement invalides");
  return Math.floor((Math.min(paid, total) * (total - tax)) / total);
}
export function refundBalance(
  paidNet: number,
  previousRefundNet: number,
  chargeAmount: number,
  chargeRefunded: number,
  rateBps: number,
) {
  if (
    ![paidNet, previousRefundNet, chargeAmount, chargeRefunded, rateBps].every(
      Number.isSafeInteger,
    ) ||
    paidNet < 0 ||
    previousRefundNet < 0 ||
    chargeAmount <= 0 ||
    chargeRefunded < 0 ||
    rateBps < 0 ||
    rateBps > 10000
  )
    throw new Error("Montants de remboursement invalides");
  const refundedNet = Math.min(
    paidNet,
    Math.max(
      previousRefundNet,
      Math.round(
        (paidNet * Math.min(chargeRefunded, chargeAmount)) / chargeAmount,
      ),
    ),
  );
  return {
    refundedNet,
    amount: Math.floor(((paidNet - refundedNet) * rateBps) / 10000),
  };
}
