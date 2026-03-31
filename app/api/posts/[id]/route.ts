import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/posts/:id — 取得單一貼文 + 反應統計
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = db.getPost(id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const reactions = db.getReactions(id);
  const reactionCounts = {
    hilarious: reactions.filter((r) => r.type === "hilarious").length,
    wtf: reactions.filter((r) => r.type === "wtf").length,
    nice: reactions.filter((r) => r.type === "nice").length,
    doubt: reactions.filter((r) => r.type === "doubt").length,
    boring: reactions.filter((r) => r.type === "boring").length,
  };

  return NextResponse.json({ post, reactions: reactionCounts, totalReactions: reactions.length });
}
