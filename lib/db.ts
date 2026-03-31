// In-memory 資料庫 + NTU 校園種子資料
// 伺服器重啟後資料會重置，未來可替換為 Neon Postgres

import { User, Landmark, Post, Reaction } from "./types";

// ─── 種子資料：5 個 NTU 校園地標 ───

const seedLandmarks: Landmark[] = [
  {
    id: "lm-001",
    name: "醉月湖",
    description: "台大校園內的湖泊，傳說夜晚會有奇怪的聲音",
    lat: 25.0183,
    lng: 121.5365,
    category: "nature",
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "lm-002",
    name: "椰林大道",
    description: "台大最具代表性的道路，兩旁種滿椰子樹",
    lat: 25.0174,
    lng: 121.5398,
    category: "landmark",
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "lm-003",
    name: "總圖書館",
    description: "台大主要圖書館，期末考期間 24 小時開放",
    lat: 25.0170,
    lng: 121.5406,
    category: "building",
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "lm-004",
    name: "小福樓",
    description: "學生餐廳和便利商店集中地，午餐時間人潮洶湧",
    lat: 25.0165,
    lng: 121.5370,
    category: "food",
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "lm-005",
    name: "舟山路",
    description: "連接校園南北的道路，有很多流浪貓出沒",
    lat: 25.0148,
    lng: 121.5412,
    category: "street",
    createdAt: "2026-03-01T00:00:00Z",
  },
];

const seedUsers: User[] = [
  {
    id: "user-001",
    displayName: "探險企鵝",
    avatarEmoji: "🐧",
    level: 2,
    totalPoints: 85,
    dailyPostsUsed: 1,
    maxDailyPosts: 2,
    streakDays: 5,
    joinedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "user-002",
    displayName: "椰林貓貓",
    avatarEmoji: "🐱",
    level: 1,
    totalPoints: 30,
    dailyPostsUsed: 0,
    maxDailyPosts: 2,
    streakDays: 2,
    joinedAt: "2026-03-05T00:00:00Z",
  },
];

const seedPosts: Post[] = [
  {
    id: "post-001",
    landmarkId: "lm-001",
    authorId: "user-001",
    content: "半夜經過醉月湖聽到怪聲，結果是青蛙在開演唱會 🐸🎤",
    imageUrl: null,
    tags: ["funny", "campus"],
    createdAt: "2026-03-10T22:30:00Z",
    heatScore: 8.5,
  },
  {
    id: "post-002",
    landmarkId: "lm-005",
    authorId: "user-002",
    content: "舟山路的橘貓今天居然讓我摸了！牠平常超兇的",
    imageUrl: null,
    tags: ["animal", "campus"],
    createdAt: "2026-03-12T14:20:00Z",
    heatScore: 12.3,
  },
  {
    id: "post-003",
    landmarkId: "lm-004",
    authorId: "user-001",
    content: "小福的雞排漲價了 5 塊，這是什麼通膨地獄",
    imageUrl: null,
    tags: ["food", "funny"],
    createdAt: "2026-03-15T12:05:00Z",
    heatScore: 5.2,
  },
];

const seedReactions: Reaction[] = [
  { id: "react-001", postId: "post-001", userId: "user-002", type: "hilarious", createdAt: "2026-03-10T23:00:00Z" },
  { id: "react-002", postId: "post-002", userId: "user-001", type: "nice", createdAt: "2026-03-12T15:00:00Z" },
  { id: "react-003", postId: "post-003", userId: "user-002", type: "wtf", createdAt: "2026-03-15T12:30:00Z" },
];

// ─── In-Memory Store ───

class Database {
  users: User[] = [...seedUsers];
  landmarks: Landmark[] = [...seedLandmarks];
  posts: Post[] = [...seedPosts];
  reactions: Reaction[] = [...seedReactions];

  private nextId(prefix: string, arr: { id: string }[]): string {
    const num = arr.length + 1;
    return `${prefix}-${String(num).padStart(3, "0")}`;
  }

  // Users
  getUsers() { return this.users; }
  getUser(id: string) { return this.users.find((u) => u.id === id); }
  createUser(data: Omit<User, "id" | "joinedAt" | "level" | "totalPoints" | "dailyPostsUsed" | "maxDailyPosts" | "streakDays">) {
    const user: User = {
      ...data,
      id: this.nextId("user", this.users),
      level: 1,
      totalPoints: 0,
      dailyPostsUsed: 0,
      maxDailyPosts: 2,
      streakDays: 0,
      joinedAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  // Landmarks
  getLandmarks() { return this.landmarks; }
  getLandmark(id: string) { return this.landmarks.find((l) => l.id === id); }
  createLandmark(data: Omit<Landmark, "id" | "createdAt">) {
    const landmark: Landmark = {
      ...data,
      id: this.nextId("lm", this.landmarks),
      createdAt: new Date().toISOString(),
    };
    this.landmarks.push(landmark);
    return landmark;
  }

  // Posts
  getPosts(landmarkId?: string) {
    if (landmarkId) return this.posts.filter((p) => p.landmarkId === landmarkId);
    return this.posts;
  }
  getPost(id: string) { return this.posts.find((p) => p.id === id); }
  createPost(data: Omit<Post, "id" | "createdAt" | "heatScore">) {
    const post: Post = {
      ...data,
      id: this.nextId("post", this.posts),
      createdAt: new Date().toISOString(),
      heatScore: 0,
    };
    this.posts.push(post);
    return post;
  }

  // Reactions
  getReactions(postId: string) {
    return this.reactions.filter((r) => r.postId === postId);
  }
  createReaction(data: Omit<Reaction, "id" | "createdAt">) {
    // 同一使用者對同一貼文只能有一個反應
    const existing = this.reactions.findIndex(
      (r) => r.postId === data.postId && r.userId === data.userId
    );
    if (existing !== -1) {
      this.reactions[existing] = { ...this.reactions[existing], type: data.type };
      return this.reactions[existing];
    }
    const reaction: Reaction = {
      ...data,
      id: this.nextId("react", this.reactions),
      createdAt: new Date().toISOString(),
    };
    this.reactions.push(reaction);
    return reaction;
  }

  // 附近地標查詢（Haversine 公式，單位：公尺）
  getNearbyLandmarks(lat: number, lng: number, radiusMeters: number = 200) {
    return this.landmarks.filter((lm) => {
      const dist = haversine(lat, lng, lm.lat, lm.lng);
      return dist <= radiusMeters;
    });
  }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // 地球半徑（公尺）
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Singleton — 整個 server 共用同一個 instance
export const db = new Database();
