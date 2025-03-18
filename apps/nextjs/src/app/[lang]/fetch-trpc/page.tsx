"use client";

import React, { useState } from "react";

export default function FetchTrpc() {
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTrpc = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Directly fetch from tRPC endpoint
      const response = await fetch("/api/trpc/auth.me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });

      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      // Log the response status and text for debugging
      console.log("Status:", response.status);
      
      // Try to get the text response first to see what's coming back
      const text = await response.text();
      console.log("Raw response:", text);
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(text);
        setResult(JSON.stringify(data, null, 2));
      } catch (jsonError) {
        setError(`Received non-JSON response: ${text.substring(0, 100)}...`);
        setResult("Error parsing JSON");
      }
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(`Fetch error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direct Fetch tRPC Test</h1>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={fetchTrpc}
        disabled={isLoading}
      >
        {isLoading ? "Loading..." : "Test tRPC with Fetch"}
      </button>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Result:</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
          {result || "No data yet"}
        </pre>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 rounded">
        <p className="font-semibold">Debugging Tips:</p>
        <ul className="list-disc pl-5">
          <li>Check the browser console for the raw response</li>
          <li>If you see HTML instead of JSON, there's middleware or server config issue</li>
          <li>Verify the Content-Type header in the response</li>
        </ul>
      </div>
    </div>
  );
}
