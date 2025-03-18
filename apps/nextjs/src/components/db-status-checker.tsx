"use client";

import { useState } from "react";
import { Button } from "@saasfly/ui/button";
import { api } from "~/utils/api";

export function DbStatusChecker() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Setup tRPC API calls
  const helloQuery = api.hello.hello.useQuery({ text: "AgriSmart" });
  const dbCheckQuery = api.hello.dbCheck.useQuery(undefined, {
    enabled: false,
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      setIsLoading(false);
    },
    onError: (err) => {
      setError(err.message);
      setResult(null);
      setIsLoading(false);
    },
  });

  const handleRestApiCheck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/public-db-test');
      const data = await response.json();
      setResult(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrpcApiCheck = () => {
    setIsLoading(true);
    dbCheckQuery.refetch();
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-2xl font-bold">Database Connectivity Check</h3>
      
      <div className="my-4">
        <p className="text-muted-foreground">
          Test the connection to the database using different methods:
        </p>
      </div>
      
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <Button onClick={handleRestApiCheck} disabled={isLoading}>
          Test Direct REST API
        </Button>
        <Button onClick={handleTrpcApiCheck} disabled={isLoading}>
          Test tRPC API
        </Button>
      </div>
      
      {helloQuery.data && (
        <div className="mt-4 rounded bg-muted p-3">
          <p className="font-medium">tRPC Basic Check:</p>
          <p>{helloQuery.data.greeting} - {helloQuery.data.time}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-4 flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span>Checking database connection...</span>
        </div>
      )}
      
      {error && (
        <div className="mt-4 rounded bg-destructive/10 p-4 text-destructive">
          <h4 className="font-bold">Error:</h4>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 rounded bg-primary/10 p-4">
          <h4 className="font-bold text-primary">Result:</h4>
          <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
