// GET /api/auth/me
// Returns the current user + profile, or 401.

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileRow, toApiProfile } from "@/lib/supabase/mappers";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ user: null, profile: null }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    user: { id: user.id },
    profile: profile ? toApiProfile(profile as ProfileRow) : null,
  });
}
