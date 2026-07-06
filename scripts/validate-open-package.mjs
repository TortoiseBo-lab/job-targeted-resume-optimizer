import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const EXPECTED_TEMPLATE_COUNT = 67;
const EXPECTED_COUNTS = {
  companies: 12,
  industries: 20,
  universities: 13,
  styles: 12,
};

const requiredFiles = [
  "README.md",
  "LICENSE",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "DATA_CARD.md",
  "docs/PUBLISHING.md",
  ".github/pull_request_template.md",
  ".github/ISSUE_TEMPLATE/bug_report.md",
  ".github/ISSUE_TEMPLATE/knowledge_request.md",
  "examples/use-playbook.md",
  "examples/template-routing.md",
  "examples/inputs/sample-resume.md",
  "examples/inputs/google-swe-intern-jd.md",
  "examples/outputs/example-targeted-resume.md",
  "examples/outputs/example-targeted-resume.docx",
  "examples/outputs/example-targeted-resume.pdf",
  "examples/outputs/example-targeted-resume.html",
  "docs/USAGE_MODEL_CN.md",
  "docs/CLAUDE_CODE_SKILL_CN.md",
  "scripts/export-resume.mjs",
  "knowledge-base/index.json",
  "knowledge-base/README.md",
  "knowledge-base/templates/catalog.json",
  "knowledge-base/templates/README.md",
  "knowledge-base/playbooks/targeted-resume-playbook.json",
  "knowledge-base/playbooks/targeted-resume-playbook.md",
];

const sensitivePatterns = [
  { label: "local user path", pattern: /\/Users\/tortoise/i },
  { label: "private desktop corpus path", pattern: /Desktop\/简历学习/i },
  { label: "source manifest", pattern: /source-manifest/i },
  { label: "raw extracted preview field", pattern: /textPreview/i },
  { label: "OpenAI-style API key", pattern: /sk-[A-Za-z0-9_-]{20,}/ },
  { label: "environment secret", pattern: /(OPENAI_API_KEY|ANTHROPIC_API_KEY|DEEPSEEK_API_KEY|SUPABASE_SERVICE_ROLE_KEY)\s*=/ },
  { label: "private key block", pattern: /BEGIN (RSA|OPENSSH|PRIVATE) KEY/ },
];

async function fileExists(relativePath) {
  await stat(path.join(ROOT, relativePath));
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

async function validateRequiredFiles() {
  for (const file of requiredFiles) {
    await fileExists(file);
  }
}

async function validateTemplateCatalog() {
  const catalogPath = path.join(ROOT, "knowledge-base/templates/catalog.json");
  const catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  if (catalog.templateCount !== EXPECTED_TEMPLATE_COUNT) {
    throw new Error(`Expected templateCount ${EXPECTED_TEMPLATE_COUNT}, found ${catalog.templateCount}.`);
  }
  if (!Array.isArray(catalog.templates) || catalog.templates.length !== EXPECTED_TEMPLATE_COUNT) {
    throw new Error(`Expected ${EXPECTED_TEMPLATE_COUNT} templates, found ${catalog.templates?.length ?? 0}.`);
  }
  const ids = new Set();
  for (const template of catalog.templates) {
    if (!template.id || !template.label || !template.layoutFamily || !Array.isArray(template.sectionOrder) || !Array.isArray(template.contentRules)) {
      throw new Error(`Template is missing required routing fields: ${JSON.stringify(template).slice(0, 120)}`);
    }
    if (ids.has(template.id)) {
      throw new Error(`Duplicate template id: ${template.id}`);
    }
    ids.add(template.id);
  }
}

async function validateCoverageIndex() {
  const indexPath = path.join(ROOT, "knowledge-base/index.json");
  const index = JSON.parse(await readFile(indexPath, "utf8"));
  const nodes = index.nodes ?? {};
  for (const [key, expected] of Object.entries(EXPECTED_COUNTS)) {
    if (!Array.isArray(nodes[key]) || nodes[key].length !== expected) {
      throw new Error(`Expected ${expected} ${key}, found ${nodes[key]?.length ?? 0}.`);
    }
  }
}

async function validatePlaybook() {
  const playbookPath = path.join(ROOT, "knowledge-base/playbooks/targeted-resume-playbook.json");
  const playbook = JSON.parse(await readFile(playbookPath, "utf8"));
  const requiredKeys = [
    "workflow",
    "scoringRubric",
    "jdSignalClusters",
    "evidenceMappingRules",
    "followUpQuestionBank",
    "syntheticRewritePatterns",
  ];
  for (const key of requiredKeys) {
    const value = playbook[key];
    const validArray = Array.isArray(value) && value.length > 0;
    const validObject = value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
    if (!validArray && !validObject) {
      throw new Error(`Playbook key must be a non-empty array or object: ${key}`);
    }
  }
}

async function validateSensitiveContent() {
  const hits = [];
  const rawFileHits = [];
  for await (const file of walk(ROOT)) {
    const relative = path.relative(ROOT, file);
    if (relative === ".gitignore" || relative === "scripts/validate-open-package.mjs") continue;
    if (/\.(png|jpg|jpeg|gif|webp|pdf|docx|zip)$/i.test(relative)) continue;
    if (relative.includes(`${path.sep}raw${path.sep}`) || relative.includes("/raw/")) {
      rawFileHits.push(relative);
      continue;
    }
    const content = await readFile(file, "utf8");
    for (const { label, pattern } of sensitivePatterns) {
      if (pattern.test(content)) {
        hits.push(`${relative}: ${label}`);
      }
    }
  }

  if (hits.length) {
    throw new Error(`Sensitive content check failed:\n${hits.join("\n")}`);
  }
  if (rawFileHits.length) {
    throw new Error(`Raw source files are not allowed in the open package:\n${rawFileHits.join("\n")}`);
  }
}

await validateRequiredFiles();
await validateTemplateCatalog();
await validateCoverageIndex();
await validatePlaybook();
await validateSensitiveContent();

console.log(`Open package validation passed: ${EXPECTED_TEMPLATE_COUNT} templates, coverage index valid, playbook valid, required files present, no sensitive pattern hits.`);
