"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [focus, setFocus] = useState(focusAreas[0]);
  const [date, setDate] = useState("");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [confidence, setConfidence] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, focus, date }),
    });
    const data = await res.json();
    setResponse(data.summary);
    setSources(data.sources || []);
    setConfidence(data.confidence || "N/A");
    setLoading(false);
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-semibold mb-6 text-center">
        LLM Competitive Intelligence Analyst
      </h1>

      <Card className="mb-6 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out">
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Company</Label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary transition"
              >
                <option value="All">All Companies</option>
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Focus Area</Label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary transition"
              >
                <option value="All">Focus Areas</option>
                {focusAreas.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <Label>From Date (optional)</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary transition"
              />
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 mt-4 rounded-lg bg-primary text-white hover:bg-primary-dark transition duration-300"
          >
            {loading ? "Analyzing..." : "Analyze Company"}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <>
          {/* Strategic Summary Section */}
          <Card className="mb-6 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold text-primary">
                Strategic Summary:
              </h2>
              <div>
                <p className="text-lg text-muted-foreground">{response}</p>
              </div>
            </CardContent>
          </Card>

          {/* Sources Section */}
          {sources.length > 0 && (
            <Card className="mb-6 shadow-xl hover:shadow-2xl transition duration-300 ease-in-out">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  Sources:
                </h3>
                <div className="space-y-4">
                  {sources.map((src, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 hover:bg-gray-200 rounded-lg p-4 transition duration-200 ease-in-out"
                    >
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {src}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </main>
  );
}
