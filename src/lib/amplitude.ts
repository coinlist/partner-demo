import type { Types } from '@amplitude/analytics-browser';

// CoinList's own analytics for the hosted demo. Partners building on this
// code can delete this file and `AmplitudeAnalytics` without affecting the
// integration.

/** The only host that reports to CoinList's production Amplitude project. */
export const PRODUCTION_HOSTNAME = 'partner.coinlist.dev';

// The Passage project, shared with passage.coinlist.co. Browser keys are
// public by design: they only allow sending events.
const PRODUCTION_AMPLITUDE_API_KEY = '6bf9ec1df173ce221a3e1addfa3cced4';

/**
 * The Amplitude key for a page served from `hostname`, or `undefined` to send
 * nothing. Only the hosted demo reports by default, so forks and local runs
 * stay silent; `override` (`NEXT_PUBLIC_AMPLITUDE_API_KEY`) opts any other
 * host in, e.g. pointing a local run at a staging project.
 */
export function amplitudeApiKey(
  hostname: string,
  override: string | undefined
): string | undefined {
  if (override) return override;
  return hostname === PRODUCTION_HOSTNAME
    ? PRODUCTION_AMPLITUDE_API_KEY
    : undefined;
}

const EVM_ADDRESS = /0x[0-9a-fA-F]{4,}(?:(?:…|\.\.\.)[0-9a-fA-F]+)?/g;
// Bounded repeats keep the scan linear: an unbounded `[^@]+@` backtracks
// quadratically on a long string with no `@`, freezing the page.
const EMAIL = /[\w.+-]{1,64}@[\w-]{1,63}(?:\.[\w-]{1,63}){1,8}/g;

/**
 * Drops the query string and hash from a URL, absolute or root-relative, and
 * redacts wallet addresses and emails from any other text. The OAuth callback
 * carries `code` and `state` in its query, and the header shows the connected
 * wallet, so neither may reach page-view or click events.
 */
export function redactString(value: string): string {
  if (/^https?:\/\//.test(value)) {
    try {
      const url = new URL(value);
      url.search = '';
      url.hash = '';
      return url.toString();
    } catch {
      // Not a parsable URL: fall through to the text redaction.
    }
  }
  const text = value.startsWith('/')
    ? value.replace(/[?#][\s\S]*$/, '')
    : value;
  return text.replace(EVM_ADDRESS, '[address]').replace(EMAIL, '[email]');
}

function redactValue(value: unknown): unknown {
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) return value.map(redactValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, redactValue(inner)])
    );
  }
  return value;
}

/**
 * Autocapture and attribution set their URLs and element text when an event
 * is created, before enrichment runs, so this sees all of them (referrers
 * land in `user_properties`). See `pageUrlEnrichment` in `AmplitudeAnalytics`.
 */
export const redactionPlugin: Types.EnrichmentPlugin = {
  name: 'partner-demo-redaction',
  type: 'enrichment',
  async execute(event) {
    if (event.event_properties) {
      event.event_properties = redactValue(
        event.event_properties
      ) as typeof event.event_properties;
    }
    if (event.user_properties) {
      event.user_properties = redactValue(
        event.user_properties
      ) as typeof event.user_properties;
    }
    return event;
  },
};
