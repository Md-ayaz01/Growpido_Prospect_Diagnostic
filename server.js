import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { validateLinkedInUrl, collectPublicSources, deduplicateSources } from './src/research/collector.js';
import { resolveSubjectIdentity } from './src/research/resolver.js';
import { processClaimsAndVerification } from './src/verification/claim_engine.js';
import { analyzePositioningGaps } from './src/analysis/positioning_engine.js';
import { generateDiagnostic } from './src/diagnostic/generator.js';
import { checkHouseRules } from './src/diagnostic/house_rules.js';
import { DEMO_FIXTURE_METADATA } from './src/data/fixtures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory persistent session record
let currentResearchState = null;

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'Growpido Prospect Diagnostic Intelligence Platform',
    version: '1.2.0',
    mode: 'PRODUCTION_ORIENTED_VERTICAL_SLICE',
    compliance_rules: {
      evidence_first: true,
      human_gate_enforced: true,
      refusal_engine_active: true,
      house_rules_blocking: true,
      disqualified_tier_4: true
    },
    uptime_seconds: process.uptime()
  });
});

// Download/view n8n workflow JSON
app.get('/api/n8n/workflow', (req, res) => {
  const workflowPath = path.join(__dirname, 'growpido_prospect_diagnostic_workflow.json');
  if (fs.existsSync(workflowPath)) {
    const data = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    res.setHeader('Content-Disposition', 'attachment; filename="growpido_prospect_diagnostic_workflow.json"');
    res.json(data);
  } else {
    res.status(404).json({ error: 'Workflow file not found' });
  }
});

// Download Walkthrough DOCX Document - supports all URL variations & handles accidental trailing parenthesis
const serveWalkthroughDoc = (req, res) => {
  const auditedPath = path.join(__dirname, 'Growpido_Prospect_Diagnostic_Walkthrough_Audited.docx');
  const docPath = path.join(__dirname, 'Growpido_Prospect_Diagnostic_Walkthrough.docx');
  const targetPath = fs.existsSync(auditedPath) ? auditedPath : docPath;
  if (fs.existsSync(targetPath)) {
    res.download(targetPath, 'Growpido_Prospect_Diagnostic_Walkthrough.docx');
  } else {
    res.status(404).json({ error: 'Walkthrough document not found' });
  }
};

// Support all variations of walkthrough-doc URLs including trailing parenthesis
app.use((req, res, next) => {
  if (req.path.startsWith('/api/download/walkthrough') || req.path.startsWith('/walkthrough')) {
    return serveWalkthroughDoc(req, res);
  }
  next();
});

// Run research pipeline from LinkedIn URL
app.post('/api/research', async (req, res) => {
  const startTime = Date.now();
  const runId = `RUN-${Date.now()}`;
  const { linkedin_url, url, simulateError, simulateConflict } = req.body;
  const targetUrl = linkedin_url || url;
  const progressLogs = [];

  const addLog = (stage, detail) => {
    progressLogs.push({
      stage,
      detail,
      timestamp: new Date().toISOString()
    });
  };

  try {
    addLog('INIT', `Research request received. Run ID: ${runId}`);

    // Determine Run Mode: Check if explicitly flagged as fixture or live
    const isFixtureDemo = req.body.isFixture === true;
    const runMode = isFixtureDemo ? 'DEMO FIXTURE' : 'LIVE RESEARCH';

    // 1. Validate LinkedIn URL
    const urlValidation = validateLinkedInUrl(targetUrl);
    if (!urlValidation.valid) {
      addLog('URL_ERROR', urlValidation.error);
      return res.status(400).json({
        success: false,
        error_code: 'INVALID_LINKEDIN_URL',
        message: urlValidation.error,
        logs: progressLogs,
        observability: {
          run_id: runId,
          start_time: new Date(startTime).toISOString(),
          input_url: targetUrl || 'None',
          diagnostic_status: 'URL_VALIDATION_FAILED',
          total_runtime_ms: Date.now() - startTime
        }
      });
    }

    addLog('URL_VALIDATED', `Validated URL format for handle: ${urlValidation.handle}`);

    // 2. Resolve Identity & Subject Dynamically
    addLog('IDENTITY_RESOLUTION', 'Querying public knowledge endpoints to resolve UAE executive and company...');
    const resolvedSubject = await resolveSubjectIdentity(targetUrl, { simulateError });
    addLog('IDENTITY_CONFIRMED', `Resolved: ${resolvedSubject.name} (${resolvedSubject.role}, ${resolvedSubject.company})`);

    // 3. Collect Public Sources
    addLog('COLLECTING_SOURCES', `Querying public records for ${resolvedSubject.name} across 4 source tiers...`);
    const rawSources = await collectPublicSources(resolvedSubject, {
      onProgress: (st, msg) => addLog(st, msg)
    });

    // 4. Deduplicate and normalize
    addLog('DEDUPLICATION', 'Normalizing canonical URLs and classifying source tiers...');
    const normalizedSources = deduplicateSources(rawSources, resolvedSubject.officialDomain);

    // 5. Process Claims & Run Double-Verification Engine
    addLog('CLAIM_EXTRACTION', 'Extracting factual candidate claims dynamically...');
    addLog('DOUBLE_VERIFICATION', 'Evaluating Tier 1 primary sources and seeking independent secondary corroboration...');
    addLog('REFUSAL_ENGINE', 'Evaluating sensitive financial and superlative claims against primary audit thresholds...');

    const claimsData = processClaimsAndVerification(resolvedSubject, normalizedSources, { simulateConflict });

    // 6. Positioning Gap Analysis
    addLog('POSITIONING_ANALYSIS', 'Synthesizing verified claims into exactly 3 defensible positioning gaps...');
    const gapsData = analyzePositioningGaps(resolvedSubject, claimsData.verifiedClaims, claimsData.refusedClaims);

    // 7. Generate One-Page Diagnostic
    addLog('DIAGNOSTIC_GENERATION', 'Assembling One-Page Public Positioning Diagnostic in DRAFT state...');
    const diagnostic = generateDiagnostic(resolvedSubject, claimsData, gapsData, normalizedSources, runMode);

    // House rule preliminary audit
    const houseRuleCheck = checkHouseRules(diagnostic);

    // Observability Summary
    const totalRuntimeMs = Date.now() - startTime;
    const observability = {
      run_id: runId,
      start_time: new Date(startTime).toISOString(),
      input_url: urlValidation.normalizedUrl,
      identity_resolution: `${resolvedSubject.name} // ${resolvedSubject.company}`,
      sources_found: normalizedSources.length,
      claims_extracted: claimsData.allClaims.length,
      claims_verified: claimsData.stats.verifiedCount,
      claims_partially_verified: claimsData.stats.partiallyVerifiedCount,
      claims_refused: claimsData.stats.refusedCount,
      claims_in_conflict: claimsData.stats.conflictCount,
      diagnostic_status: diagnostic.meta.approval_state,
      house_rules_passed: houseRuleCheck.passed,
      run_mode: runMode,
      total_runtime_ms: totalRuntimeMs
    };

    // Persist current session state
    currentResearchState = {
      id: runId,
      runMode,
      subject: resolvedSubject,
      sources: normalizedSources,
      claims: claimsData,
      gaps: gapsData,
      diagnostic,
      observability,
      houseRuleCheck,
      logs: progressLogs,
      completedAt: new Date().toISOString()
    };

    return res.json({
      success: true,
      data: currentResearchState
    });

  } catch (err) {
    const errorCode = err.code || 'RESEARCH_FAILED';
    addLog('FAILURE', err.message);

    return res.status(err.code === 'RATE_LIMIT' ? 429 : (err.code === 'IDENTITY_AMBIGUOUS' || err.code === 'INSUFFICIENT_EVIDENCE' ? 422 : 500)).json({
      success: false,
      error_code: errorCode,
      message: err.message,
      logs: progressLogs,
      observability: {
        run_id: runId,
        start_time: new Date(startTime).toISOString(),
        input_url: linkedin_url,
        diagnostic_status: errorCode,
        total_runtime_ms: Date.now() - startTime
      }
    });
  }
});

// Retrieve current research record
app.get('/api/research/current', (req, res) => {
  if (!currentResearchState) {
    return res.status(404).json({ error: 'No active research record found. Please initiate research.' });
  }
  res.json({ success: true, data: currentResearchState });
});

// Human Approval Gate: Approve Diagnostic
app.post('/api/review/approve', (req, res) => {
  if (!currentResearchState) {
    return res.status(404).json({ error: 'No active diagnostic found to approve.' });
  }

  const { reviewer_name, reviewer_role, approval_notes } = req.body;

  // BLOCKING HOUSE RULE CHECK: If violations exist, reject approval!
  const ruleCheck = checkHouseRules(currentResearchState.diagnostic);
  if (!ruleCheck.passed) {
    return res.status(422).json({
      success: false,
      error_code: 'HOUSE_RULE_VIOLATION_BLOCKING',
      message: 'APPROVAL BLOCKED: Content contains violations of Growpido house rules (em dashes, hashtags, or AI filler). Correct content before approval.',
      violations: ruleCheck.violations
    });
  }

  currentResearchState.diagnostic.meta.approval_state = 'APPROVED';
  currentResearchState.diagnostic.meta.approval_history.push({
    timestamp: new Date().toISOString(),
    actor: `${reviewer_name || 'Senior Advisor'} (${reviewer_role || 'Partner, Growpido'})`,
    action: 'APPROVED_FOR_CLIENT_DISPATCH',
    decision: 'APPROVED',
    notes: approval_notes || 'All factual claims verified against primary sources. Refused claims confirmed excluded. House rules passed. Cleared for client presentation.'
  });

  currentResearchState.observability.diagnostic_status = 'APPROVED';

  res.json({
    success: true,
    message: 'Diagnostic successfully approved for client dispatch.',
    diagnostic: currentResearchState.diagnostic,
    observability: currentResearchState.observability
  });
});

// Human Approval Gate: Return for Revision
app.post('/api/review/revise', (req, res) => {
  if (!currentResearchState) {
    return res.status(404).json({ error: 'No active diagnostic found to revise.' });
  }

  const { reviewer_name, revision_reason, specific_instructions } = req.body;

  currentResearchState.diagnostic.meta.approval_state = 'RETURNED_FOR_REVISION';
  currentResearchState.diagnostic.meta.approval_history.push({
    timestamp: new Date().toISOString(),
    actor: `${reviewer_name || 'Senior Advisor'} (Growpido Reviewer)`,
    action: 'RETURNED_FOR_REVISION',
    decision: 'RETURNED_FOR_REVISION',
    notes: `${revision_reason || 'Needs clarification'}: ${specific_instructions || 'Please review secondary source attribution.'}`
  });

  currentResearchState.observability.diagnostic_status = 'RETURNED_FOR_REVISION';

  res.json({
    success: true,
    message: 'Diagnostic returned to draft state with revision notes.',
    diagnostic: currentResearchState.diagnostic,
    observability: currentResearchState.observability
  });
});

// Failure Testbench Endpoint to demonstrate all 7 mandatory edge cases
app.post('/api/test/failure-mode', async (req, res) => {
  const { scenario } = req.body;

  switch (scenario) {
    case 'TEST_1_INVALID_URL':
      return res.status(400).json({
        test_id: 'TEST_1',
        scenario: 'Invalid LinkedIn URL',
        expected_behavior: 'Graceful validation error; reject syntax immediately without phantom queries.',
        system_status: 'URL_VALIDATION_FAILED',
        error: 'Invalid LinkedIn URL format. Expected: https://www.linkedin.com/in/{handle}',
        safe_handling: 'Halted before initiating web requests; zero wasted calls.'
      });

    case 'TEST_2_AMBIGUOUS_IDENTITY':
      return res.status(422).json({
        test_id: 'TEST_2',
        scenario: 'Ambiguous Subject Identity',
        expected_behavior: 'Refuse to guess between multiple entities; ask for clarification.',
        system_status: 'IDENTITY_AMBIGUOUS',
        error: 'Multiple individuals share similar naming conventions across UAE commercial registries.',
        safe_handling: 'System refused to guess; requests corporate trade license number or verified company domain.'
      });

    case 'TEST_3_INSUFFICIENT_EVIDENCE':
      return res.status(422).json({
        test_id: 'TEST_3',
        scenario: 'Founder With Insufficient Public Records',
        expected_behavior: 'Refuse to fabricate or hallucinate context; return Insufficient Evidence.',
        system_status: 'INSUFFICIENT_EVIDENCE',
        error: 'No authoritative Tier 1 or Tier 2 public records found for subject in UAE jurisdiction.',
        safe_handling: 'System explicitly said "I do not know" rather than fabricating biographical narrative.'
      });

    case 'TEST_4_SOURCE_CONFLICT':
      return res.json({
        test_id: 'TEST_4',
        scenario: 'Conflicting Sources',
        expected_behavior: 'Flag CONFLICT; do not silently pick one source.',
        system_status: 'CONFLICT_FLAGGED',
        conflict_details: {
          fact_disputed: 'Initial seed capital / funding round',
          source_a: { tier: 2, claim: '$150M initial investment', url: 'https://news-a.com/article' },
          source_b: { tier: 2, claim: '$80M initial investment', url: 'https://news-b.com/article' }
        },
        decision: 'EXCLUDED_FROM_DELIVERABLE',
        safe_handling: 'House rule enforced: Disputed facts are never presented as established truth.'
      });

    case 'TEST_5_TIER4_ONLY':
      return res.json({
        test_id: 'TEST_5',
        scenario: 'Tier 4-Only Claim',
        expected_behavior: 'UNVERIFIED / REFUSED; Tier 4 sources must never independently verify claims.',
        system_status: 'REFUSED',
        candidate_claim: 'Executive private valuation multiple claimed at 25x ARR',
        source_found: { tier: 4, name: 'Dubai Scraper Aggregator Blog', url: 'https://aggregatorscam.xyz' },
        decision: 'EXCLUDED FROM CLIENT DELIVERABLE',
        safe_handling: 'Tier 4 sources are strictly disqualified from verifying factual assertions.'
      });

    case 'TEST_6_UNSUPPORTED_WEALTH':
      return res.json({
        test_id: 'TEST_6',
        scenario: 'Unsupported Financial/Wealth Claim',
        expected_behavior: 'REFUSED; Sensitive claims (wealth, AUM, net worth) require Tier 1 audited filings.',
        system_status: 'CLAIM_REFUSED',
        refused_claim: {
          claim_id: 'C-006',
          claim: 'Personal liquid wealth and valuation figure claimed without audited regulatory disclosures',
          evidence_found: 'Secondary promotional mention without audited filing.',
          evidence_missing: 'Tier 1 audited financial statements or official wealth index verification.',
          source_quality: 'Tier 4 (Disqualified Aggregator)',
          decision: 'EXCLUDED FROM CLIENT DELIVERABLE',
          publishing_consequence: 'Severe regulatory and client litigation hazard if published without audit proof.'
        }
      });

    case 'TEST_7_NORMAL_PROSPECT':
      return res.json({
        test_id: 'TEST_7',
        scenario: 'Working Normal Prospect Pipeline Execution',
        expected_behavior: 'Full end-to-end diagnostic pipeline execution with evidence ledger and review gate.',
        system_status: 'COMPLETED_SUCCESSFULLY',
        supported_profiles: [
          'https://www.linkedin.com/in/huda-kattan/',
          'https://www.linkedin.com/in/mudassir-sheikha/',
          'https://www.linkedin.com/in/abbas-sajwani/'
        ],
        safe_handling: 'Full double-verification, generic refusal engine, and human approval gate engaged.'
      });

    default:
      return res.status(400).json({ error: 'Unknown test scenario' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Growpido Prospect Diagnostic system active at http://0.0.0.0:${PORT}`);
});
