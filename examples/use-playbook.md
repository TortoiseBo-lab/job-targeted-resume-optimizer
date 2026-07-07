# Example: Use The Playbook In An LLM Prompt

This package does not ship an LLM client. It gives you the knowledge slices to load into your own agent.

## Minimal Context Loader

```js
import fs from "node:fs";

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const playbook = readJson("knowledge-base/playbooks/targeted-resume-playbook.json");
const companyRules = readJson("knowledge-base/companies/google/rules.json");
const industryRules = readJson("knowledge-base/industries/software-engineering/rules.json");
const styleRules = readJson("knowledge-base/styles/big-tech/rules.json");

const promptContext = {
  playbook: {
    workflow: playbook.workflow,
    scoringRubric: playbook.scoringRubric,
    evidenceMappingRules: playbook.evidenceMappingRules,
    followUpQuestionBank: playbook.followUpQuestionBank,
  },
  rules: [companyRules, industryRules, styleRules],
};

console.log(JSON.stringify(promptContext, null, 2));
```

## Prompt Skeleton

```txt
You are a resume tailoring agent.

Goal:
Create a final targeted resume and separate optimization report for one specific application.

Inputs:
- Candidate resume: <paste candidate facts>
- Target company: Google
- Target role: Software Engineer
- Job description: <paste JD>

Knowledge:
<insert selected company, industry, style rules, and playbook workflow>

Rules:
- Do not invent companies, roles, dates, awards, tools, metrics, or outcomes.
- Use JD language only when supported by candidate facts.
- Separate direct evidence, transferable evidence, and evidence gaps.
- Ask follow-up questions for missing metrics or missing context.
- Return final resume content for Word/PDF export, plus a separate optimization report and next questions.
```

## Expected Output Shape

```json
{
  "resumeStrategy": {
    "targetSignals": [],
    "evidenceMap": [],
    "gaps": [],
    "sectionOrder": [],
    "templateRoute": ""
  },
  "finalResumeSource": "",
  "optimizationReport": {
    "score": 0,
    "changes": [],
    "risks": [],
    "nextQuestions": []
  }
}
```
