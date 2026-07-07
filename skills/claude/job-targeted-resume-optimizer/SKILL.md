---
name: job-targeted-resume-optimizer
description: Create a target-company and target-role tailored resume through a guided workflow. Use when the user wants resume optimization, resume rewriting, a final resume document for a specific company/job/JD, an ATS-friendly resume, a Claude Code skill-based resume builder, or Word/PDF resume output from candidate facts.
---

# Job Targeted Resume Optimizer

Run a guided resume-building workflow: intake, target analysis, evidence mapping, strategy, final resume writing, review, and export.

## Required Inputs

Collect or infer:

- Candidate resume or candidate facts.
- Target company.
- Target role.
- Target market or region.
- Job description.
- Desired output format: Word, PDF, or both. Markdown is an internal source format only unless the user explicitly asks for it.

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
6. Keep missing facts, `[Need detail: ...]`, follow-up questions, and optimization commentary out of the resume.
7. Save a separate optimization report under `outputs/<company-role>-optimization-report.md`.
8. Use a temporary or hidden Markdown source only as an internal export source, unless the user explicitly asks for Markdown.
9. Run:

   `node <this skill>/scripts/export-resume.mjs --input <resume-source-file> --out-dir outputs --base-name <company-role>-targeted-resume`

10. Confirm `.docx` and `.pdf` files exist before reporting success.
11. Note the exporter layout profile (`standard`, `compact`, or `dense`) and PDF engine from the command output.
12. If the resume spills beyond the desired page count, tighten the source content first: reduce weak bullets, merge low-value skills, and keep only target-relevant evidence.

## Hard Rules

- Never invent companies, roles, dates, degrees, tools, awards, metrics, users, revenue, publications, or outcomes.
- Do not force JD keywords into unsupported experience.
- Use target-company and target-role reasoning, not generic polishing.
- Preserve the candidate's real background.
- Ask follow-up questions when metrics, scope, tools, or outcomes are missing.
- Never put follow-up questions, missing-detail markers, or optimization commentary inside the resume document.

## Final Response

Report:

- Word/PDF paths.
- Separate optimization-report path.
- Export layout profile and PDF engine.
- Chosen template route.
- Top 3 strongest matches.
- Top 3 evidence gaps.
- Next questions for the user.
