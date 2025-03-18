"use client";

import React, { useEffect, useState } from "react";
import { trpc } from "~/trpc/client";

export default function TrpcDebugPage() {
  const [status, setStatus] = useState<string>("Testing tRPC connection...");
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function testTrpc() {
      try {
        // Call the me procedure which should work without authentication
        const result = await trpc.auth.me.query();
        setStatus(JSON.stringify(result, null, 2));
      } catch (err: any) {
        console.error("tRPC test error:", err);
        setError(err.message || "Unknown error");
        setStatus("Failed to connect to tRPC server");
      }
    }
    
    testTrpc();
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">tRPC Debug</h1>
        
        <div className="bg-gray-50 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-500">{error}</p>
            </div>
          )}
          
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap overflow-x-auto">{status}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
