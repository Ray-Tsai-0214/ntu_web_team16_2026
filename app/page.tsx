export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
        🗺️ OMG 奇聞地圖 API
      </h1>
      <p style={{ marginBottom: "2rem", color: "var(--textLight)" }}>
        Odd Map Gossip — NTU Web Team 16 後端服務
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          📍 Landmarks 地標
        </h2>
        <ul>
          <li><code>GET /api/landmarks</code> — 取得所有地標</li>
          <li><code>GET /api/landmarks?lat=25.017&amp;lng=121.539&amp;radius=200</code> — 附近查詢</li>
          <li><code>GET /api/landmarks/:id</code> — 取得地標 + 該地標貼文</li>
          <li><code>POST /api/landmarks</code> — 新增地標</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          📝 Posts 貼文
        </h2>
        <ul>
          <li><code>GET /api/posts</code> — 取得所有貼文</li>
          <li><code>GET /api/posts?landmarkId=lm-001</code> — 依地標篩選</li>
          <li><code>GET /api/posts/:id</code> — 取得貼文 + 反應統計</li>
          <li><code>POST /api/posts</code> — 發佈貼文（檢查每日上限）</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          😂 Reactions 反應
        </h2>
        <ul>
          <li><code>GET /api/posts/:id/reactions</code> — 取得貼文的所有反應</li>
          <li><code>POST /api/posts/:id/reactions</code> — 新增/更新反應</li>
          <li>五種類型：hilarious 😂 | wtf 🤯 | nice 👍 | doubt 🤔 | boring 👎</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
          👤 Users 使用者
        </h2>
        <ul>
          <li><code>GET /api/users</code> — 取得所有使用者</li>
          <li><code>GET /api/users/:id</code> — 取得使用者 + 統計</li>
          <li><code>POST /api/users</code> — 註冊新使用者</li>
          <li><code>PUT /api/users/:id</code> — 更新使用者資料</li>
        </ul>
      </section>

      <hr style={{ margin: "2rem 0", border: "none", borderTop: "1px solid var(--mutedBrown)" }} />

      <p style={{ color: "var(--textLight)", fontSize: "0.9rem" }}>
        前端原型：<a href="/frontend/home.html">首頁</a>{" · "}
        <a href="/frontend/profile.html">個人頁</a>{" · "}
        <a href="/frontend/upload.html">發文頁</a>
      </p>
    </main>
  );
}
