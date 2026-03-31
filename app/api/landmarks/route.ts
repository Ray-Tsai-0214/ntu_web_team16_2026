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