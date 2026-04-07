import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PostRow, ProfileRow, toApiPost, toApiProfile } from "@/lib/supabase/mappers";
import type { Database } from "@/lib/supabase/database.types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// GET /api/users/:id — profile + their posts (public)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", id)
    .order("created_at", { ascending: false });

  if (postsErr) return NextResponse.json({ error: postsErr.message }, { status: 500 });

  return NextResponse.json({
    user: toApiProfile(profile as ProfileRow),
    posts: (posts ?? []).map((p) => toApiPost(p as PostRow)),
  });
}

// PUT /api/users/:id — update display name / avatar (auth required, self only)
// RLS profiles_update_self enforces auth.uid() = id, so we don't need to recheck here,
// but we still call getUser() so we can return a clear 401 instead of an opaque RLS error.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.id !== id) {
    return NextResponse.json(
      { error: "You can only update your own profile" },
      { status: 403 }
    );
  }

  let body: { displayName?: unknown; avatarEmoji?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: ProfileUpdate = {};
  if (typeof body.displayName === "string" && body.displayName.trim()) {
    updates.display_name = body.displayName.trim();
  }
  if (typeof body.avatarEmoji === "string" && body.avatarEmoji.trim()) {
    updates.avatar_emoji = body.avatarEmoji.trim();
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data: updated, error: updateErr } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: updateErr?.message || "Update failed" },
      { status: 500 }
    );
  }

  return NextResponse.json(toApiProfile(updated as ProfileRow));
}
