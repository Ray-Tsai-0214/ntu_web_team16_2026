// Converters between Supabase row shapes (snake_case) and API/frontend shapes (camelCase).
// Keeping this in one place makes the API surface stable even if columns get renamed.

export interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  avatar_emoji: string;
  level: number;
  total_points: number;
  post_count: number;
  reaction_count: number;
  daily_posts_used: number;
  max_daily_posts: number;
  joined_at: string;
}

export interface PostRow {
  id: number;
  landmark_id: string;
  author_id: string;
  coords_lng: number;
  coords_lat: number;
  img: string;
  body: string;
  tags: string[];
  likes: number;
  saves: number;
  created_at: string;
}

export interface LandmarkRow {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  category: string;
}

export function toApiProfile(p: ProfileRow) {
  return {
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    avatarEmoji: p.avatar_emoji,
    level: p.level,
    totalPoints: p.total_points,
    postCount: p.post_count,
    reactionCount: p.reaction_count,
    dailyPostsUsed: p.daily_posts_used,
    maxDailyPosts: p.max_daily_posts,
    joinedAt: p.joined_at,
  };
}

export function toApiPost(p: PostRow) {
  const d = new Date(p.created_at);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  return {
    id: p.id,
    landmarkId: p.landmark_id,
    authorId: p.author_id,
    coords: [p.coords_lng, p.coords_lat] as [number, number],
    img: p.img,
    text: p.body,
    date,
    tags: p.tags,
    likes: p.likes,
    saves: p.saves,
  };
}

export function toApiLandmark(l: LandmarkRow) {
  return {
    id: l.id,
    name: l.name,
    description: l.description ?? "",
    lat: l.lat,
    lng: l.lng,
    category: l.category,
  };
}

export interface PetRow {
  pet_id: string;
  user_id: string;
  name: string;
  species: string;
  stage: string;
  level: number;
  exp: number;
  hunger: number;
  cleanliness: number;
  mood: number;
  health: number;
  favorability: number;
  skin: string;
  outfit: string;
  accessory: unknown;
  expression: string;
  current_action: string;
  last_feed_time: string | null;
  last_clean_time: string | null;
  affinity: unknown;
  coins: number;
  inventory: unknown;
  created_at: string;
  updated_at: string;
}

export function toApiPet(p: PetRow) {
  return {
    petId: p.pet_id,
    userId: p.user_id,
    name: p.name,
    species: p.species,
    stage: p.stage,
    level: p.level,
    exp: p.exp,
    hunger: p.hunger,
    cleanliness: p.cleanliness,
    mood: p.mood,
    health: p.health,
    favorability: p.favorability,
    skin: p.skin,
    outfit: p.outfit,
    accessory: p.accessory,
    expression: p.expression,
    currentAction: p.current_action,
    lastFeedTime: p.last_feed_time,
    lastCleanTime: p.last_clean_time,
    affinity: p.affinity,
    coins: p.coins,
    inventory: p.inventory,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

/** Haversine distance in metres between two lat/lng pairs. */
export function haversineMetres(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
