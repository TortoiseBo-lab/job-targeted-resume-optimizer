# Contributing

Thanks for helping improve AI Resume Refine.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Use your own API keys locally. Do not commit secrets, uploaded resumes, private resume corpora, payment assets, Vercel metadata, or generated temporary files.

## Before Opening a Pull Request

```bash
npm run lint
npm run build
```

Keep changes focused. For UI changes, include screenshots or a short recording when useful. For AI workflow changes, describe the prompt, schema, or behavior that changed.

## Knowledge Data

Only commit abstracted rules and synthetic examples. Raw resumes, school sample packets, extracted text, and local source manifests should stay outside the repository.
