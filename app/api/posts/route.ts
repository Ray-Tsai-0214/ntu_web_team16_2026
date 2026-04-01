import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/posts — 取得所有貼文（可用 ?landmarkId= 篩選）
export async function GET(request: NextRequest) {
  const landmarkId = request.nextUrl.searchParams.get("landmarkId");
  const posts = db.getPosts(landmarkId ?? undefined);
  return NextResponse.json(posts);
}

// POST /api/posts — 新增貼文
// 接受兩種模式：
//   1. landmarkId — 使用現有地標
//   2. landmarkName + coords — 自動建立新地標（來自 Mapbox 真實 POI）
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { landmarkId, landmarkName, authorId, coords, img, text, tags } = body;

  if (!authorId || !text) {
    return NextResponse.json(
      { error: "Missing required fields: authorId, text" },
      { status: 400 }
    );
  }

  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return NextResponse.json(
      { error: "Missing or invalid coords: [lng, lat]" },
      { status: 400 }
    );
  }

  const author = db.getUser(authorId);
  if (!author) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (author.dailyPostsUsed >= author.maxDailyPosts) {
    return NextResponse.json(
      { error: `Daily post limit reached (${author.maxDailyPosts})` },
      { status: 429 }
    );
  }

  // 決定 landmarkId：使用現有的，或從 Mapbox POI 名稱自動建立
  let resolvedLandmarkId = landmarkId;

  if (!resolvedLandmarkId && landmarkName) {
    // 檢查是否已存在同名地標（避免重複）
    const existing = db.getLandmarks().find(
      (lm) => lm.name === landmarkName
    );
    if (existing) {
      resolvedLandmarkId = existing.id;
    } else {
      // 自動建立新地標
      const newLandmark = db.createLandmark({
        name: landmarkName,
        description: "",
        lat: coords[1],  // coords 是 [lng, lat]
        lng: coords[0],
        category: "poi",
      });
      resolvedLandmarkId = newLandmark.id;
    }
  }

  if (!resolvedLandmarkId) {
    return NextResponse.json(
      { error: "Must provide landmarkId or landmarkName" },
      { status: 400 }
    );
  }

  const post = db.createPost({
    landmarkId: resolvedLandmarkId,
    authorId,
    coords: coords as [number, number],
    img: img ?? "",
    text,
    tags: tags ?? [],
  });

  return NextResponse.json(post, { status: 201 });
}
