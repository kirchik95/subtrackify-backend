const EXCHANGE_API_URL = 'https://open.er-api.com/v6/latest/USD';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface RatesCache {
  rates: Record<string, number>;
  fetchedAt: number;
}

let cache: RatesCache | null = null;

async function fetchRates(): Promise<Record<string, number>> {
  const response = await fetch(EXCHANGE_API_URL);
  if (!response.ok) {
    throw new Error(`Exchange rate API error: ${response.status}`);
  }
  const data = (await response.json()) as { result: string; rates: Record<string, number> };
  if (data.result !== 'success') {
    throw new Error('Exchange rate API returned non-success result');
  }
  return data.rates; // Already includes USD: 1
}

async function getRates(): Promise<Record<string, number>> {
  const now = Date.now();

  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rates;
  }

  try {
    const rates = await fetchRates();
    cache = { rates, fetchedAt: now };
    return rates;
  } catch (error) {
    // Use stale cache if available
    if (cache) {
      console.warn('Failed to fetch exchange rates, using stale cache:', error);
      return cache.rates;
    }
    console.warn('Failed to fetch exchange rates, no cache available:', error);
    throw error;
  }
}

/**
 * Convert an amount from one currency to another.
 * Uses USD as intermediary: amount / rates[from] * rates[to]
 * Degrades gracefully: returns unconverted amount if rates unavailable.
 */
export async function convert(amount: number, from: string, to: string): Promise<number> {
  if (from === to || amount === 0) return amount;

  try {
    const rates = await getRates();
    const fromRate = rates[from];
    const toRate = rates[to];

    if (!fromRate || !toRate) {
      console.warn(`Exchange rate not found for ${from} or ${to}, returning unconverted`);
      return amount;
    }

    // Convert: amount in FROM → USD → TO
    return (amount / fromRate) * toRate;
  } catch {
    // Graceful degradation: return unconverted amount
    return amount;
  }
}
