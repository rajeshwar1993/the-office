#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function main() {
  const [inputPath, outputPath] = process.argv.slice(2);

  if (!inputPath || !outputPath) {
    console.error('Usage: node render.js <input.html> <output.pdf>');
    process.exit(1);
  }

  const absoluteInput = path.resolve(inputPath);
  const absoluteOutput = path.resolve(outputPath);

  if (!fs.existsSync(absoluteInput)) {
    console.error(`Input file not found: ${absoluteInput}`);
    process.exit(1);
  }

  // Create output directory if missing
  const outputDir = path.dirname(absoluteOutput);
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`file://${absoluteInput}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: absoluteOutput,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  console.log(`PDF saved: ${absoluteOutput}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
