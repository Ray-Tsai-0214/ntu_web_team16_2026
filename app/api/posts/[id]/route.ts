import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/posts/:id — 取得單一貼文 + 反應統計
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  const post = db.getPost(postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  const reactionCounts = db.getReactionCounts(postId);
  return NextResponse.json({ post, reactions: reactionCounts });
}

// PATCH /api/posts/:id — like 或 save toggle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  const body = await request.json();
  const { action } = body; // "like" or "save"

  if (action === "like") {
    const post = db.toggleLike(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  }
  if (action === "save") {
    const post = db.toggleSave(postId);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
