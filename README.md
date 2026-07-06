# Targeted Resume Skill Open Knowledge

Open knowledge for building a target-company and target-role driven resume tailoring skill.

This is not the production web app. It is the public GitHub package: abstracted resume rules, a 67-template routing catalog, and a practical playbook for turning a candidate profile, target company, target role, and JD into a tailored resume strategy.

## Start Here

If you are not a developer and just want to use this with ChatGPT, Claude, Gemini, or another LLM, start with:

- [中文零代码上手指南](START_HERE_CN.md)
- [Copy-paste Chinese prompt](prompts/chatgpt-copy-paste-cn.md)
- [Install as a Claude Code skill](docs/CLAUDE_CODE_SKILL_CN.md)
- [Usage guide](docs/USAGE.md)

## Why This Exists

Most AI resume tools stop at generic polishing. This package is organized around a stricter workflow:

1. Read the target company, role, market, seniority, and JD.
2. Extract job signals and evidence requirements.
3. Map the candidate's real facts to direct matches, transferable matches, and gaps.
4. Choose section order, density, and template strategy.
5. Rewrite bullets without inventing facts.
6. Produce a report with rationale and follow-up questions.

## What's Included

- `knowledge-base/index.json`: coverage map for companies, industries, universities, and styles.
- `knowledge-base/templates/catalog.json`: 67 template routes with layout, density, section-order, and content rules.
- `knowledge-base/playbooks/targeted-resume-playbook.json`: machine-readable workflow.
- `knowledge-base/playbooks/targeted-resume-playbook.md`: human-readable workflow.
- `knowledge-base/**/rules.json`: abstracted source-specific writing rules.
- `knowledge-base/**/examples.json`: synthetic examples and bullet patterns.
- `examples/`: small integration examples for prompt design and routing.
- `DATA_CARD.md`: inclusion, exclusion, and source policy.
- `scripts/validate-open-package.mjs`: release validation.

## What's Not Included

- Production website code.
- Original third-party guide PDFs, screenshots, or raw extracted text.
- Raw personal resumes, uploaded user files, or private resume corpora.
- API keys, deployment metadata, payment assets, or local source manifests.

## Quick Start

Requires Node.js 18+.

```bash
npm install
npm run validate
```

Export a Markdown resume package to Word and PDF:

```bash
npm run export -- --input outputs/my-targeted-resume.md
```

Try the bundled example:

```bash
npm run export:example
```

Use the JSON files directly from your own app or agent:

```js
import fs from "node:fs";

const index = JSON.parse(fs.readFileSync("knowledge-base/index.json", "utf8"));
const playbook = JSON.parse(fs.readFileSync("knowledge-base/playbooks/targeted-resume-playbook.json", "utf8"));
const templates = JSON.parse(fs.readFileSync("knowledge-base/templates/catalog.json", "utf8"));

console.log(index.nodes.companies);
console.log(playbook.workflow.map((step) => step.name));
console.log(templates.templateCount);
```

## Suggested LLM Flow

Load only the relevant slices for a request:

1. Resolve target company and role to slugs from `knowledge-base/index.json`.
2. Load the matching company, industry, university, and style `rules.json`.
3. Load one primary template from `knowledge-base/templates/catalog.json`.
4. Add the playbook workflow and scoring rubric.
5. Ask the model to generate a resume draft plus an optimization report.

See:

- [examples/use-playbook.md](examples/use-playbook.md)
- [examples/template-routing.md](examples/template-routing.md)

## Coverage

Current open coverage includes:

- Companies: Google, Meta, Amazon, OpenAI, Microsoft, TikTok, McKinsey, BCG, Bain, Goldman Sachs, J.P. Morgan, Morgan Stanley.
- Industries: software engineering, data science, product management, consulting, finance, investment banking, marketing, academic CV, healthcare, law, public policy, accounting, statistics, fintech, and more.
- Universities/styles: Harvard, MIT, Stanford, UPenn, Berkeley, Yale, Princeton, CMU, Cornell, Duke, ATS, Big Tech, consulting, investment banking, academic CV, and modern style routes.
- Templates: 67 target-driven resume routes.

## Data Policy

The public knowledge base stores abstracted, project-authored rules and synthetic examples. It is designed to be useful without redistributing copyrighted source documents or personal data.

See [DATA_CARD.md](DATA_CARD.md).

## Validation

```bash
npm run validate
```

The validator checks required files, coverage counts, template count, JSON validity, and obvious sensitive content patterns.

## Publishing Status

See [docs/PUBLISHING.md](docs/PUBLISHING.md) for the final GitHub release checklist.

## License

MIT
