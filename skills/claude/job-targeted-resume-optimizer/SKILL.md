---
name: job-targeted-resume-optimizer
description: Create a target-company and target-role tailored resume through a guided workflow. Use when the user wants resume optimization, resume rewriting, a resume draft for a specific company/job/JD, an ATS-friendly resume, a Claude Code skill-based resume builder, or Word/PDF resume output from candidate facts.
---

# Job Targeted Resume Optimizer

Run a guided resume-building workflow: intake, target analysis, evidence mapping, strategy, drafting, review, and export.

## Required Inputs

Collect or infer:

- Candidate resume or candidate facts.
- Target company.
- Target role.
- Target market or region.
- Job description.
- Desired output format: Markdown, Word, PDF, or all.

If the user has not provided a resume or JD, ask for those first.

## Knowledge Loading

Use the skill installation directory as the base. Read:

- `references/knowledge-base/index.json`
- `references/knowledge-base/playbooks/targeted-resume-playbook.md`
- `references/knowledge-base/templates/catalog.json`

Then load only relevant company, industry, university, and style rule files.

## Workflow

1. Extract JD signals: responsibilities, hard skills, soft skills, business context, seniority, and hidden screening criteria.
2. Parse the candidate resume into factual evidence.
3. Map evidence into direct match, transferable match, and gap.
4. Choose section order and a template route from the 67-template catalog.
5. Rewrite the resume without inventing facts.
6. Mark missing facts as `[Need detail: ...]`.
7. Save a Markdown resume package under `outputs/<company-role>-targeted-resume.md`.
8. If Word/PDF is requested, run:

   `node <this skill>/scripts/export-resume.mjs --input outputs/<company-role>-targeted-resume.md`

9. Confirm generated files exist before reporting success.

## Hard Rules

- Never invent companies, roles, dates, degrees, tools, awards, metrics, users, revenue, publications, or outcomes.
- Do not force JD keywords into unsupported experience.
- Use target-company and target-role reasoning, not generic polishing.
- Preserve the candidate's real background.
- Ask follow-up questions when metrics, scope, tools, or outcomes are missing.

## Final Response

Report:

- Markdown output path.
- Word/PDF paths if generated.
- Chosen template route.
- Top 3 strongest matches.
- Top 3 evidence gaps.
- Next questions for the user.
