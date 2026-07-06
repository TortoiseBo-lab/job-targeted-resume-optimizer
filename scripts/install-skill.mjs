#!/usr/bin/env node
import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL_NAME = "job-targeted-resume-optimizer";

function parseArgs(argv) {
  const args = {
    command: "install",
    target: "all",
    dryRun: false,
  };

  if (argv[0] && !argv[0].startsWith("-")) {
    args.command = argv.shift();
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target" || arg === "-t") {
      args.target = argv[++index] ?? "";
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  resume-skill install --target all
  resume-skill install --target codex
  resume-skill install --target claude

Local repo shortcuts:
  npm run install:skills
  npm run install:codex
  npm run install:claude

Options:
  --target all|codex|claude
  --dry-run

The installer copies the skill into:
  Codex:       \${CODEX_HOME:-~/.codex}/skills/job-targeted-resume-optimizer
  Claude Code: \${CLAUDE_HOME:-~/.claude}/skills/job-targeted-resume-optimizer`);
}

function homeDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) throw new Error("Cannot determine home directory.");
  return home;
}

function targetRoot(kind) {
  if (kind === "codex") {
    return path.join(process.env.CODEX_HOME || path.join(homeDir(), ".codex"), "skills");
  }
  if (kind === "claude") {
    return path.join(process.env.CLAUDE_HOME || path.join(homeDir(), ".claude"), "skills");
  }
  throw new Error(`Unsupported target: ${kind}`);
}

async function ensureFileOrDir(relativePath) {
  await stat(path.join(ROOT, relativePath));
}

async function copyIfExists(from, to) {
  try {
    await stat(from);
  } catch {
    return;
  }
  await cp(from, to, { recursive: true });
}

async function installOne(kind, { dryRun }) {
  const sourceSkill = path.join(ROOT, "skills", kind, SKILL_NAME);
  const destination = path.join(targetRoot(kind), SKILL_NAME);

  await stat(sourceSkill);

  const planned = [
    `${sourceSkill} -> ${destination}`,
    `${path.join(ROOT, "knowledge-base")} -> ${path.join(destination, "references", "knowledge-base")}`,
    `${path.join(ROOT, "scripts", "export-resume.mjs")} -> ${path.join(destination, "scripts", "export-resume.mjs")}`,
    `${path.join(ROOT, "examples")} -> ${path.join(destination, "assets", "examples")}`,
  ];

  if (dryRun) {
    console.log(`Would install ${kind} skill:`);
    for (const item of planned) console.log(`- ${item}`);
    return destination;
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await rm(destination, { recursive: true, force: true });
  await cp(sourceSkill, destination, { recursive: true });

  await mkdir(path.join(destination, "references"), { recursive: true });
  await mkdir(path.join(destination, "scripts"), { recursive: true });
  await mkdir(path.join(destination, "assets"), { recursive: true });

  await cp(path.join(ROOT, "knowledge-base"), path.join(destination, "references", "knowledge-base"), { recursive: true });
  await cp(path.join(ROOT, "scripts", "export-resume.mjs"), path.join(destination, "scripts", "export-resume.mjs"));
  await copyIfExists(path.join(ROOT, "examples"), path.join(destination, "assets", "examples"));

  console.log(`Installed ${kind} skill: ${destination}`);
  return destination;
}

await ensureFileOrDir("knowledge-base/index.json");
await ensureFileOrDir("scripts/export-resume.mjs");

const args = parseArgs(process.argv.slice(2));
if (args.command !== "install") {
  printHelp();
  throw new Error(`Unsupported command: ${args.command}`);
}

const targets = args.target === "all" ? ["codex", "claude"] : [args.target];
for (const target of targets) {
  if (!["codex", "claude"].includes(target)) {
    throw new Error(`Unsupported --target ${target}. Use all, codex, or claude.`);
  }
}

for (const target of targets) {
  await installOne(target, args);
}

console.log("Done.");
