import { execFile } from "node:child_process";
import { constants } from "node:fs";
import { access, copyFile, mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const ROOT = process.cwd();
const execFileAsync = promisify(execFile);

const LAYOUT_PROFILES = {
  standard: {
    name: "standard",
    pageMargin: 720,
    normalSize: 21,
    titleSize: 36,
    h2Size: 24,
    h3Size: 22,
    paragraphAfter: 70,
    bulletAfter: 35,
    line: 250,
    pdf: {
      title: 18,
      contact: 9.6,
      h2: 11.3,
      h3: 10.4,
      body: 9.9,
      bullet: 9.7,
      lineHeight: 1.28,
      marginX: 54,
      marginY: 54,
    },
  },
  compact: {
    name: "compact",
    pageMargin: 648,
    normalSize: 20,
    titleSize: 34,
    h2Size: 23,
    h3Size: 21,
    paragraphAfter: 45,
    bulletAfter: 22,
    line: 238,
    pdf: {
      title: 17,
      contact: 9.2,
      h2: 10.8,
      h3: 10,
      body: 9.45,
      bullet: 9.25,
      lineHeight: 1.22,
      marginX: 50,
      marginY: 48,
    },
  },
  dense: {
    name: "dense",
    pageMargin: 576,
    normalSize: 19,
    titleSize: 32,
    h2Size: 22,
    h3Size: 20,
    paragraphAfter: 25,
    bulletAfter: 10,
    line: 225,
    pdf: {
      title: 16,
      contact: 8.9,
      h2: 10.3,
      h3: 9.55,
      body: 9,
      bullet: 8.85,
      lineHeight: 1.16,
      marginX: 45,
      marginY: 42,
    },
  },
};

function parseArgs(argv) {
  const args = {
    input: "",
    outDir: "",
    baseName: "",
    formats: ["docx", "pdf"],
    includeReport: false,
    pdfEngine: "auto",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" || arg === "-i") {
      args.input = argv[++index] ?? "";
    } else if (arg === "--out-dir" || arg === "-o") {
      args.outDir = argv[++index] ?? "";
    } else if (arg === "--base-name") {
      args.baseName = argv[++index] ?? "";
    } else if (arg === "--formats") {
      args.formats = (argv[++index] ?? "").split(",").map((value) => value.trim()).filter(Boolean);
    } else if (arg === "--include-report") {
      args.includeReport = true;
    } else if (arg === "--pdf-engine") {
      args.pdfEngine = argv[++index] ?? "auto";
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  if (!args.input) {
    printHelp();
    throw new Error("Missing required --input <resume-source-file> argument.");
  }
  if (!["auto", "libreoffice", "internal"].includes(args.pdfEngine)) {
    throw new Error("Unsupported --pdf-engine. Use auto, libreoffice, or internal.");
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  npm run export -- --input outputs/my-targeted-resume.md
  npm run export -- --input examples/outputs/example-targeted-resume.md --out-dir tmp/exported

Options:
  --input, -i      Internal resume source file to export.
  --out-dir, -o    Output directory. Defaults to the input file directory.
  --base-name      Output file base name. Defaults to input file name.
  --formats        Comma-separated formats. Defaults to docx,pdf. Supports docx,pdf,html.
  --include-report Keep optimization-report sections in the exported document.
  --pdf-engine     auto|libreoffice|internal. Defaults to auto.

This exporter has no external runtime dependencies.`);
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtml(value) {
  return escapeXml(value).replace(/'/g, "&#39;");
}

function plainText(value) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\s*\[Need detail:[^\]]+\]/gi, "")
    .trim();
}

function inlineHtml(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function parseMarkdown(markdown, { includeReport = false } = {}) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let listItems = [];
  let codeLines = [];
  let inCode = false;
  let skipSection = false;

  const excludedSections = new Set([
    "target role",
    "resume strategy",
    "optimization report",
    "strongest matches",
    "evidence gaps",
    "next questions",
    "follow-up questions",
    "change rationale",
    "candidate evidence map",
    "target role signal analysis",
  ]);

  function flushList() {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  }

  function flushCode() {
    if (codeLines.length) {
      blocks.push({ type: "code", text: codeLines.join("\n") });
      codeLines = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(rawLine);
      continue;
    }

    if (!line.trim()) {
      flushList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const text = plainText(heading[2]);
      const normalizedHeading = text.toLowerCase();
      if (!includeReport && level === 2 && excludedSections.has(normalizedHeading)) {
        skipSection = true;
        continue;
      }
      if (level <= 2) {
        skipSection = false;
      }
      if (!skipSection) {
        blocks.push({ type: "heading", level, text });
      }
      continue;
    }

    if (skipSection) {
      continue;
    }

    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      const item = plainText(bullet[1]);
      if (item) listItems.push(item);
      continue;
    }

    flushList();
    const text = plainText(line);
    if (text) blocks.push({ type: "paragraph", text });
  }

  flushList();
  flushCode();
  return blocks;
}

function estimateWrappedLines(text, charsPerLine) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

function estimateResumeLines(blocks) {
  let lines = 0;
  for (const block of blocks) {
    if (block.type === "heading") {
      lines += block.level === 1 ? 2.4 : block.level === 2 ? 2.1 : 1.4;
    } else if (block.type === "list") {
      for (const item of block.items) lines += estimateWrappedLines(item, 98) + 0.15;
    } else if (block.type === "code") {
      lines += block.text.split("\n").length;
    } else {
      lines += estimateWrappedLines(block.text, 106) + 0.2;
    }
  }
  return lines;
}

function selectLayoutProfile(blocks) {
  const estimatedLines = estimateResumeLines(blocks);
  if (estimatedLines > 64) return LAYOUT_PROFILES.dense;
  if (estimatedLines > 52) return LAYOUT_PROFILES.compact;
  return LAYOUT_PROFILES.standard;
}

function buildHtml(blocks, title, profile) {
  const body = blocks.map((block) => {
    if (block.type === "heading") {
      return `<h${block.level}>${inlineHtml(block.text)}</h${block.level}>`;
    }
    if (block.type === "list") {
      return `<ul>${block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</ul>`;
    }
    if (block.type === "code") {
      return `<pre><code>${escapeHtml(block.text)}</code></pre>`;
    }
    return `<p>${inlineHtml(block.text)}</p>`;
  }).join("\n");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    @page { margin: ${(profile.pageMargin / 1440).toFixed(2)}in; }
    body { color: #151515; font-family: Arial, Helvetica, sans-serif; font-size: ${(profile.normalSize / 2).toFixed(1)}pt; line-height: ${(profile.line / 240).toFixed(2)}; }
    h1 { font-size: ${(profile.titleSize / 2).toFixed(1)}pt; margin: 0 0 5pt; text-align: center; }
    h2 { border-bottom: 1px solid #222; font-size: ${(profile.h2Size / 2).toFixed(1)}pt; margin: 11pt 0 4pt; padding-bottom: 2pt; text-transform: uppercase; page-break-after: avoid; }
    h3 { font-size: ${(profile.h3Size / 2).toFixed(1)}pt; margin: 7pt 0 2pt; page-break-after: avoid; }
    h4 { font-size: ${(profile.normalSize / 2).toFixed(1)}pt; margin: 6pt 0 2pt; page-break-after: avoid; }
    p { margin: 0 0 ${(profile.paragraphAfter / 20).toFixed(1)}pt; }
    ul { margin: 1pt 0 ${(profile.bulletAfter / 20).toFixed(1)}pt 15pt; padding: 0; }
    li { margin: 0 0 2pt; }
    code { font-family: Menlo, Consolas, monospace; font-size: 9pt; }
    pre { background: #f6f8fa; border: 1px solid #d0d7de; padding: 8pt; white-space: pre-wrap; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

function docxParagraph(text, style = "", extraPPr = "") {
  const styleXml = style ? `<w:pStyle w:val="${style}"/>` : "";
  const pPr = styleXml || extraPPr ? `<w:pPr>${styleXml}<w:widowControl/>${extraPPr}</w:pPr>` : "";
  return `<w:p>${pPr}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function docxSectionHeading(text, profile) {
  const border = `<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="3" w:color="222222"/></w:pBdr><w:keepNext/><w:keepLines/><w:spacing w:before="${Math.max(110, profile.paragraphAfter * 2)}" w:after="${Math.max(45, profile.paragraphAfter)}"/>`;
  return docxParagraph(text, "Heading2", border);
}

function docxSubheading(text) {
  return docxParagraph(text, "Heading3", "<w:keepNext/><w:keepLines/>");
}

function docxPlainParagraph(text, profile) {
  const spacing = `<w:spacing w:after="${profile.paragraphAfter}" w:line="${profile.line}" w:lineRule="auto"/>`;
  return docxParagraph(text, "", spacing);
}

function docxTitle(text, profile) {
  const pPr = `<w:jc w:val="center"/><w:keepLines/><w:spacing w:after="${Math.max(60, profile.paragraphAfter)}"/>`;
  return docxParagraph(text, "Title", pPr);
}

function docxContactLine(text, profile) {
  const pPr = `<w:jc w:val="center"/><w:keepLines/><w:spacing w:after="${Math.max(55, profile.paragraphAfter)}"/>`;
  return docxParagraph(text, "", pPr);
}

function docxBullet(text, profile) {
  return `<w:p><w:pPr><w:widowControl/><w:spacing w:after="${profile.bulletAfter}" w:line="${profile.line}" w:lineRule="auto"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function buildDocxXml(blocks, profile) {
  const paragraphs = [];
  blocks.forEach((block, index) => {
    if (block.type === "heading") {
      if (block.level === 1) {
        paragraphs.push(docxTitle(block.text, profile));
      } else if (block.level === 2) {
        paragraphs.push(docxSectionHeading(block.text, profile));
      } else {
        paragraphs.push(docxSubheading(block.text));
      }
    } else if (block.type === "list") {
      for (const item of block.items) {
        paragraphs.push(docxBullet(item, profile));
      }
    } else if (index === 1 && blocks[0]?.type === "heading" && blocks[0].level === 1) {
      paragraphs.push(docxContactLine(block.text, profile));
    } else {
      paragraphs.push(docxPlainParagraph(block.text, profile));
    }
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.join("\n")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="${profile.pageMargin}" w:right="${profile.pageMargin}" w:bottom="${profile.pageMargin}" w:left="${profile.pageMargin}" w:header="360" w:footer="360" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function buildDocxStylesXml(profile) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr><w:widowControl/><w:spacing w:line="${profile.line}" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="${profile.normalSize}"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:keepLines/><w:spacing w:after="${Math.max(80, profile.paragraphAfter)}"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="${profile.titleSize}"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="${Math.max(110, profile.paragraphAfter * 2)}" w:after="${Math.max(45, profile.paragraphAfter)}"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="${profile.h2Size}"/><w:caps/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="${Math.max(70, profile.paragraphAfter)}" w:after="${Math.max(25, Math.floor(profile.paragraphAfter / 2))}"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="${profile.h3Size}"/></w:rPr>
  </w:style>
</w:styles>`;
}

function buildDocxNumberingXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="360" w:hanging="180"/></w:pPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>`;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, date } = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.from(file.content, "utf8");
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);

    centralParts.push(central, name);
    offset += local.length + name.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function buildDocxSettingsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:displayBackgroundShape/>
  <w:defaultTabStop w:val="720"/>
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
  </w:compat>
</w:settings>`;
}

function buildDocx(blocks, profile) {
  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    },
    {
      name: "word/_rels/document.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
</Relationships>`,
    },
    {
      name: "word/document.xml",
      content: buildDocxXml(blocks, profile),
    },
    {
      name: "word/styles.xml",
      content: buildDocxStylesXml(profile),
    },
    {
      name: "word/numbering.xml",
      content: buildDocxNumberingXml(),
    },
    {
      name: "word/settings.xml",
      content: buildDocxSettingsXml(),
    },
  ]);
}

function pdfEscape(value) {
  return value
    .replace(/[^\x20-\x7e]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function approximateTextWidth(text, size) {
  let units = 0;
  for (const char of text) {
    if (char === " ") units += 0.26;
    else if ("il.,'|!;:".includes(char)) units += 0.22;
    else if ("mwMW@#%&".includes(char)) units += 0.78;
    else if (/[A-Z]/.test(char)) units += 0.58;
    else units += 0.48;
  }
  return units * size;
}

function wrapTextToWidth(text, maxWidth, size) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (approximateTextWidth(next, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildPdf(blocks, profile) {
  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = profile.pdf.marginX;
  const marginY = profile.pdf.marginY;
  const contentWidth = pageWidth - marginX * 2;
  const pages = [];
  let commands = [];
  let y = pageHeight - marginY;

  function newPage() {
    if (commands.length) pages.push(commands);
    commands = [];
    y = pageHeight - marginY;
  }

  function ensureSpace(points) {
    if (y - points < marginY) newPage();
  }

  function addLine(text, size = profile.pdf.body, indent = 0) {
    ensureSpace(size * profile.pdf.lineHeight + 3);
    commands.push(`BT /F1 ${size.toFixed(1)} Tf ${marginX + indent} ${y.toFixed(1)} Td (${pdfEscape(text)}) Tj ET`);
    y -= size * profile.pdf.lineHeight + 1.8;
  }

  function addRule() {
    ensureSpace(8);
    const ruleY = y + 3;
    commands.push(`q 0.7 w ${marginX} ${ruleY.toFixed(1)} m ${pageWidth - marginX} ${ruleY.toFixed(1)} l S Q`);
    y -= 5;
  }

  function addCenteredLine(text, size = profile.pdf.title) {
    ensureSpace(size + 5);
    const estimatedWidth = approximateTextWidth(text, size);
    const x = Math.max(marginX, (pageWidth - estimatedWidth) / 2);
    commands.push(`BT /F1 ${size.toFixed(1)} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${pdfEscape(text)}) Tj ET`);
    y -= size * profile.pdf.lineHeight + 2;
  }

  blocks.forEach((block, blockIndex) => {
    if (block.type === "heading") {
      if (block.level === 1) {
        y -= 2;
        addCenteredLine(block.text, profile.pdf.title);
        y -= 1;
      } else if (block.level === 2) {
        ensureSpace(42);
        y -= 5;
        addLine(block.text.toUpperCase(), profile.pdf.h2, 0);
        addRule();
      } else {
        ensureSpace(28);
        y -= 3;
        addLine(block.text, profile.pdf.h3, 0);
      }
    } else if (block.type === "list") {
      for (const item of block.items) {
        for (const [index, line] of wrapTextToWidth(item, contentWidth - 28, profile.pdf.bullet).entries()) {
          addLine(`${index === 0 ? "- " : "  "}${line}`, profile.pdf.bullet, 10);
        }
      }
      y -= 1;
    } else {
      for (const line of wrapTextToWidth(block.text, contentWidth, profile.pdf.body)) {
        const centered = blocks[0]?.type === "heading" && blockIndex === 1;
        if (centered) {
          addCenteredLine(line, profile.pdf.contact);
        } else {
          addLine(line, profile.pdf.body, 0);
        }
      }
      y -= 1;
    }
  });
  if (commands.length) pages.push(commands);

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  const pageObjectIds = [];
  for (const pageCommands of pages) {
    const content = pageCommands.join("\n");
    const contentId = objects.length + 1;
    objects.push(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);
    const pageId = objects.length + 1;
    pageObjectIds.push(pageId);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`);
  }

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "utf8");
}

async function executableExists(command) {
  if (!command) return false;
  if (command.includes(path.sep)) {
    try {
      await access(command, constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }
  try {
    await execFileAsync(command, ["--version"], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function findLibreOffice() {
  try {
    const { stdout } = await execFileAsync("/bin/sh", ["-lc", "command -v soffice || command -v libreoffice"], { timeout: 5000 });
    const discovered = stdout.trim().split("\n")[0];
    if (discovered && await executableExists(discovered)) return discovered;
  } catch {
    // Fall through to explicit candidates.
  }

  const candidates = [
    process.env.RESUME_EXPORT_SOFFICE,
    "soffice",
    "libreoffice",
    "/Applications/LibreOffice.app/Contents/MacOS/soffice",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (await executableExists(candidate)) return candidate;
  }
  return "";
}

async function convertDocxToPdfWithLibreOffice(docxPath, pdfPath) {
  const soffice = await findLibreOffice();
  if (!soffice) return false;

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "resume-export-"));
  try {
    try {
      await execFileAsync(
        soffice,
        ["--headless", "--convert-to", "pdf", "--outdir", tempDir, docxPath],
        { timeout: 45000 },
      );

      const converted = path.join(tempDir, `${path.basename(docxPath, path.extname(docxPath))}.pdf`);
      await stat(converted);
      await copyFile(converted, pdfPath);
      return true;
    } catch {
      return false;
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

const args = parseArgs(process.argv.slice(2));
for (const format of args.formats) {
  if (!["docx", "pdf", "html"].includes(format)) {
    throw new Error(`Unsupported format: ${format}. Supported formats: docx,pdf,html.`);
  }
}
const inputPath = path.resolve(ROOT, args.input);
const inputStats = await stat(inputPath);
if (!inputStats.isFile()) {
  throw new Error(`Input is not a file: ${inputPath}`);
}

const outDir = path.resolve(ROOT, args.outDir || path.dirname(args.input));
await mkdir(outDir, { recursive: true });

const baseName = args.baseName || path.basename(inputPath, path.extname(inputPath));
const markdown = await readFile(inputPath, "utf8");
const blocks = parseMarkdown(markdown, { includeReport: args.includeReport });
const profile = selectLayoutProfile(blocks);
const generated = [];
const formats = new Set(args.formats);
const docxBuffer = buildDocx(blocks, profile);
let docxPathForPdf = "";
let tempDocxDir = "";
let pdfEngineUsed = "";

try {
  if (formats.has("docx")) {
    const target = path.join(outDir, `${baseName}.docx`);
    await writeFile(target, docxBuffer);
    docxPathForPdf = target;
    generated.push(target);
  }

  if (formats.has("pdf")) {
    const target = path.join(outDir, `${baseName}.pdf`);
    let converted = false;

    if (args.pdfEngine !== "internal") {
      if (!docxPathForPdf) {
        tempDocxDir = await mkdtemp(path.join(os.tmpdir(), "resume-export-docx-"));
        docxPathForPdf = path.join(tempDocxDir, `${baseName}.docx`);
        await writeFile(docxPathForPdf, docxBuffer);
      }
      converted = await convertDocxToPdfWithLibreOffice(docxPathForPdf, target);
      if (!converted && args.pdfEngine === "libreoffice") {
        throw new Error("LibreOffice PDF conversion requested, but soffice/libreoffice was not available.");
      }
    }

    if (!converted) {
      await writeFile(target, buildPdf(blocks, profile));
      pdfEngineUsed = "internal";
    } else {
      pdfEngineUsed = "libreoffice";
    }
    generated.push(target);
  }

  if (formats.has("html")) {
    const target = path.join(outDir, `${baseName}.html`);
    await writeFile(target, buildHtml(blocks, baseName, profile), "utf8");
    generated.push(target);
  }

} finally {
  if (tempDocxDir) await rm(tempDocxDir, { recursive: true, force: true });
}

console.log("Resume export complete:");
console.log(`- layout profile: ${profile.name}`);
if (pdfEngineUsed) console.log(`- pdf engine: ${pdfEngineUsed}`);
for (const file of generated) {
  console.log(`- ${path.relative(ROOT, file)}`);
}
