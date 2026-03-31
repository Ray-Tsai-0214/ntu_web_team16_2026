import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/users — 取得所有使用者
export async function GET() {
  return NextResponse.json(db.getUsers());
}

// POST /api/users — 建立新使用者
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { displayName, avatarEmoji } = body;

  if (!displayName || !avatarEmoji) {
    return NextResponse.json(
      { error: "Missing required fields: displayName, avatarEmoji" },
      { status: 400 }
    );
  }

  const user = db.createUser({ displayName, avatarEmoji });
  return NextResponse.json(user, { status: 201 });
}
