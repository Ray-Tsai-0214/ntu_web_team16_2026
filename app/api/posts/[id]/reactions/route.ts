import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const VALID_TYPES = ["hilarious", "wtf", "nice", "doubt", "boring"] as const;
type ReactionType = (typeof VALID_TYPES)[number];

// GET /api/posts/:id/reactions — counts per type
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  if (Number.isNaN(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .maybeSingle();
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { data: rows, error } = await supabase
    .from("reactions")
    .select("type")
    .eq("post_id", postId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const counts: Record<ReactionType, number> = {
    hilarious: 0,
    wtf: 0,
    nice: 0,
    doubt: 0,
    boring: 0,
  };
  for (const r of rows ?? []) {
    const t = (r as { type: string }).type as ReactionType;
    if (t in counts) counts[t] += 1;
  }
  return NextResponse.json(counts);
}

// POST /api/posts/:id/reactions — upsert current user's reaction
// Body: { type }
// userId is taken from session, NEVER from body.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  if (Number.isNaN(postId)) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { type?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const type = body.type;
  if (typeof type !== "string" || !VALID_TYPES.includes(type as ReactionType)) {
    return NextResponse.json(
      { error: `Invalid type — use one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Verify post exists.
  const { data: post } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .maybeSingle();
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Upsert: one reaction per (post_id, user_id). If exists, change the type.
  const { data: upserted, error: upsertErr } = await supabase
    .from("reactions")
    .upsert(
      { post_id: postId, user_id: user.id, type },
      { onConflict: "post_id,user_id" }
    )
    .select("*")
    .single();

  if (upsertErr || !upserted) {
    return NextResponse.json(
      { error: upsertErr?.message || "Failed to react" },
      { status: 500 }
    );
  }

  return NextResponse.json(upserted, { status: 201 });
}
