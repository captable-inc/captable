#!/usr/bin/env node

// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const path = require("path");
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const fs = require("fs");

const pdfjsDistPath = path.dirname(require.resolve("pdfjs-dist/package.json"));

const pdfWorkerPath = path.join(pdfjsDistPath, "build", "pdf.worker.min.js");

fs.copyFileSync(pdfWorkerPath, "./public/pdf.worker.min.js");
