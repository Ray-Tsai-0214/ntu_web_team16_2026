import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/landmarks — 取得所有地標（可選：附近查詢）
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius");

  // 如果有提供座標，回傳附近地標
  if (lat && lng) {
    const nearby = db.getNearbyLandmarks(
      parseFloat(lat),
      parseFloat(lng),
      radius ? parseFloat(radius) : 200
    );
    return NextResponse.json(nearby);
  }

  return NextResponse.json(db.getLandmarks());
}

// POST /api/landmarks — 新增地標
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, lat, lng, category } = body;

  if (!name || !description || lat == null || lng == null || !category) {
    return NextResponse.json(
      { error: "Missing required fields: name, description, lat, lng, category" },
      { status: 400 }
    );
  }

  const landmark = db.createLandmark({ name, description, lat, lng, category });
  return NextResponse.json(landmark, { status: 201 });
}
