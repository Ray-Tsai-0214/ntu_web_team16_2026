import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LEVEL_THRESHOLDS } from "@/lib/types";

// GET /api/users/:id — 取得單一使用者 + 統計
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = db.getUser(id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const userPosts = db.getPosts().filter((p) => p.authorId === id);

  return NextResponse.json({
    user,
    stats: {
      totalPosts: userPosts.length,
      nextLevelAt: LEVEL_THRESHOLDS[user.level] ?? null,
    },
  });
}

// PUT /api/users/:id — 更新使用者資料
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
