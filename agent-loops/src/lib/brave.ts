/**
 * Real Brave Search API wrapper. Used by the searcher sub-agent's
 * `web_search` tool. Returns the top N results, condensed to (title,
 * url, snippet) so the model has just enough context to synthesize
 * without ballooning the prompt.
 */

const BRAVE_ENDPOINT = 'https://api.search.brave.com/res/v1/web/search';

export interface BraveResult {
  title: string;
  url: string;
  snippet: string;
}

export async function braveSearch(
  query: string,
  count: number = 5
): Promise<BraveResult[]> {
  const apiKey = process.env.BRAVE_API_KEY;
  if (!apiKey) {
    throw new Error('BRAVE_API_KEY is not set');
  }

  const url = new URL(BRAVE_ENDPOINT);
  url.searchParams.set('q', query);
  url.searchParams.set('count', String(count));

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-Subscription-Token': apiKey,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brave Search ${res.status}: ${text.slice(0, 200)}`);
  }

  const body = (await res.json()) as {
    web?: { results?: Array<{ title: string; url: string; description?: string }> };
  };
  const results = body.web?.results ?? [];
  return results.slice(0, count).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.description ?? '',
  }));
}
