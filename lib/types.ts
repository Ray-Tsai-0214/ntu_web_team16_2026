// OMG (Odd Map Gossip) — 資料型別定義
// 對應 OMG_blueprint.md 中的 Data Models

/** 反應類型（Threads 風格） */
export type ReactionType = "hilarious" | "wtf" | "nice" | "doubt" | "boring";

/** 反應權重對照 */
export const REACTION_WEIGHTS: Record<ReactionType, number> = {
  hilarious: 1.5, // 😂
  wtf: 1.2,       // 🤯
  nice: 1.0,      // 👍
  doubt: 0,       // 🤔
  boring: -1.0,   // 👎
};

/** 貼文標籤 */
export type PostTag =
  | "funny" | "food" | "weird" | "animal"
  | "service" | "spooky" | "urban-legend" | "campus";

/** 使用者等級門檻 */
export const LEVEL_THRESHOLDS = [0, 51, 151, 301] as const;

// ─── 資料模型 ───

export interface User {
  id: string;
  displayName: string;
  avatarEmoji: string;
  level: number;         // 1-4
  totalPoints: number;
  dailyPostsUsed: number;
  maxDailyPosts: number; // 2 (default) → 5 (unlocked)
  streakDays: number;
  joinedAt: string;      // ISO 8601
}

export interface Landmark {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  category: string;
  createdAt: string;
}

export interface Post {
  id: string;
  landmarkId: string;
  authorId: string;
  content: string;
  imageUrl: string | null;
  tags: PostTag[];
  createdAt: string;
  heatScore: number;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
}
