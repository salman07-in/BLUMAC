import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      ".well-known",
      "mcp",
      "server-card.json"
    );
    const content = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(content);

    return NextResponse.json(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        name: "blumac-korean-store",
        version: "1.0.0",
        endpoint: "https://blumac.in/api/mcp",
        capabilities: { tools: true, resources: true },
      },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  }
}

