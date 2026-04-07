// POST /api/auth/signup
// Body: { username, password, displayName?, avatarEmoji? }
// Creates an auth.users row via the admin client (no email confirmation),
// inserts a public.profiles row, then signs the user in (sets cookies).

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileRow, toApiProfile } from "@/lib/supabase/mappers";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_DOMAIN = process.env.OMG_AUTH_EMAIL_DOMAIN || "omg.local";

export async function POST(request: NextRequest) {
  let body: {
    username?: unknown;
    password?: unknown;
    displayName?: unknown;
    avatarEmoji?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const displayName =
    typeof body.displayName === "string" && body.displayName.trim()
      ? body.displayName.trim()
      : username;
  const avatarEmoji =
    typeof body.avatarEmoji === "string" && body.avatarEmoji.trim()
      ? body.avatarEmoji.trim()
      : "🐱";

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: "username must be 3–20 chars, [a-zA-Z0-9_] only" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  // 1. Check username uniqueness in profiles (RLS-bypassed via service role).
  const { data: existingProfile, error: lookupErr } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (lookupErr) {
    return NextResponse.json({ error: lookupErr.message }, { status: 500 });
  }
  if (existingProfile) {
    return NextResponse.json({ error: "username already taken" }, { status: 409 });
  }

  // 2. Create the auth user with email_confirm so no email is sent.
  const syntheticEmail = `${username}@${EMAIL_DOMAIN}`;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: syntheticEmail,
    password,
    email_confirm: true,
    user_metadata: { username, display_name: displayName },
  });

  if (createErr || !created.user) {
    return NextResponse.json(
      { error: createErr?.message || "failed to create user" },
      { status: 500 }
    );
  }

  // 3. Insert profile row and read it back so we get the trigger-applied defaults.
  const { data: insertedProfile, error: profileErr } = await admin
    .from("profiles")
    .insert({
      id: created.user.id,
      username,
      display_name: displayName,
      avatar_emoji: avatarEmoji,
    })
    .select("*")
    .single();

  if (profileErr || !insertedProfile) {
    // Rollback: delete the auth user we just created so signup is atomic.
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: profileErr?.message || "Failed to create profile" },
      { status: 500 }
    );
  }

  // 4. Sign the user in via the SSR client so the cookie is set on the response.
  const supabase = await createSupabaseServerClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: syntheticEmail,
    password,
  });

  if (signInErr) {
    return NextResponse.json({ error: signInErr.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      user: { id: created.user.id },
      profile: toApiProfile(insertedProfile as ProfileRow),
    },
    { status: 201 }
  );
}
