import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

function parseArgs(argv) {
  const args = {
    input: "",
    outDir: "",
    baseName: "",
    formats: ["docx", "pdf", "html"],
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
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  if (!args.input) {
    printHelp();
    throw new Error("Missing required --input <markdown-file> argument.");
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  npm run export -- --input outputs/my-targeted-resume.md
  npm run export -- --input examples/outputs/example-targeted-resume.md --out-dir tmp/exported

Options:
  --input, -i      Markdown resume package to export.
  --out-dir, -o    Output directory. Defaults to the input file directory.
  --base-name      Output file base name. Defaults to input file name.
  --formats        Comma-separated formats. Defaults to docx,pdf,html.

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
    .trim();
}

function inlineHtml(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let listItems = [];
  let codeLines = [];
  let inCode = false;

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
      blocks.push({ type: "heading", level: heading[1].length, text: plainText(heading[2]) });
      continue;
    }

    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet) {
      listItems.push(plainText(bullet[1]));
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: plainText(line) });
  }

  flushList();
  flushCode();
  return blocks;
}

function buildHtml(blocks, title) {
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
    @page { margin: 0.65in; }
    body { color: #151515; font-family: Arial, Helvetica, sans-serif; font-size: 10.5pt; line-height: 1.36; }
    h1 { font-size: 20pt; margin: 0 0 6pt; text-align: center; }
    h2 { border-bottom: 1px solid #222; font-size: 12pt; margin: 14pt 0 5pt; padding-bottom: 2pt; text-transform: uppercase; }
    h3 { font-size: 10.8pt; margin: 9pt 0 2pt; }
    h4 { font-size: 10.5pt; margin: 7pt 0 2pt; }
    p { margin: 0 0 5pt; }
    ul { margin: 2pt 0 6pt 16pt; padding: 0; }
    li { margin: 0 0 3pt; }
    code { font-family: Menlo, Consolas, monospace; font-size: 9pt; }
    pre { background: #f6f8fa; border: 1px solid #d0d7de; padding: 8pt; white-space: pre-wrap; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

function docxParagraph(text, style = "") {
  const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : "";
  return `<w:p>${styleXml}<w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function docxBullet(text) {
  return `<w:p><w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
}

function buildDocxXml(blocks) {
  const paragraphs = [];
  for (const block of blocks) {
    if (block.type === "heading") {
      const style = block.level === 1 ? "Title" : `Heading${Math.min(block.level, 3)}`;
      paragraphs.push(docxParagraph(block.text, style));
    } else if (block.type === "list") {
      for (const item of block.items) {
        paragraphs.push(docxBullet(item));
      }
    } else {
      paragraphs.push(docxParagraph(block.text));
    }
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.join("\n")}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function buildDocxStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="180" w:after="80"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="24"/><w:caps/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr><w:spacing w:before="120" w:after="40"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="22"/></w:rPr>
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

function buildDocx(blocks) {
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
      name: "word/document.xml",
      content: buildDocxXml(blocks),
    },
    {
      name: "word/styles.xml",
      content: buildDocxStylesXml(),
    },
    {
      name: "word/numbering.xml",
      content: buildDocxNumberingXml(),
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

function wrapText(text, maxChars) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function buildPdf(blocks) {
  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 54;
  const marginY = 54;
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

  function addLine(text, size = 10.5, indent = 0) {
    ensureSpace(size + 5);
    commands.push(`BT /F1 ${size.toFixed(1)} Tf ${marginX + indent} ${y.toFixed(1)} Td (${pdfEscape(text)}) Tj ET`);
    y -= size + 4.2;
  }

  for (const block of blocks) {
    if (block.type === "heading") {
      const size = block.level === 1 ? 18 : block.level === 2 ? 12 : 10.8;
      y -= block.level === 1 ? 2 : 6;
      addLine(block.text.toUpperCase(), size, 0);
      y -= 2;
    } else if (block.type === "list") {
      for (const item of block.items) {
        for (const [index, line] of wrapText(item, 92).entries()) {
          addLine(`${index === 0 ? "- " : "  "}${line}`, 10.2, 10);
        }
      }
      y -= 2;
    } else {
      for (const line of wrapText(block.text, 96)) {
        addLine(line, 10.4, 0);
      }
      y -= 2;
    }
  }
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

const args = parseArgs(process.argv.slice(2));
const inputPath = path.resolve(ROOT, args.input);
const inputStats = await stat(inputPath);
if (!inputStats.isFile()) {
  throw new Error(`Input is not a file: ${inputPath}`);
}

const outDir = path.resolve(ROOT, args.outDir || path.dirname(args.input));
await mkdir(outDir, { recursive: true });

const baseName = args.baseName || path.basename(inputPath, path.extname(inputPath));
const markdown = await readFile(inputPath, "utf8");
const blocks = parseMarkdown(markdown);
const generated = [];

for (const format of args.formats) {
  const target = path.join(outDir, `${baseName}.${format}`);
  if (format === "html") {
    await writeFile(target, buildHtml(blocks, baseName), "utf8");
  } else if (format === "docx") {
    await writeFile(target, buildDocx(blocks));
  } else if (format === "pdf") {
    await writeFile(target, buildPdf(blocks));
  } else {
    throw new Error(`Unsupported format: ${format}. Supported formats: docx,pdf,html.`);
  }
  generated.push(target);
}

console.log("Resume export complete:");
for (const file of generated) {
  console.log(`- ${path.relative(ROOT, file)}`);
}
