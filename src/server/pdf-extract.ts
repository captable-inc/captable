// Import the internal lib directly to avoid pdf-parse's test file check in index.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}
