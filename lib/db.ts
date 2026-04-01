// In-memory 資料庫 + 種子資料
// 使用 globalThis 確保 HMR / warm instance 間資料不遺失

import { User, Landmark, Post, Reaction, PostTag, ReactionType } from "./types";

// ─── 種子地標（NTU 校園，含德田館等） ───

const seedLandmarks: Landmark[] = [
  { id: "lm-001", name: "醉月湖", description: "台大校園內的湖泊", lat: 25.0183, lng: 121.5365, category: "nature" },
  { id: "lm-002", name: "椰林大道", description: "台大最具代表性的道路", lat: 25.0174, lng: 121.5398, category: "landmark" },
  { id: "lm-003", name: "總圖書館", description: "台大主要圖書館", lat: 25.0170, lng: 121.5406, category: "building" },
  { id: "lm-004", name: "小福樓", description: "學生餐廳集中地", lat: 25.0165, lng: 121.5370, category: "food" },
  { id: "lm-005", name: "舟山路", description: "流浪貓出沒的道路", lat: 25.0148, lng: 121.5412, category: "street" },
  { id: "lm-006", name: "德田館", description: "資工系館，24小時有人在debug", lat: 25.0217, lng: 121.5413, category: "building" },
  { id: "lm-007", name: "博雅教學館", description: "大型階梯教室", lat: 25.0180, lng: 121.5380, category: "building" },
  { id: "lm-008", name: "新生教學館", description: "通識課聚集地", lat: 25.0195, lng: 121.5345, category: "building" },
  { id: "lm-009", name: "鹿鳴堂", description: "校園活動與展演空間", lat: 25.0160, lng: 121.5388, category: "landmark" },
  { id: "lm-010", name: "活大 (學生活動中心)", description: "社團辦公室與餐廳", lat: 25.0158, lng: 121.5398, category: "building" },
  { id: "lm-011", name: "台大正門", description: "羅斯福路上的校門", lat: 25.0149, lng: 121.5334, category: "landmark" },
  { id: "lm-012", name: "共同教學館", description: "大一大二必修課教室", lat: 25.0190, lng: 121.5400, category: "building" },
  { id: "lm-013", name: "台大體育館", description: "體育課與校隊訓練場地", lat: 25.0210, lng: 121.5355, category: "building" },
  { id: "lm-014", name: "水源校區", description: "研究生宿舍區", lat: 25.0130, lng: 121.5340, category: "landmark" },
  { id: "lm-015", name: "公館夜市", description: "台大旁的知名夜市", lat: 25.0115, lng: 121.5340, category: "food" },
];

const seedUsers: User[] = [
  {
    id: "user-001", displayName: "StorySeeker99", avatarEmoji: "🐧",
    level: 3, totalPoints: 450, postCount: 42, reactionCount: 891,
    dailyPostsUsed: 0, maxDailyPosts: 5, joinedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "user-002", displayName: "椰林貓貓", avatarEmoji: "🐱",
    level: 1, totalPoints: 30, postCount: 5, reactionCount: 12,
    dailyPostsUsed: 0, maxDailyPosts: 5, joinedAt: "2026-03-05T00:00:00Z",
  },
];

// 種子貼文 — coords 使用對應地標的真實座標
const seedPosts: Post[] = [
  { id: 1, landmarkId: "lm-005", authorId: "user-001", coords: [121.5412, 25.0148], img: "assets/cat.jpg", text: "他不答應跟我交換身體，差評", date: "2023.10.27", tags: ["funny", "animal"], likes: 5, saves: 2 },
  { id: 2, landmarkId: "lm-002", authorId: "user-002", coords: [121.5398, 25.0174], img: "assets/map.jpg", text: "是誰在這裡迷路了?是我", date: "2023.10.28", tags: ["funny", "campus"], likes: 12, saves: 8 },
  { id: 3, landmarkId: "lm-004", authorId: "user-001", coords: [121.5370, 25.0165], img: "assets/eat.jpg", text: "沒有鳳梨，一點都不道地", date: "2023.10.29", tags: ["food", "weird"], likes: 20, saves: 1 },
];

const seedReactions: Reaction[] = [
  { id: "react-001", postId: 1, userId: "user-002", type: "hilarious" },
  { id: "react-002", postId: 2, userId: "user-001", type: "nice" },
  { id: "react-003", postId: 3, userId: "user-002", type: "wtf" },
];

// ─── In-Memory Store ───

class Database {
  users: User[] = [...seedUsers];
  landmarks: Landmark[] = [...seedLandmarks];
  posts: Post[] = [...seedPosts];
  reactions: Reaction[] = [...seedReactions];
  private postIdCounter = seedPosts.length;

  getUsers() { return this.users; }
  getUser(id: string) { return this.users.find((u) => u.id === id); }
  createUser(data: Pick<User, "displayName" | "avatarEmoji">) {
    const user: User = {
      ...data,
      id: `user-${String(this.users.length + 1).padStart(3, "0")}`,
      level: 1, totalPoints: 0, postCount: 0, reactionCount: 0,
      dailyPostsUsed: 0, maxDailyPosts: 5, joinedAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  getLandmarks() { return this.landmarks; }
  getLandmark(id: string) { return this.landmarks.find((l) => l.id === id); }

  createLandmark(data: Omit<Landmark, "id">) {
    const landmark: Landmark = {
      ...data,
      id: `lm-${String(this.landmarks.length + 1).padStart(3, "0")}`,
    };
    this.landmarks.push(landmark);
    return landmark;
  }

  getNearbyLandmarks(lat: number, lng: number, radiusMeters: number = 200) {
    return this.landmarks
      .map((lm) => ({ ...lm, distance: haversine(lat, lng, lm.lat, lm.lng) }))
      .filter((lm) => lm.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }

  getPosts(landmarkId?: string) {
    if (landmarkId) return this.posts.filter((p) => p.landmarkId === landmarkId);
    return this.posts;
  }
  getPostsByAuthor(authorId: string) {
    return this.posts.filter((p) => p.authorId === authorId);
  }
  getPost(id: number) { return this.posts.find((p) => p.id === id); }

  createPost(data: { landmarkId: string; authorId: string; coords: [number, number]; img: string; text: string; tags: PostTag[] }) {
    this.postIdCounter++;
    const now = new Date();
    const post: Post = {
      ...data,
      id: this.postIdCounter,
      date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`,
      likes: 0, saves: 0,
    };
    this.posts.push(post);
    const author = this.getUser(data.authorId);
    if (author) {
      author.dailyPostsUsed += 1;
      author.postCount += 1;
      author.totalPoints += 2;
    }
    return post;
  }

  getReactions(postId: number) { return this.reactions.filter((r) => r.postId === postId); }
  getReactionCounts(postId: number) {
    const reactions = this.getReactions(postId);
    return {
      hilarious: reactions.filter((r) => r.type === "hilarious").length,
      wtf: reactions.filter((r) => r.type === "wtf").length,
      nice: reactions.filter((r) => r.type === "nice").length,
      doubt: reactions.filter((r) => r.type === "doubt").length,
      boring: reactions.filter((r) => r.type === "boring").length,
    };
  }
  createReaction(data: { postId: number; userId: string; type: ReactionType }) {
    const existing = this.reactions.findIndex(
      (r) => r.postId === data.postId && r.userId === data.userId
    );
    if (existing !== -1) {
      this.reactions[existing] = { ...this.reactions[existing], type: data.type };
      return this.reactions[existing];
    }
    const reaction: Reaction = {
      ...data,
      id: `react-${String(this.reactions.length + 1).padStart(3, "0")}`,
    };
    this.reactions.push(reaction);
    const post = this.getPost(data.postId);
    if (post && ["hilarious", "wtf", "nice"].includes(data.type)) {
      post.likes += 1;
    }
    return reaction;
  }

  toggleLike(postId: number) {
    const post = this.getPost(postId);
    if (!post) return null;
    post.likes += 1;
    return post;
  }
  toggleSave(postId: number) {
    const post = this.getPost(postId);
    if (!post) return null;
    post.saves += 1;
    return post;
  }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// globalThis singleton — 跨 HMR / warm instance 保持資料
const globalDb = globalThis as typeof globalThis & { __omgDb?: Database };
if (!globalDb.__omgDb) {
  globalDb.__omgDb = new Database();
}
export const db: Database = globalDb.__omgDb;
