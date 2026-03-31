import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { REACTION_WEIGHTS, ReactionType } from "@/lib/types";

const VALID_TYPES: ReactionType[] = ["hilarious", "wtf", "nice", "doubt", "boring"];

// GET /api/posts/:id/reactions — 取得該貼文的所有反應
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!db.getPost(id)) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const reactions = db.getReactions(id);
  return NextResponse.json(reactions);
}

// POST /api/posts/:id/reactions — 對貼文新增/更新反應
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;
  const body = await request.json();
  const { userId, type } = body;

  if (!userId || !type) {
    return NextResponse.json(
      { error: "Missing required fields: userId, type" },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Invalid reaction type. Must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!db.getPost(postId)) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const reaction = db.createReaction({ postId, userId, type });

  // 更新貼文的 heatScore
  const allReactions = db.getReactions(postId);
  const post = db.getPost(postId)!;
  const hoursAgo = (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
  const positive = allReactions.reduce((sum, r) => sum + Math.max(0, REACTION_WEIGHTS[r.type]), 0);
  const negative = allReactions.reduce((sum, r) => sum + Math.abs(Math.min(0, REACTION_WEIGHTS[r.type])), 0);
  post.heatScore = (positive - negative) / Math.pow(hoursAgo + 2, 1.5);

  return NextResponse.json(reaction, { status: 201 });
}
