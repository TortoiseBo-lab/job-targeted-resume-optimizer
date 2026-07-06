# npm Publishing

This package is intended to be published as:

```txt
job-targeted-resume-optimizer
```

## Preflight

Run:

```bash
npm run validate
npm pack --dry-run
```

Confirm:

- Package name is available on npm.
- Version in `package.json` has not been published before.
- `README.md`, `LICENSE`, `skills/`, `knowledge-base/`, `scripts/`, `examples/`, and docs are included in the tarball.
- No private corpora, API keys, production web app files, or payment assets are included.

## Login

```bash
npm login
```

If npm asks for a one-time password, complete the browser or terminal verification.

Check login:

```bash
npm whoami
```

## Publish

```bash
npm publish
```

## Verify

```bash
npm view job-targeted-resume-optimizer name version bin repository --json
```

Then test installation in a clean folder:

```bash
npm install -g job-targeted-resume-optimizer
resume-skill install --target all --dry-run
```

