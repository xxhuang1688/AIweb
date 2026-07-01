import { NextResponse } from "next/server";
import { runDemoGenerationAgent } from "@/lib/agent/demoAgent";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await runDemoGenerationAgent(body);
    const status = response.status === "invalid_request" ? 400 : 200;

    return NextResponse.json(response, { status });
  } catch {
    return NextResponse.json(
      {
        status: "invalid_request",
        provider: "syncCraft",
        prompt: null,
        result: null,
        errors: ["リクエストJSONを読み取れませんでした。"],
        demoUrl: null,
      },
      { status: 400 },
    );
  }
}
