import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LandmarkRow, haversineMetres, toApiLandmark } from "@/lib/supabase/mappers";

// GET /api/landmarks
//   no params      → all landmarks
//   ?lat=&lng=     → landmarks within `radius` metres (default 200), sorted by distance
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = request.nextUrl;

  const { data, error } = await supabase.from("landmarks").select("*");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as LandmarkRow[];
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radius = parseFloat(searchParams.get("radius") ?? "200");
    const nearby = rows
      .map((lm) => ({
        ...toApiLandmark(lm),
        distance: haversineMetres(userLat, userLng, lm.lat, lm.lng),
      }))
      .filter((lm) => lm.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
    return NextResponse.json(nearby);
  }

  return NextResponse.json(rows.map(toApiLandmark));
}
