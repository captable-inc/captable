import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/env";

export interface AgreementExtractionResult {
  type: "CONTRACTOR" | "INVESTOR";
  party_name: string | null;
  party_email: string | null;
  role: string | null;
  effective_date: string | null;
  start_date: string | null;
  quantity: number | null;
  units_per_period: number | null;
  vesting_periods: number | null;
  share_class: string | null;
  price_per_share: number | null;
  total_amount: number | null;
  vesting_cliff_days: number | null;
  vesting_period_months: number | null;
  notes: string | null;
}

const EXTRACTION_PROMPT = `You are parsing an equity agreement for Launch Legends LLC. Extract structured data as JSON.

The agreement is either a CONTRACTOR agreement (consulting services with equity vesting) or an INVESTOR agreement (subscription for shares at a price).

Extract these fields:

{
  "type": "CONTRACTOR" or "INVESTOR",
  "party_name": "Full legal name of the consultant or investor",
  "party_email": "Email address if present in the document, null otherwise",
  "role": "Job title/position if contractor, null if investor",
  "effective_date": "YYYY-MM-DD format",
  "start_date": "YYYY-MM-DD format (official start date, may differ from effective date)",
  "quantity": total number of units/shares being granted,
  "units_per_period": units vesting per period (null for investors),
  "vesting_periods": number of vesting periods (null for investors),
  "share_class": "Class B" (default for all non-founder agreements),
  "price_per_share": price per share in USD (null for contractors),
  "total_amount": total investment amount in USD (null for contractors),
  "vesting_cliff_days": cliff period in days (typically 90, null for investors),
  "vesting_period_months": total vesting duration in months (typically 24, null for investors),
  "notes": "Any unusual terms, special conditions, or items that differ from standard terms"
}

IMPORTANT:
- For contractor agreements, the equity details are typically in "EXHIBIT A" under a section called "EQUITY"
- The party name is in the opening paragraph of the agreement
- Dates may appear in multiple formats (January 10, 2025 or 01/10/2025)
- If a field cannot be determined from the text, use null
- The "quantity" should be the TOTAL units, not per-period amount

Return ONLY valid JSON, no other text.`;

export async function extractAgreementData(
  text: string,
): Promise<{ data: AgreementExtractionResult | null; raw: string; error?: string }> {
  if (!env.ANTHROPIC_API_KEY) {
    return {
      data: null,
      raw: "",
      error: "ANTHROPIC_API_KEY is not configured. Please set it in your environment variables.",
    };
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20250401",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `${EXTRACTION_PROMPT}\n\nThe agreement text follows:\n---\n${text}\n---`,
        },
      ],
    });

    const content = message.content[0];
    if (!content || content.type !== "text") {
      return { data: null, raw: JSON.stringify(message.content), error: "Unexpected response type" };
    }

    const rawResponse = content.text;

    // Extract JSON from the response (handle potential markdown code blocks)
    let jsonStr = rawResponse;
    const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch?.[1]) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr) as AgreementExtractionResult;
    return { data: parsed, raw: rawResponse };
  } catch (err) {
    // Try fallback model
    try {
      const message = await client.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: `${EXTRACTION_PROMPT}\n\nThe agreement text follows:\n---\n${text}\n---`,
          },
        ],
      });

      const content = message.content[0];
      if (!content || content.type !== "text") {
        return { data: null, raw: JSON.stringify(message.content), error: "Unexpected response type" };
      }

      const rawResponse = content.text;
      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch?.[1]) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr) as AgreementExtractionResult;
      return { data: parsed, raw: rawResponse };
    } catch (_fallbackErr) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      return { data: null, raw: "", error: `AI extraction failed: ${errorMsg}` };
    }
  }
}
