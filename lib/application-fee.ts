const INVALID_PAYMENT_REFERENCES = new Set([
  '',
  'n/a',
  'na',
  'none',
  'null',
  'undefined',
  '-',
  'pending',
  'not paid',
  'unpaid',
]);

/** True when an application already has a recorded application-fee payment. */
export function hasPaidApplicationFee(
  paymentReference?: string | null,
  paymentProof?: string | null
): boolean {
  const ref = typeof paymentReference === 'string' ? paymentReference.trim() : '';
  if (ref && !INVALID_PAYMENT_REFERENCES.has(ref.toLowerCase())) {
    return true;
  }

  const proof = typeof paymentProof === 'string' ? paymentProof.trim() : '';
  return Boolean(proof);
}

export function isNigerianApplicant(
  nationality?: string | null,
  country?: string | null
): boolean {
  return [nationality, country].some(
    (value) => typeof value === 'string' && value.trim().toLowerCase() === 'nigeria'
  );
}
