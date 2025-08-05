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
  const [summaryHTML, setSummaryHTML] = useState("");
  const [confidenceHTML, setConfidenceHTML] = useState("");
  const [sourcesHTML, setSourcesHTML] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const selectedCompany = company === "Custom" ? customCompany : company;

    if (!selectedCompany || !focus) {
      setError("Please provide both a company and a focus area.");
      return;
    }

    setLoading(true);
    setError("");
    setSummaryHTML("");
    setConfidenceHTML("");
    setSourcesHTML("");

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: selectedCompany,
          focus,
          date,
          prompt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSummaryHTML(data.summaryHTML || "");
        setConfidenceHTML(data.confidenceHTML || "");
        setSourcesHTML(data.sourcesHTML || "");
      } else {
        setError(data.error || "An error occurred.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
                  {focusAreas.map((f) => (
                    <option key={f} value={f}>
                      {f}
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

          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}

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

      {(summaryHTML || confidenceHTML || sourcesHTML) && (
        <Card className="shadow-md bg-white">
          <CardContent className="p-6 space-y-6">
            {summaryHTML && (
              <div dangerouslySetInnerHTML={{ __html: summaryHTML }} />
            )}
            {confidenceHTML && (
              <div dangerouslySetInnerHTML={{ __html: confidenceHTML }} />
            )}
            {sourcesHTML && (
              <div dangerouslySetInnerHTML={{ __html: sourcesHTML }} />
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
