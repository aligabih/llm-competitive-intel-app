import { NextRequest, NextResponse } from "next/server";

const TOGETHER_API = "https://api.together.xyz/v1/chat/completions";

export async function POST(req: NextRequest) {
  const { company, focus, date, prompt } = await req.json();

  const selectedCompany =
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

  for (const comp of selectedCompany) {
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
Content: ${a.description || a.content}`;
      })
      .join("\n\n");

    allArticles.push(content);
  }

  const mergedArticles = allArticles.join("\n\n");

  const userQuery = prompt?.trim();

  const promptContent = `
  You are a competitive intelligence analyst.

  Your task is to analyze the following articles about ${
    selectedCompany.length > 1 ? "top tech companies" : selectedCompany[0]
  }.

  ${
    userQuery
      ? `Focus your analysis on this specific question or interest from the user:\n"${userQuery}".`
      : `Focus your analysis on: "${focus}", including:\n- Product releases\n- Financial performance\n- Market shifts\n- Hiring trends.`
  }

  Use only the context from the articles provided.

  Include inline references [1], [2], etc., where applicable, and assign a confidence score (0-100) based on how well-supported and consistent the analysis is.

  Articles:
  ${mergedArticles}

  Return your response in the following format:

  - Summary: <Well-organized, multi-section analysis>
  - Confidence Score: <0-100>
  - Sources: [<URL1>, <URL2>, ...]
  `;

  const response = await fetch(TOGETHER_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [{ role: "user", content: promptContent }],
      temperature: 0.3,
      max_tokens: 1400,
    }),
  });

  const json = await response.json();
  const content =
    json.choices?.[0]?.message?.content || "No summary generated.";

  // Parse output
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
