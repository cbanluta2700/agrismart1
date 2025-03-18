"use client";

import React, { useState } from "react";
import { trpc } from "~/trpc/client";

export default function ApiDebugPage() {
  const [directResult, setDirectResult] = useState<string>("Not fetched yet");
  const [trpcResult, setTrpcResult] = useState<string>("Not fetched yet");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const testDirectApi = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/trpc-test');
      const contentType = response.headers.get('content-type');
      console.log('Response Content-Type:', contentType);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDirectResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Direct API error:', err);
      setError(`Direct API error: ${err.message}`);
      setDirectResult('Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testTrpcApi = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Try to use a simple tRPC endpoint
      const result = await trpc.auth.me.query();
      setTrpcResult(JSON.stringify(result, null, 2));
    } catch (err: any) {
      console.error('tRPC API error:', err);
      setError(`tRPC API error: ${err.message}`);
      setTrpcResult('Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Debugging</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Direct API Test</h2>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={testDirectApi}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Test Direct API'}
          </button>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap">{directResult}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">tRPC API Test</h2>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
            onClick={testTrpcApi}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Test tRPC API'}
          </button>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="whitespace-pre-wrap">{trpcResult}</pre>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Debugging Tips:</h2>
        <ul className="list-disc pl-5">
          <li>Check the browser console for detailed error messages</li>
          <li>Verify if Direct API works but tRPC doesn't</li>
          <li>Inspect the network tab to see the actual responses</li>
        </ul>
      </div>
    </div>
  );
}
