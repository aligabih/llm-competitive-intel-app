"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const companies = [
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
  "Custom",
];

const focusAreas = [
  "Product Releases",
  "AI Initiatives",
  "Mobile Devices",
  "Laptops",
  "Quarterly Earnings",
  "Hiring Trends",
];

export default function HomePage() {
  const [company, setCompany] = useState(companies[0]);
  const [customCompany, setCustomCompany] = useState("");
  const [focus, setFocus] = useState(focusAreas[0]);
  const [date, setDate] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [confidence, setConfidence] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const selectedCompany = company === "Custom" ? customCompany : company;
    setLoading(true);
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: selectedCompany, focus, date, prompt }),
    });
    const data = await res.json();
    setResponse(data.summary);
    setSources(data.sources || []);
    setConfidence(data.confidence || "N/A");
    setLoading(false);
  };

  const renderSummaryWithFootnotes = () => {
    let updated = response;
    sources.forEach((src, i) => {
      const footnote = `[${i + 1}]`;
      const link = `<sup class='text-xs align-super'><a href="${src}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">[${
        i + 1
      }]</a></sup>`;
      updated = updated.replaceAll(footnote, link);
    });
    return updated;
  };

  return (
    <main className="p-6 max-w-5xl mx-auto font-sans bg-gray-50 min-h-screen">
      <header className="mb-8 py-4 border-b border-gray-300">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Competitive Intelligence Dashboard
        </h1>
      </header>

      <Card className="mb-6 shadow-md bg-white">
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </Label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded text-gray-700"
              >
                <option value="All">All Companies</option>
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {company === "Custom" && (
                <Input
                  placeholder="Enter custom company name"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  className="mt-2 w-full"
                />
              )}
            </div>
            {company !== "Custom" && (
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Area
                </Label>
                <select
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-gray-700"
                >
                  <option value="All">Focus Areas</option>
                  {focusAreas.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                From Date (optional)
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Custom Prompt (optional)
            </Label>
            <Textarea
              placeholder="Ask a question about any company or market trend..."
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full text-gray-700"
            />
          </div>

          <div className="text-right">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Analyzing..." : "Analyze Company"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {response && (
        <Card className="shadow-md bg-white">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Strategic Summary
            </h2>
            <p
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderSummaryWithFootnotes() }}
            ></p>
            {sources.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mt-4 text-gray-800">
                  Sources
                </h3>
                <ol className="list-decimal pl-6 space-y-1 text-sm text-blue-600">
                  {sources.map((src, i) => (
                    <li key={i}>
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {src}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
