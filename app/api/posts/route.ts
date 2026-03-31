import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/posts — 取得所有貼文（可用 ?landmarkId= 篩選）
export async function GET(request: NextRequest) {
  const landmarkId = request.nextUrl.searchParams.get("landmarkId");
  const posts = db.getPosts(landmarkId ?? undefined);
  return NextResponse.json(posts);
}

// POST /api/posts — 新增貼文
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { landmarkId, authorId, coords, img, text, tags } = body;

  if (!landmarkId || !authorId || !text) {
    return NextResponse.json(
      { error: "Missing required fields: landmarkId, authorId, text" },
      { status: 400 }
    );
  }

  if (!db.getLandmark(landmarkId)) {
    return NextResponse.json({ error: "Landmark not found" }, { status: 404 });
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

  const landmark = db.getLandmark(landmarkId)!;
  const post = db.createPost({
    landmarkId,
    authorId,
    coords: coords ?? [landmark.lng, landmark.lat],
    img: img ?? "",
    text,
    tags: tags ?? [],
  });

  return NextResponse.json(post, { status: 201 });
}
