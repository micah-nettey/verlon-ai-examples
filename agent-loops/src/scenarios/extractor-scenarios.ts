/**
 * 30 hand-written passages for the doc-extractor agent.
 *
 * Mix:
 *    7 sales / outreach emails
 *    7 meeting notes
 *    6 invoices / contract snippets
 *    5 inbound support inquiries
 *    5 press releases
 *
 * Each passage is realistic enough that the model has to do real
 * extraction (company / contact / dates / amounts / summary), not just
 * regex out obvious fields. Some are intentionally sparse on data so
 * the strict-JSON schema's nullable fields actually get exercised.
 */
export interface ExtractorPassage {
  name: string;
  passage: string;
}

export const EXTRACTOR_PASSAGES: ExtractorPassage[] = [
  // ─── Sales / outreach emails (7) ──────────────────────────────────
  {
    name: 'acme renewal',
    passage:
      "Hi, this is Jane Cooper from Acme Corp (jane@acme.io, 415-555-0199). We'd like to renew our enterprise contract by Dec 15 2026 for $48,000 USD. Let me know what paperwork you need from our side.",
  },
  {
    name: 'cold outreach from vendor',
    passage:
      "Hi team, I'm Marcus Hill, founder of Quill Analytics. We work with Series B+ SaaS companies on usage analytics and pricing experiments. Would love to set up a 20-minute call sometime in the next two weeks. You can reach me at marcus@quillanalytics.co or +1 (628) 555-0144.",
  },
  {
    name: 'quote follow-up',
    passage:
      "Hi Patel — following up on the quote we sent on Oct 14. The $24,500 annual SOW for the integration work would expire if not signed by Dec 1 2026. Let us know if you need a revised scope. — Olivia Reyes, Northwind Solutions, olivia.reyes@northwind.io.",
  },
  {
    name: 'discount offer',
    passage:
      "Hi! As a thank-you for being a long-standing customer, we'd like to offer you 20% off your next annual renewal. The discount is good through Jan 31 2027 and would bring your renewal from £18,000 to £14,400. Let me know if you'd like us to apply it. — Daniel Park, daniel@arcata.studio.",
  },
  {
    name: 'termination notice',
    passage:
      "Hi — please consider this our 30-day notice of non-renewal. Our contract ends Feb 28 2027 and we won't be continuing. The decision wasn't about Layer's product but rather a budget reorg internally. Sarah Ng, sarah.ng@helio.health, billing contact for Helio Health. Final invoice should be $0 since we're paid through the term.",
  },
  {
    name: 'expansion request',
    passage:
      "Hi! We're loving Layer and want to expand from our current 3 seats to 12 seats starting Nov 1 2026. Per the pricing page that should be $1,188/mo total. Can you pro-rate the change for the current cycle? — Rohan Mehta, head of platform at Tessa Robotics. rohan@tessarobotics.ai.",
  },
  {
    name: 'unpaid invoice reminder',
    passage:
      "Hi Lin — this is a friendly reminder that invoice #INV-2026-0817 for $3,420 USD was due on Oct 30 and is now 9 days overdue. If there's an issue with the invoice please let us know, otherwise please remit at your earliest convenience. — accounts@uselayer.ai.",
  },

  // ─── Meeting notes (7) ────────────────────────────────────────────
  {
    name: 'standup',
    passage:
      "Standup, Nov 6 2026.\n- Aria: shipped the rate-limiter fix yesterday, working on the dashboard regression today, no blockers.\n- Devon: still investigating the streaming chunk drop on Vercel, may need to escalate to their support.\n- Priya: doing customer interviews this afternoon (3 calls scheduled with Series A founders), out tomorrow for a half-day.",
  },
  {
    name: 'product planning',
    passage:
      "Product planning, Tuesday morning. Decisions: (1) Streaming GA pushed to Dec — needs more soak time. (2) The BYOK admin UI scope is reduced to per-gate only; per-project deferred. (3) Q1 theme is 'cost observability' — Aria will draft a more detailed plan by Nov 20. Attendees: Aria, Devon, Priya, Marcus (PM). Marcus to send notes to leadership@uselayer.ai.",
  },
  {
    name: 'customer interview',
    passage:
      "Customer interview with Sam (sam@northwind.io) at Northwind, Nov 4 2026, 11:00 AM PT. Sam runs ML platform at a 40-person team. Pain points: (1) hard to attribute LLM costs to product features, (2) wants cross-environment dashboards (dev/staging/prod), (3) BYOK setup took longer than expected. Quote: 'If you fixed cost attribution, I'd renew tomorrow at 2x.'",
  },
  {
    name: 'all-hands recap',
    passage:
      "All-hands, Nov 5 2026. Highlights: shipped Phase 5 (R.5.b) credit packs + Stripe webhook on time; closed out the data privacy compliance audit (ZDR + redaction path verified); revenue is on track for the quarter. Q&A focused on the upcoming pricing experiment. Next all-hands is Dec 3.",
  },
  {
    name: '1:1 notes',
    passage:
      "1:1 with manager, Oct 28 2026. Talked about: (1) workload feels healthy, no concerns. (2) interested in moving more toward backend infra work next quarter. (3) want feedback on PRs to be more focused — currently getting too many style nits and not enough architectural pushback. Action: manager to review last 5 PRs and pull out a 'highest-leverage feedback' list.",
  },
  {
    name: 'sprint retro',
    passage:
      'Sprint retro for sprint ending Oct 31. Went well: pair-programming on the routing rework cut implementation time roughly in half. To improve: too many flaky tests in CI — we need to either fix or quarantine them this sprint. Action items: (1) Devon owns the flaky-test triage, due Nov 7. (2) Aria writes up the routing-rework decision for the wiki, due Nov 10.',
  },
  {
    name: 'board notes',
    passage:
      "Board update meeting, Nov 1 2026. Attendees: founders, two board members, Sequoia partner. Topics: ARR up 38% QoQ to $4.2M, runway sits at 22 months, hiring plan is on track (3 of 5 Q4 hires signed). Next board meeting is Feb 5 2027. Pre-read materials due Jan 28.",
  },

  // ─── Invoices / contract snippets (6) ─────────────────────────────
  {
    name: 'saas contract clause',
    passage:
      "8. Term and Renewal. The Initial Term of this Agreement is twelve (12) months commencing on the Effective Date (Jan 1 2027). Thereafter the Agreement shall automatically renew for successive twelve-month terms unless either Party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term. Total annual fee: USD 72,000.",
  },
  {
    name: 'invoice line items',
    passage:
      "Invoice #INV-2026-1142 issued Nov 1 2026, due Dec 1 2026. Bill-to: Helio Health, attn: Sarah Ng (sarah.ng@helio.health). Line items: Growth tier subscription Nov 2026 — $499.00; Overage usage 142.4M tokens @ $0.0008/1k — $113.92; Credit pack purchase — $200.00. Total due: $812.92 USD.",
  },
  {
    name: 'sow snippet',
    passage:
      "Statement of Work between Layer AI Inc. and Tessa Robotics, dated Sep 12 2026. Scope: integration of Layer SDK into Tessa's robotics control plane, including custom routing rules and 24/7 on-call support. Engagement runs Oct 1 2026 through Mar 31 2027. Total fees: $84,000 paid in three installments of $28,000 each (Oct 1, Jan 1, Apr 1).",
  },
  {
    name: 'mutual nda',
    passage:
      'This Mutual Non-Disclosure Agreement is entered into between Layer AI, Inc. and Northwind Solutions LLC ("Northwind") effective Oct 22 2026. The obligations of each Party with respect to Confidential Information shall survive for a period of three (3) years following the date of disclosure. Notices to Northwind: olivia.reyes@northwind.io.',
  },
  {
    name: 'msa snippet',
    passage:
      "12. Limitation of Liability. EXCEPT FOR EITHER PARTY'S BREACH OF CONFIDENTIALITY OBLIGATIONS, IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY EXCEED THE GREATER OF (A) THE FEES PAID BY CUSTOMER TO LAYER IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR (B) USD 50,000.",
  },
  {
    name: 'renewal addendum',
    passage:
      "Renewal Addendum #2 to the Master Services Agreement dated Mar 5 2025 between Layer AI Inc. and Acme Corp. Effective Jan 1 2027 the Annual Subscription Fee is increased from $42,000 to $48,000 reflecting the upgrade from Growth to Scale tier. All other terms of the underlying MSA remain in full force. Signed by Jane Cooper (CFO, Acme Corp) and Layer AI on Nov 7 2026.",
  },

  // ─── Inbound support (5) ──────────────────────────────────────────
  {
    name: 'bug report',
    passage:
      "Hi support — we're seeing intermittent 502 responses from /v3/chat over the past two days, maybe 1 in 50 requests. Reproducible with a small Node test that fires 100 sequential requests. Layer SDK 0.4.7, deployed on Fly.io in IAD region. Let me know if you need request IDs — I can pull the last 10. — kevin@frame.io.",
  },
  {
    name: 'feature request',
    passage:
      "Feature request: would love to see per-environment API keys (dev / staging / prod) so we can scope spend caps differently. Currently we have to use one key per env which makes our deployment scripts uglier than they need to be. Filing this on behalf of the platform team at Tessa Robotics. — rohan@tessarobotics.ai.",
  },
  {
    name: 'refund request short',
    passage:
      "Hi — I was charged $99 on Nov 3 but my account shows we cancelled on Nov 1. Can you refund? Account: sarah.ng@helio.health, charge ID is ch_3OxxxxAB.",
  },
  {
    name: 'tech question short',
    passage:
      'Quick one: does the Layer Python SDK support the streaming API yet, or only the Node SDK? Building a Streamlit app and the Python ergonomics matter for us. Thanks — daniel@arcata.studio.',
  },
  {
    name: 'access issue',
    passage:
      "I can't log into the dashboard. Tried the password reset email but it never arrives — checked spam already. Account is olivia.reyes@northwind.io. Can someone manually trigger the reset, or is the SMTP queue backed up?",
  },

  // ─── Press releases (5) ───────────────────────────────────────────
  {
    name: 'funding announcement',
    passage:
      "FOR IMMEDIATE RELEASE — November 12 2026 — San Francisco, CA — Tessa Robotics today announced the close of its $42 million Series B financing led by Insight Partners with participation from existing investors. The round brings total funding to $61 million. Tessa will use the funds to expand its engineering team and accelerate enterprise rollout. Press contact: press@tessarobotics.ai.",
  },
  {
    name: 'product launch',
    passage:
      "Northwind Solutions today announced the general availability of Northwind Cortex, its next-generation observability platform for AI agents. The launch follows a six-month private beta with over 30 enterprise design partners. Cortex starts at $499/month for the Growth tier. For more information visit northwind.io/cortex or contact press@northwind.io.",
  },
  {
    name: 'partnership announcement',
    passage:
      'Acme Corp and Helio Health today announced a multi-year strategic partnership to bring AI-driven clinical-decision support to community hospitals across the southeastern United States. The partnership, valued at over $25 million across the initial three-year term, will see Acme deploy its medical-imaging models within the Helio Health hospital network beginning Q1 2027.',
  },
  {
    name: 'hire announcement',
    passage:
      "Layer AI today announced the hire of Dr. Lila Ortega as its first Chief Scientist. Dr. Ortega joins from Google DeepMind where she led the alignment research group for the past four years. She begins at Layer on January 5 2027 and will be based in the company's San Francisco office.",
  },
  {
    name: 'award announcement',
    passage:
      'Quill Analytics has been named a 2026 Gartner Cool Vendor in the AI Engineering category. The recognition follows a year of rapid growth that saw Quill triple its annual recurring revenue to $14 million. Founder and CEO Marcus Hill commented, "This recognition validates the bet our customers have made on us." For media inquiries contact press@quillanalytics.co.',
  },
];
