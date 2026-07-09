# Publishing Checklist

## Current Status

The open package is separated from the production website. It contains the public knowledge base, 96-template catalog, template-level spec library, targeted resume playbook, license, contribution notes, security notes, data card, examples, GitHub templates, and a validation script.

## Ready

- Public README scoped to the open package, not the web app.
- MIT license.
- Contribution, security, and data policy notes.
- `knowledge-base/templates/catalog.json` with 96 templates.
- `knowledge-base/templates/template-specs.json` with page, font, divider, writing, and QA rules.
- `knowledge-base/playbooks/targeted-resume-playbook.json` and Markdown version.
- Example usage docs in `examples/`.
- GitHub issue and PR templates.
- Validation script for required files, coverage counts, template count, JSON validity, raw-file absence, and obvious sensitive content.

## Before First Public Push

1. Choose final repository name and GitHub owner.
2. Run `npm run validate`.
3. Manually skim `README.md`, `DATA_CARD.md`, and `knowledge-base/README.md` in GitHub preview.
4. Confirm there are no production web app files, private corpora, payment assets, local manifests, or environment files.
5. Create the first commit.
6. Push to a new GitHub repo.
7. Verify GitHub detects the MIT license and renders the README cleanly.

## Suggested Repository Settings

- Visibility: public.
- Default branch: `main`.
- Features: Issues on, Discussions optional, Wiki off unless needed.
- Branch protection: optional for solo release; recommended after first public version.
- Topics: `resume`, `career`, `llm`, `ai-agent`, `job-search`, `knowledge-base`, `resume-templates`.

## Release Command

```bash
npm run validate
```

Do not publish if validation fails.
