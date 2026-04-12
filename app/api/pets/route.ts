import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toApiPet, PetRow } from "@/lib/supabase/mappers";

// GET /api/pets               → all pets (public)
// GET /api/pets?userId=<id>   → pets owned by a specific user
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const userId = req.nextUrl.searchParams.get("userId");

  let query = supabase.from("pets").select("*").order("created_at", { ascending: true });
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data as PetRow[]).map(toApiPet));
}

// POST /api/pets
// Body: { petId, name, species, stage?, skin?, outfit?, accessory?, affinity? }
// Requires session cookie. user_id is taken from session (cannot be forged).
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { petId, name, species, stage, skin, outfit, accessory, affinity } = body;

  if (!petId || typeof petId !== "string") {
    return NextResponse.json({ error: "petId is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pets")
    .insert({
      pet_id: petId,
      user_id: user.id,
      name: name ?? "",
      species: species ?? "",
      stage: stage ?? "egg",
      skin: skin ?? "",
      outfit: outfit ?? "",
      accessory: accessory ?? [],
      affinity: affinity ?? {},
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Pet ID already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(toApiPet(data as PetRow), { status: 201 });
}
