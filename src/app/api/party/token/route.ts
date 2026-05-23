import { NextResponse } from "next/server";
import Ably from "ably";

// ============================================================
// 📚 LEARN: api/party/route.ts (I Build)
// ============================================================
// We NEVER want to send our ABLY_API_KEY to the client's browser.
// If we did, anyone could use our quota.
// Instead, the client asks this endpoint: "Can I have a temporary token?"
// We use the secret key to generate a short-lived token and send it back.
// ============================================================

export async function GET(req: Request) {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json({ error: "Missing ABLY_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId") || Math.random().toString(36).substring(7);

  try {
    // We instantiate Ably on the server using our secret key
    const client = new Ably.Rest(process.env.ABLY_API_KEY);
    
    // We generate a token request for the specific client
    const tokenRequestData = await client.auth.createTokenRequest({ clientId: clientId });
    
    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error("Ably Token Error:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
