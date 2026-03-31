import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/landmarks/:id — 取得單一地標 + 該地標的貼文
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const landmark = db.getLandmark(id);
  if (!landmark) {
    return NextResponse.json({ error: "Landmark not found" }, { status: 404 });
  }

  const posts = db.getPosts(id);
  return NextResponse.json({ landmark, posts });
}
