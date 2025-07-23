import { NextRequest, NextResponse } from "next/server";

const TOGETHER_API = "https://api.together.xyz/v1/chat/completions";

export async function POST(req: NextRequest) {
  const { company, focus, date } = await req.json();

  const allCompanies =
    company === "All"
      ? [
          "Apple",
          "Microsoft",
          "Google",
          "Amazon",
          "Meta",
          "Tesla",
          "Nvidia",
          "Samsung",
          "Intel",
          "IBM",
        ]
      : [company];

  const allArticles: string[] = [];

  for (const comp of allCompanies) {
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        comp + " " + focus
      )}&from=${
        date || "2024-07-01"
      }&sortBy=publishedAt&language=en&pageSize=3&apiKey=${
        process.env.NEWSAPI_KEY
      }`
    );
    const news = await newsRes.json();

    const content = (news.articles || [])
      .map((a: any, index: number) => {
        return `Article ${index + 1}:
  Company: ${comp}
  Title: ${a.title}
  URL: ${a.url}
  Content: ${a.description || a.content}
  `;
      })
      .join("\n\n");

    allArticles.push(content);
  }

  const mergedArticles = allArticles.join("\n\n");

  const prompt = `
You are a competitive intelligence analyst. Based on the following articles about ${
    company === "All" ? "top tech companies" : company
  }, generate a strategic summary related to "${focus}". Focus on product releases, financial performance, market shifts, and hiring trends.

Include inline references [1], [2], etc., and assign a confidence score (0-100) based on clarity, consistency, and the number of sources.

Articles:
${mergedArticles}

Return the output in the following format:
1. A clean and readable strategic summary (do not paste it all in one blob, use clear sections).
2. Confidence Score (0-100) based on the accuracy of the summary.
3. Sources: [URL1, URL2, ...]

Ensure the sections are distinct, with no unnecessary repetition.
`;

  const response = await fetch(TOGETHER_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1400,
    }),
  });

  const json = await response.json();
  const content =
    json.choices?.[0]?.message?.content || "No summary generated.";

  //Parse output
  const summaryMatch = content.match(
    /- Summary:\s*(.+?)(?=- Confidence Score:)/s
  );
  const confidenceMatch = content.match(
    /- Confidence Score:\s*(.+?)(?=- Sources:)/s
  );
  const sourcesMatch = content.match(/- Sources:\s*\[([^\]]+)\]/);

  const summary =
    summaryMatch?.[1]?.replace(/Confidence Score:.*$/s, "").trim() || content;
  const confidence = confidenceMatch?.[1]?.trim() || "N/A";
  const sources =
    sourcesMatch?.[1]
      ?.split(",")
      .map((s: string) => s.trim().replace(/^"|"$/g, "")) || [];

  return NextResponse.json({ summary, confidence, sources });
}
