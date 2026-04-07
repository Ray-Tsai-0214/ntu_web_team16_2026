import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileRow, toApiProfile } from "@/lib/supabase/mappers";

// GET /api/users — list all profiles (public).
// NOTE: POST is no longer here — use POST /api/auth/signup instead.
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("joined_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((p) => toApiProfile(p as ProfileRow)));
}
