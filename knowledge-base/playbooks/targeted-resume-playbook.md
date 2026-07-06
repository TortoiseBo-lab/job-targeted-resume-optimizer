# Target-Company Job-Driven Resume Tailoring Playbook

A public, abstracted playbook for turning a candidate profile, target company, target role, and JD into a tailored resume and optimization report.

## Source Policy

This playbook contains abstracted rules and synthetic examples only. It intentionally avoids original third-party guide prose, raw sample resume text, and personal data.

## Workflow

1. **target_intake** - Normalize the target company, role family, country/market, seniority, JD, and user constraints.
   Outputs: role_family, target_market, company_signals, must_have_requirements, nice_to_have_requirements
2. **jd_signal_extraction** - Extract skill, responsibility, domain, tool, stakeholder, metric, and behavioral signals from the JD.
   Outputs: keyword_clusters, responsibility_clusters, evidence_requirements, risk_flags
3. **experience_evidence_mapping** - Map user facts to JD signals without inventing facts.
   Outputs: direct_matches, transferable_matches, weak_or_missing_evidence, follow_up_questions
4. **section_strategy** - Choose resume sections, ordering, density, and page size for the target market and role.
   Outputs: section_order, compression_plan, front_page_priority, template_id
5. **bullet_rewrite** - Rewrite bullets as action, object, method/tool, scope, and outcome.
   Outputs: rewritten_bullets, metric_questions, unsupported_claims_removed
6. **report_delivery** - Explain the changes, gaps, and next evidence needed before final submission.
   Outputs: score, diagnosis, rewrite_rationale, next_questions, export_ready_resume

## Scoring Rubric

- **JD Match (25%)**: Must-have skills are proven by experience; Top responsibilities appear in the first half; Keywords are supported by facts.
- **Company Fit (15%)**: Company-specific signals shape prioritization; Tone fits the company and market; Evidence matches expected maturity.
- **Evidence Strength (25%)**: Bullets contain action, method, scope, and result; Metrics are used only when supported; Weak responsibilities are compressed.
- **Structure and Scanability (20%)**: Sections are conventional; Dates and headings are consistent; Most relevant content appears early.
- **Language Quality (15%)**: No inflated AI phrasing; Verbs are precise; Claims are specific and defensible.

## Evidence Mapping Rules

- Direct evidence beats keyword matching. A keyword should appear only when a real experience proves it.
- When a JD requirement is missing, ask for project, coursework, tool, stakeholder, scale, or result evidence before rewriting.
- Weakly related experience should be compressed, not deleted, when it still shows transferable skills.
- The first half of the resume should carry the strongest role-specific evidence.
- Do not fabricate metrics, company names, tools, awards, dates, or outcomes.

## Synthetic Rewrite Patterns

- Weak: Worked on a data dashboard for the team.
  Strong: Built a SQL-based KPI dashboard that consolidated weekly sales data and helped managers identify underperforming regions.
  Why: Adds tool, object, cadence, stakeholder, and decision value without inventing unsupported metrics.
- Weak: Participated in a machine learning project.
  Strong: Trained and evaluated a classification model on course project data, comparing baseline and tuned results to explain feature impact.
  Why: Names model work and evaluation behavior while staying conservative when dataset and metric details are missing.
- Weak: Helped with market research.
  Strong: Synthesized competitor pricing and customer segment findings into a recommendation memo for a student consulting project.
  Why: Turns vague assistance into analysis output, context, and deliverable.
