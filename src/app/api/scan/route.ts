import { NextRequest, NextResponse } from "next/server";

const TOGETHER_API = "https://api.together.xyz/v1/chat/completions";

const TOP_TECH_COMPANIES = [
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
];

const getArticlesForCompany = async (
  company: string,
  focus: string,
  date?: string
) => {
  const fromDate =
    date ||
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const res = await fetch(
    `https://newsapi.org/v2/everything?q="${company}" "${focus}"&from=${fromDate}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${process.env.NEWSAPI_KEY}`
  );

  const json = await res.json();

  const articles = (json.articles || []).filter(
    (a: any) =>
      a.title?.toLowerCase().includes(company.toLowerCase()) ||
      a.description?.toLowerCase().includes(company.toLowerCase())
  );

  return articles
    .map(
      (a: any, index: number) => `Article ${index + 1}:
Company: ${company}
Title: ${a.title}
URL: ${a.url}
Content: ${a.description || a.content}`
    )
    .join("\n\n");
};

const callLLM = async (prompt: string) => {
  const res = await fetch(TOGETHER_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    }),
  });

  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() || "";
};

export async function POST(req: NextRequest) {
  const { company, focus, date, prompt: userPrompt } = await req.json();

  if (!company || !focus) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const selectedCompanies = company === "All" ? TOP_TECH_COMPANIES : [company];
  let allArticles: string[] = [];

  for (const comp of selectedCompanies) {
    const companyArticles = await getArticlesForCompany(comp, focus, date);
    allArticles.push(companyArticles);
  }

  const mergedArticles = allArticles.join("\n\n");

  if (!mergedArticles.trim()) {
    return NextResponse.json({
      summaryHTML: `<div class="block"><h2>Summary</h2><p>No relevant articles found for "${company}" and "${focus}". Try adjusting the focus or date.</p></div>`,
      confidenceHTML: `<div class="block"><h2>Confidence Score</h2><p>0/100 (Insufficient relevant data)</p></div>`,
      sourcesHTML: `<div class="block"><h2>Sources</h2><p>No sources available.</p></div>`,
    });
  }

  if (
    userPrompt?.toLowerCase().includes("suggest focus areas") &&
    company !== "All"
  ) {
    const suggestionPrompt = `
You are a competitive intelligence analyst.

Your task is to suggest the top 5 focus areas someone should investigate about the company "${company}" based on recent news.

Use the following articles:
${mergedArticles}

Respond in the following format:

Top 5 Focus Areas:
1. ...
2. ...
3. ...
4. ...
5. ...
`;
    const suggestion = await callLLM(suggestionPrompt);
    return NextResponse.json({
      summaryHTML: `<div class="block"><h2>Top 5 Focus Areas</h2><p>${suggestion}</p></div>`,
      confidenceHTML: "",
      sourcesHTML: "",
    });
  }

  const summaryPrompt = `
You are a competitive intelligence analyst.

Summarize the following articles about ${
    company === "All" ? "top tech companies" : company
  } with a focus on "${focus}".

User interest: ${userPrompt || "General overview"}

Only use the content in the articles. Do NOT fabricate. Be concise and structured.

Articles:
${mergedArticles}

Respond in a professional summary format.
`;

  const summary = await callLLM(summaryPrompt);

  const confidencePrompt = `
Based only on the consistency, clarity, and support of the following articles:

Articles:
${mergedArticles}

Assign a confidence score between 0 and 100 for how reliable a summary based on these would be.

⚠️ Important: Respond with only a single number (0–100). Do not include any explanation.

Your answer:
`;

  const rawConfidence = await callLLM(confidencePrompt);

  const matched = rawConfidence.match(/\b([0-9]{1,2}|100)\b/);
  const confidence = matched ? matched[1] : "N/A";

  const sourcesPrompt = `
Extract all article URLs from the following and return them as a Markdown list:

Articles:
${mergedArticles}

Respond like this:
- https://example.com
- ...
`;

  const sourcesRaw = await callLLM(sourcesPrompt);
  const sources = sourcesRaw
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.startsWith("- "))
    .map((line: string) => line.replace("- ", "").trim());

  return NextResponse.json({
    summaryHTML: `<div class="block"><h2>Summary</h2><p>${summary}</p></div>`,
    confidenceHTML: `<div class="block"><h2>Confidence Score</h2><p>${confidence}/100</p></div>`,
    sourcesHTML: `<div class="block"><h2>Sources</h2><ul>${sources
      .map((s: string) => `<li><a href="${s}" target="_blank">${s}</a></li>`)
      .join("")}</ul></div>`,
  });
}
