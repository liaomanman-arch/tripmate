import { useState, useRef, useCallback } from "react";

// ─── DESIGN TOKENS (matching screenshot: white cards, orange accent, light grey bg) ───
const C = {
  bg: "#F2F4F7",
  card: "#FFFFFF",
  orange: "#FF6B2B",
  orangeLight: "#FFF0EA",
  blue: "#4A7CFF",
  blueLight: "#EEF3FF",
  green: "#2DC76D",
  greenLight: "#E8FAF1",
  yellow: "#FFB800",
  yellowLight: "#FFF8E0",
  ink: "#1A1D23",
  sub: "#8A8FA3",
  border: "#ECEEF2",
  red: "#FF4444",
};

const TABS = [
  { key: "home", label: "首页", icon: "🏠" },
  { key: "records", label: "纪录", icon: "📋" },
  { key: "scan", label: "扫描", icon: "📷" },
  { key: "stats", label: "统计", icon: "📊" },
  { key: "settings", label: "设定", icon: "⚙️" },
];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const TRIP = {
  name: "日本中部北陆之旅",
  todayJPY: 2820, todayCNY: 131, todayNTD: 581,
  totalJPY: 90300, totalNTD: 18602,
  budgetPct: 16,
  day: 25, totalDays: 25,
  currency: "JPY",
};

const MEMBERS = [
  { id: 1, name: "小雨", emoji: "👩‍🦱", color: C.orange, paid: 45200, share: 30100 },
  { id: 2, name: "阿明", emoji: "👨‍🦳", color: C.blue, paid: 28600, share: 30100 },
  { id: 3, name: "Tony", emoji: "🧑‍🦰", color: C.green, paid: 16500, share: 30100 },
];

const RECORDS = [
  { id: 1, title: "咖啡、麵包", category: "餐饮", method: "现金", store: "Lawson", amount: 420, ntd: 87, member: MEMBERS[0], day: "Day25", time: "08:12", lang: "日语" },
  { id: 2, title: "温泉入浴券", category: "门票", method: "Suica", store: "加賀温泉郷", amount: 1800, ntd: 371, member: MEMBERS[1], day: "Day24", time: "14:30", lang: "日语" },
  { id: 3, title: "金沢カレー", category: "餐饮", method: "现金", store: "ゴーゴーカレー", amount: 950, ntd: 196, member: MEMBERS[0], day: "Day24", time: "12:05", lang: "日语" },
  { id: 4, title: "新干线票", category: "交通", method: "IC卡", store: "JR東海", amount: 5610, ntd: 1156, member: MEMBERS[2], day: "Day23", time: "09:00", lang: "日语" },
  { id: 5, title: "药妆购物", category: "购物", method: "现金", store: "マツモトキヨシ", amount: 3240, ntd: 668, member: MEMBERS[0], day: "Day22", time: "16:40", lang: "日语" },
];

const CAT_COLORS = { 餐饮: C.orange, 购物: C.blue, 门票: C.yellow, 交通: C.green, 住宿: "#9B59B6", 咖啡: "#E67E22" };
const CAT_ICONS = { 餐饮: "🍜", 购物: "🛍️", 门票: "🎟️", 交通: "🚄", 住宿: "🏨", 咖啡: "☕" };

const DAILY = [1200, 3400, 2800, 5600, 4200, 7800, 3100, 2900, 4500, 6200, 3800, 2100, 4900, 5300, 3700, 2820];
const CAT_STATS = [
  { name: "餐饮", pct: 35, amount: 31605 },
  { name: "交通", pct: 25, amount: 22575 },
  { name: "住宿", pct: 20, amount: 18060 },
  { name: "购物", pct: 12, amount: 10836 },
  { name: "门票", pct: 8, amount: 7224 },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card, borderRadius: 18, padding: 18,
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}>{children}</div>
  );
}

function Tag({ label, color, bg }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color: color || C.orange,
      background: bg || C.orangeLight, borderRadius: 8,
      padding: "3px 8px", display: "inline-block",
    }}>{label}</span>
  );
}

function MemberDot({ member, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: member.color + "22",
      border: `2.5px solid ${member.color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.48, flexShrink: 0,
    }}>{member.emoji}</div>
  );
}

function ProgressBar({ pct, color, height = 7 }) {
  return (
    <div style={{ background: C.border, borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{
        width: `${Math.min(pct, 100)}%`, height: "100%",
        background: color || C.green, borderRadius: 99,
        transition: "width 0.6s ease",
      }} />
    </div>
  );
}

function SectionTitle({ children, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{children}</span>
      {action && <span onClick={onAction} style={{ fontSize: 13, color: C.orange, fontWeight: 600, cursor: "pointer" }}>{action}</span>}
    </div>
  );
}

// ─── PHOTO STACK (hero) ───────────────────────────────────────────────────────
function PhotoStack() {
  const photos = ["🗻", "⛩️", "🦀"];
  const rotations = [-8, 0, 8];
  const colors = ["#FFD0B5", "#B5D8FF", "#B5FFD0"];
  return (
    <div style={{ height: 170, position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end", marginBottom: 4 }}>
      {photos.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 110, height: 140,
          background: colors[i],
          borderRadius: 18,
          boxShadow: "0 6px 24px rgba(0,0,0,0.13)",
          transform: `rotate(${rotations[i]}deg) translateX(${(i - 1) * 52}px)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 48,
          zIndex: i === 1 ? 3 : i === 0 ? 1 : 2,
          border: "3px solid #fff",
        }}>{p}</div>
      ))}
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({ onTabChange }) {
  return (
    <div style={{ padding: "16px 16px 90px" }}>
      {/* Hero photo stack */}
      <PhotoStack />
      <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, color: C.ink, margin: "12px 0 20px" }}>
        {TRIP.name}
      </h2>

      {/* 4 stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {/* Today */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ background: C.orangeLight, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💰</div>
            <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>今日支出</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, letterSpacing: -1 }}>¥{TRIP.todayJPY.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>≈ NT${TRIP.todayNTD}</div>
        </Card>

        {/* Total */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ background: C.blueLight, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📊</div>
            <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>旅程累计</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, letterSpacing: -1 }}>¥{TRIP.totalJPY.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>≈ NT${TRIP.totalNTD.toLocaleString()}</div>
        </Card>

        {/* Budget */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ background: C.greenLight, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎯</div>
            <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>预算进度（现金+Suica）</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.ink }}>{TRIP.budgetPct}%</div>
          <ProgressBar pct={TRIP.budgetPct} color={C.green} height={6} />
        </Card>

        {/* Day */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ background: C.yellowLight, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📅</div>
            <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>旅程天数</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.ink }}>Day {TRIP.day}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>共 {TRIP.totalDays} 天</div>
        </Card>
      </div>

      {/* Today's spending */}
      <SectionTitle action="查看全部" onAction={() => onTabChange("records")}>今日花费</SectionTitle>
      {RECORDS.slice(0, 2).map(r => (
        <Card key={r.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <MemberDot member={r.member} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>{r.title}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 5, alignItems: "center" }}>
                <Tag label={r.category} color={CAT_COLORS[r.category]} bg={CAT_COLORS[r.category] + "20"} />
                <Tag label={r.method} color={C.sub} bg={C.border} />
                <Tag label={`▪ ${r.store}`} color={C.sub} bg={C.border} />
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.ink }}>¥{r.amount.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: C.sub }}>NT${r.ntd}</div>
            </div>
          </div>
        </Card>
      ))}

      {/* Members */}
      <SectionTitle style={{ marginTop: 8 }}>旅伴</SectionTitle>
      <Card>
        {MEMBERS.map((m, i) => (
          <div key={m.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            paddingBottom: i < MEMBERS.length - 1 ? 14 : 0,
            marginBottom: i < MEMBERS.length - 1 ? 14 : 0,
            borderBottom: i < MEMBERS.length - 1 ? `1px solid ${C.border}` : "none",
          }}>
            <MemberDot member={m} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: C.sub }}>已付 ¥{m.paid.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {m.paid > m.share
                ? <Tag label={`收回 ¥${(m.paid - m.share).toLocaleString()}`} color={C.green} bg={C.greenLight} />
                : <Tag label={`补 ¥${(m.share - m.paid).toLocaleString()}`} color={C.red} bg="#FFEEEE" />
              }
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── RECORDS SCREEN ───────────────────────────────────────────────────────────
function RecordsScreen() {
  const [filter, setFilter] = useState("全部");
  const cats = ["全部", ...Object.keys(CAT_COLORS)];
  const list = filter === "全部" ? RECORDS : RECORDS.filter(r => r.category === filter);

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      {/* Summary */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {[
          { v: `¥${TRIP.totalJPY.toLocaleString()}`, l: "旅程合计", c: C.orange, bg: C.orangeLight },
          { v: `${RECORDS.length}笔`, l: "记录", c: C.blue, bg: C.blueLight },
          { v: `¥${Math.round(TRIP.totalJPY / 3).toLocaleString()}`, l: "人均", c: C.green, bg: C.greenLight },
        ].map(s => (
          <div key={s.l} style={{ flex: 1, background: s.bg, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 14, scrollbarWidth: "none" }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            background: filter === c ? C.orange : C.card,
            color: filter === c ? "#fff" : C.sub,
            border: `1.5px solid ${filter === c ? C.orange : C.border}`,
            borderRadius: 20, padding: "6px 16px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
          }}>{c}</button>
        ))}
      </div>

      {list.map(r => (
        <Card key={r.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              background: (CAT_COLORS[r.category] || C.orange) + "20",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}>{CAT_ICONS[r.category] || "💳"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>{r.store}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                <Tag label={r.category} color={CAT_COLORS[r.category]} bg={CAT_COLORS[r.category] + "20"} />
                <Tag label={r.method} color={C.sub} bg={C.border} />
                <Tag label={r.lang} color={C.blue} bg={C.blueLight} />
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.ink }}>¥{r.amount.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: C.sub }}>NT${r.ntd}</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{r.member.emoji} {r.time}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── SCAN SCREEN (REAL GEMINI AI) ─────────────────────────────────────────────
function ScanScreen() {
  const [apiKey, setApiKey] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | loading | result | done | error
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [payer, setPayer] = useState(MEMBERS[0]);
  const [imagePreview, setImagePreview] = useState(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const fileRef = useRef();

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!apiKey.trim()) { setShowKeyInput(true); return; }

    // Preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target.result.split(",")[1];
      const mime = file.type;
      setImagePreview(e.target.result);
      setPhase("loading");
      setErrMsg("");

      try {
        const prompt = `你是一个旅行记账助手。请分析这张收据图片（可能是日语、韩语、法语、英语等），提取信息并以JSON格式返回。

只返回JSON，不要其他文字：
{
  "storeName": "店名（翻译成中文）",
  "storeNameOriginal": "原文店名",
  "totalAmount": 数字,
  "currency": "货币代码如JPY/KRW/EUR/USD",
  "cnyEstimate": 人民币估算数字,
  "ntdEstimate": 台币估算数字,
  "tax": "税额说明",
  "language": "识别到的语言",
  "category": "餐饮/购物/交通/门票/住宿/咖啡 中选一",
  "items": [{"name":"品项中文名","price":"价格"}],
  "date": "日期如2025-03-15或unknown"
}`;

        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: mime, data: b64 } },
                ],
              }],
              generationConfig: { temperature: 0.1 },
            }),
          }
        );

        if (!resp.ok) {
          const err = await resp.json();
          throw new Error(err?.error?.message || `HTTP ${resp.status}`);
        }

        const data = await resp.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setResult(parsed);
        setPhase("result");
      } catch (err) {
        setErrMsg(err.message || "识别失败，请重试");
        setPhase("error");
      }
    };
    reader.readAsDataURL(file);
  }, [apiKey]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  if (phase === "done") return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", minHeight: 500, justifyContent: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, marginBottom: 8 }}>入账成功！</div>
      <div style={{ fontSize: 14, color: C.sub, marginBottom: 28 }}>
        ¥{result?.totalAmount?.toLocaleString()} {result?.currency} · {result?.category}
      </div>
      <button onClick={() => { setPhase("idle"); setResult(null); setImagePreview(null); }} style={{
        background: C.orange, color: "#fff", border: "none",
        borderRadius: 16, padding: "14px 40px", fontSize: 16, fontWeight: 700, cursor: "pointer",
      }}>继续扫描</button>
    </div>
  );

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      {/* API Key setup */}
      <Card style={{ marginBottom: 16, background: showKeyInput ? C.orangeLight : C.card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>🔑 Gemini API Key</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
              {apiKey ? "✅ 已配置" : "点击输入 Key 后即可扫描"}
            </div>
          </div>
          <button onClick={() => setShowKeyInput(!showKeyInput)} style={{
            background: C.orange, color: "#fff", border: "none",
            borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>{showKeyInput ? "收起" : "设置"}</button>
        </div>
        {showKeyInput && (
          <input
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="粘贴你的 Gemini API Key (AIza...)"
            type="password"
            style={{
              width: "100%", marginTop: 12, border: `1.5px solid ${C.border}`,
              borderRadius: 10, padding: "10px 12px", fontSize: 13,
              outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        )}
      </Card>

      {/* Upload zone */}
      {phase === "idle" || phase === "error" ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2.5px dashed ${C.orange}60`,
            borderRadius: 22, height: 220, background: C.orangeLight,
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", cursor: "pointer", marginBottom: 16,
            transition: "all 0.2s",
          }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📷</div>
          <div style={{ fontWeight: 700, color: C.ink, fontSize: 16 }}>点击上传 / 拍摄收据</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>支持 日 · 韩 · 法 · 英 · 德 多语种</div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : phase === "loading" ? (
        <Card style={{ height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 16, background: "#1A1D23" }}>
          {imagePreview && <img src={imagePreview} style={{ position: "absolute", opacity: 0.15, width: "100%", height: "100%", objectFit: "cover", borderRadius: 18 }} />}
          <div style={{ fontSize: 42, marginBottom: 14, animation: "spin 1s linear infinite" }}>🔍</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Gemini AI 识别中…</div>
          <div style={{ color: C.sub, fontSize: 13, marginTop: 6 }}>正在解析收据内容并翻译</div>
          <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
        </Card>
      ) : null}

      {phase === "error" && (
        <Card style={{ background: "#FFF0F0", marginBottom: 16 }}>
          <div style={{ color: C.red, fontWeight: 700, fontSize: 14 }}>❌ 识别失败</div>
          <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>{errMsg}</div>
        </Card>
      )}

      {/* Result */}
      {phase === "result" && result && (
        <>
          <Card style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <Tag label={`🤖 ${result.language} 识别完成`} color={C.green} bg={C.greenLight} />
                <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginTop: 8 }}>{result.storeName}</div>
                <div style={{ fontSize: 12, color: C.sub }}>{result.storeNameOriginal}</div>
              </div>
              <Tag label={result.category} color={CAT_COLORS[result.category] || C.orange} bg={(CAT_COLORS[result.category] || C.orange) + "20"} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, background: C.orangeLight, borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>{result.totalAmount?.toLocaleString()} {result.currency}</div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>原价</div>
              </div>
              <div style={{ flex: 1, background: C.blueLight, borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>NT${result.ntdEstimate}</div>
                <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>约台币</div>
              </div>
            </div>
            {result.tax && <div style={{ fontSize: 12, color: C.sub, marginTop: 10 }}>🧾 {result.tax}</div>}
          </Card>

          {result.items?.length > 0 && (
            <Card style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 14, marginBottom: 10 }}>消费明细</div>
              {result.items.map((item, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "9px 0", borderBottom: i < result.items.length - 1 ? `1px solid ${C.border}` : "none",
                  fontSize: 14,
                }}>
                  <span style={{ color: C.ink }}>{item.name}</span>
                  <span style={{ color: C.sub, fontWeight: 600 }}>{item.price}</span>
                </div>
              ))}
            </Card>
          )}

          <Card style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: C.ink, fontSize: 14, marginBottom: 12 }}>代付人</div>
            <div style={{ display: "flex", gap: 10 }}>
              {MEMBERS.map(m => (
                <button key={m.id} onClick={() => setPayer(m)} style={{
                  flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  background: payer.id === m.id ? m.color + "18" : C.bg,
                  border: `2px solid ${payer.id === m.id ? m.color : C.border}`,
                  borderRadius: 14, padding: "10px 6px", cursor: "pointer",
                }}>
                  <span style={{ fontSize: 22 }}>{m.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{m.name}</span>
                </button>
              ))}
            </div>
          </Card>

          <button onClick={() => setPhase("done")} style={{
            width: "100%", background: C.orange, color: "#fff",
            border: "none", borderRadius: 16, padding: "18px",
            fontSize: 17, fontWeight: 800, cursor: "pointer",
            boxShadow: `0 6px 20px ${C.orange}60`,
          }}>确认入账</button>
        </>
      )}

      {/* Lang badges */}
      {phase === "idle" && (
        <Card>
          <div style={{ fontWeight: 700, color: C.ink, fontSize: 14, marginBottom: 10 }}>AI 支持识别</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["🇯🇵 日语", "🇰🇷 韩语", "🇫🇷 法语", "🇺🇸 英语", "🇩🇪 德语", "🇮🇹 意大利语", "🇹🇭 泰语", "🇹🇼 繁中"].map(l => (
              <Tag key={l} label={l} color={C.blue} bg={C.blueLight} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── STATS SCREEN ─────────────────────────────────────────────────────────────
function StatsScreen() {
  const maxDay = Math.max(...DAILY);
  return (
    <div style={{ padding: "16px 16px 90px" }}>
      {/* Daily bar chart */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>每日花费趋势（¥JPY）</SectionTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 110 }}>
          {DAILY.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ fontSize: 9, color: C.sub, writingMode: "vertical-rl", display: v > 5000 ? "block" : "none" }}>
                {(v / 1000).toFixed(1)}k
              </div>
              <div style={{
                width: "100%", borderRadius: "4px 4px 0 0",
                background: i === DAILY.length - 1 ? C.orange : C.orange + "55",
                height: Math.max((v / maxDay) * 85, 6),
                transition: "height 0.4s ease",
              }} />
              <div style={{ fontSize: 9, color: C.sub }}>D{i + 1}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Category breakdown */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>消费类别占比</SectionTitle>
        {CAT_STATS.map(s => (
          <div key={s.name} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>
                {CAT_ICONS[s.name]} {s.name}
              </span>
              <span style={{ fontSize: 13, color: C.sub }}>¥{s.amount.toLocaleString()} · {s.pct}%</span>
            </div>
            <ProgressBar pct={s.pct} color={CAT_COLORS[s.name]} />
          </div>
        ))}
      </Card>

      {/* AA Settlement */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>AA 结算</SectionTitle>
        <div style={{ background: C.orangeLight, borderRadius: 12, padding: 12, marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.sub }}>人均应付</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: C.orange }}>¥{Math.round(TRIP.totalJPY / 3).toLocaleString()}</div>
        </div>
        {[
          { from: MEMBERS[1], to: MEMBERS[0], amount: 1500 },
          { from: MEMBERS[2], to: MEMBERS[0], amount: 13600 },
        ].map((t, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 0", borderBottom: i === 0 ? `1px solid ${C.border}` : "none",
          }}>
            <MemberDot member={t.from} size={36} />
            <div style={{ flex: 1, fontSize: 13, color: C.sub }}>
              <span style={{ fontWeight: 700, color: C.ink }}>{t.from.name}</span> 转给 <span style={{ fontWeight: 700, color: C.ink }}>{t.to.name}</span>
            </div>
            <Tag label={`¥${t.amount.toLocaleString()}`} color={C.green} bg={C.greenLight} />
          </div>
        ))}
        <button style={{
          width: "100%", marginTop: 14, background: C.greenLight, color: C.green,
          border: `1.5px solid ${C.green}40`, borderRadius: 12,
          padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>📤 生成结算截图分享</button>
      </Card>

      {/* Member breakdown */}
      <Card>
        <SectionTitle>人均明细</SectionTitle>
        {MEMBERS.map((m, i) => (
          <div key={m.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 0", borderBottom: i < MEMBERS.length - 1 ? `1px solid ${C.border}` : "none",
          }}>
            <MemberDot member={m} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>{m.name}</div>
              <ProgressBar pct={(m.paid / TRIP.totalJPY) * 100} color={m.color} height={5} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>¥{m.paid.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: C.sub }}>{Math.round((m.paid / TRIP.totalJPY) * 100)}%</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── SETTINGS SCREEN ──────────────────────────────────────────────────────────
function SettingsScreen() {
  const [notionKey, setNotionKey] = useState("");
  const [currency, setCurrency] = useState("JPY");
  const [syncOn, setSyncOn] = useState(false);

  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, color: C.ink, fontSize: 15, marginBottom: 14 }}>🗂 Notion 同步</div>
        <input value={notionKey} onChange={e => setNotionKey(e.target.value)}
          placeholder="Notion Integration Token" type="password"
          style={{ width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 10, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, color: C.ink }}>自动同步</span>
          <div onClick={() => setSyncOn(!syncOn)} style={{
            width: 50, height: 28, borderRadius: 99, cursor: "pointer",
            background: syncOn ? C.green : C.border,
            position: "relative", transition: "background 0.2s",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", background: "#fff",
              position: "absolute", top: 3, left: syncOn ? 25 : 3,
              transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }} />
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, color: C.ink, fontSize: 15, marginBottom: 14 }}>💱 货币设置</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["JPY", "KRW", "EUR", "USD", "THB"].map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={{
              background: currency === c ? C.orange : C.bg,
              color: currency === c ? "#fff" : C.ink,
              border: `1.5px solid ${currency === c ? C.orange : C.border}`,
              borderRadius: 10, padding: "8px 18px", fontSize: 13,
              fontWeight: 700, cursor: "pointer",
            }}>{c}</button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 800, color: C.ink, fontSize: 15, marginBottom: 14 }}>👥 搭子群管理</div>
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>
            {/* Simple QR grid */}
            <div style={{ display: "inline-grid", gridTemplateColumns: "repeat(6,14px)", gap: 2, background: C.ink, padding: 8, borderRadius: 10 }}>
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: 2, background: [0,1,5,6,7,11,12,13,14,18,19,23,24,29,30,35].includes(i) ? "#fff" : C.orange }} />
              ))}
            </div>
          </div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 8 }}>扫码加入旅行团</div>
        </div>
        <button style={{
          width: "100%", background: C.ink, color: "#fff",
          border: "none", borderRadius: 12, padding: "13px",
          fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 8,
        }}>📲 碰一碰加好友（NFC）</button>
      </Card>

      <Card>
        <div style={{ fontWeight: 800, color: C.ink, fontSize: 15, marginBottom: 14 }}>📤 导出数据</div>
        {[
          { label: "导出 Excel 报销单", icon: "📊" },
          { label: "导出 PDF 账单", icon: "📄" },
          { label: "分享攻略（含消费）", icon: "🗺️" },
        ].map((btn, i) => (
          <button key={i} style={{
            width: "100%", background: C.bg, color: C.ink,
            border: `1.5px solid ${C.border}`, borderRadius: 12,
            padding: "13px", fontSize: 14, fontWeight: 700,
            cursor: "pointer", marginBottom: 8, textAlign: "left",
          }}>{btn.icon} {btn.label}</button>
        ))}
      </Card>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function TripMateV2() {
  const [tab, setTab] = useState("home");

  const screens = {
    home: <HomeScreen onTabChange={setTab} />,
    records: <RecordsScreen />,
    scan: <ScanScreen />,
    stats: <StatsScreen />,
    settings: <SettingsScreen />,
  };

  const titles = { home: "旅行记账", records: "消费纪录", scan: "扫描收据", stats: "统计分析", settings: "设定" };
  const subtitles = { home: "日本中部北陆之旅", records: "全程明细", scan: "Gemini AI 智能识别", stats: "数据可视化", settings: "同步与导出" };

  return (
    <div style={{
      maxWidth: 390, margin: "0 auto", minHeight: "100vh",
      background: C.bg,
      fontFamily: "-apple-system, 'PingFang SC', 'SF Pro Display', sans-serif",
      position: "relative",
    }}>
      {/* Status bar */}
      <div style={{ background: C.card, padding: "14px 20px 0", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 14 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.ink, letterSpacing: -0.5 }}>{titles[tab]}</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{subtitles[tab]}</div>
          </div>
          <div style={{
            background: C.greenLight, borderRadius: 20, padding: "5px 12px",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>Notion 同步</span>
          </div>
        </div>
      </div>

      {/* Screen content */}
      <div style={{ paddingTop: 4 }}>
        {screens[tab]}
      </div>

      {/* Bottom tab bar */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 390,
        background: C.card, borderTop: `1px solid ${C.border}`,
        display: "flex", padding: "8px 0 22px",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
      }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, background: "none", border: "none",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            cursor: "pointer", padding: "4px 0",
          }}>
            {t.key === "scan" ? (
              <div style={{
                width: 52, height: 52, borderRadius: 16, marginTop: -20,
                background: tab === t.key ? C.orange : C.ink,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, boxShadow: `0 4px 16px ${C.orange}60`,
                border: "3px solid #fff",
              }}>{t.icon}</div>
            ) : (
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: tab === t.key ? C.orange : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: tab === t.key ? 22 : 20,
              }}>{t.icon}</div>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, color: tab === t.key ? C.orange : C.sub }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
