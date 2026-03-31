import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
