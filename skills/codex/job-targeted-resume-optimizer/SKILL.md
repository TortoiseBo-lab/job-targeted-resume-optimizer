---
name: job-targeted-resume-optimizer
description: Create a target-company and target-role tailored resume through a guided workflow. Use when the user wants resume optimization, resume rewriting, a final resume document for a specific company/job/JD, an ATS-friendly resume, a Claude/Codex skill-based resume builder, or Word/PDF resume output from candidate facts.
---

# Job Targeted Resume Optimizer

Run a guided resume-building workflow that feels like a product flow: intake, target analysis, evidence mapping, strategy, final resume writing, review, and export.

## Required Inputs

Collect or infer:

- Candidate resume or candidate facts.
- Target company.
- Target role.
- Target market or region.
- Job description.
- Desired output format: Word, PDF, or both. Markdown is an internal source format only unless the user explicitly asks for it.

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
   - Keep gaps and missing facts out of the resume. Put them in the separate optimization report.

5. **Resume strategy**
   - Choose section order and density.
   - Pick a template route from the 67-template catalog.
   - Explain what to emphasize, compress, or remove.

6. **Draft final resume**
   - Create a clean final resume source in a temporary or hidden working file.
   - The resume must be the final application-ready version only.
   - Do not include target analysis, resume strategy, evidence gaps, follow-up questions, `[Need detail: ...]`, or optimization notes in the resume.
   - If facts are missing, either omit the unsupported claim or use a conservative factual version.
   - Create a separate report under `outputs/<company-role>-optimization-report.md` for target signals, evidence map, risks, and follow-up questions.

7. **Export**
   - Always produce Word/PDF as the main user-facing deliverables unless the user explicitly asks otherwise.
   - Run:

     `node <this skill>/scripts/export-resume.mjs --input <resume-source-file> --out-dir outputs --base-name <company-role>-targeted-resume`

   - Confirm the `.docx` and `.pdf` files exist before reporting success.

## Hard Rules

- Never invent companies, roles, dates, degrees, tools, awards, metrics, users, revenue, publications, or outcomes.
- Do not force JD keywords into unsupported experience.
- Use target-company and target-role reasoning, not generic polishing.
- Preserve the candidate's real background.
- Ask follow-up questions when metrics, scope, tools, or outcomes are missing.
- Never put follow-up questions, missing-detail markers, or optimization commentary inside the resume document.
- Prefer clear, ATS-friendly English for the final resume unless the user requests another language.

## Output Summary

At the end, report:

- Word/PDF paths.
- Separate optimization-report path.
- Chosen template route.
- Top 3 strongest matches.
- Top 3 evidence gaps.
- The next questions the user should answer to make the resume stronger.
