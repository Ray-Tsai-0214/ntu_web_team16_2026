// POST /api/auth/login
// Body: { username, password }
// Sets the Supabase auth cookie on success.

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileRow, toApiProfile } from "@/lib/supabase/mappers";

const EMAIL_DOMAIN = process.env.OMG_AUTH_EMAIL_DOMAIN || "omg.local";

export async function POST(request: NextRequest) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "username and password required" },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username}@${EMAIL_DOMAIN}`,
    password,
  });

  if (error || !data.user) {
    // 401 to avoid leaking whether the username exists.
    return NextResponse.json(
      { error: "invalid username or password" },
      { status: 401 }
    );
  }

  // Fetch profile to return alongside the session.
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  return NextResponse.json({
    user: { id: data.user.id },
    profile: profile ? toApiProfile(profile as ProfileRow) : null,
  });
}
