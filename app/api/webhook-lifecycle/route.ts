import { NextResponse } from "next/server";
import { webhookLifecycle, getWebHookData } from "@/lib/api/createWeebhook";

function getNestedValue(obj: Record<string, any>, path: string): unknown {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return acc[part];
    }
    return "";
  }, obj);
}

interface WebhookLifecycleRequest {
  triggerId: string;
  authToken: string;
  hookType: "Dynamic" | "Textbased";
  prompt?: string; 
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const body: WebhookLifecycleRequest = await req.json();
    const { searchParams } = new URL(req.url);
    const triggerId = searchParams.get("triggerId");
    const { prompt, authToken } = body;

    if (!triggerId || !authToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { storedPrompt, hookType} = await getWebHookData(triggerId);
    let finalPrompt: string;

    if (hookType === "Dynamic") {
      if (!prompt) {
        return NextResponse.json(
          { error: "Missing originalPrompt for dynamic hook" },
          { status: 400 }
        );
      }
      finalPrompt = prompt;
    } else {
      if (!storedPrompt) {
        return NextResponse.json(
          { error: "Stored prompt not found for trigger" },
          { status: 404 }
        );
      }

      finalPrompt = storedPrompt.replace(/\$\{(.*?)\}/g, (_: any, key: any) => {
        const trimmedKey = key.trim();
        const value = getNestedValue(body, trimmedKey);
        return value !== undefined
          ? typeof value === "object"
            ? JSON.stringify(value)
            : String(value)
          : "";
      });
    }

    const result = await webhookLifecycle(
      triggerId,
      authToken,
      finalPrompt
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in webhook-lifecycle endpoint:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}