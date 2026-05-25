import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT =
  "You are a research analyst. The user has a passion. Search the web and find 5-8 real people who turned that exact passion into a business. For each person include: their name, what they built, how they started, approximate revenue or scale if available, and a link if you found one. Then list the top 3 business models that work for this passion with a one-sentence explanation of each. Be specific and factual — only include real people you actually find, not hypothetical examples.";

const RESPONSE_FORMAT_INSTRUCTION = `After researching, respond with ONLY a valid JSON object (no markdown fences, no commentary) matching this exact schema:
{
  "passion": "the passion as entered",
  "people": [
    {
      "name": "Full Name",
      "business": "What they built",
      "how_they_started": "1-2 sentence origin story",
      "revenue_or_scale": "Revenue/scale info or 'Not publicly available'",
      "link": "URL or null"
    }
  ],
  "business_models": [
    {
      "name": "Model Name",
      "description": "One sentence explanation"
    }
  ]
}`;

export async function POST(req: Request) {
  let body: { passion?: unknown };
  try {
    body = (await req.json()) as { passion?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const passion =
    typeof body.passion === "string" ? body.passion.trim() : "";
  if (!passion) {
    return NextResponse.json(
      { error: "Please enter a passion" },
      { status: 400 },
    );
  }
  if (passion.length > 500) {
    return NextResponse.json(
      { error: "Passion text is too long (500 char max)" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server missing ANTHROPIC_API_KEY" },
      { status: 500 },
    );
  }

  const anthropic = new Anthropic({ apiKey });

  let message;
  try {
    message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16384,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `My passion is: ${passion}\n\n${RESPONSE_FORMAT_INSTRUCTION}`,
        },
      ],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Research request failed. Try again later." },
      { status: 502 },
    );
  }

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json(
      { error: "Unexpected model response" },
      { status: 502 },
    );
  }

  let parsed: unknown;
  try {
    let raw = textBlock.text.trim();
    const fence = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/im.exec(raw);
    if (fence?.[1]) {
      raw = fence[1].trim();
    }
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Could not parse response from model" },
      { status: 502 },
    );
  }

  return NextResponse.json(parsed);
}
