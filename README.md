# Job Targeted Resume Optimizer

[![npm version](https://img.shields.io/npm/v/job-targeted-resume-optimizer.svg)](https://www.npmjs.com/package/job-targeted-resume-optimizer)
[![license](https://img.shields.io/badge/license-MIT-111111.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-111111.svg)](package.json)

An installable Codex and Claude Code skill for creating target-company and target-role tailored resumes.

Most resume tools polish what already exists. This package starts from the target: company, role, market, seniority, and JD. It maps the candidate's real evidence to that target, chooses a resume strategy, rewrites without inventing facts, and delivers final Word and PDF files.

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

## Demo

Bundled example:

- Input resume: [examples/inputs/sample-resume.md](examples/inputs/sample-resume.md)
- Target JD: [examples/inputs/google-swe-intern-jd.md](examples/inputs/google-swe-intern-jd.md)
- Output Word: [examples/outputs/example-targeted-resume.docx](examples/outputs/example-targeted-resume.docx)
- Output PDF: [examples/outputs/example-targeted-resume.pdf](examples/outputs/example-targeted-resume.pdf)
- Separate report: [examples/outputs/example-optimization-report.md](examples/outputs/example-optimization-report.md)

Run the demo export locally:

```bash
git clone https://github.com/TortoiseBo-lab/job-targeted-resume-optimizer.git
cd job-targeted-resume-optimizer
npm install
npm run export:example
```

## Workflow

```txt
Resume + Target JD
  -> Target role signal analysis
  -> Candidate evidence map
  -> Strategy and template route
  -> Final resume source
  -> Word / PDF export
  -> Separate optimization report
```

The skill is designed to behave like a guided resume-making flow:

1. Intake the original resume and target JD.
2. Extract target-company and target-role signals.
3. Separate direct matches, transferable matches, and gaps.
4. Select section order, density, and template route.
5. Rewrite bullets using only supported facts.
6. Keep missing-detail questions and optimization notes out of the resume.
7. Export the final resume as Word and PDF.
8. Put suggestions in a separate report.

## Why It Exists

Generic resume editing often makes every candidate sound the same. This package is built around a stricter principle:

> A strong resume is not just well written. It is engineered for one target application.

The system uses:

- Company-specific writing rules.
- Industry and role conventions.
- University and style guidance.
- A 67-route template catalog.
- A target-driven playbook for evidence mapping and resume strategy.

## What Is Included

| Path | Purpose |
| --- | --- |
| `skills/codex/job-targeted-resume-optimizer/` | Codex skill package |
| `skills/claude/job-targeted-resume-optimizer/` | Claude Code skill package |
| `knowledge-base/index.json` | Coverage map for companies, industries, universities, and styles |
| `knowledge-base/templates/catalog.json` | 67 resume template routes |
| `knowledge-base/playbooks/targeted-resume-playbook.md` | Human-readable workflow |
| `scripts/install-skill.mjs` | Codex / Claude Code installer |
| `scripts/export-resume.mjs` | Resume source to DOCX / PDF exporter |
| `examples/` | Sample resume, JD, and generated outputs |
| `prompts/chatgpt-copy-paste-cn.md` | No-code Chinese prompt |

## Coverage

Current open coverage includes:

- Companies: Google, Meta, Amazon, OpenAI, Microsoft, TikTok, McKinsey, BCG, Bain, Goldman Sachs, J.P. Morgan, Morgan Stanley.
- Industries: software engineering, data science, product management, consulting, finance, investment banking, marketing, academic CV, healthcare, law, public policy, accounting, statistics, fintech, and more.
- Styles: ATS, Big Tech, consulting, investment banking, academic CV, modern, minimal, startup, and other routes.
- Templates: 67 target-driven resume routes.

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
