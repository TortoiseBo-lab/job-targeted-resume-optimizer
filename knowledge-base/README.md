# Knowledge Base

This directory stores the open, abstracted knowledge layer for the targeted resume skill.

It is meant to be read by your own app, script, or LLM agent. It does not include raw source PDFs, screenshots, uploaded resumes, private corpora, or local source manifests.

## Top-Level Files

- `index.json`: coverage map and entry point.
- `templates/catalog.json`: 67 template routes with layout, density, section-order, and content rules.
- `templates/README.md`: template catalog notes.
- `playbooks/targeted-resume-playbook.json`: machine-readable workflow.
- `playbooks/targeted-resume-playbook.md`: human-readable workflow.

## Knowledge Nodes

Each company, industry, university, or style node can include:

- `rules.json`: structured resume rules.
- `examples.json`: synthetic examples and reusable bullet patterns.
- `summary.md`: human-readable summary.
- `processed/*.md`: abstracted learning profile, not raw source text.

The generator should combine rules in this order:

1. Company target rules.
2. Industry or role rules.
3. University or market rules.
4. Style and template rules.
5. The global playbook.

Example route:

```txt
Target company: Google
Target role: Software Engineer
Market: USA
Style: Big Tech
```

Relevant files:

```txt
knowledge-base/companies/google/rules.json
knowledge-base/industries/software-engineering/rules.json
knowledge-base/universities/harvard/rules.json
knowledge-base/styles/big-tech/rules.json
knowledge-base/templates/catalog.json
knowledge-base/playbooks/targeted-resume-playbook.json
```

## Current Coverage

- Companies: Google, Meta, Amazon, OpenAI, Microsoft, TikTok, McKinsey, BCG, Bain, Goldman Sachs, J.P. Morgan, Morgan Stanley.
- Industries: software engineering, data science, data analyst, product management, consulting, investment banking, finance, marketing, academic CV, healthcare, law, public policy, accounting, statistics, fintech, and more.
- Universities: Harvard, MIT, Stanford, UPenn, Berkeley, Yale, Princeton, CMU, Cornell, Duke, Tufts, UVA Darden, WUSTL.
- Styles: ATS, minimal, modern, big tech, consulting, investment banking, academic CV, startup style, Jake's Resume, Deedy Resume, Awesome-CV, moderncv.

## Use Policy

Use these files as guidance for generation, scoring, and critique. Do not treat company or university names as endorsement, affiliation, or official approval. The rules are abstracted project-authored interpretations intended for resume writing workflows.
