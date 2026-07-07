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
- Final rewritten resume content for Word/PDF export.
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

Please generate a final targeted resume as Word and PDF.
Put optimization notes, evidence gaps, and follow-up questions in a separate report, not inside the resume.
```

## Option 3: Export Internal Resume Source To Word And PDF

After the skill or another AI assistant creates a clean internal resume source file, export it:

```bash
npm run export -- --input outputs/google-swe-intern-targeted-resume.md
```

The exporter creates Word and PDF by default:

```txt
outputs/google-swe-intern-targeted-resume.docx
outputs/google-swe-intern-targeted-resume.pdf
```

The export command prints the selected layout profile and PDF engine:

```txt
Resume export complete:
- layout profile: standard
- pdf engine: internal
```

Layout profiles are selected automatically:

- `standard` for normal one-page resumes.
- `compact` when the resume needs tighter spacing.
- `dense` when the source is long and needs maximum page fit.

PDF uses LibreOffice conversion when a working `soffice` or `libreoffice` command exists. Otherwise it falls back to the internal PDF renderer.

Try the bundled example:

```bash
npm run export:example
```

## Recommended Workflow

1. Prepare a factual resume and a target job description.
2. Use the prompt or Claude Code skill to generate a final resume source and separate optimization report.
3. Review the separate report for missing metrics, tools, scale, or context.
4. Regenerate or edit the final resume source after facts are confirmed.
5. Export Word and PDF files.

## Important Rules

- Do not invent candidate facts.
- Do not force job-description keywords into unsupported experience.
- Treat gaps as follow-up questions.
- Do not put follow-up questions or missing-detail markers inside the final resume.
- Keep the final resume evidence-based, ATS-friendly, and tailored to one target role.
