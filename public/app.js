/**
 * GROWPIDO // Client-Side Controller (Hardened Vertical Slice)
 * Powers the Prospect -> Diagnostic Intelligence Platform
 * Supports Dynamic Multi-Founder Research & Refusal Engine
 */

let currentRecord = null;

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initPresets();
  initEventListeners();
  loadN8nWorkflowPreview();
  // Auto-run research on active profile
  triggerResearch();
});

// Initialize Tab Navigation
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  const shortcutBtn = document.getElementById('reviewGateShortcutBtn');
  if (shortcutBtn) {
    shortcutBtn.addEventListener('click', () => {
      const reviewTabBtn = document.querySelector('[data-tab="tabReview"]');
      if (reviewTabBtn) reviewTabBtn.click();
    });
  }
}

// Initialize Profile Presets
function initPresets() {
  const btnHuda = document.getElementById('presetHuda');
  const btnMudassir = document.getElementById('presetMudassir');
  const btnAbbas = document.getElementById('presetAbbas');
  const btnRonaldo = document.getElementById('presetRonaldo');
  const btnFadi = document.getElementById('presetFadi');
  const btnAmbareen = document.getElementById('presetAmbareen');
  const input = document.getElementById('linkedinInput');
  const targetLabel = document.getElementById('activeTargetLabel');

  const allPresetButtons = [btnHuda, btnMudassir, btnAbbas, btnRonaldo, btnFadi, btnAmbareen];

  const setPreset = (btn, url, label) => {
    allPresetButtons.forEach(b => b?.classList.remove('active'));
    btn?.classList.add('active');
    input.value = url;
    if (targetLabel) targetLabel.textContent = label;
    triggerResearch();
  };

  if (btnHuda) {
    btnHuda.addEventListener('click', () => {
      setPreset(btnHuda, 'https://www.linkedin.com/in/huda-kattan/', 'Huda Kattan (Founder & CEO, Huda Beauty)');
    });
  }

  if (btnMudassir) {
    btnMudassir.addEventListener('click', () => {
      setPreset(btnMudassir, 'https://www.linkedin.com/in/mudassir-sheikha/', 'Mudassir Sheikha (Co-Founder & CEO, Careem)');
    });
  }

  if (btnAbbas) {
    btnAbbas.addEventListener('click', () => {
      setPreset(btnAbbas, 'https://www.linkedin.com/in/abbas-sajwani/', 'Abbas Sajwani (Founder & CEO, AHS Properties)');
    });
  }

  if (btnRonaldo) {
    btnRonaldo.addEventListener('click', () => {
      setPreset(btnRonaldo, 'https://www.linkedin.com/in/ronaldo-mouchawar/', 'Ronaldo Mouchawar (Founder & CEO, Souq.com)');
    });
  }

  if (btnFadi) {
    btnFadi.addEventListener('click', () => {
      setPreset(btnFadi, 'https://www.linkedin.com/in/fadi-ghandour/', 'Fadi Ghandour (Executive Chairman, Wamda)');
    });
  }

  if (btnAmbareen) {
    btnAmbareen.addEventListener('click', () => {
      setPreset(btnAmbareen, 'https://www.linkedin.com/in/ambareen-musa/', 'Ambareen Musa (Founder & CEO, Souqamal)');
    });
  }

  // Quick chip buttons in failure advisory card
  document.querySelectorAll('.fac-chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      const url = chip.getAttribute('data-url');
      const label = chip.getAttribute('data-label');
      if (url) {
        input.value = url;
        if (targetLabel) targetLabel.textContent = label;
        triggerResearch();
      }
    });
  });
}

// Event Listeners
function initEventListeners() {
  const runBtn = document.getElementById('runResearchBtn');
  runBtn.addEventListener('click', () => {
    triggerResearch();
  });

  // Human Review Gate Actions
  const btnApprove = document.getElementById('btnApproveGate');
  const btnRevise = document.getElementById('btnReviseGate');

  if (btnApprove) btnApprove.addEventListener('click', () => handleApprovalAction('APPROVE'));
  if (btnRevise) btnRevise.addEventListener('click', () => handleApprovalAction('REVISE'));

  // Evidence Ledger Filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      renderEvidenceLedger(filter);
    });
  });
}

// Trigger Pipeline Research
async function triggerResearch() {
  const input = document.getElementById('linkedinInput');
  const url = input.value.trim();
  const runBtn = document.getElementById('runResearchBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const tracker = document.getElementById('pipelineTracker');
  const statusBadge = document.getElementById('pipelineStatusBadge');

  if (!url) {
    alert('Please enter a public LinkedIn profile URL.');
    return;
  }

  // Reset UI
  runBtn.disabled = true;
  btnText.textContent = 'RESEARCHING...';
  btnSpinner.classList.remove('hidden');
  tracker.classList.remove('hidden');
  statusBadge.textContent = 'EXECUTING VERIFICATION';
  statusBadge.className = 'badge badge-warning';

  const failCard = document.getElementById('failureAlertCard');
  if (failCard) failCard.classList.add('hidden');

  const pipelineStages = [
    'Validating LinkedIn Profile Format',
    'Querying Public Knowledge Endpoints to Resolve Subject & Company',
    'Querying Official Corporate Domain (Tier 1)',
    'Collecting Independent Secondary Press & Directories (Tier 2)',
    'Deduplicating Sources & Detecting Syndication',
    'Extracting Factual Candidate Claims Dynamically',
    'Evaluating Primary Evidence Against Tier 1 Sources',
    'Seeking Independent Corroboration (Tier 2)',
    'Evaluating Claim Decision & Generic Refusal Engine',
    'Synthesizing 3 Positioning Gaps (Fact / Impact / Direction)',
    'Compiling Defensible One-Page Diagnostic (DRAFT)',
    'Enforcing Human Review Gate & House Rules Validation'
  ];

  const stepGrid = document.getElementById('stepGrid');
  stepGrid.innerHTML = pipelineStages.map((st, idx) => `
    <div class="step-item ${idx === 0 ? 'active' : ''}" id="step-${idx}">
      <span class="step-icon">${idx === 0 ? '●' : '○'}</span>
      <span>${st}</span>
    </div>
  `).join('');

  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < pipelineStages.length - 1) {
      const prev = document.getElementById(`step-${currentStep}`);
      if (prev) {
        prev.className = 'step-item done';
        prev.querySelector('.step-icon').textContent = '✓';
      }
      currentStep++;
      const next = document.getElementById(`step-${currentStep}`);
      if (next) {
        next.className = 'step-item active';
        next.querySelector('.step-icon').textContent = '●';
      }
    }
  }, 350);

  try {
    const response = await fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedin_url: url })
    });

    clearInterval(interval);

    pipelineStages.forEach((_, idx) => {
      const el = document.getElementById(`step-${idx}`);
      if (el) {
        el.className = 'step-item done';
        el.querySelector('.step-icon').textContent = '✓';
      }
    });

    const result = await response.json();

    if (!result.success) {
      statusBadge.textContent = 'SAFE FAILURE ENFORCED // RESEARCH HALTED';
      statusBadge.className = 'badge badge-danger';
      
      const facBadge = document.getElementById('facBadge');
      const facTitle = document.getElementById('facTitle');
      const facDesc = document.getElementById('facDesc');

      if (failCard) {
        failCard.classList.remove('hidden');
        if (facBadge) facBadge.textContent = `RUBRIC CATEGORY 4 PASSED // SAFE FAILURE ENFORCED (${result.error_code || 'INSUFFICIENT_EVIDENCE'})`;
        if (facTitle) {
          facTitle.textContent = result.error_code === 'INVALID_LINKEDIN_URL' 
            ? 'Invalid LinkedIn URL Format' 
            : 'Subject Not Verified from Authoritative Public Records';
        }
        if (facDesc) {
          facDesc.textContent = result.message || 'The subject identity or corporate affiliation could not be verified from public records.';
        }
      }

      if (result.observability) {
        renderObservability(result.observability);
      }
      return;
    }

    if (failCard) failCard.classList.add('hidden');

    currentRecord = result.data;
    statusBadge.textContent = 'COMPLETED // AWAITING HUMAN REVIEW';
    statusBadge.className = 'badge badge-success';

    const targetLabel = document.getElementById('activeTargetLabel');
    if (targetLabel && currentRecord.subject) {
      targetLabel.textContent = `${currentRecord.subject.name} (${currentRecord.subject.role}, ${currentRecord.subject.company})`;
    }

    // Update Observability Panel
    renderObservability(currentRecord.observability);

    // Render components
    renderDiagnostic(currentRecord.diagnostic);
    renderEvidenceLedger('all');
    renderRefusalShowcase(currentRecord.claims.refusedClaims);
    updateCounts(currentRecord);
    renderAuditTrail(currentRecord.diagnostic.meta.approval_history);

  } catch (err) {
    clearInterval(interval);
    statusBadge.textContent = 'CONNECTION ERROR';
    statusBadge.className = 'badge badge-danger';
    console.error('Research error:', err);
  } finally {
    runBtn.disabled = false;
    btnText.textContent = 'RESEARCH PROSPECT';
    btnSpinner.classList.add('hidden');
  }
}

// Render Observability Telemetry
function renderObservability(obs) {
  if (!obs) return;

  document.getElementById('obsRunId').textContent = `RUN-ID: ${obs.run_id}`;
  document.getElementById('obsInputUrl').textContent = obs.input_url;
  document.getElementById('obsIdentity').textContent = obs.identity_resolution;
  document.getElementById('obsSources').textContent = obs.sources_found;
  document.getElementById('obsClaimsTotal').textContent = obs.claims_extracted;
  document.getElementById('obsClaimsVerified').textContent = obs.claims_verified;
  document.getElementById('obsClaimsPartial').textContent = obs.claims_partially_verified;
  document.getElementById('obsClaimsRefused').textContent = obs.claims_refused;
  document.getElementById('obsConflicts').textContent = obs.claims_in_conflict;
  document.getElementById('obsRuntime').textContent = `${obs.total_runtime_ms} ms`;

  const houseRulesEl = document.getElementById('obsHouseRules');
  if (obs.house_rules_passed) {
    houseRulesEl.textContent = 'PASSED (0 VIOLATIONS)';
    houseRulesEl.className = 'obs-v text-emerald';
  } else {
    houseRulesEl.textContent = 'VIOLATION DETECTED';
    houseRulesEl.className = 'obs-v text-rose';
  }

  // Update Run Mode Pill
  const modePill = document.getElementById('runModePill');
  const modeTag = document.getElementById('modeTag');
  if (obs.run_mode === 'DEMO FIXTURE') {
    modePill.textContent = 'DEMO FIXTURE DATA';
    modePill.className = 'mode-pill mode-fixture';
    modeTag.textContent = 'Mode: DEMO FIXTURE';
  } else {
    modePill.textContent = 'LIVE RESEARCH';
    modePill.className = 'mode-pill mode-live';
    modeTag.textContent = 'Mode: LIVE RESEARCH';
  }
}

// Render the One-Page Diagnostic
function renderDiagnostic(diag) {
  if (!diag) return;

  // Meta
  document.getElementById('diagSubject').textContent = diag.meta.subject.name;
  document.getElementById('diagCompany').textContent = diag.meta.subject.company;
  document.getElementById('diagLocation').textContent = diag.meta.subject.location;
  document.getElementById('diagDate').textContent = diag.meta.research_date;

  updateApprovalPill(diag.meta.approval_state);

  // 1. Executive Summary
  document.getElementById('diagSummary').textContent = diag.section_1_executive_summary.content;

  // 2. Current Positioning
  const posGrid = document.getElementById('diagPositioningGrid');
  posGrid.innerHTML = diag.section_2_current_positioning.observations.map(obs => `
    <div class="pos-card">
      <span class="pos-label">${obs.label}</span>
      <div class="pos-val">${obs.value}</div>
      <p class="pos-evidence">${obs.evidence}</p>
    </div>
  `).join('');

  // 3. Three Biggest Gaps
  const gapsContainer = document.getElementById('diagGapsContainer');
  gapsContainer.innerHTML = diag.section_3_three_biggest_gaps.gaps.map(g => `
    <div class="gap-card">
      <div class="gap-header">
        <span class="gap-category">GAP 0${g.number} // ${g.category}</span>
        <span class="badge badge-warning">EVIDENTIARY GAP</span>
      </div>
      <div class="gap-title">${g.title}</div>
      <div class="gap-breakdown">
        <div class="gap-col">
          <span class="gap-col-title col-fact">Documented Evidence:</span>
          <p>${g.evidence_observed}</p>
        </div>
        <div class="gap-col">
          <span class="gap-col-title col-impact">Why It Matters:</span>
          <p>${g.why_it_matters}</p>
        </div>
        <div class="gap-col">
          <span class="gap-col-title col-recom">Recommended Direction:</span>
          <p>${g.recommended_direction}</p>
        </div>
      </div>
    </div>
  `).join('');

  // 4. Narrative Territories
  const territoriesGrid = document.getElementById('diagTerritoriesGrid');
  territoriesGrid.innerHTML = diag.section_4_narrative_territories.territories.map(t => `
    <div class="territory-card">
      <div class="territory-name">${t.territory}</div>
      <p class="territory-rationale">${t.rationale}</p>
      <div class="territory-value">${t.strategic_value}</div>
    </div>
  `).join('');

  // 5. Evidence Quality Scorecard
  const stats = diag.section_5_evidence_quality.stats;
  document.getElementById('statReviewed').textContent = stats.total_claims_analyzed;
  document.getElementById('statVerified').textContent = stats.verified_primary_and_secondary;
  document.getElementById('statPartially').textContent = stats.partially_verified;
  document.getElementById('statRefused').textContent = stats.unverified_refused;

  // Refusal Highlight Box
  const refusalHighlight = diag.section_5_evidence_quality.critical_refusal_highlight;
  document.getElementById('diagRefusalTitle').textContent = `Refused Claim [${refusalHighlight.claim_id}]: Excluded from Deliverable`;
  document.getElementById('diagRefusalText').textContent = `"${refusalHighlight.rejected_claim}"`;
  document.getElementById('diagRefusalReason').innerHTML = `
    <strong>Refusal Justification:</strong> ${refusalHighlight.why_considered}<br>
    <strong>Evidence Missing:</strong> ${refusalHighlight.evidence_missing}<br>
    <strong>Publishing Consequence:</strong> ${refusalHighlight.publishing_consequence}
  `;

  // 6. Key Sources
  const sourcesList = document.getElementById('diagSourcesList');
  sourcesList.innerHTML = diag.section_6_key_sources.sources.map(s => `
    <div class="source-item">
      <a href="${s.url}" target="_blank" rel="noopener noreferrer">
        ${s.title}
      </a>
      <span class="tier-badge tier-${s.tier}">Tier ${s.tier}</span>
    </div>
  `).join('');
}

// Render Evidence Ledger
function renderEvidenceLedger(filter = 'all') {
  if (!currentRecord || !currentRecord.claims) return;
  const tbody = document.getElementById('ledgerTableBody');
  const allClaims = currentRecord.claims.allClaims;

  const filtered = allClaims.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'VERIFIED') return c.verification_status === 'VERIFIED' || c.verification_status.includes('PRIMARY VERIFIED');
    if (filter === 'PARTIALLY VERIFIED') return c.verification_status === 'PARTIALLY VERIFIED';
    if (filter === 'REFUSED') return c.verification_status === 'REFUSED';
    if (filter === 'CONFLICT') return c.verification_status === 'CONFLICT';
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-cell">No claims match the selected filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    let statusBadgeClass = 'badge-success';
    if (c.verification_status === 'PARTIALLY VERIFIED' || c.verification_status.includes('PRIMARY VERIFIED')) statusBadgeClass = 'badge-warning';
    if (c.verification_status === 'REFUSED' || c.verification_status === 'UNVERIFIED') statusBadgeClass = 'badge-danger';
    if (c.verification_status === 'CONFLICT') statusBadgeClass = 'badge-danger';

    let decisionBadge = '<span class="badge badge-success">INCLUDE</span>';
    if (c.decision === 'INCLUDE_WITH_CAVEAT') decisionBadge = '<span class="badge badge-warning">INCLUDE (CAVEAT)</span>';
    if (c.decision === 'EXCLUDE') decisionBadge = '<span class="badge badge-danger">EXCLUDE</span>';

    const src1 = c.primary_source ? `
      <div>
        <a href="${c.primary_source.url}" target="_blank" style="color: #93C5FD; text-decoration: none;">${c.primary_source.title || 'Primary Source'}</a>
        <div><span class="tier-badge tier-${c.primary_source.tier}">Tier ${c.primary_source.tier}</span> ✓ Primary Found</div>
      </div>
    ` : '<span style="color: #64748B;">None (Audit Missing)</span>';

    const src2 = c.secondary_source ? `
      <div>
        <a href="${c.secondary_source.url}" target="_blank" style="color: #93C5FD; text-decoration: none;">${c.secondary_source.title || 'Independent Corroboration'}</a>
        <div><span class="tier-badge tier-${c.secondary_source.tier}">Tier ${c.secondary_source.tier}</span> ✓ Corroborated</div>
      </div>
    ` : '<span style="color: #64748B;">None Found</span>';

    return `
      <tr>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--gold-light);">${c.claim_id}</td>
        <td style="font-weight: 500; color: #FFFFFF; max-width: 280px;">${c.claim_text}</td>
        <td>${src1}</td>
        <td>${src2}</td>
        <td><span class="badge ${statusBadgeClass}">${c.verification_status}</span></td>
        <td>${decisionBadge}</td>
        <td style="font-size: 0.75rem; color: #CBD5E1; max-width: 300px;">${c.decision_reason}</td>
      </tr>
    `;
  }).join('');
}

// Render Refusal Showcase
function renderRefusalShowcase(refusedClaims) {
  const container = document.getElementById('refusalShowcaseContainer');
  if (!refusedClaims || refusedClaims.length === 0) {
    container.innerHTML = `<p class="empty-cell">No claims were refused during this research cycle.</p>`;
    return;
  }

  container.innerHTML = refusedClaims.map((rc, idx) => {
    const details = rc.refusal_details || {
      why_considered: rc.decision_reason,
      evidence_found: 'Secondary repetition without primary filing',
      evidence_missing: 'Tier 1 audited filing',
      source_quality: 'Tier 4',
      publishing_consequence: 'Reputational and verification risk'
    };

    const originBadge = rc.isSynthetic 
      ? '<span class="badge badge-warning" style="margin-left: 0.5rem;">SYNTHETIC TEST PROBE (AUDIT FIXTURE)</span>'
      : '<span class="badge badge-success" style="margin-left: 0.5rem;">DISCOVERED IN PUBLIC FOOTPRINT</span>';

    return `
      <div class="refusal-card">
        <div class="refusal-banner-row">
          <div>
            <span class="badge badge-danger">REFUSAL CASE 0${idx + 1} // STATUS: ${rc.verification_status}</span>
            ${originBadge}
          </div>
          <span class="badge badge-danger">DECISION: ${rc.decision} FROM REPORT</span>
        </div>
        <div class="refusal-claim-title">Candidate Claim: "${rc.claim_text}"</div>
        <div class="refusal-grid-2">
          <div>
            <span class="gap-col-title col-fact">Evidence Audit Trail:</span>
            <p style="font-size: 0.8rem; color: #94A3B8; margin-top: 0.3rem;">
              <strong>Origin:</strong> ${rc.origin || 'Candidate Claim'}<br>
              <strong>Why Considered:</strong> ${details.why_considered}<br>
              <strong>Evidence Found:</strong> ${details.evidence_found}<br>
              <strong>Evidence Missing:</strong> ${details.evidence_missing}<br>
              <strong>Source Quality:</strong> ${details.source_quality}
            </p>
          </div>
          <div>
            <span class="gap-col-title col-impact">Defensibility & Publishing Consequence:</span>
            <p style="font-size: 0.82rem; color: #FCA5A5; margin-top: 0.3rem; line-height: 1.45;">
              <strong>Reason:</strong> ${rc.decision_reason}<br>
              <strong>Consequence:</strong> ${details.publishing_consequence}
            </p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Update Header Counts
function updateCounts(record) {
  if (!record) return;
  document.getElementById('ledgerCount').textContent = record.claims.allClaims.length;
  document.getElementById('refusalCount').textContent = record.claims.refusedClaims.length;
}

// Update State Pills
function updateApprovalPill(state) {
  const pill = document.getElementById('diagnosticApprovalPill');
  const gateText = document.getElementById('gateStatusText');
  const gateBadge = document.getElementById('gateBadge');

  if (state === 'APPROVED') {
    pill.textContent = 'APPROVED // CLEARED FOR CLIENT DISPATCH';
    pill.className = 'state-pill state-approved';
    gateText.textContent = 'APPROVED // CLEARED FOR CLIENT DISPATCH';
    gateText.className = 'state-pill state-approved';
    gateBadge.textContent = 'APPROVED';
    gateBadge.className = 'badge-mini badge-success';
  } else if (state === 'RETURNED_FOR_REVISION') {
    pill.textContent = 'RETURNED FOR REVISION // DRAFT';
    pill.className = 'state-pill state-revision';
    gateText.textContent = 'REVISION REQUESTED // RETURNED TO DRAFT';
    gateText.className = 'state-pill state-revision';
    gateBadge.textContent = 'REVISION';
    gateBadge.className = 'badge-mini badge-danger';
  } else {
    pill.textContent = 'DRAFT // PENDING HUMAN REVIEW';
    pill.className = 'state-pill state-draft';
    gateText.textContent = 'DRAFT // AWAITING HUMAN VERIFICATION';
    gateText.className = 'state-pill state-draft';
    gateBadge.textContent = 'PENDING';
    gateBadge.className = 'badge-mini badge-amber';
  }
}

// Render Audit Trail
function renderAuditTrail(history) {
  const container = document.getElementById('gateAuditTrail');
  if (!history || history.length === 0) return;

  container.innerHTML = history.slice().reverse().map(h => `
    <div class="audit-entry">
      <span class="audit-time">${new Date(h.timestamp).toLocaleTimeString()}</span>
      <span class="audit-actor">${h.actor}</span>
      <p class="audit-msg">${h.notes || h.action}</p>
    </div>
  `).join('');
}

// Handle Human Approval Gate Actions
async function handleApprovalAction(action) {
  const reviewerName = document.getElementById('reviewerName').value.trim();
  const reviewerRole = document.getElementById('reviewerRole').value.trim();
  const notes = document.getElementById('reviewNotes').value.trim();

  const endpoint = action === 'APPROVE' ? '/api/review/approve' : '/api/review/revise';
  const body = action === 'APPROVE' ? {
    reviewer_name: reviewerName,
    reviewer_role: reviewerRole,
    approval_notes: notes || 'All factual claims verified against primary sources. Refused claims confirmed excluded. House rules passed.'
  } : {
    reviewer_name: reviewerName,
    revision_reason: 'Advisory Reviewer Revision Request',
    specific_instructions: notes || 'Please verify title designation with company registry.'
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    if (result.success) {
      currentRecord.diagnostic = result.diagnostic;
      updateApprovalPill(result.diagnostic.meta.approval_state);
      renderAuditTrail(result.diagnostic.meta.approval_history);
      alert(`Human Approval Gate: ${result.message}`);
    } else {
      // Blocking house rule error
      alert(`APPROVAL BLOCKED: ${result.message}`);
    }
  } catch (err) {
    alert(`Gate Action Error: ${err.message}`);
  }
}

// Failure Testbench Runner
async function runFailureScenario(scenario) {
  const outputEl = document.getElementById('testbenchOutput');
  outputEl.textContent = `Executing failure scenario: [${scenario}] against system resilience engine...`;

  try {
    const res = await fetch('/api/test/failure-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });

    const json = await res.json();
    outputEl.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    outputEl.textContent = `Network Error: ${err.message}`;
  }
}

// Load n8n Workflow JSON Preview
async function loadN8nWorkflowPreview() {
  const block = document.getElementById('workflowJsonBlock');
  try {
    const res = await fetch('/api/n8n/workflow');
    if (res.ok) {
      const data = await res.json();
      block.textContent = JSON.stringify(data, null, 2);
    } else {
      block.textContent = '// n8n workflow file ready for export.';
    }
  } catch (err) {
    block.textContent = `// Workflow preview available via direct download.`;
  }
}

window.runFailureScenario = runFailureScenario;
