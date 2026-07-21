#!/usr/bin/env node
/**
 * Markdown → PDF (pdfkit + AppleGothic)
 * Usage: node docs/handover/scripts/generate-pdfs.js [filename.md]
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(ROOT, 'pdf');
const FONT = '/System/Library/Fonts/Supplemental/AppleGothic.ttf';

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

const PAGE = { left: 50, right: 50, top: 55, bottom: 55 };
const WIDTH = 595.28 - PAGE.left - PAGE.right;

function stripMd(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.+?)\]\([^)]+\)/g, '$1');
}

function ensureSpace(doc, need = 24) {
  if (doc.y + need > doc.page.height - PAGE.bottom) {
    doc.addPage();
  }
}

function writeParagraph(doc, text, opts = {}) {
  const size = opts.size || 10;
  const color = opts.color || '#111111';
  doc.font(FONT).fontSize(size).fillColor(color);
  doc.text(stripMd(text), PAGE.left, doc.y, {
    width: WIDTH,
    lineGap: opts.lineGap ?? 4,
    align: opts.align || 'left',
  });
}

function measureRow(doc, row, colW, fontSize) {
  doc.font(FONT).fontSize(fontSize);
  let maxH = 22;
  for (const cell of row) {
    const h = doc.heightOfString(stripMd(cell), { width: colW - 10 });
    maxH = Math.max(maxH, h + 12);
  }
  return maxH;
}

function renderTable(doc, rows) {
  if (!rows.length) return;
  const cols = Math.max(...rows.map((r) => r.length));
  const colW = WIDTH / cols;
  const fontSize = 9;

  rows.forEach((row, ri) => {
    const padded = [...row];
    while (padded.length < cols) padded.push('');
    const rowH = measureRow(doc, padded, colW, fontSize);
    ensureSpace(doc, rowH + 4);

    const y0 = doc.y;
    if (ri === 0) {
      doc.save();
      doc.rect(PAGE.left, y0, WIDTH, rowH).fill('#f1f5f9');
      doc.restore();
    } else if (ri % 2 === 0) {
      doc.save();
      doc.rect(PAGE.left, y0, WIDTH, rowH).fill('#fafafa');
      doc.restore();
    }

    padded.forEach((cell, ci) => {
      const x = PAGE.left + ci * colW;
      doc.font(FONT).fontSize(fontSize).fillColor(ri === 0 ? '#0f172a' : '#111111');
      doc.text(stripMd(cell), x + 5, y0 + 6, {
        width: colW - 10,
        lineGap: 2,
      });
    });

    doc.y = y0 + rowH + 2;
    doc.moveTo(PAGE.left, doc.y).lineTo(PAGE.left + WIDTH, doc.y).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
    doc.moveDown(0.15);
  });
  doc.moveDown(0.4);
}

function renderCodeBlock(doc, lines) {
  const block = lines.join('\n');
  doc.font(FONT).fontSize(8.5);
  const h = doc.heightOfString(block, { width: WIDTH - 20, lineGap: 2 }) + 18;
  ensureSpace(doc, h);
  const y0 = doc.y;
  doc.save();
  doc.rect(PAGE.left, y0, WIDTH, h).fill('#f8fafc');
  doc.restore();
  doc.font(FONT).fontSize(8.5).fillColor('#1e293b');
  doc.text(block, PAGE.left + 10, y0 + 9, { width: WIDTH - 20, lineGap: 2 });
  doc.y = y0 + h + 8;
  doc.fillColor('#111111');
}

function renderMarkdown(doc, md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  let inCode = false;
  let codeBuf = [];

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeBuf = [];
      } else {
        inCode = false;
        renderCodeBlock(doc, codeBuf);
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
      doc.moveDown(0.35);
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      ensureSpace(doc, 14);
      doc.moveTo(PAGE.left, doc.y).lineTo(PAGE.left + WIDTH, doc.y).strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.5);
      i++;
      continue;
    }

    const h1 = line.match(/^# (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const bullet = line.match(/^[-*] (.+)/);
    const isTable = line.includes('|') && line.trim().startsWith('|');

    if (h1) {
      ensureSpace(doc, 40);
      doc.moveDown(0.2);
      writeParagraph(doc, h1[1], { size: 18, color: '#0f172a' });
      doc.moveDown(0.35);
    } else if (h2) {
      ensureSpace(doc, 32);
      doc.moveDown(0.15);
      writeParagraph(doc, h2[1], { size: 14, color: '#0f172a' });
      doc.moveDown(0.25);
    } else if (h3) {
      ensureSpace(doc, 26);
      writeParagraph(doc, h3[1], { size: 12, color: '#334155' });
      doc.moveDown(0.2);
    } else if (bullet) {
      ensureSpace(doc, 18);
      writeParagraph(doc, `• ${bullet[1]}`, { size: 10 });
    } else if (isTable) {
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) {
        const row = lines[i].trim();
        if (!/^\|[-\s|:]+\|$/.test(row)) {
          rows.push(row.split('|').slice(1, -1).map((c) => c.trim()));
        }
        i++;
      }
      renderTable(doc, rows);
      continue;
    } else {
      ensureSpace(doc, 16);
      writeParagraph(doc, line, { size: 10 });
    }
    i++;
  }
}

function convert(file) {
  const input = path.join(ROOT, file);
  const output = path.join(PDF_DIR, `${path.basename(file, '.md')}.pdf`);
  if (!fs.existsSync(input)) {
    console.warn('skip:', file);
    return Promise.resolve();
  }

  if (fs.existsSync(output)) fs.unlinkSync(output);

  const md = fs.readFileSync(input, 'utf8');
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      autoFirstPage: true,
      compress: true,
      info: {
        Title: path.basename(file, '.md'),
        Author: 'DONGGORI',
        Creator: 'donggori handover pdf generator',
      },
    });
    const stream = fs.createWriteStream(output);
    stream.on('finish', () => {
      try {
        const { execSync } = require('child_process');
        execSync(`xattr -cr "${output}"`, { stdio: 'ignore' });
      } catch {}
      console.log('✓', output);
      resolve();
    });
    stream.on('error', reject);
    doc.on('error', reject);

    doc.pipe(stream);
    doc.font(FONT);
    doc.y = PAGE.top;
    renderMarkdown(doc, md);
    doc.end();
  });
}

async function main() {
  if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });
  if (!fs.existsSync(FONT)) {
    console.error('Korean font not found:', FONT);
    process.exit(1);
  }

  const arg = process.argv[2];
  const targets = arg ? [path.basename(arg)] : FILES;

  for (const file of targets) {
    await convert(file);
  }
  console.log('Done:', PDF_DIR);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
