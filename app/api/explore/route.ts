import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

const SYSTEM_PROMPT =
  "You are a research analyst helping someone figure out how to make money from their passion. Search the web specifically for REGULAR people — not celebrities or famous entrepreneurs — who turned this passion into their first $1,000 to $50,000 in income. Look on Reddit (r/entrepreneur, r/sidehustle, r/personalfinance), Indie Hackers, YouTube creator stories, and personal blogs. For each person find: their first name or username, what they actually did (be specific — not 'started a photography business' but 'charged $150/session for family portraits at local parks'), how they got their first customer, how long it took, and approximately how much they made in year one. Only include people who started with little to no money or experience. If you cannot find real documented examples, say so honestly. Then list 3 specific first steps someone could take THIS WEEK to start making money from this passion — not general advice, specific actions with realistic expected outcomes.";

const RESPONSE_FORMAT_INSTRUCTION = `After researching, respond with ONLY a valid JSON object (no markdown fences, no commentary) matching this exact schema:
{
  "passion": "the passion as entered",
  "people": [
    {
      "name": "First name or username",
      "what_they_did": "Specific description of what they actually did to make money",
      "first_customer": "How they got their first paying customer",
      "time_to_first_dollar": "How long it took to earn their first income",
      "year_one_income": "Approximate income in year one, or 'Not disclosed'",
      "link": "URL to their post/story or null"
    }
  ],
  "first_steps": [
    {
      "action": "Specific action to take this week",
      "expected_outcome": "Realistic expected result from this action"
    }
  ],
  "honest_note": "If you could not find enough real documented examples, explain what you found instead and be transparent about it"
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
