# Data Card

## What Is Included

This repository includes an open knowledge layer for a target-company and target-role driven resume tailoring skill:

- Abstracted university, company, industry, market, and style rules.
- A generated catalog of 67 resume templates.
- A JD-driven tailoring playbook for signal extraction, evidence mapping, scoring, follow-up questions, and rewrite patterns.
- Synthetic before/after bullet examples.
- Chinese resume rules for domestic, Hong Kong, internet, finance, public-sector, technical, product, and operations use cases.

## What Is Not Included

The repository intentionally does not include:

- Original third-party resume guide PDFs or screenshots.
- Raw extracted resume-guide prose.
- Raw personal resumes or user uploads.
- Private source manifests with local file paths.
- Payment assets, deployment metadata, API keys, or production secrets.

## Source Policy

The public knowledge base stores abstracted rules, project-authored template metadata, and synthetic examples. It is designed to make the open-source version genuinely useful without redistributing raw copyrighted documents or personal data.

## Regeneration

This public package contains generated open artifacts. The private production system owns the exporter that regenerates:

- `knowledge-base/templates/catalog.json`
- `knowledge-base/templates/README.md`
- `knowledge-base/playbooks/targeted-resume-playbook.json`
- `knowledge-base/playbooks/targeted-resume-playbook.md`

Public contributors should edit abstract rules, examples, documentation, or playbook proposals directly and run:

```bash
npm run validate
```
