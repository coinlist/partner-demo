'use client';

import * as amplitude from '@amplitude/analytics-browser';
import { useEffect } from 'react';
import { amplitudeApiKey, redactionPlugin } from '@/lib/amplitude';

/**
 * Page views, sessions, attribution and clicks for the hosted demo at
 * partner.coinlist.dev. Renders nothing, and sends nothing on any other host
 * unless `NEXT_PUBLIC_AMPLITUDE_API_KEY` is set (see `amplitudeApiKey`).
 */
export function AmplitudeAnalytics() {
  useEffect(() => {
    const apiKey = amplitudeApiKey(
      window.location.hostname,
      process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY
    );
    if (!apiKey) return;

    amplitude.add(redactionPlugin);
    amplitude.init(apiKey, {
      autocapture: {
        attribution: true,
        pageViews: true,
        sessions: true,
        elementInteractions: true,
        // An enrichment plugin the SDK registers after `redactionPlugin`, so
        // the previous-page URLs it adds would skip the redaction. Every other
        // URL is set when an event is created, before any enrichment runs.
        pageUrlEnrichment: false,
        formInteractions: false,
        fileDownloads: false,
        webVitals: false,
        networkTracking: false,
        frustrationInteractions: false,
      },
    });
  }, []);

  return null;
}
