import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@saasfly/api";

export const runtime = "edge";

export async function OPTIONS(req: NextRequest) {
  // Handle CORS preflight request
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    },
  });
}

const handler = async (req: NextRequest) => {
  console.log(`Edge tRPC request to ${req.nextUrl.pathname}`);
  
  try {
    // Convert NextRequest to standard Request to avoid type issues
    const url = req.nextUrl.clone();
    const method = req.method;
    
    // Create a standard Request object
    const standardRequest = new Request(url, {
      method,
      headers: req.headers,
      body: method !== 'GET' && method !== 'HEAD' ? await req.blob() : undefined,
    });

    const response = await fetchRequestHandler({
      endpoint: "/api/trpc/edge",
      router: appRouter,
      req: standardRequest,
      createContext: () => createTRPCContext({ req: standardRequest as any }),
      onError({ error }) {
        console.error("tRPC edge error:", error);
      },
    });

    // Force the proper Content-Type header
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/json');

    // Create a new response with the forced headers
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  } catch (error) {
    console.error("Edge tRPC error:", error);
    return NextResponse.json({ error: "Internal server error" }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

export { handler as GET, handler as POST };
