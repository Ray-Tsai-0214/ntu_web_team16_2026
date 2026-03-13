# OMG - Odd Map Gossip

## App Overview
A mobile-first map-based web application where users walk around, discover nearby landmarks, and collect/share interesting real-world stories and anecdotes ("gossip"). Inspired by Pikmin Bloom's walking mechanics and Nomad Table's location-based community. Users have pet companions and earn rewards for contributing high-quality content.

---

## Page Structure (based on wireframe)

### Page 1: Home Page (Map View)
- **Full-screen interactive map** as the main interface
- **Red pin markers** showing landmarks with stories nearby
- **User's current location** indicator with 200m radius circle
- **Bottom navigation bar** with 3 tabs:
  - Left: User Profile (person icon)
  - Center: Map/Home (globe icon)
  - Right: Pet (pet icon)
- **Tap a pin** → navigates to Landmark Detail Page
- **Floating action button** → navigate to Upload Page (post at current location)

### Page 2: Landmark Detail Page
- **Header**: Landmark name + pet characters decorating the top
- **Heart/like counter** with animated reaction bar
- **Story feed**: scrollable list of user-submitted gossip posts
  - Each post shows: author avatar, content, reactions, timestamp
  - Reaction buttons (Threads-style): laugh / wtf / like / doubt / boring
- **Comment thread** on each post (nested replies)
- **Sort options**: Hot (trending) / New / Top rated

### Page 3: Upload Page (post at current location)
- **Photo/image area** (optional) with camera icon to take photo or upload
- **Attach to**: auto-detect nearest landmark, or create user landmark (if Lv.4+)
- **Submit button** → publish to the landmark's story board
- **Daily post counter**: "2/2 remaining today"

### Page 4: Edit Page (compose post)
- **Pet avatar preview** at top (your pet helps you write!)
- **Rich text input** area for the story/anecdote
- **Image attachment** option
- **Tag selector**: #food #spooky #funny #weird #service #animal etc.
- **Keyboard area** at bottom
- **Character limit**: 300 characters per post

### Page 5: User Profile Page
- **Pet avatar** (left) + **Name / ID / Level badge** (right)
- **Stats section**: achievements (成就)
- **Two tab buttons**:
  - 收藏 (Saved/Bookmarked posts)
  - 保齡 (Collection history / posts collected while walking)
- **Post feed**: user's own published stories
- **Bottom navigation** (same as home page)

### Page 6: Pet Page
- **Large pet display** (cute penguin-like character, centered)
- **Pet name and level**
- **Pet status bars** (happiness, experience, etc.)
- **Customization options** (unlockable outfits/accessories)
- **Pet evolution stages** based on user activity

---

## Core Mechanics

### Content Quality Control System
| Rule | Detail |
|------|--------|
| Daily post limit | Base: 2 posts/day |
| Unlock +1 post | Accumulate 10 total likes |
| Unlock +2 posts | Accumulate 50 total likes |
| Bonus post | Single post hits 20 likes (viral) → +1 same day |
| Streak bonus | 7-day posting streak with avg rating > 3.5 → permanent +1 |

### User Level System
| Level | Title | Points | Perks |
|-------|-------|--------|-------|
| Lv.1 | Passerby (路人) | 0-30 | 2 posts/day, text only |
| Lv.2 | Storyteller (說書人) | 31-100 | 3 posts/day, can attach images |
| Lv.3 | Anecdote Hunter (軼事獵人) | 101-300 | 4 posts/day, posts can be pinned |
| Lv.4 | Urban Legend (都市傳說) | 301+ | 5 posts/day, can create new landmarks |

### Point System
| Action | Points |
|--------|--------|
| Publish a post | +2 |
| Receive a like/reaction | +1 |
| Post gets bookmarked | +3 |
| Viral post (20+ likes) | +10 |
| Reported & confirmed | -20 |
| Receive dislike | -1 (max -3 per post) |

### Reaction System (Threads-inspired)
| Emoji | Meaning | Weight |
|-------|---------|--------|
| laughing | Hilarious | 1.5x |
| shocked | WTF / Unbelievable | 1.2x |
| thumbs up | Nice | 1.0x |
| thinking | Suspicious / Doubt | 0x |
| thumbs down | Boring | -1.0x |

### Trending Score Formula
```
heat_score = (positive_reactions - negative_reactions) / (hours_since_post + 2) ^ 1.5
```

### Location Mechanics
| Range | Action |
|-------|--------|
| Within 200m | Unlock landmark story board, can browse & post |
| Within 50m | "Deep explore" - see hidden posts (low-like easter eggs) |
| Daily quest | Visit 3 different landmarks → +5 bonus points |

### Landmark Types
- Official Landmark: mapped to real Google Maps places
- User Landmark: created by Lv.4+ users at any coordinate
- Hotspot: auto-generated when an area gets 10+ posts in 24hrs

---

## Tech Stack (Google AI Studio Build)

### Frontend
- React (default in AI Studio Build)
- Map library: Leaflet.js + OpenStreetMap (free) or Google Maps JS API
- Mobile-first responsive design
- PWA support for home screen install

### Backend
- Node.js (AI Studio Build default)
- Express.js API routes

### Database
- Firebase Firestore
  - Users collection
  - Landmarks collection (with GeoHash for geo-queries)
  - Posts collection
  - Reactions collection
  - Comments collection

### Authentication
- Google Sign-in (Firebase Auth, built-in with AI Studio)

### AI Integration (Gemini API)
- Content moderation on post submission
- Auto-tagging posts
- Future: crawled review filtering

---

## Data Model

### Users
```
{
  id: string,
  username: string,
  avatarUrl: string,
  level: number (1-4),
  points: number,
  dailyPostCount: number,
  maxDailyPosts: number,
  streakDays: number,
  petId: string,
  createdAt: timestamp
}
```

### Landmarks
```
{
  id: string,
  name: string,
  type: "official" | "user" | "hotspot",
  lat: number,
  lng: number,
  geoHash: string,
  googlePlaceId: string | null,
  createdBy: string | null,
  postCount: number,
  createdAt: timestamp
}
```

### Posts
```
{
  id: string,
  authorId: string,
  landmarkId: string,
  content: string (max 300 chars),
  imageUrl: string | null,
  tags: string[],
  reactions: {
    laugh: number,
    wtf: number,
    like: number,
    doubt: number,
    boring: number
  },
  heatScore: number,
  isHidden: boolean (easter egg posts),
  createdAt: timestamp
}
```

### Reactions
```
{
  userId: string,
  postId: string,
  type: "laugh" | "wtf" | "like" | "doubt" | "boring",
  createdAt: timestamp
}
```

### Comments
```
{
  id: string,
  postId: string,
  authorId: string,
  parentCommentId: string | null,
  content: string,
  createdAt: timestamp
}
```

### Pets
```
{
  id: string,
  ownerId: string,
  name: string,
  species: string,
  level: number,
  experience: number,
  appearance: string (evolution stage),
  accessories: string[],
  createdAt: timestamp
}
```

---

## Google AI Studio Build Prompt

Below is the initial prompt to paste into Google AI Studio Build mode:

---

```
Build a mobile-first map-based web app called "OMG - Odd Map Gossip".

## Core Concept
Users walk around in the real world, discover nearby landmarks on a map, and collect/share funny real-world stories and anecdotes. Think Pikmin Bloom meets Reddit, but location-based.

## Tech Requirements
- React frontend, Node.js backend
- Firebase Firestore database with GeoHash for location queries
- Firebase Authentication with Google Sign-in
- Leaflet.js with OpenStreetMap tiles for the map (free, no API key needed)
- Mobile-first design (iPhone SE width as minimum: 375px)
- Use a playful, rounded UI style with soft colors (pastel blue, white, light yellow accents)

## Pages & Navigation

### Bottom Tab Bar (persistent on all pages)
3 tabs with icons:
- Left: User Profile (person icon)
- Center: Home/Map (globe icon) - this is the default page
- Right: Pet (paw icon)

### Page 1: Home Page (Map View) - default landing page
- Full-screen Leaflet map showing user's current location (use browser Geolocation API)
- Show a translucent blue circle (200m radius) around user's position
- Red pin markers on the map representing landmarks that have stories
- Tapping a pin opens the Landmark Detail Page
- Floating "+" button (bottom-right, above tab bar) to create a new post at current location
- For demo purposes: seed 5-8 fake landmarks around Taipei (NTU campus area, coordinates around 25.0174, 121.5398) with sample gossip posts

### Page 2: Landmark Detail Page (overlay/modal or new route)
- Header: landmark name, distance from user
- Heart counter showing total positive reactions
- Scrollable feed of gossip posts at this landmark, sorted by heat score
- Each post card shows:
  - Author avatar + username + level badge
  - Post content text (max 300 chars)
  - Optional image
  - Tags as colored pills
  - Row of 5 reaction buttons: 😂 Hilarious (laugh), 🤯 WTF (wtf), 👍 Nice (like), 🤔 Doubt (doubt), 👎 Boring (boring)
  - Reaction counts displayed
  - Timestamp (relative: "2h ago", "3d ago")
  - "Reply" button to open comment thread
- Sort toggle: Hot / New / Top
- Comments section under each post (nested thread style like Threads app)

### Page 3: Create Post Page (opened from "+" button)
- Auto-detects nearest landmark within 200m, or lets user name a new spot
- Text input area (max 300 characters) with character counter
- Optional image upload (camera icon button)
- Tag selector: predefined tags like #funny #spooky #food #service #animal #weird #urban-legend
- "Daily posts remaining: X/Y" indicator at top
- Submit button
- Pet avatar shown as a small companion in the corner (decorative)

### Page 4: User Profile Page
- Top section: pet avatar (left) + username, user ID, level badge (right)
- Stats row: total points, total posts, total reactions received
- Two toggle tabs:
  - "My Posts" - feed of user's own published posts
  - "Saved" - bookmarked/collected posts
- Each post card same format as in Landmark Detail

### Page 5: Pet Page
- Large centered display of the user's pet character (a cute round penguin-like creature)
- Pet name (editable) and level
- Experience bar
- Simple evolution: 3 stages based on level (baby → teen → adult), visually change the pet SVG/image
- List of unlocked accessories (future feature, show placeholder)

## Database Structure (Firestore)

Collections:
1. `users` - id mod, username, avatarUrl, level(1-4), points, dailyPostCount, maxDailyPosts(default 2), streakDays, petId, createdAt
2. `landmarks` - id, name, type(official/user/hotspot), lat, lng, geoHash, googlePlaceId(nullable), createdBy(nullable), postCount, createdAt
3. `posts` - id, authorId, landmarkId, content(max 300), imageUrl(nullable), tags[], reactions{laugh,wtf,like,doubt,boring}, heatScore, isHidden(bool), createdAt
4. `reactions` - uniqueId mod, userId, postId, type(laugh/wtf/like/doubt/boring), createdAt (enforce one reaction per user per post)
5. `comments` - id, postId, authorId, parentCommentId(nullable for nested threads), content, createdAt
6. `pets` - id, ownerId, name, species, level, experience, appearance(stage), accessories[], createdAt

## Business Logic (implement in server-side code)

### Daily Post Limit
- Default: 2 posts per day
- Check before allowing post creation
- Reset daily at midnight (store lastResetDate on user doc)

### Point System
- On post creation: author +2 points
- On receiving a reaction: author +1 point (laugh/wtf/like only, not doubt/boring)
- On post bookmarked: author +3 points
- On post reaching 20+ likes: author +10 bonus points
- On confirmed report: author -20 points

### Level Calculation
- Lv.1 (0-30 pts): 2 posts/day, text only
- Lv.2 (31-100 pts): 3 posts/day, can attach images
- Lv.3 (101-300 pts): 4 posts/day
- Lv.4 (301+ pts): 5 posts/day, can create new landmarks
- Update level automatically when points change

### Heat Score
- Recalculate periodically: (positive - negative) / (hours_since_post + 2)^1.5
- positive = laugh*1.5 + wtf*1.2 + like*1.0
- negative = boring * 1.0

### Location Check
- Before showing landmark content or allowing posts: verify user is within 200m using Haversine formula
- For demo/testing: add a toggle to disable distance check

## Seed Data
Pre-populate the database with these landmarks and sample posts around NTU Taipei:
1. "台大總圖書館" (25.0174, 121.5398) - 3 sample funny posts
2. "台大小福" (25.0165, 121.5335) - 2 sample posts
3. "公館夜市入口" (25.0130, 121.5340) - 3 sample posts
4. "台大醉月湖" (25.0195, 121.5380) - 2 sample posts
5. "溫州街巷弄" (25.0225, 121.5310) - 2 sample posts

Sample post content should be funny, quirky one-star-review style stories in Traditional Chinese (zh-TW).

## UI Style
- Playful and rounded (border-radius: 16px on cards)
- Primary color: #4A90D9 (soft blue)
- Accent: #FFD93D (warm yellow)
- Background: #F8F9FA (light gray)
- Card background: white
- Text: #2D3436 (dark gray)
- Reaction buttons with emoji + count, highlight when user has reacted
- Smooth page transitions
- Bottom tab bar: white background with subtle shadow, active tab highlighted in primary color
```

---

## Development Phases

### Phase 1 - MVP (Google AI Studio Build)
- [x] Map view with landmarks
- [x] Post creation & viewing
- [x] Reaction system
- [x] Google Sign-in
- [x] Basic daily post limit
- [x] User profile page

### Phase 2 - Enhancement (still in AI Studio or export to local)
- [ ] Comment threads (nested replies)
- [ ] Bookmark/save posts
- [ ] Level system with perks
- [ ] Heat score sorting
- [ ] Pet page (basic display + naming)

### Phase 3 - Advanced (export to local development)
- [ ] Pet evolution system
- [ ] Real GPS walking detection
- [ ] Crawled review integration + Gemini filtering
- [ ] Push notifications (PWA)
- [ ] Content moderation via Gemini API
- [ ] User reporting system
