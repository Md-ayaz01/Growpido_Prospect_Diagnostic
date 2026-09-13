import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_callout(doc, title, text, border_color_hex="D4AF37", bg_color_hex="F8FAFC"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, bg_color_hex)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="none"/><w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color_hex}"/><w:bottom w:val="none"/><w:right w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    run_t = p.add_run(f"■ {title.upper()}\n")
    run_t.bold = True
    run_t.font.name = "Georgia"
    run_t.font.size = Pt(9.5)
    run_t.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
    
    run_b = p.add_run(text)
    run_b.font.name = "Calibri"
    run_b.font.size = Pt(9.5)
    run_b.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def style_heading_1(p, text):
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Georgia"
    run.font.size = Pt(15)
    run.bold = True
    run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

def style_heading_2(p, text):
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Georgia"
    run.font.size = Pt(12)
    run.bold = True
    run.font.color.rgb = RGBColor(0xB4, 0x53, 0x09)

def add_body_p(doc, text, bold_prefix=""):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(9.5)
        r_pre.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    return p

def main():
    doc = Document()
    
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # -------------------------------------------------------------
    # DOCUMENT COVER / HEADER
    # -------------------------------------------------------------
    header_p = doc.add_paragraph()
    header_p.paragraph_format.space_before = Pt(0)
    header_p.paragraph_format.space_after = Pt(2)
    r_kicker = header_p.add_run("GROWPIDO REPUTATION & NARRATIVE ADVISORY // DUBAI\n")
    r_kicker.font.name = "Georgia"
    r_kicker.font.size = Pt(9.5)
    r_kicker.bold = True
    r_kicker.font.color.rgb = RGBColor(0xD4, 0xAF, 0x37)

    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    r_title = title_p.add_run("PROSPECT → DIAGNOSTIC WALKTHROUGH")
    r_title.font.name = "Georgia"
    r_title.font.size = Pt(20)
    r_title.bold = True
    r_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(12)
    r_sub = sub_p.add_run("Defensible Public-Source Positioning Intelligence Platform // Production-Oriented Vertical Slice")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(10.5)
    r_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # Meta Table
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("CANDIDATE / AUTHOR", "Mohammed Ayaz Pathan (Senior AI & Research Systems Architect)"),
        ("EVALUATOR / CLIENT", "Nidhi Hooda, Founder — Growpido (Dubai, UAE)"),
        ("TESTED TARGETS", "Huda Kattan (Huda Beauty), Mudassir Sheikha (Careem), Abbas Sajwani (AHS)"),
        ("ASSESSMENT TRACK", "Track B: Prospect to Diagnostic (September 2026 Build Task)"),
        ("SUBMISSION STATUS", "FINAL HARDENED VERTICAL SLICE // 5.5 Hours Reported")
    ]
    for row_idx, (k, v) in enumerate(meta_data):
        c0 = meta_table.cell(row_idx, 0)
        c1 = meta_table.cell(row_idx, 1)
        c0.width = Inches(2.2)
        c1.width = Inches(4.5)
        set_cell_background(c0, "F1F5F9")
        set_cell_background(c1, "F8FAFC")
        set_cell_margins(c0, 50, 50, 80, 80)
        set_cell_margins(c1, 50, 50, 80, 80)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.name = "Georgia"
        r0.font.size = Pt(8)
        r0.bold = True
        r0.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9)
        r1.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_callout(doc, "CORE ADVISORY PRINCIPLE", 
                "EVIDENCE BEFORE ASSERTION.\n"
                "In Dubai reputation advisory (DIFC, ADGM, family offices), an unverified number or fabricated claim is a regulatory hazard and a lost client. "
                "The system is designed to say: 'I don't know', 'I could not verify this', and 'This claim is not safe to publish' before asserting any public positioning claim.",
                border_color_hex="D4AF37", bg_color_hex="FFFDF5")

    # -------------------------------------------------------------
    # SECTION 1: SYSTEM OVERVIEW & ZERO-HARDCODING GUARANTEE
    # -------------------------------------------------------------
    style_heading_1(doc.add_paragraph(), "1. System Overview & Generic Research Architecture")
    add_body_p(doc, "This system is an auditable, production-oriented vertical slice built for Growpido's Track B assessment. In accordance with Growpido's 100-point scoring rubric, all hardcoded assumptions and predetermined outcomes have been eliminated. The research, verification, refusal, and positioning gap engines reach decisions dynamically from collected public evidence for any valid UAE executive LinkedIn URL.")

    add_body_p(doc, "Key architectural highlights:", "Architectural Safeguards: ")
    add_body_p(doc, "• Live Research vs Demo Fixture: The interface and telemetry explicitly distinguish between LIVE RESEARCH and stored demonstration datasets.")
    add_body_p(doc, "• Random Prospect Validation: Validated end-to-end on Mudassir Sheikha (Co-Founder & CEO, Careem) as well as Abbas Sajwani (Founder & CEO, AHS Properties).")
    add_body_p(doc, "• Multi-Status Verification: Supports VERIFIED, PRIMARY VERIFIED (CORROBORATION NOT FOUND), PARTIALLY VERIFIED, CONFLICT, and REFUSED.")
    add_body_p(doc, "• Blocking House Rule Checker: Deterministically checks for em dashes, hashtags, and AI filler vocabulary. Violations block human approval.")

    # -------------------------------------------------------------
    # SECTION 2: LIVE RANDOM PROSPECT RUN (MUDASSIR SHEIKHA)
    # -------------------------------------------------------------
    style_heading_1(doc.add_paragraph(), "2. Dynamic Research on New Prospect (Mudassir Sheikha — Careem)")
    add_body_p(doc, "To prove that the pipeline does not rely on hardcoded demo conclusions, the reviewer can enter Mudassir Sheikha's public LinkedIn profile (https://www.linkedin.com/in/mudassir-sheikha/). The system dynamically resolves his identity via public knowledge endpoints, collects sources across 4 tiers, extracts candidate claims, and generates a defensible diagnostic:")

    img1_path = r"C:\Users\patha\.gemini\antigravity-ide\brain\873b738d-8c61-4c95-8058-3c7df22572b0\mudassir_diagnostic_live_1789230554181.png"
    if os.path.exists(img1_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.paragraph_format.space_after = Pt(2)
        p_img.add_run().add_picture(img1_path, width=Inches(6.2))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run("Figure 1: Live Research Diagnostic & Observability Telemetry for Mudassir Sheikha (Careem)")
        r_cap.font.name = "Calibri"
        r_cap.font.size = Pt(8)
        r_cap.font.italic = True
        r_cap.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # -------------------------------------------------------------
    # SECTION 3: THE GENERIC REFUSAL ENGINE
    # -------------------------------------------------------------
    style_heading_1(doc.add_paragraph(), "3. The Generic Refusal Engine (Audit Case Study)")
    add_body_p(doc, "The refusal engine dynamically intercepts sensitive financial metrics (wealth, net worth, AUM, valuation) or unverified superlatives that lack Tier 1 audited regulatory proof:")

    add_callout(doc, "GENERIC REFUSAL CASE STUDY [CLAIM C-006]",
                "Candidate Claim: 'Mudassir Sheikha maintains an unverified private liquid net worth exceeding $500 Million with undocumented pre-IPO distributions.'\n\n"
                "Why Considered: Discovered in secondary web chatter and speculative executive wealth scrapers.\n\n"
                "Evidence Found: Secondary aggregator repetition lacking audited balance sheets or filings.\n\n"
                "Evidence Missing: Tier 1 audited financial filings, regulatory disclosures (DIFC/ADGM/SEC), or verified Forbes/Bloomberg Billionaire Index verification.\n\n"
                "Source Quality: Tier 4 (Disqualified Aggregator).\n\n"
                "System Decision: CLAIM REFUSED // EXCLUDED FROM CLIENT DELIVERABLE.\n\n"
                "Publishing Consequence: Publishing unverified personal wealth metrics creates immediate legal, regulatory, and reputational liability for the advisory and client.",
                border_color_hex="EF4444", bg_color_hex="FEF2F2")

    # -------------------------------------------------------------
    # SECTION 4: HUMAN REVIEW GATE & HOUSE RULES
    # -------------------------------------------------------------
    style_heading_1(doc.add_paragraph(), "4. Human Approval Gate & House Rule Enforcement")
    add_body_p(doc, "The AI never automatically marks a report ready for client presentation. The senior advisor must inspect the audit ledger and sign off. Furthermore, the system includes a blocking house rule checker that rejects approval if em dashes, hashtags, or AI filler words are detected:")

    img2_path = r"C:\Users\patha\.gemini\antigravity-ide\brain\873b738d-8c61-4c95-8058-3c7df22572b0\mudassir_approved_gate_1789230752538.png"
    if os.path.exists(img2_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.paragraph_format.space_after = Pt(2)
        p_img.add_run().add_picture(img2_path, width=Inches(6.2))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run("Figure 2: Human Approval Gate — Mandatory Advisory Checklist & Approved Status Audit Log")
        r_cap.font.name = "Calibri"
        r_cap.font.size = Pt(8)
        r_cap.font.italic = True
        r_cap.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # -------------------------------------------------------------
    # SECTION 5: SECOND PROSPECT DEMO (ABBAS SAJWANI)
    # -------------------------------------------------------------
    style_heading_1(doc.add_paragraph(), "5. Multi-Subject Verification: Abbas Sajwani (AHS Properties)")
    add_body_p(doc, "Clicking the Abbas Sajwani preset executes the identical generic pipeline on AHS Properties, retrieving corporate domain records and independently corroborating projects while refusing the unverified global billionaire timeline claim:")

    img3_path = r"C:\Users\patha\.gemini\antigravity-ide\brain\873b738d-8c61-4c95-8058-3c7df22572b0\abbas_diagnostic_live_1789231016709.png"
    if os.path.exists(img3_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.paragraph_format.space_after = Pt(2)
        p_img.add_run().add_picture(img3_path, width=Inches(6.2))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run("Figure 3: Abbas Sajwani (AHS Properties) Public Positioning Diagnostic")
        r_cap.font.name = "Calibri"
        r_cap.font.size = Pt(8)
        r_cap.font.italic = True
        r_cap.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # -------------------------------------------------------------
    # SECTION 6: N8N WORKFLOW
    # -------------------------------------------------------------
    style_heading_1(doc.add_paragraph(), "6. Exportable n8n Automation Workflow")
    add_body_p(doc, "The automation architecture is fully represented in growpido_prospect_diagnostic_workflow.json. All 13 nodes have clear input/output contracts connecting webhook ingestion, URL validation, dynamic source collection, deduplication, claim extraction, double-verification, refusal decisioning, gap analysis, and human approval response:")

    img4_path = r"C:\Users\patha\.gemini\antigravity-ide\brain\873b738d-8c61-4c95-8058-3c7df22572b0\n8n_workflow_view_1789229330457.png"
    if os.path.exists(img4_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(6)
        p_img.paragraph_format.space_after = Pt(2)
        p_img.add_run().add_picture(img4_path, width=Inches(6.2))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_after = Pt(8)
        r_cap = p_cap.add_run("Figure 4: The 13-Node n8n Workflow Schema")
        r_cap.font.name = "Calibri"
        r_cap.font.size = Pt(8)
        r_cap.font.italic = True
        r_cap.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # -------------------------------------------------------------
    # SECTION 7: SUBMISSION PACK & THE HONEST PARAGRAPH
    # -------------------------------------------------------------
    style_heading_1(doc.add_paragraph(), "7. Growpido Submission Pack & Founder Questionnaire")
    
    style_heading_2(doc.add_paragraph(), "Direct Answers to Nidhi Hooda's 4 Questions:")
    add_body_p(doc, "Free and available immediately.", "1. Current Employment Status: ")
    add_body_p(doc, "Notice period is 0 days. Earliest start date is immediately.", "2. Notice Period & Start Date: ")
    add_body_p(doc, "Nothing. Clean slate. No freelance clients, no side product, no courses.", "3. Concurrent Commitments: ")
    add_body_p(doc, "Full-time and 100% exclusive.", "4. Exclusivity: ")

    style_heading_2(doc.add_paragraph(), "The Honest Paragraph (What Broke & What I Would Fix Next):")
    add_callout(doc, "THE HONEST PARAGRAPH",
                "What broke early on was source attribution fragility: initial automated web fetches were either rate-limited or blocked by anti-bot headers on regional news portals, leading the extraction layer to attempt to parse incomplete snippets or fall back onto secondary aggregators. I had to enforce strict timeout abort controllers, User-Agent normalization, and an explicit disqualification rule that completely bars Tier 4 aggregators from verifying factual claims.\n\n"
                "Secondly, resolving nuances like 'Founder & CEO' versus 'Co-Founder' showed how easily secondary business press introduces title drift; rather than letting the AI average this into a generic statement, I had to write explicit deterministic rules that defer to the Tier 1 corporate filing and flag the secondary variation as a caveat.\n\n"
                "If I had another 48 hours, I would integrate direct UAE trade license API verification via Dubai Economy (DED) / DIFC public registers, build a live diffing engine to track when an executive's public bio silently changes between web crawls, and deploy a webhook listener in n8n that pushes review requests directly into Slack for one-click mobile partner sign-offs.",
                border_color_hex="10B981", bg_color_hex="F0FDF4")

    style_heading_2(doc.add_paragraph(), "Hours Breakdown:")
    add_body_p(doc, "5.5 hours start to finish.", "Total Reported Time: ")

    style_heading_2(doc.add_paragraph(), "Recommended 5-Minute Loom Sequence:")
    add_body_p(doc, "• Min 0:00 - 1:00: Problem definition, core principle 'Evidence Before Assertion', and house rules.\n• Min 1:00 - 2:00: Live research run on Mudassir Sheikha (Careem) — proving dynamic resolution and telemetry.\n• Min 2:00 - 3:00: The Generic Refusal Engine — deep dive into excluded unverified wealth assertion and publishing consequence.\n• Min 3:00 - 4:00: Evidence Ledger & the One-Page Diagnostic (3 Gaps, Narrative Territories, Sources).\n• Min 4:00 - 5:00: Human Approval Gate clearance, Failure Testbench demonstration, and the honest paragraph on system limits.")

    output_path = r"C:\Users\patha\.gemini\antigravity-ide\scratch\growpido-prospect-diagnostic\Growpido_Prospect_Diagnostic_Walkthrough_Audited.docx"
    doc.save(output_path)
    print("Hardened document successfully saved at:", output_path)

    # Also attempt saving to original if unlocked
    try:
        orig_path = r"C:\Users\patha\.gemini\antigravity-ide\scratch\growpido-prospect-diagnostic\Growpido_Prospect_Diagnostic_Walkthrough.docx"
        doc.save(orig_path)
        print("Also updated:", orig_path)
    except Exception as e:
        print("Note: Original docx is currently open in Word/editor (file lock held by Windows). Saved as Growpido_Prospect_Diagnostic_Walkthrough_Audited.docx.")

if __name__ == "__main__":
    main()
