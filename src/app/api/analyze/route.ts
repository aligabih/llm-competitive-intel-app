import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { content } = await req.json();

  const prompt = `
You are a competitive intelligence analyst. Analyze the following text and extract key strategic insights.
Provide a concise summary highlighting product updates, hiring trends, market signals, or pricing strategy shifts.

Text:
${content}

Strategic Summary:
`;

  const togetherResponse = await fetch(
    "https://api.together.xyz/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1", // or use meta-llama/Llama-3-8b-chat
        messages: [
          {
            role: "system",
            content: "You are a helpful and strategic AI analyst.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1024,
      }),
    }
  );

  const json = await togetherResponse.json();
  const summary =
    json.choices?.[0]?.message?.content || "No summary generated.";

  return NextResponse.json({ summary });
}
