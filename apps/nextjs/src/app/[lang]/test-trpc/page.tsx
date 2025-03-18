"use client";

import React, { useEffect, useState } from "react";
import { trpc } from "~/trpc/client";

export default function TestTRPC() {
  const [result, setResult] = useState<string>("Loading...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testTRPC = async () => {
      try {
        // Replace with an actual trpc endpoint that exists
        const response = await trpc.auth.me.query();
        setResult(JSON.stringify(response, null, 2));
      } catch (err: any) {
        console.error("TRPC Error:", err);
        setError(err.message || "Unknown error");
        setResult("Error occurred");
      }
    };

    testTRPC();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">tRPC Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Result:</h2>
        <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
          {result}
        </pre>
      </div>
    </div>
  );
}
