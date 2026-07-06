# Example: Template Routing

The template catalog is metadata, not a visual design dependency. Use it to choose layout family, density, section order, and content constraints.

## Minimal Router

```js
import fs from "node:fs";

const catalog = JSON.parse(fs.readFileSync("knowledge-base/templates/catalog.json", "utf8"));

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function routeTemplate({ company = "", role = "", style = "", market = "" }) {
  const text = `${company} ${role} ${style} ${market}`.toLowerCase();

  if (includesAny(text, ["google", "meta", "amazon", "microsoft", "openai", "software", "backend", "frontend", "machine learning"])) {
    return catalog.templates.find((template) => template.id === "google-big-tech");
  }

  if (includesAny(text, ["mckinsey", "bcg", "bain", "consulting", "strategy"])) {
    return catalog.templates.find((template) => template.id === "mbb-consulting");
  }

  if (includesAny(text, ["goldman", "j.p. morgan", "morgan stanley", "investment banking", "finance"])) {
    return catalog.templates.find((template) => template.id === "wharton-finance");
  }

  if (includesAny(text, ["phd", "research", "academic cv", "publication"])) {
    return catalog.templates.find((template) => template.id === "academic-phd-research");
  }

  return catalog.templates.find((template) => template.id === "harvard-general");
}

const selected = routeTemplate({
  company: "Google",
  role: "Software Engineer",
  style: "Big Tech",
  market: "USA",
});

console.log(selected.id);
console.log({
  layoutFamily: selected.layoutFamily,
  density: selected.density,
  sectionOrder: selected.sectionOrder,
  contentRules: selected.contentRules,
});
```

## How To Use The Result

Pass the selected template fields into your prompt:

- `layoutFamily`
- `sectionOrder`
- `density`
- `contentRules`
- `rationale`

The model should use those rules to shape the resume body and export plan.
