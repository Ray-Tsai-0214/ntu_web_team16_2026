import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PostRow, toApiPost } from "@/lib/supabase/mappers";

// GET /api/posts — list all posts (optionally filtered by ?landmarkId=)
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const landmarkId = request.nextUrl.searchParams.get("landmarkId");

  let q = supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (landmarkId) q = q.eq("landmark_id", landmarkId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data ?? []).map((p) => toApiPost(p as PostRow)));
}

// POST /api/posts — create a post (auth required)
// Body: { landmarkId | landmarkName, coords:[lng,lat], img, text, tags? }
// authorId is taken from the session, NEVER from the body.
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: {
    landmarkId?: unknown;
    landmarkName?: unknown;
    coords?: unknown;
    img?: unknown;
    text?: unknown;
    tags?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Missing required field: text" }, { status: 400 });
  }
  if (text.length > 500) {
    return NextResponse.json({ error: "text too long (max 500)" }, { status: 400 });
  }

  const coords = body.coords;
  if (
    !Array.isArray(coords) ||
    coords.length !== 2 ||
    typeof coords[0] !== "number" ||
    typeof coords[1] !== "number"
  ) {
    return NextResponse.json(
      { error: "Missing or invalid coords: [lng, lat]" },
      { status: 400 }
    );
  }
  const [lng, lat] = coords as [number, number];

  // Daily post limit check.
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("daily_posts_used, max_daily_posts")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr || !profile) {
    return NextResponse.json(
      { error: profileErr?.message || "Profile not found" },
      { status: 500 }
    );
  }
  if (profile.daily_posts_used >= profile.max_daily_posts) {
    return NextResponse.json(
      { error: `Daily post limit reached (${profile.max_daily_posts})` },
      { status: 429 }
    );
  }

  // Resolve landmark — existing id, or create on the fly from a Mapbox POI name.
  let landmarkId =
    typeof body.landmarkId === "string" && body.landmarkId.trim()
      ? body.landmarkId.trim()
      : null;
  const landmarkName =
    typeof body.landmarkName === "string" && body.landmarkName.trim()
      ? body.landmarkName.trim()
      : null;

  if (!landmarkId && landmarkName) {
    // Need to insert into landmarks. Public users have no INSERT policy on landmarks
    // (read-only by RLS), so use the admin client for this trusted operation.
    const admin = createSupabaseAdminClient();

    const { data: existing } = await admin
      .from("landmarks")
      .select("id")
      .eq("name", landmarkName)
      .maybeSingle();

    if (existing) {
      landmarkId = (existing as { id: string }).id;
    } else {
      const newId = `lm-poi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const { error: insertErr } = await admin.from("landmarks").insert({
        id: newId,
        name: landmarkName,
        description: "",
        lat,
        lng,
        category: "poi",
      });
      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
      landmarkId = newId;
    }
  }

  if (!landmarkId) {
    return NextResponse.json(
      { error: "Must provide landmarkId or landmarkName" },
      { status: 400 }
    );
  }

  // Insert the post — author_id MUST equal auth.uid() per RLS.
  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === "string") : [];
  const img = typeof body.img === "string" ? body.img : "";

  const { data: inserted, error: insertErr } = await supabase
    .from("posts")
    .insert({
      landmark_id: landmarkId,
      author_id: user.id,
      coords_lng: lng,
      coords_lat: lat,
      img,
      body: text,
      tags,
    })
    .select("*")
    .single();

  if (insertErr || !inserted) {
    return NextResponse.json(
      { error: insertErr?.message || "Failed to create post" },
      { status: 500 }
    );
  }

  return NextResponse.json(toApiPost(inserted as PostRow), { status: 201 });
}
