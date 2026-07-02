/**
 * 30 hand-written customer-support conversations for volume generation.
 *
 * Mix:
 *    5 pure-billing (multi-turn, all stay with the billing specialist)
 *    5 pure-technical
 *    3 pure-general
 *   10 pivot (cross-specialist within one session — most interesting
 *      for cross-sub-gate analysis)
 *    7 single-turn quick tickets
 *
 * Pivots are written so the user organically transitions ("Got it,
 * thanks. Separate question — …"), not contrived ("now talk about X").
 */
export interface SupportScenario {
  name: string;
  turns: string[];
}

export const SUPPORT_SCENARIOS: SupportScenario[] = [
  // ─── Pure billing (5) ─────────────────────────────────────────────
  {
    name: 'renewal-date confusion',
    turns: [
      "Hi — I'm trying to figure out when my next renewal hits. I subscribed mid-September and my dashboard shows 'next charge Nov 16' but I expected it to be Oct 16.",
      'Account email is jane@northwind.io. We started on the Starter monthly plan if that helps.',
      'Got it — so the prorated October charge already went through? I see one for $9.40 on Sep 30 in my email but nothing on my Stripe receipts page.',
    ],
  },
  {
    name: 'duplicate-charge refund',
    turns: [
      'I was charged twice for the November invoice — both on Nov 3, both for $99. Can you refund the duplicate?',
      'Account is acct_8gZ4mP, charges are ch_3OABcd and ch_3OABef on the Stripe side.',
      "Perfect, thank you. So the refund should land in 5–7 business days on the same card I'll get an email when it processes?",
    ],
  },
  {
    name: 'plan downgrade',
    turns: [
      "We want to downgrade from Growth to Starter at the end of this billing cycle. What's the process and what happens to the credits we've already pre-purchased?",
      "Got it. We have $84 in credits showing on the dashboard right now — those carry over to Starter? They don't expire when we drop tiers?",
      'And the rate-limit cap drops from 10k/min to 1k/min the moment the downgrade applies, or only at the start of the next billing cycle?',
    ],
  },
  {
    name: 'invoice export for accounting',
    turns: [
      'Hey — our finance team needs every invoice from Jan 2026 onward in PDF. Is there a bulk-export, or do I have to download them one at a time from the dashboard?',
      "Beautiful, the CSV export works. One follow-up — is there a way to also get them mailed to a separate billing email so finance gets them automatically each month? I don't want to forward them every cycle.",
    ],
  },
  {
    name: 'expired-card update',
    turns: [
      "Got the 'card declined' email this morning — my Visa expired on Oct 31. Where do I update the card on file?",
      "Updated. Now — does Stripe automatically retry the failed charge from this morning, or do I need to trigger something? I don't want service to lapse for the team.",
    ],
  },

  // ─── Pure technical (5) ───────────────────────────────────────────
  {
    name: 'sdk timeout on long completions',
    turns: [
      "Our Node SDK times out on completions longer than ~30s. We're using @verlon-ai/sdk 0.4.x on Railway. Is there a configurable timeout?",
      'I tried passing `timeout: 120000` to the Verlon constructor but it still cuts off. Could Railway itself be killing the connection at the proxy?',
      "Switched to streaming and it's fine end-to-end now. Last question — does streaming count differently against my rate limit, or is it the same one request = one count?",
    ],
  },
  {
    name: '429 errors after upgrade',
    turns: [
      "Started getting 429s about an hour ago even though we're on the Growth tier and well below the documented limits. Anything happening upstream?",
      'We have a background worker that fans out about 10 requests at once when a queue depth threshold trips. So bursts up to 10 concurrent calls but well under the per-minute cap.',
      'OK so the per-minute is the hard cap, not concurrency — got it. Should I implement a token bucket on our side, or is the official advice to just rely on retry-after backoff from the 429 response?',
    ],
  },
  {
    name: 'streaming integration question',
    turns: [
      "We want to switch from non-streaming to SSE-based streaming for our customer-facing chat. Do you have a Node example showing how to consume the stream and forward it to a browser EventSource?",
      'The browser side is straightforward — my question is more about the server: when I hit `/v3/chat` with `stream: true`, the chunks come back as SSE. Do I forward them as-is, or do I need to re-emit them as my own event names?',
      'Got it. Separately — when the model finishes, do I get a terminal `data: [DONE]` chunk or does the stream just close? My EventSource on the client needs to know the final boundary.',
    ],
  },
  {
    name: 'BYOK setup',
    turns: [
      "We want to use our own Anthropic API key for one specific gate (an internal one we don't want to count against Verlon-managed quota). Where do I add the key?",
      "Found the BYOK section. Is the scope per-gate or per-project? I have three gates in this project and only one should use my key — the other two should keep using Verlon's pooled keys.",
    ],
  },
  {
    name: 'webhook events for session timeout',
    turns: [
      "I want to get a webhook notification whenever an agent session times out (so we can re-engage the user with an email). What's the event name?",
      "Subscribed to `session.completed` and `session.budget_exceeded`. Is the payload shape the same for both, or do I need to handle them separately? I'd love a TS type if you have one.",
    ],
  },

  // ─── Pure general (3) ─────────────────────────────────────────────
  {
    name: 'email-preferences unsub',
    turns: [
      "I'm getting a lot of product newsletters from you all — is there a single place to opt out of marketing emails without unsubscribing from the transactional ones (invoices etc)?",
      'Found Settings → Notifications → Marketing. Did the toggle. How long does it take for the change to propagate?',
    ],
  },
  {
    name: 'careers inquiry',
    turns: [
      'Hi — love what Verlon is building. Are you hiring? I noticed only a few roles on the website but I imagine the engineering team is growing.',
      "Got it. I'll send my materials to careers@verlon.ai. Any specific person to address it to, or is that fine?",
    ],
  },
  {
    name: 'docs feedback',
    turns: [
      "The intro tutorial 'Build your first gate in 5 minutes' has a step that doesn't match the current dashboard UI — the screenshot shows a button labeled 'New Gate' but it's now '+ Create Gate'. Where can I file doc bugs?",
      "Filed it on GitHub. Will you all reply on the issue or just close it with a fix? Just want to know whether to watch the issue or not.",
    ],
  },

  // ─── Pivot scenarios (10) ─────────────────────────────────────────
  {
    name: 'pivot: billing → technical',
    turns: [
      "When does my next renewal hit? I'm on the Growth monthly plan, started Oct 8.",
      "Got it, thanks. Separate question: my SDK keeps timing out on completions over 20s — we're on Node, deployed on Railway. Any common cause for that?",
    ],
  },
  {
    name: 'pivot: technical → billing',
    turns: [
      "Our API calls started returning 429s about 30 min ago. We just upgraded from Starter to Growth yesterday — could the limit increase still be propagating?",
      "Hmm, wait — let me double-check. Did the upgrade actually go through? I see the new tier on the dashboard but the renewal email I just got still says Starter. Don't want to be paying for something that didn't apply.",
    ],
  },
  {
    name: 'pivot: billing → general',
    turns: [
      'Just confirming — my refund for the duplicate charge processed this morning, $99 back on the same card. Thanks for the quick turnaround.',
      "While I have you — where can I update the email address marketing emails go to? I'd rather route them to my personal inbox so the team's shared address stays clean.",
    ],
  },
  {
    name: 'pivot: general → technical',
    turns: [
      'Where can I leave product feedback? Found a few rough edges I want to share.',
      "Actually — one of them might be a bug, not a feature ask. When the SDK gets a 5xx from upstream, the error doesn't include the underlying provider message, just 'Internal error'. We're flying blind on transient OpenAI outages. Is there a way to surface the original?",
    ],
  },
  {
    name: 'pivot: technical → billing',
    turns: [
      "P95 completion latency on our gate jumped from ~800ms to 3.5s since yesterday. We didn't change anything — model is still gpt-4o.",
      "Hmm. Is priority routing only on the Growth and Scale tiers? Looking at our plan, we're on Starter and I'm wondering if we just got dropped to a slower queue.",
    ],
  },
  {
    name: 'pivot: billing → technical',
    turns: [
      'Quick billing question: if I upgrade from Starter to Growth mid-cycle, do I get prorated for the unused Starter days, or do I pay the full Growth amount and lose the rest of the month?',
      "Sounds fair. Quick technical follow-up since we're upgrading anyway: does Growth raise the per-minute rate limit on the embeddings endpoint, or only the chat endpoint?",
    ],
  },
  {
    name: 'pivot: general → billing',
    turns: [
      'Where can I see which third-party integrations Verlon supports? Looking specifically for Slack and Datadog integrations.',
      "Both are in the integrations page, perfect. One more thing — do you have a referral program? We're going to recommend Verlon to a few partner companies and was wondering if there's a discount on either side.",
    ],
  },
  {
    name: 'pivot: technical → general → billing',
    turns: [
      "Getting 'model not found: gpt-4o-mini-realtime' from a gate I just created. The model picker in the dashboard does list it though.",
      "OK so the realtime variant is in private preview — got it. Is there a public roadmap doc somewhere where I can track when it goes GA? I want to know what to plan around.",
      'Last thing — once it goes GA, will it count against my normal completion budget or be billed separately like image generation is?',
    ],
  },
  {
    name: 'pivot: billing → technical',
    turns: [
      'I see a $0.0234 charge for embeddings yesterday — did that come from a single request or aggregated? Just trying to reconcile our internal cost dashboard.',
      "Got it, daily rollup. Separate question — do embedding endpoints have different rate limits than chat completions? We're considering moving our retrieval pipeline to your /v3/embeddings.",
    ],
  },
  {
    name: 'pivot: technical → billing',
    turns: [
      'Streaming responses sometimes cut off mid-token — like the model is partway through a word and the SSE just stops. Happens maybe 1% of requests.',
      "Could that be related to my plan tier? I noticed the Scale tier doc mentions 'guaranteed completion' as a feature. What does that actually mean in practice — is Starter dropping connections under load?",
    ],
  },

  // ─── Single-turn (7) ──────────────────────────────────────────────
  {
    name: 'invoice currency',
    turns: ['Can I get my monthly invoice issued in EUR instead of USD?'],
  },
  {
    name: 'python sdk',
    turns: [
      'Is there an official Python SDK, or am I supposed to use the OpenAI/Anthropic SDKs with Verlon as a base URL?',
    ],
  },
  {
    name: 'enterprise sla',
    turns: [
      "What's the uptime SLA on the Enterprise plan? We need at least four nines for our compliance docs.",
    ],
  },
  {
    name: 'sandbox env',
    turns: [
      'Do you have a sandbox / staging environment we can hit without burning real budget while we build out our integration?',
    ],
  },
  {
    name: 'credit expiry',
    turns: [
      'How long do prepurchased credits stay valid? I bought a $200 credit pack in March and want to know if I need to use them by a specific date.',
    ],
  },
  {
    name: 'on-prem deployment',
    turns: [
      'Can Verlon be deployed on-premise / in our own VPC for compliance reasons, or is it cloud-only?',
    ],
  },
  {
    name: 'changelog location',
    turns: [
      "Where can I subscribe to your API changelog? I want to be notified when there are breaking changes coming so we can plan around them — RSS or email is fine, I don't want to have to check a webpage.",
    ],
  },
];
