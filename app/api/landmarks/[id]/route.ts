import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LandmarkRow, PostRow, toApiLandmark, toApiPost } from "@/lib/supabase/mappers";

// GET /api/landmarks/:id — landmark + its posts
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: landmark, error: lmErr } = await supabase
    .from("landmarks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (lmErr) return NextResponse.json({ error: lmErr.message }, { status: 500 });
  if (!landmark) {
    return NextResponse.json({ error: "Landmark not found" }, { status: 404 });
  }

  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .select("*")
    .eq("landmark_id", id)
    .order("created_at", { ascending: false });

  if (postsErr) {
    return NextResponse.json({ error: postsErr.message }, { status: 500 });
  }

  return NextResponse.json({
    landmark: toApiLandmark(landmark as LandmarkRow),
    posts: (posts ?? []).map((p) => toApiPost(p as PostRow)),
  });
}
