type CancelSubscriptionResponse = {
  success?: boolean;
  error?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
};

export async function cancelBusinessSubscription(
  businessId: string
): Promise<CancelSubscriptionResponse> {
  const response = await fetch("/api/stripe/cancel-subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      businessId
    })
  });

  const result = (await response.json()) as CancelSubscriptionResponse;

  if (!response.ok) {
    throw new Error(result.error ?? "Não foi possível cancelar a subscrição.");
  }

  return result;
}
