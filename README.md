# Job Targeted Resume Optimizer

[![npm version](https://img.shields.io/npm/v/job-targeted-resume-optimizer.svg)](https://www.npmjs.com/package/job-targeted-resume-optimizer)
[![license](https://img.shields.io/badge/license-MIT-111111.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-111111.svg)](package.json)

An installable Codex and Claude Code skill for creating target-company and target-role tailored resumes.

Most resume tools polish what already exists. This package starts from the target: company, role, market, seniority, and JD. It maps the candidate's real evidence to that target, chooses a resume strategy, rewrites without inventing facts, and delivers final Word and PDF files with resume-specific layout controls.

This is the open skill package, not the hosted production web app.

## Install

Install from npm:

```bash
npm install -g job-targeted-resume-optimizer
resume-skill install --target all
```

Install only one environment:

```bash
resume-skill install --target codex
resume-skill install --target claude
```

Then ask Codex or Claude Code:

```txt
Use job-targeted-resume-optimizer.

My resume is in ./inputs/resume.md.
The JD is in ./inputs/target-jd.md.
Target company: Google
Target role: Software Engineer Intern
Target market: US

Please generate a final targeted resume as Word and PDF.
Put optimization notes and follow-up questions in a separate report, not inside the resume.
```

Expected outputs:

```txt
outputs/google-software-engineer-intern-targeted-resume.docx
outputs/google-software-engineer-intern-targeted-resume.pdf
outputs/google-software-engineer-intern-optimization-report.md
```

## Demos

The repository includes synthetic international-student demos. All people, resumes, and JDs are fictional and safe for open-source use.

| Demo | Route | Page | Style | Outputs |
| --- | --- | --- | --- | --- |
| [Google SWE Intern](examples/demos/google-swe-intern/README.md) | `google-big-tech` | US Letter | `tech-clean` | docx / pdf / report |
| [Finance Analyst](examples/demos/finance-analyst/README.md) | `investment-banking-analyst` | US Letter | `finance-compact` | docx / pdf / report |
| [Consulting BA](examples/demos/consulting-ba/README.md) | `mbb-consulting` | US Letter | `consulting-executive` | docx / pdf / report |
| [Chinese Internet Product](examples/demos/chinese-internet-product/README.md) | `chinese-product-ops` | A4 | `chinese-professional` | docx / pdf / report |
| [UK Graduate Scheme](examples/demos/uk-graduate-scheme/README.md) | `uk-graduate-scheme` | A4 | `classic-ats` | docx / pdf / report |

Run all demo exports locally:

```bash
git clone https://github.com/TortoiseBo-lab/job-targeted-resume-optimizer.git
cd job-targeted-resume-optimizer
npm install
npm run export:demos
```

The older minimal bundled example remains available under `examples/inputs` and `examples/outputs`.

## Workflow

```txt
Resume + Target JD
  -> Target role signal analysis
  -> Candidate evidence map
  -> Strategy and template route
  -> Final resume source
  -> Auto-fit Word / PDF export
  -> Separate optimization report
```

The skill is designed to behave like a guided resume-making flow:

1. Intake the original resume and target JD.
2. Extract target-company and target-role signals.
3. Separate direct matches, transferable matches, and gaps.
4. Select section order, density, and template route.
5. Rewrite bullets using only supported facts.
6. Keep missing-detail questions and optimization notes out of the resume.
7. Export the final resume as Word and PDF with automatic standard/compact/dense layout selection.
8. Put suggestions in a separate report.

## Document Export Quality

The built-in exporter is optimized for application-ready resumes:

- Word sections use divider lines, consistent margins, ATS-friendly fonts, and heading keep rules.
- The exporter estimates resume length and automatically selects `standard`, `compact`, or `dense` spacing.
- The exporter can apply a 96-route template id through `--template-route`, such as `google-big-tech`, `wharton-finance`, or `mbb-consulting`.
- Every route has a template-level spec in `knowledge-base/templates/template-specs.json`.
- Template routes map to real document style families: `classic-ats`, `tech-clean`, `academic-cv`, `finance-compact`, `consulting-executive`, `creative-modern`, and `chinese-professional`.
- Serif templates use `Times New Roman` in Word and `Times-Roman` in fallback PDF; tech and modern templates use Arial/Aptos-style sans fonts.
- US, US school, and US company templates default to US Letter; China, UK, Europe, Australia, and Hong Kong templates default to A4.
- Divider line weight, color, heading capitalization, density, and Chinese font fallback vary by document template.
- Export QA checks page size, template font, required sections, skills section presence, bullet density, page fill, divider rules, and AI-tone phrases.
- PDF generation uses LibreOffice conversion when a working `soffice` or `libreoffice` command is available.
- If LibreOffice is not available, PDF generation falls back to the internal renderer instead of failing.
- Optimization notes, evidence gaps, and follow-up questions are filtered out of the resume export by default.

Example:

```bash
npm run export -- --input outputs/google-swe-intern-targeted-resume.md --template-route google-big-tech
npm run export -- --input outputs/finance-analyst-targeted-resume.md --template-route wharton-finance
```

## Why It Exists

Generic resume editing often makes every candidate sound the same. This package is built around a stricter principle:

> A strong resume is not just well written. It is engineered for one target application.

The system uses:

- Company-specific writing rules.
- Industry and role conventions.
- University and style guidance.
- A 96-route template catalog.
- A target-driven playbook for evidence mapping and resume strategy.

## What Is Included

| Path | Purpose |
| --- | --- |
| `skills/codex/job-targeted-resume-optimizer/` | Codex skill package |
| `skills/claude/job-targeted-resume-optimizer/` | Claude Code skill package |
| `knowledge-base/index.json` | Coverage map for companies, industries, universities, and styles |
| `knowledge-base/templates/catalog.json` | 96 resume template routes |
| `knowledge-base/templates/template-specs.json` | Template-level page, font, divider, writing, and QA rules |
| `knowledge-base/playbooks/targeted-resume-playbook.md` | Human-readable workflow |
| `scripts/install-skill.mjs` | Codex / Claude Code installer |
| `scripts/export-resume.mjs` | Auto-fit resume source to DOCX / PDF exporter |
| `examples/` | Sample resume, JD, and generated outputs |
| `prompts/chatgpt-copy-paste-cn.md` | No-code Chinese prompt |

## Coverage

Current open coverage includes:

- Companies: Google, Meta, Amazon, OpenAI, Microsoft, TikTok, McKinsey, BCG, Bain, Goldman Sachs, J.P. Morgan, Morgan Stanley.
- Industries: software engineering, data science, product management, consulting, finance, investment banking, marketing, academic CV, healthcare, law, public policy, accounting, statistics, fintech, and more.
- Styles: ATS, Big Tech, consulting, investment banking, academic CV, modern, minimal, startup, and other routes.
- Templates: 96 target-driven resume routes.

## Use Without Installation

For a no-code test, copy the prompt into ChatGPT, Claude, Gemini, or another LLM:

- [中文零代码上手指南](START_HERE_CN.md)
- [Copy-paste Chinese prompt](prompts/chatgpt-copy-paste-cn.md)

## Use As A Developer Package

You can load the JSON files directly from your own app or agent:

```js
import fs from "node:fs";

const index = JSON.parse(fs.readFileSync("knowledge-base/index.json", "utf8"));
const playbook = JSON.parse(fs.readFileSync("knowledge-base/playbooks/targeted-resume-playbook.json", "utf8"));
const templates = JSON.parse(fs.readFileSync("knowledge-base/templates/catalog.json", "utf8"));

console.log(index.nodes.companies);
console.log(playbook.workflow.map((step) => step.name));
console.log(templates.templateCount);
```

## Data Policy

The public package contains abstracted, project-authored rules and synthetic examples. It does not include raw private resume corpora, uploaded user resumes, original third-party guide PDFs, payment code, API keys, deployment assets, or production website files.

See [DATA_CARD.md](DATA_CARD.md).

## Validation

```bash
npm run validate
```

The validator checks required files, coverage counts, template count, JSON validity, raw-file absence, and obvious sensitive-content patterns.

## Documentation

- [Usage guide](docs/USAGE.md)
- [Installable skills](docs/INSTALL_SKILLS.md)
- [Claude Code skill guide](docs/CLAUDE_CODE_SKILL_CN.md)
- [npm publishing notes](docs/NPM_PUBLISHING.md)

## License

MIT
