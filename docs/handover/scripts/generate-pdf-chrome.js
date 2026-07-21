#!/usr/bin/env node
/**
 * Markdown → PDF (Chrome headless) — 인수인계 문서용
 * Usage:
 *   node docs/handover/scripts/generate-pdf-chrome.js           # 전체
 *   node docs/handover/scripts/generate-pdf-chrome.js 03-API-문서.md  # 단일
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(ROOT, 'pdf');
const CHROME =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const FILES = [
  'README.md',
  '01-개발-산출물.md',
  '02-DB-스키마.md',
  '03-API-문서.md',
  '04-설치-배포-가이드.md',
  '05-환경-인프라.md',
  '06-인수인계-추가-사항.md',
  '07-프로젝트-구조-스크립트.md',
  '08-계정-정보.md',
];

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineMd(text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function mdToHtml(md, title) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        codeBuf = [];
      } else {
        inCode = false;
        const cls = codeLang === 'mermaid' ? ' class="mermaid"' : '';
        html.push(`<pre><code${cls}>${esc(codeBuf.join('\n'))}</code></pre>`);
        codeLang = '';
      }
      i++;
      continue;
    }

    if (inCode) {
      codeBuf.push(line);
      i++;
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      html.push('<hr/>');
      i++;
      continue;
    }

    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const h4 = line.match(/^#### (.+)/);
    const bullet = line.match(/^[-*] (.+)/);
    const quote = line.match(/^> (.+)/);
    const isTable = line.includes('|') && line.trim().startsWith('|');

    if (h1) html.push(`<h1>${inlineMd(h1[1])}</h1>`);
    else if (h2) html.push(`<h2>${inlineMd(h2[1])}</h2>`);
    else if (h3) html.push(`<h3>${inlineMd(h3[1])}</h3>`);
    else if (h4) html.push(`<h4>${inlineMd(h4[1])}</h4>`);
    else if (quote) html.push(`<blockquote>${inlineMd(quote[1])}</blockquote>`);
    else if (bullet) html.push(`<p class="bullet">• ${inlineMd(bullet[1])}</p>`);
    else if (isTable) {
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) {
        const row = lines[i].trim();
        if (!/^\|[-\s|:]+\|$/.test(row)) {
          rows.push(row.split('|').slice(1, -1).map((c) => c.trim()));
        }
        i++;
      }
      if (rows.length) {
        html.push('<table><thead><tr>');
        rows[0].forEach((c) => html.push(`<th>${inlineMd(c)}</th>`));
        html.push('</tr></thead><tbody>');
        rows.slice(1).forEach((row) => {
          html.push('<tr>');
          row.forEach((c) => html.push(`<td>${inlineMd(c)}</td>`));
          html.push('</tr>');
        });
        html.push('</tbody></table>');
      }
      continue;
    } else {
      html.push(`<p>${inlineMd(line)}</p>`);
    }
    i++;
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>
  @page { size: A4; margin: 18mm 15mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #111827;
    max-width: 100%;
  }
  h1 {
    font-size: 20pt;
    font-weight: 700;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 10px;
    margin: 0 0 16px;
    color: #0f172a;
  }
  h2 {
    font-size: 14pt;
    font-weight: 700;
    margin: 1.5em 0 0.6em;
    color: #0f172a;
    padding-bottom: 4px;
    border-bottom: 1px solid #f1f5f9;
  }
  h3 {
    font-size: 12pt;
    font-weight: 600;
    margin: 1.2em 0 0.5em;
    color: #334155;
  }
  h4 {
    font-size: 11pt;
    font-weight: 600;
    margin: 1em 0 0.4em;
    color: #475569;
  }
  p { margin: 0.4em 0; }
  p.bullet { padding-left: 4px; }
  strong { font-weight: 600; color: #0f172a; }
  code {
    background: #f1f5f9;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 9.5pt;
    font-family: 'SF Mono', 'Menlo', monospace;
    color: #0f172a;
  }
  pre {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 14px 16px;
    border-radius: 8px;
    font-size: 8.5pt;
    line-height: 1.5;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 12px 0;
  }
  pre code {
    background: none;
    padding: 0;
    font-size: inherit;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 10pt;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #e2e8f0;
    padding: 8px 10px;
    text-align: left;
    vertical-align: top;
  }
  th { background: #f1f5f9; font-weight: 600; color: #0f172a; }
  tr:nth-child(even) td { background: #fafafa; }
  hr {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 24px 0;
  }
  blockquote {
    margin: 12px 0;
    padding: 10px 14px;
    border-left: 4px solid #fbbf24;
    background: #fffbeb;
    color: #92400e;
    border-radius: 0 6px 6px 0;
    font-size: 10pt;
  }
</style>
</head>
<body>${html.join('\n')}</body>
</html>`;
}

function convert(file) {
  const input = path.join(ROOT, file);
  const base = path.basename(file, '.md');
  const output = path.join(PDF_DIR, `${base}.pdf`);
  const htmlPath = path.join(PDF_DIR, `${base}.html`);

  if (!fs.existsSync(input)) {
    console.warn('skip (missing):', file);
    return;
  }
  if (!fs.existsSync(CHROME)) {
    console.error('Chrome not found:', CHROME);
    process.exit(1);
  }

  const md = fs.readFileSync(input, 'utf8');
  fs.writeFileSync(htmlPath, mdToHtml(md, base), 'utf8');

  if (fs.existsSync(output)) fs.unlinkSync(output);

  execSync(
    `"${CHROME}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${output}" "file://${htmlPath}"`,
    { stdio: 'pipe' }
  );

  try {
    execSync(`xattr -cr "${output}"`, { stdio: 'ignore' });
  } catch {}

  try {
    fs.unlinkSync(htmlPath);
  } catch {}

  console.log('✓', output);
}

function main() {
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

  const arg = process.argv[2];
  const targets = arg ? [path.basename(arg)] : FILES;

  for (const file of targets) {
    convert(file);
  }
  console.log('Done:', PDF_DIR);
}

main();
