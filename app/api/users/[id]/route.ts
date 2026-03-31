import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/users/:id — 使用者資料 + 該使用者的貼文
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = db.getUser(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const posts = db.getPostsByAuthor(id);
  return NextResponse.json({ user, posts });
}

// PUT /api/users/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = db.getUser(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const body = await request.json();
  if (body.displayName) user.displayName = body.displayName;
  if (body.avatarEmoji) user.avatarEmoji = body.avatarEmoji;
  return NextResponse.json(user);
}
