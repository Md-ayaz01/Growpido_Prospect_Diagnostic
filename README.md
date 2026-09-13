# Growpido // Prospect → Diagnostic Intelligence Platform
**Track B Submission — AI & Automation Engineer Build Task (September 2026)**

> **Core Advisory Principle: Evidence Before Assertion.**  
> Built for Growpido (Dubai-based reputation and narrative advisory).  
> The system starts from a public LinkedIn URL belonging to a UAE founder, CEO, or fund manager and generates a defensible, client-ready **One-Page Public Positioning Diagnostic** backed by a 4-Tier Source Hierarchy, Double-Verification Engine, Critical Refusal Engine, and Senior Human Approval Gate.

---

## 1. Product Overview & Key Problem

Reputation advisory in DIFC and GCC markets requires extreme evidentiary integrity. In fund manager and founder communications, an unverified number or fabricated milestone is not a typo — it is a regulatory liability and a lost client.

This system solves this challenge by operationalizing:
1. **Public Research Only**: Zero login, zero scraping of private credentials, zero outreach or subject contact.
2. **Double-Verification Standard**: Every factual claim is verified against a Tier 1 primary source and corroborated by an independent Tier 2 source.
3. **The Refusal Engine**: Explicitly detects and rejects claims lacking primary audit verification (e.g. unverified billionaire net worth assertions or promotional valuation claims), explaining why they are excluded.
4. **Separation of Fact vs Interpretation vs Recommendation**: Never presents analytical interpretations or strategic guidance as established facts.
5. **Human Approval Gate**: AI never dispatches reports externally without an audited senior advisor sign-off.

---

## 2. Architecture & Pipeline Flow

```
USER
  │  (Submits Public LinkedIn URL)
  ▼
ADVISORY INTERFACE (Antigravity Web App)
  │  (Triggers Research Pipeline)
  ▼
ORCHESTRATION LAYER (n8n Webhook / Backend API)
  ├── 1. URL Validation (Canonical handle check, no private scraping)
  ├── 2. Subject & Corporate Entity Resolution (Dubai / UAE jurisdiction)
  ├── 3. Tier 1 Primary Source Retrieval (ahsproperties.com, official registries)
  ├── 4. Tier 2 Independent Corroboration (Entrepreneur ME, CTBUH, Gulf News)
  ├── 5. Normalization & Deduplication (Canonical URL matching)
  ├── 6. Candidate Claim Extraction (Identity, Founding, Lineage, Wealth)
  ├── 7. Double-Verification Engine (Tier 1 Primary Check + Tier 2 Secondary Check)
  ├── 8. Refusal Engine (Filters out unverified claims, logs refusal audit)
  ├── 9. Positioning Gap Analysis (Synthesizes 3 distinct gaps: Fact, Impact, Direction)
  └── 10. One-Page Diagnostic Assembly (Draft memo with scorecard & sources)
  │
  ▼
EVIDENCE PERSISTENCE & AUDIT LEDGER
  │
  ▼
HUMAN APPROVAL GATE
  ├── DRAFT // PENDING HUMAN REVIEW
  ├── Reviewer Inspection of Claims & Refusal Justifications
  └── APPROVE FOR CLIENT DISPATCH or RETURN FOR REVISION
```

---

## 3. Source Hierarchy

| Tier | Source Category | Description & Authority Standard | Eligible Status in Pipeline |
|---|---|---|---|
| **Tier 1** | Primary / Highest Trust | Official company domains (`ahsproperties.com`, `ahstower.com`), official founder biographies, government records (DLD, DIFC, ADGM), regulatory filings. | Can establish primary existence, corporate ownership, official executive title. |
| **Tier 2** | Major Business & Financial Press | Established regional publications (Forbes Middle East, Arabian Business, Gulf News, Entrepreneur Middle East, CTBUH Global Skyscraper Center). | Can provide independent second verification. |
| **Tier 3** | Professional & Industry Profiles | Public LinkedIn profile headers, event speaker profiles, trade directory listings. | Contextual signals only; cannot independently establish financial or material ownership metrics. |
| **Tier 4** | Low Trust / Disqualified | Aggregators, content scrapers, unsourced blogs, AI-generated summary sites. | **DISQUALIFIED**: Never used to verify factual claims. |

---

## 4. Verification Rules & Decision Engine

For every candidate factual claim:
1. **Primary Check**: Check against Tier 1 primary sources. Does the source directly support the exact claim?
2. **Secondary Check**: Check against independent Tier 2 sources. Do entity, title, dates, and scope corroborate?
3. **Classification**:
   - **`VERIFIED`**: Directly supported by Tier 1 primary source AND independently corroborated by Tier 2 source. Decision: **`INCLUDE`**.
   - **`PARTIALLY VERIFIED`**: Primary evidence exists, but nuance/wording differs across sources (e.g. "Founder & CEO" on corporate portal vs "Co-Founder" in a single business feature). Decision: **`INCLUDE_WITH_CAVEAT`**.
   - **`UNVERIFIED / REFUSED`**: Fails Tier 1 verification or relies on promotional phrasing without audited proof. Decision: **`EXCLUDE`**.
   - **`FLAG CONFLICT`**: Sources contradict each other (e.g. conflicting financial rounds). Excluded from final narrative.

---

## 5. Demo Subject: Abbas Sajwani (Real Public Evidence)

- **Subject**: Abbas Sajwani
- **Role**: Founder & CEO
- **Company**: AHS Properties
- **Location**: Dubai, United Arab Emirates

### Verified Findings:
- **Identity & Role**: Founder and Chief Executive Officer of AHS Properties (*Tier 1: `ahsproperties.com/abbas-sajwani/`, Tier 2: `Entrepreneur Middle East`*).
- **Establishment**: Founded in Dubai in 2021 focusing on ultra-luxury residential development (*Tier 1: `ahsproperties.com`, Tier 2: `Arabian Business`*).
- **Flagship Developments**: Acquisition and redevelopment of the 328-meter AHS Tower on Sheikh Zayed Road; prime canal and Palm Jumeirah residences (*Tier 1: `ahsproperties.com`, Tier 2: `CTBUH Skyscraper Center`, `Gulf News`*).
- **Family Lineage**: Son of DAMAC founder Hussain Sajwani, operating AHS Properties as an autonomous private vehicle (*Tier 1: `ahsproperties.com`, Tier 2: `Wikipedia biographical record`*).

### Refused Claim Case Study:
- **Claim**: *"Abbas Sajwani is the Youngest Real Estate Billionaire Globally with an independent net worth exceeding $1 Billion."*
- **Status**: **`UNVERIFIED`**
- **Decision**: **`EXCLUDE FROM FINAL DIAGNOSTIC`**
- **Audit Refusal Reason**:  
  > *"While featured in promotional timeline header text ('The Journey To Becoming the Youngest Real Estate Billionaire Globally'), there is no Tier 1 audited financial disclosure, regulatory filing, or Forbes/Bloomberg Billionaires Index listing establishing Abbas Sajwani as an independent individual billionaire (his father Hussain Sajwani is the listed billionaire of DAMAC). Available secondary hits are limited to unverified aggregators (Tier 4). Publishing this claim without audited proof violates Growpido fact-integrity standards."*

---

## 6. The One-Page Diagnostic: 3 Biggest Positioning Gaps

1. **Gap 1: Differentiation & Narrative Decoupling**  
   - *Fact*: Public PR emphasizes family lineage and architectural renderings, with minimal long-form commentary on proprietary underwriting or development mechanics.  
   - *Impact*: Leaves founder positioning vulnerable to perceptions of inherited opportunity rather than independent institutional edge.  
   - *Direction*: Position around *"Boutique Ultra-Prime Real Estate as an Alternative Asset Class"*, contrasting agile boutique curation against mass conglomerate scale.

2. **Gap 2: Authority & Proof Verification**  
   - *Fact*: PR snippets employ unverified superlatives ("Youngest Billionaire", unverified pipeline valuations) lacking public audited financial statements.  
   - *Impact*: Dilutes credibility with Tier 1 institutional investors, DIFC family offices, and sovereign wealth partners.  
   - *Direction*: Retire unverified wealth assertions. Anchor authority on verifiable operational execution: square-footage realization, construction velocity, and elite architectural partnerships.

3. **Gap 3: Executive Thought Leadership & Audience Targeting**  
   - *Fact*: Public presence is transactional, peaking exclusively around project groundbreakings and sales milestones.  
   - *Impact*: Project-led visibility decays rapidly; thesis-led thought leadership compounds enduring institutional trust.  
   - *Direction*: Establish a fortnightly executive cadence addressing prime land scarcity, engineering complexities, and European/Asian UHNW capital migration into the UAE.

---

## 7. Human Approval Gate

The system enforces a strict human-in-the-loop governance model:
- **Initial State**: `DRAFT // PENDING HUMAN REVIEW`
- **Mandatory Checklist**:
  1. Every material claim verified against Tier 1 primary sources.
  2. Second independent verification corroborated without source conflict.
  3. Unsupported superlatives excluded by the Refusal Engine.
  4. House rules verified: zero em dashes, zero hashtags, zero AI filler vocabulary.
- **Actions**:
  - **`APPROVE FOR CLIENT DISPATCH`**: Advances state to `APPROVED` and records reviewer credentials, timestamp, and audit justification.
  - **`RETURN FOR REVISION`**: Returns diagnostic to draft status with specific researcher feedback notes.

---

## 8. Failure Handling & Resilience Testbench

The platform includes an interactive testbench verifying system behavior under failure conditions:
- **Invalid LinkedIn URL**: Instant syntax rejection; prevents phantom web calls.
- **Ambiguous Subject Identity**: Refuses to guess between identical names; halts and requests commercial registry number.
- **Scraper Rate Limiting (HTTP 429)**: Automatic exponential backoff with researcher alert.
- **Conflicting Primary Sources**: Detects discrepancies between publications and isolates the claim from client deliverables.

---

## 9. n8n Automation & Orchestration Workflow

The orchestration layer is exportable as a valid n8n workflow JSON:
- **File**: [`growpido_prospect_diagnostic_workflow.json`](file:///C:/Users/patha/.gemini/antigravity-ide/scratch/growpido-prospect-diagnostic/growpido_prospect_diagnostic_workflow.json)
- **Nodes Included**:
  1. `Webhook Ingestion`
  2. `Validate LinkedIn URL`
  3. `Identity & Company Resolution`
  4. `Public Source Collection`
  5. `Normalize & Deduplicate Sources`
  6. `Extract Candidate Claims`
  7. `Tier 1 Primary Verification`
  8. `Tier 2 Independent Verification`
  9. `Claim Decision & Refusal Engine`
  10. `Positioning Gap Analysis`
  11. `Assemble Diagnostic`
  12. `Human Approval Gate`
  13. `Respond to Webhook`

---

## 10. How to Run Locally

### Prerequisites
- Node.js v18+ (tested on Node v24.13.0)
- npm v9+

### Setup & Launch
```bash
cd growpido-prospect-diagnostic
npm install
node server.js
```
The application will be live at:
```
http://localhost:3000
```

### Run Automated Verification Test Suite
```bash
npm test
```
Executes all 6 integration tests verifying URL validation, source classification, double-verification, refusal engine logic, positioning analysis, and diagnostic assembly.
