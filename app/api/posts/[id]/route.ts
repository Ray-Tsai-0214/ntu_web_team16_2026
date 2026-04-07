import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PostRow, toApiPost } from "@/lib/supabase/mappers";

const VALID_REACTIONS = ["hilarious", "wtf", "nice", "doubt", "boring"] as const;

// GET /api/posts/:id — single post + per-type reaction counts
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

  const { data: post, error: postErr } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .maybeSingle();

  if (postErr) return NextResponse.json({ error: postErr.message }, { status: 500 });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const { data: reactionRows } = await supabase
    .from("reactions")
    .select("type")
    .eq("post_id", postId);

  const counts: Record<(typeof VALID_REACTIONS)[number], number> = {
    hilarious: 0,
    wtf: 0,
    nice: 0,
    doubt: 0,
    boring: 0,
  };
  for (const r of reactionRows ?? []) {
    const t = (r as { type: string }).type as keyof typeof counts;
    if (t in counts) counts[t] += 1;
  }

  return NextResponse.json({ post: toApiPost(post as PostRow), reactions: counts });
}

// PATCH /api/posts/:id — { action: "like" | "save" } increments the counter.
// Requires auth (anyone signed-in can like/save anyone else's post).
export async function PATCH(
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

  let body: { action?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const action = body.action;
  if (action !== "like" && action !== "save") {
    return NextResponse.json(
      { error: "Invalid action — use 'like' or 'save'" },
      { status: 400 }
    );
  }

  // RLS posts_update_self only lets the AUTHOR update. For likes/saves we need any
  // authenticated user to be able to bump the counter, so use the admin client
  // (we've already verified `user` above).
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const admin = createSupabaseAdminClient();

  // Fetch current value, then increment. Branch on action so the column name is a
  // literal that the typed Update accepts.
  const { data: current, error: readErr } = await admin
    .from("posts")
    .select("id, likes, saves")
    .eq("id", postId)
    .maybeSingle();

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });
  if (!current) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const updatePayload =
    action === "like"
      ? { likes: (current.likes ?? 0) + 1 }
      : { saves: (current.saves ?? 0) + 1 };

  const { data: updated, error: updateErr } = await admin
    .from("posts")
    .update(updatePayload)
    .eq("id", postId)
    .select("*")
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: updateErr?.message || "Update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json(toApiPost(updated as PostRow));
}
