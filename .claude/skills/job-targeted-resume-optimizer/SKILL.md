---
name: Job Targeted Resume Optimizer
description: Create a company- and role-targeted resume draft, optimization report, evidence map, and follow-up questions from a candidate resume and target job description.
---

# Job Targeted Resume Optimizer

Use this skill when the user wants to tailor, optimize, rewrite, or generate a resume for a specific company, role, market, or job description.

The goal is not generic polishing. The goal is to produce a target-company and target-role driven resume package using the repository's open knowledge base.

## Expected Inputs

Accept any combination of:

- Candidate resume text pasted in chat.
- A path to a resume file, such as PDF, DOCX, Markdown, TXT, or JSON.
- Target company.
- Target role.
- Target region or market.
- Job description text pasted in chat.
- A path to a JD file.
- Desired output format, such as Markdown, DOCX, or PDF.

If critical inputs are missing, ask for them briefly. The minimum useful inputs are candidate resume, target role, and job description.

## Knowledge Loading

Before writing the resume, locate the repository root that contains:

- `knowledge-base/index.json`
- `knowledge-base/playbooks/targeted-resume-playbook.md`
- `knowledge-base/templates/catalog.json`

Then load only the relevant knowledge slices:

1. Always read `knowledge-base/index.json`.
2. Always read `knowledge-base/playbooks/targeted-resume-playbook.md`.
3. Always read `knowledge-base/templates/catalog.json`.
4. If target company matches a known slug, read `knowledge-base/companies/<slug>/rules.json` and `summary.md`.
5. If target industry or role maps to a known industry, read `knowledge-base/industries/<slug>/rules.json` and `summary.md`.
6. If the situation implies a style route, read the relevant style rules, such as:
   - Big Tech: `knowledge-base/styles/big-tech/rules.json`
   - Consulting: `knowledge-base/styles/consulting/rules.json`
   - Investment banking: `knowledge-base/styles/investment-banking/rules.json`
   - ATS: `knowledge-base/styles/ats/rules.json`
   - Academic CV: `knowledge-base/styles/academic-cv/rules.json`
7. If the candidate's school is covered and relevant, read the matching university rules.

Do not load the full repository unless the user asks for an audit or broad exploration.

## Workflow

Follow this sequence:

1. Parse the target JD into role signals: responsibilities, hard skills, soft skills, business context, seniority, domain terms, and hidden screening criteria.
2. Parse the candidate resume into factual evidence: education, experience, projects, research, skills, leadership, awards, metrics, tools, dates, and outcomes.
3. Build an evidence map with three buckets:
   - Direct match.
   - Transferable match.
   - Gap or missing evidence.
4. Choose a template route from `knowledge-base/templates/catalog.json` based on role, company, market, seniority, and candidate background.
5. Decide section order and density.
6. Rewrite bullets using only supported facts.
7. Mark missing metrics or missing context as `[Need detail: ...]`.
8. Produce a targeted resume draft plus an optimization report.

## Hard Rules

- Never invent companies, roles, dates, degrees, awards, tools, metrics, publications, revenue, users, or outcomes.
- Do not disguise unsupported JD keywords as candidate experience.
- Preserve the candidate's real background.
- Prefer specific evidence over broad claims.
- If a fact is unclear, ask a follow-up question or mark it as missing.
- Keep resume language direct, ATS-friendly, and professionally restrained.
- For English resumes, output fluent professional English.
- For Chinese explanation, use clear Chinese unless the user asks otherwise.

## Default Output

Unless the user requests a different format, create a Markdown file under:

`outputs/<company-or-role>-targeted-resume.md`

The file should contain:

1. Target role signal analysis.
2. Candidate evidence map.
3. Recommended resume strategy.
4. Rewritten resume draft.
5. Change rationale.
6. Follow-up questions.

Also summarize the result in chat with:

- Output file path.
- Chosen template route.
- Top 3 strongest matches.
- Top 3 evidence gaps.

## DOCX And PDF

If the user asks for Word or PDF:

1. Generate the Markdown resume package first.
2. Check whether a local converter is available, such as `pandoc`, `libreoffice`, or another project-supported exporter.
3. If a converter is available, produce the requested `.docx` or `.pdf`.
4. If no converter is available, explain the missing dependency and still provide the Markdown output.

Do not claim a DOCX or PDF was created unless the file exists.

