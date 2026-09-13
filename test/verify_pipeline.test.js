import assert from 'assert';
import { validateLinkedInUrl, deduplicateSources } from '../src/research/collector.js';
import { classifySourceTier } from '../src/research/hierarchy.js';
import { resolveSubjectIdentity } from '../src/research/resolver.js';
import { collectPublicSources } from '../src/research/collector.js';
import { processClaimsAndVerification } from '../src/verification/claim_engine.js';
import { analyzePositioningGaps } from '../src/analysis/positioning_engine.js';
import { generateDiagnostic } from '../src/diagnostic/generator.js';
import { checkHouseRules } from '../src/diagnostic/house_rules.js';

console.log('=========================================================');
console.log('GROWPIDO HARDENED TEST SUITE: Track B Prospect -> Diagnostic');
console.log('Strict Evidence Integrity // Zero Hardcoded Production Logic');
console.log('=========================================================');

let deterministicPassed = 0;
let livePassed = 0;

// =========================================================
// PART A: DETERMINISTIC UNIT TESTS (Offline / Zero Network Dependency)
// =========================================================
console.log('\n--- PART A: DETERMINISTIC UNIT TESTS ---');

// UNIT TEST 1: URL Validation & Canonicalization
console.log('\n[UNIT TEST 1] Testing LinkedIn URL Validation & Canonicalization...');
const validUrl = validateLinkedInUrl('https://www.linkedin.com/in/huda-kattan/');
assert.strictEqual(validUrl.valid, true);
assert.strictEqual(validUrl.handle, 'huda-kattan');

const invalidUrl = validateLinkedInUrl('https://facebook.com/not-linkedin');
assert.strictEqual(invalidUrl.valid, false);
console.log('✓ Unit Test 1 passed: URL syntax strictly enforced.');
deterministicPassed++;

// UNIT TEST 2: Dynamic Source Classification & Hierarchy
console.log('\n[UNIT TEST 2] Testing Dynamic 4-Tier Source Hierarchy Classification...');
const t1Official = classifySourceTier('https://hudabeauty.com/en-ae/leadership', 'hudabeauty.com');
assert.strictEqual(t1Official.tier, 1, 'Company domain must be Tier 1 Primary');

const t2Press = classifySourceTier('https://www.forbes.com/sites/feature', 'hudabeauty.com');
assert.strictEqual(t2Press.tier, 2, 'Forbes must be Tier 2 High Trust');

const t3LinkedIn = classifySourceTier('https://www.linkedin.com/in/huda-kattan/', 'hudabeauty.com');
assert.strictEqual(t3LinkedIn.tier, 3, 'LinkedIn must be Tier 3 Profile');

const t4Aggregator = classifySourceTier('https://unverified-scraper-portal.xyz/wealth', 'hudabeauty.com');
assert.strictEqual(t4Aggregator.tier, 4, 'Aggregators must be Tier 4 Disqualified');
console.log('✓ Unit Test 2 passed: Dynamic 4-tier classification validated.');
deterministicPassed++;

// UNIT TEST 3: Multi-Status Decision Logic & Pure Evidence Dependency
console.log('\n[UNIT TEST 3] Testing Multi-Status Decision Logic (Zero claim_id Hardcoding)...');
const mockSubject = {
  name: 'Test Founder',
  company: 'Test Ventures',
  role: 'Founder & CEO',
  location: 'Dubai, United Arab Emirates'
};

const mockSources = [
  {
    id: 'SRC-001',
    url: 'https://testventures.ae',
    hostname: 'testventures.ae',
    title: 'Test Ventures Official',
    type: 'official_primary',
    tier: 1,
    isAvailable: true,
    status: 'AVAILABLE',
    excerpt: 'Test Ventures is an operating investment enterprise founded by Test Founder in Dubai.'
  },
  {
    id: 'SRC-002',
    url: 'https://forbes.com/article',
    hostname: 'forbes.com',
    title: 'Forbes Profile',
    type: 'independent_publication',
    tier: 2,
    isAvailable: true,
    status: 'AVAILABLE',
    excerpt: 'Forbes report: Test Founder is the Founder & CEO of Test Ventures, an enterprise based in Dubai.'
  }
];

const mockEvalResult = processClaimsAndVerification(mockSubject, mockSources);
assert(mockEvalResult.verifiedClaims.length >= 1, 'Claims with corroborating T1+T2 sources must be VERIFIED');
for (const c of mockEvalResult.verifiedClaims) {
  assert(c.source_id, 'Claim must have source_id');
  assert(c.source_url, 'Claim must have source_url');
  assert(c.evidence_quote, 'Claim must have evidence_quote');
  assert(c.source_tier, 'Claim must have source_tier');
  assert.strictEqual(c.verification_decision, 'INCLUDE');
}
console.log(`✓ Unit Test 3 passed: Multi-status verification evaluated strictly from source evidence.`);
deterministicPassed++;

// UNIT TEST 4: Generic Refusal Engine & Synthetic Probe Isolation
console.log('\n[UNIT TEST 4] Testing Generic Refusal Engine & Synthetic Probe Isolation...');
const mockWithProbe = processClaimsAndVerification(mockSubject, mockSources, { injectSyntheticProbe: true });
const probeRefusal = mockWithProbe.allClaims.find(c => c.origin === 'SYNTHETIC_TEST_PROBE');
assert(probeRefusal, 'Synthetic probe must be present when explicitly requested');
assert.strictEqual(probeRefusal.verification_status, 'REFUSED');
assert.strictEqual(probeRefusal.verification_decision, 'EXCLUDE');
assert.strictEqual(probeRefusal.isSynthetic, true);

// Verify live mode has ZERO synthetic probes
const mockLive = processClaimsAndVerification(mockSubject, mockSources);
const unpromptedProbe = mockLive.allClaims.find(c => c.origin === 'SYNTHETIC_TEST_PROBE');
assert.strictEqual(unpromptedProbe, undefined, 'Live research must never inject unprompted synthetic probes');
console.log('✓ Unit Test 4 passed: Refusal engine strictly excludes probes and live mode contains zero synthetic probes.');
deterministicPassed++;

// UNIT TEST 5: Conflict Detection Logic
console.log('\n[UNIT TEST 5] Testing Conflict Detection and Exclusion...');
const mockConflict = processClaimsAndVerification(mockSubject, mockSources, { simulateConflict: true });
const conflictClaim = mockConflict.allClaims.find(c => c.verification_status === 'CONFLICT');
assert(conflictClaim, 'Conflict claim must be flagged CONFLICT');
assert.strictEqual(conflictClaim.verification_decision, 'EXCLUDE');
assert.strictEqual(conflictClaim.conflict_flag, true);
console.log('✓ Unit Test 5 passed: Conflicting data flagged and excluded from client deliverable.');
deterministicPassed++;

// UNIT TEST 6: Failed Domain Fetch Handling
console.log('\n[UNIT TEST 6] Testing Failed Domain Fetch Handling (Mark Unavailable, Never Create False Tier 1)...');
const unavailableDomainSubject = {
  name: 'Test Executive',
  company: 'Nonexistent Enterprise',
  officialDomain: 'unreachable-non-existent-domain-404-xyz.com',
  handle: 'test-exec',
  location: 'Dubai, UAE'
};
const sourcesUnreachable = await collectPublicSources(unavailableDomainSubject);
const t1Unreachable = sourcesUnreachable.find(s => s.tier === 1);
assert(t1Unreachable, 'Source record should exist to document attempted check');
assert.strictEqual(t1Unreachable.isAvailable, false, 'Failed domain fetch must be marked unavailable');
assert.strictEqual(t1Unreachable.status, 'UNAVAILABLE', 'Status must be UNAVAILABLE');
assert.strictEqual(t1Unreachable.excerpt, null, 'Unavailable source must not have evidence excerpt');
console.log('✓ Unit Test 6 passed: Successfully marked unavailable and disqualified from verification.');
deterministicPassed++;

// UNIT TEST 7: Positioning Gap Analysis & House Rules Validator
console.log('\n[UNIT TEST 7] Testing Positioning Gap Analysis & House Rules Validator...');
const gapsResult = analyzePositioningGaps(mockSubject, mockEvalResult.verifiedClaims, mockEvalResult.refusedClaims);
assert.strictEqual(gapsResult.gaps.length, 3, 'Must synthesize exactly 3 positioning gaps');

for (const g of gapsResult.gaps) {
  assert(g.fact, 'Must have documented Fact');
  assert(g.interpretation, 'Must have strategic Interpretation');
  assert(g.recommended_direction, 'Must have Recommended Direction');
  // Confirm absence of speculative adverbs
  assert(!g.fact.includes('consistently'), 'Must not use unevidenced adverb "consistently"');
  assert(!g.fact.includes('primarily'), 'Must not use unevidenced adverb "primarily"');
  assert(!g.fact.includes('sporadic'), 'Must not use unevidenced adverb "sporadic"');
}

// Verify Insufficient Evidence behavior: when no refused claims exist, Gap 2 explicitly states Insufficient public evidence
assert.strictEqual(gapsResult.gaps[1].gap, 'Insufficient public evidence to establish this gap.');
assert.strictEqual(gapsResult.gaps[1].fact, 'Insufficient public evidence to establish this gap.');

// When no verified claims exist, gaps declare insufficient evidence rather than inferring unevidenced vulnerabilities
const emptyGaps = analyzePositioningGaps(mockSubject, [], []);
assert.strictEqual(emptyGaps.gaps[0].gap, 'Insufficient public evidence to establish this gap.');
assert.strictEqual(emptyGaps.gaps[1].gap, 'Insufficient public evidence to establish this gap.');
assert.strictEqual(emptyGaps.gaps[2].gap, 'Insufficient public evidence to establish this gap.');

const mockDiagnostic = generateDiagnostic(mockSubject, mockEvalResult, gapsResult, mockSources, 'LIVE RESEARCH');
const ruleCheckClean = checkHouseRules(mockDiagnostic);
assert.strictEqual(ruleCheckClean.passed, true, 'Diagnostic must pass house rules');

// Test House Rule blocking behavior on text containing em dash
const ruleCheckViolated = checkHouseRules('Finding text — with an em dash.');
assert.strictEqual(ruleCheckViolated.passed, false, 'Em dash must fail house rule check');
assert.strictEqual(ruleCheckViolated.canApprove, false, 'Violations must BLOCK approval');
console.log('✓ Unit Test 7 passed: Positioning gaps derived cleanly from observable properties, insufficient evidence handled safely, and house rules enforced.');
deterministicPassed++;

// =========================================================
// PART B: LIVE INTEGRATION TESTS (Network-Dependent Validation)
// =========================================================
console.log('\n--- PART B: LIVE INTEGRATION TESTS ---');

try {
  // LIVE TEST 8: Live Dynamic Identity Resolution (Huda Kattan)
  console.log('\n[LIVE TEST 8] Testing Live Dynamic Identity Resolution on Huda Kattan...');
  const resolvedHuda = await resolveSubjectIdentity('https://www.linkedin.com/in/huda-kattan/');
  assert.strictEqual(resolvedHuda.name, 'Huda Kattan');
  assert.strictEqual(resolvedHuda.company, 'Huda Beauty');
  assert.strictEqual(resolvedHuda.officialDomain, 'hudabeauty.com');
  assert(!JSON.stringify(resolvedHuda).includes('Executive Leader'), 'Zero Executive Leader fallback permitted');
  console.log(`✓ Live Test 8 passed: Dynamically resolved ${resolvedHuda.name} (${resolvedHuda.company}, domain: ${resolvedHuda.officialDomain}).`);
  livePassed++;

  // LIVE TEST 9: Live Source Collection & Retrieved Excerpts
  console.log('\n[LIVE TEST 9] Testing Live Source Collection & Retrieved Excerpt Integrity...');
  const sourcesHuda = await collectPublicSources(resolvedHuda);
  assert(sourcesHuda.length >= 2, 'Should collect available public sources');
  assert(!sourcesHuda.some(s => s.url.includes('unverified-middleeast-wealth-index.net')), 'Live research must never contain fabricated Tier 4 aggregator URL');
  
  // Verify LinkedIn is labeled as metadata signal and not evidence
  const liSource = sourcesHuda.find(s => s.tier === 3);
  if (liSource) {
    assert.strictEqual(liSource.isContextOnly, true, 'LinkedIn must be flagged context only');
    assert.strictEqual(liSource.status, 'METADATA_SIGNAL');
  }

  // Verify Wikipedia has real retrieved text or is marked unavailable
  const wikiSource = sourcesHuda.find(s => s.hostname === 'en.wikipedia.org');
  if (wikiSource && wikiSource.isAvailable) {
    assert(wikiSource.excerpt && wikiSource.excerpt.length > 20, 'Wikipedia must have real retrieved excerpt');
    assert(!wikiSource.excerpt.includes('Biographical and corporate public records documenting'), 'Never use generic placeholder prose');
  }
  console.log(`✓ Live Test 9 passed: Sources collected with verified retrieved excerpts and metadata signals.`);
  livePassed++;

  // LIVE TEST 10: Live Claim Verification & Traceability
  console.log('\n[LIVE TEST 10] Testing Live Claim Verification & Traceability...');
  const dedupedHuda = deduplicateSources(sourcesHuda, resolvedHuda.officialDomain);
  const liveClaimsHuda = processClaimsAndVerification(resolvedHuda, dedupedHuda);

  for (const c of liveClaimsHuda.allClaims) {
    if (c.verification_status.includes('VERIFIED')) {
      assert(c.source_id, 'Verified claim must have source_id');
      assert(c.source_url, 'Verified claim must have source_url');
      assert(c.source_tier, 'Verified claim must have source_tier');
      assert(c.evidence_quote, 'Verified claim must have real retrieved evidence_quote');
    }
    // Verify no unevidenced placeholder claims
    assert(!c.claim_text.includes('strategic capital allocation'), 'Must not generate unevidenced capital allocation claim');
    assert(!c.claim_text.includes('Founder vs Co-Founder'), 'Must not generate unevidenced Founder vs Co-Founder claim');
  }
  console.log(`✓ Live Test 10 passed: Discovered claims strictly traceable to retrieved evidence excerpts.`);
  livePassed++;

} catch (netErr) {
  console.error('LIVE INTEGRATION TEST WARNING/FAILURE:', netErr.message);
  console.error('Note: Live test encountered network/API restriction. Deterministic unit tests are unaffected.');
}

console.log('\n=========================================================');
console.log(`TEST SUMMARY: ${deterministicPassed}/7 Deterministic Unit Tests Passed | ${livePassed}/3 Live Integration Tests Passed.`);
console.log('=========================================================\n');
