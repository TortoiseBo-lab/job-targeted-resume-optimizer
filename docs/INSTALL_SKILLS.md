# Installable Skills

This package can install the same resume-building workflow into Codex and Claude Code.

## What Users Get

After installation, users can ask Codex or Claude Code to create a target-role resume package. The skill guides the assistant through:

1. Resume and JD intake.
2. Target company and role analysis.
3. Evidence mapping.
4. Resume strategy and template routing.
5. Final resume generation.
6. Word and PDF export.
7. Separate optimization report generation.

## Install From This Repository

Clone the repository:

```bash
git clone https://github.com/TortoiseBo-lab/job-targeted-resume-optimizer.git
cd job-targeted-resume-optimizer
npm install
```

Install both Codex and Claude Code skills:

```bash
npm run install:skills
```

Install only Codex:

```bash
npm run install:codex
```

Install only Claude Code:

```bash
npm run install:claude
```

## Install After npm Publication

```bash
npm install -g job-targeted-resume-optimizer
resume-skill install --target all
```

Target options:

```bash
resume-skill install --target codex
resume-skill install --target claude
resume-skill install --target all
```

## Where It Installs

Codex:

```txt
${CODEX_HOME:-~/.codex}/skills/job-targeted-resume-optimizer
```

Claude Code:

```txt
${CLAUDE_HOME:-~/.claude}/skills/job-targeted-resume-optimizer
```

## User Workflow

After installation, the user can say:

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

The skill should produce:

```txt
outputs/google-software-engineer-intern-targeted-resume.docx
outputs/google-software-engineer-intern-targeted-resume.pdf
outputs/google-software-engineer-intern-optimization-report.md
```

## Safety Note

The installer does not run automatically on `npm install`. Users explicitly run `resume-skill install` or one of the local install scripts to copy the skill into Codex or Claude Code.
