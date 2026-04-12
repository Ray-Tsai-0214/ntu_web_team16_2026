import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toApiPet, PetRow } from "@/lib/supabase/mappers";

type Params = { params: Promise<{ id: string }> };

// GET /api/pets/:id  → single pet (public)
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("pet_id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  }

  return NextResponse.json(toApiPet(data as PetRow));
}

// PATCH /api/pets/:id
// Updates any subset of pet fields. Only the owner (session user) may update.
// Updatable fields: name, species, stage, level, exp, hunger, cleanliness, mood,
//   health, favorability, skin, outfit, accessory, expression, currentAction,
//   lastFeedTime, lastCleanTime, affinity, coins, inventory
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();

  // Map camelCase body fields → snake_case DB columns (only include defined fields)
  const fieldMap: Record<string, string> = {
    name:          "name",
    species:       "species",
    stage:         "stage",
    level:         "level",
    exp:           "exp",
    hunger:        "hunger",
    cleanliness:   "cleanliness",
    mood:          "mood",
    health:        "health",
    favorability:  "favorability",
    skin:          "skin",
    outfit:        "outfit",
    accessory:     "accessory",
    expression:    "expression",
    currentAction: "current_action",
    lastFeedTime:  "last_feed_time",
    lastCleanTime: "last_clean_time",
    affinity:      "affinity",
    coins:         "coins",
    inventory:     "inventory",
  };

  const patch: Record<string, unknown> = {};
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (body[camel] !== undefined) patch[snake] = body[camel];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pets")
    .update(patch)
    .eq("pet_id", id)
    .eq("user_id", user.id)   // RLS also enforces this; double-check here
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Pet not found or not authorized" }, { status: 404 });
  }

  return NextResponse.json(toApiPet(data as PetRow));
}

// DELETE /api/pets/:id  → owner only
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("pets")
    .delete()
    .eq("pet_id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
