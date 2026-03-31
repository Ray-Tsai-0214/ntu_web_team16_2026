import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ReactionType } from "@/lib/types";

const VALID_TYPES: ReactionType[] = ["hilarious", "wtf", "nice", "doubt", "boring"];

// GET /api/posts/:id/reactions
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  if (!db.getPost(postId)) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json(db.getReactionCounts(postId));
}

// POST /api/posts/:id/reactions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  const body = await request.json();
  const { userId, type } = body;

  if (!userId || !type) {
    return NextResponse.json({ error: "Missing: userId, type" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: `Invalid type. Use: ${VALID_TYPES.join(", ")}` }, { status: 400 });
  }
  if (!db.getPost(postId)) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const reaction = db.createReaction({ postId, userId, type });
  return NextResponse.json(reaction, { status: 201 });
}
