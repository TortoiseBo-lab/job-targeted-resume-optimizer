# Usage Guide

This repository is an open knowledge package and Claude Code skill for creating target-company and target-role tailored resumes.

It is not a hosted resume website. It is meant to be used by an AI assistant, a Claude Code workflow, or a developer building a resume agent.

## Option 1: No-Code Prompt Use

Use this when you want to try the workflow in ChatGPT, Claude, Gemini, or another LLM without installing anything.

1. Open `prompts/chatgpt-copy-paste-cn.md`.
2. Copy the full prompt.
3. Paste it into your AI assistant.
4. Add your original resume, target company, target role, target market, and job description.

The assistant should return:

- Target role signal analysis.
- Candidate evidence map.
- Resume strategy.
- Rewritten resume draft.
- Change rationale.
- Follow-up questions.

## Option 2: Claude Code Skill

Use this when you want a local file-based workflow.

```bash
git clone https://github.com/TortoiseBo-lab/job-targeted-resume-optimizer.git
cd job-targeted-resume-optimizer
claude
```

Then call the skill inside Claude Code:

```txt
/job-targeted-resume-optimizer
```

Example request:

```txt
Please create a target-role resume package.

Candidate resume: ./inputs/resume.md
Target JD: ./inputs/target-jd.md
Target company: Google
Target role: Software Engineer Intern
Target market: US

Please generate a Markdown resume, optimization report, evidence gaps, and Word/PDF outputs.
```

## Option 3: Export Markdown To Word And PDF

After the skill or another AI assistant creates a Markdown resume package, export it:

```bash
npm run export -- --input outputs/google-swe-intern-targeted-resume.md
```

The exporter creates:

```txt
outputs/google-swe-intern-targeted-resume.docx
outputs/google-swe-intern-targeted-resume.pdf
outputs/google-swe-intern-targeted-resume.html
```

Try the bundled example:

```bash
npm run export:example
```

## Recommended Workflow

1. Prepare a factual resume and a target job description.
2. Use the prompt or Claude Code skill to generate a targeted Markdown resume.
3. Review any `[Need detail: ...]` markers.
4. Add missing metrics, tools, scale, or context.
5. Regenerate or edit the final Markdown.
6. Export Word and PDF files.

## Important Rules

- Do not invent candidate facts.
- Do not force job-description keywords into unsupported experience.
- Treat gaps as follow-up questions.
- Keep the final resume evidence-based, ATS-friendly, and tailored to one target role.
