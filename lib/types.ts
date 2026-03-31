// OMG (Odd Map Gossip) — 資料型別定義
// 對應前端 JS 的資料結構 + OMG_blueprint.md

/** 反應類型（Threads 風格） */
export type ReactionType = "hilarious" | "wtf" | "nice" | "doubt" | "boring";

/** 反應 Emoji 對照 */
export const REACTION_EMOJI: Record<ReactionType, string> = {
  hilarious: "😂",
  wtf: "🤯",
  nice: "👍",
  doubt: "🤔",
  boring: "👎",
};

/** 貼文標籤 */
export type PostTag =
  | "funny" | "food" | "weird" | "animal"
  | "service" | "spooky" | "urban-legend" | "campus";

// ─── 資料模型（對齊前端 JS 格式） ───

export interface User {
  id: string;
  displayName: string;
  avatarEmoji: string;
  level: number;
  totalPoints: number;
  postCount: number;
  reactionCount: number;
  dailyPostsUsed: number;
  maxDailyPosts: number;
  joinedAt: string;
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  category: string;
}

/** 貼文 — 對齊前端 home.js 的 postsData 格式 */
export interface Post {
  id: number;
  landmarkId: string;
  authorId: string;
  coords: [number, number];  // [lng, lat] — Mapbox 格式
  img: string;                // 圖片路徑
  text: string;               // 貼文內容
  date: string;               // 顯示用日期 "2023.10.27"
  tags: PostTag[];
  likes: number;
  saves: number;
}

export interface Reaction {
  id: string;
  postId: number;
  userId: string;
  type: ReactionType;
}
