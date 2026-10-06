import { NextResponse } from "next/server";
import { sendLocationRequest } from "../../../lib/whatsapp";

// For now requests are just logged server-side for your own records —
// there's no dashboard, since the team monitors the WhatsApp inbox directly.
// Swap this for a real DB write (Postgres/SQLite) once you want history/analytics.
function logRequest(entry) {
  console.log("[garage-request]", JSON.stringify(entry));
}

export async function POST(req) {
  try {
    const { service, name, phone, vehicle } = await req.json();

    if (!service || !name || !phone || !vehicle) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!["rescue", "door", "maintenance", "tyres", "battery", "diagnostics"].includes(service)) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }

    logRequest({ service, name, phone, vehicle, at: new Date().toISOString() });

    await sendLocationRequest({ name, phone, service, vehicle });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Request handling failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
