---
name: job-targeted-resume-optimizer
description: Create a target-company and target-role tailored resume through a guided workflow. Use when the user wants resume optimization, resume rewriting, a resume draft for a specific company/job/JD, an ATS-friendly resume, a Claude/Codex skill-based resume builder, or Word/PDF resume output from candidate facts.
---

# Job Targeted Resume Optimizer

Run a guided resume-building workflow that feels like a product flow: intake, target analysis, evidence mapping, strategy, drafting, review, and export.

## Required Inputs

Collect or infer:

- Candidate resume or candidate facts.
- Target company.
- Target role.
- Target market or region.
- Job description.
- Desired output format: Markdown, Word, PDF, or all.

If the user has not provided a resume or JD, ask for those first. Keep the question short and practical.

## Guided Workflow

1. **Intake**
   - Ask for the original resume, target company, target role, target market, and JD.
   - If the user has files, read them directly.
   - If the user pasted text, preserve the facts exactly.

2. **Knowledge loading**
   - Read `references/knowledge-base/index.json`.
   - Read `references/knowledge-base/playbooks/targeted-resume-playbook.md`.
   - Read `references/knowledge-base/templates/catalog.json`.
   - Load only relevant company, industry, university, and style rule files.

3. **Target analysis**
   - Extract responsibilities, hard skills, soft skills, business context, seniority signals, and hidden screening criteria from the JD.

4. **Evidence map**
   - Classify candidate evidence as direct match, transferable match, or gap.
   - Do not invent facts.
   - Mark missing facts as `[Need detail: ...]`.

5. **Resume strategy**
   - Choose section order and density.
   - Pick a template route from the 67-template catalog.
   - Explain what to emphasize, compress, or remove.

6. **Draft**
   - Create a targeted Markdown resume under `outputs/<company-role>-targeted-resume.md`.
   - Include an optimization report with target signals, evidence map, changes, risks, and follow-up questions.

7. **Export**
   - If the user asks for Word or PDF, run:

     `node <this skill>/scripts/export-resume.mjs --input outputs/<company-role>-targeted-resume.md`

   - Confirm the `.docx`, `.pdf`, and `.html` files exist before reporting success.

## Hard Rules

- Never invent companies, roles, dates, degrees, tools, awards, metrics, users, revenue, publications, or outcomes.
- Do not force JD keywords into unsupported experience.
- Use target-company and target-role reasoning, not generic polishing.
- Preserve the candidate's real background.
- Ask follow-up questions when metrics, scope, tools, or outcomes are missing.
- Prefer clear, ATS-friendly English for the final resume unless the user requests another language.

## Output Summary

At the end, report:

- Markdown output path.
- Word/PDF paths if generated.
- Chosen template route.
- Top 3 strongest matches.
- Top 3 evidence gaps.
- The next questions the user should answer to make the resume stronger.
