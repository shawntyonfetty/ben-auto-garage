import { NextResponse } from "next/server";

const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";
let makesCache = null;
let makesCacheTime = 0;
const CACHE_MS = 1000 * 60 * 60 * 12;

async function getMakes() {
  if (makesCache && Date.now() - makesCacheTime < CACHE_MS) return makesCache;

  const response = await fetch(`${VPIC_BASE}/GetMakesForVehicleType/car?format=json`, {
    next: { revalidate: 43200 },
  });
  if (!response.ok) throw new Error("Vehicle make service unavailable");

  const data = await response.json();
  makesCache = [...new Set((data.Results || []).map((item) => item.MakeName).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  makesCacheTime = Date.now();
  return makesCache;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const query = (searchParams.get("q") || "").trim().toLowerCase();

    if (!query) return NextResponse.json({ results: [] });

    if (type === "makes") {
      const makes = await getMakes();
      const results = makes.filter((make) => make.toLowerCase().includes(query)).slice(0, 12);
      return NextResponse.json({ results });
    }

    if (type === "models") {
      const make = (searchParams.get("make") || "").trim();
      if (!make) return NextResponse.json({ results: [] });

      const response = await fetch(
        `${VPIC_BASE}/GetModelsForMake/${encodeURIComponent(make)}?format=json`,
        { next: { revalidate: 43200 } }
      );
      if (!response.ok) throw new Error("Vehicle model service unavailable");

      const data = await response.json();
      const models = [...new Set((data.Results || []).map((item) => item.Model_Name).filter(Boolean))];
      const results = models
        .filter((model) => model.toLowerCase().includes(query))
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 15);

      return NextResponse.json({ results });
    }

    return NextResponse.json({ error: "Invalid vehicle search type" }, { status: 400 });
  } catch (error) {
    console.error("Vehicle lookup failed:", error);
    return NextResponse.json(
      { error: "Vehicle catalogue temporarily unavailable", results: [] },
      { status: 503 }
    );
  }
}
