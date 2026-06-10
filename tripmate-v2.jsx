// ─── 浏览器原生 UMD 适配（用全局对象解构，代替 import 语法） ───
const { useState, useRef, useCallback } = React;

// ─── DESIGN TOKENS ───
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

// ─── MOCK DATA ───
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

// ─── SHARED COMPONENTS ───
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

function SectionTitle({ children, action, onAction, style }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, ...style }}>
      <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>{children}</span>
      {action && <span onClick={onAction} style={{ fontSize: 13, color: C.orange, fontWeight: 600, cursor: "pointer" }}>{action}</span>}
    </div>
  );
}

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

// ─── SCREENS ───
function HomeScreen({ onTabChange }) {
  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <PhotoStack />
      <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 800, color: C.ink, margin: "12px 0 20px" }}>
        {TRIP.name}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ background: C.orangeLight, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💰</div>
            <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>今日支出</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, letterSpacing: -1 }}>¥{TRIP.todayJPY.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>≈ NT${TRIP.todayNTD}</div>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ background: C.blueLight, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📊</div>
            <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>旅程累计</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, letterSpacing: -1 }}>¥{TRIP.totalJPY.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>≈ NT${TRIP.totalNTD.toLocaleString()}</div>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ background: C.greenLight, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎯</div>
            <span style={{ fontSize: 11, color: C.sub, fontWeight: 600 }}>预算进度（现金+Suica）</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.ink }}>{TRIP.budgetPct}%</div>
          <ProgressBar pct={TRIP.budgetPct} color={C.green} height={6} />
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ background: C.yellowLight, borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📅</div>
            <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>旅程天数</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: C.ink }}>Day {TRIP.day}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 3 }}>共 {TRIP.totalDays} 天</div>
        </Card>
      </div>

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

      <SectionTitle style={{ marginTop: 18 }}>旅伴</SectionTitle>
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

function RecordsScreen() {
  const [filter, setFilter] = useState("全部");
  const cats = ["全部", ...Object.keys(CAT_COLORS)];
  const list = filter === "全部" ? RECORDS : RECORDS.filter(r => r.category === filter);

  return (
    <div style={{ padding: "16px 16px 90px" }}>
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

function ScanScreen() {
  const [apiKey, setApiKey] = useState("");
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [payer, setPayer] = useState(MEMBERS[0]);
  const [imagePreview, setImagePreview] = useState(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const fileRef = useRef();

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!apiKey.trim()) { setShowKeyInput(true); return; }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const b64 = e.target.result.split(",")[1];
      const mime = file.type;
      setImagePreview(e.target.result);
      setPhase("loading");
      setErrMsg("");

      try {
        const prompt = `你是一个旅行记账助手。请分析这张收据图片（可能是日语、韩语、法语、英语等），提取信息并以JSON格式返回。只返回JSON，不要其他文字...`;
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
        const clean = text.replace(/```json|
```/g, "").trim();
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
      <Card style="{{" marginBottom: 16, background: showKeyInput ? C.orangeLight : C.card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: C.ink, fontSize: 14 }}>🔑 Gemini API Key</div>
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{apiKey ? "✅ 已配置" : "点击输入 Key 后即可扫描"}</div>
          </div>
          <button onClick={() => setShowKeyInput(!showKeyInput)} style={{
            background: C.orange, color: "#fff", border: "none",
            borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>{showKeyInput ? "收起" : "设置"}</button>
        </div>
        {showKeyInput && (
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="粘贴你的 Gemini API Key (AIza...)" type="password" style={{ width: "100%", marginTop: 12, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        )}
      </Card>

      {(phase === "idle" || phase === "error") ? (
        <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} onClick={() => fileRef.current?.click()} style={{ border: `2.5px dashed ${C.orange}60`, borderRadius: 22, height: 220, background: C.orangeLight, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 16 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📷</div>
          <div style={{ fontWeight: 700, color: C.ink, fontSize: 16 }}>点击上传 / 拍摄收据</div>
          <div style={{ fontSize: 13, color: C.sub, marginTop: 6 }}>支持 多语种 AI 智能解析</div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : phase === "loading" ? (
        <Card style="{{" height: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: marginBottom: 16, background: "#1A1D23", position: "relative" }}>
          {imagePreview && <img src={imagePreview} style={{ position: "absolute", opacity: 0.15, width: "100%", height: "100%", objectFit: "cover", borderRadius: 18 }} />}
          <div style={{ fontSize: 42, marginBottom: 14, animation: "spin 1s linear infinite" }}>🔍</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Gemini AI 识别中…</div>
          <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
        </Card>
      ) : null}

      {phase === "error" && (
        <Card style="{{" background: "#FFF0F0", marginBottom: 16 }}><div style={{ color: C.red, fontWeight: 700, fontSize: 14 }}>❌ 识别失败</div><div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>{errMsg}</div></Card>
      )}

      {phase === "result" && result && (
        <>
          <Card style="{{" marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <Tag label="{`🤖" ${result.language} 识别完成`} color="{C.green}" bg="{C.greenLight}"/>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.ink, marginTop: 8 }}>{result.storeName}</div>
              </div>
              <Tag label="{result.category}" color="{CAT_COLORS[result.category]" || C.orange} bg="{(CAT_COLORS[result.category]" C.orange) + "20"}/>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1, background: C.orangeLight, borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.orange }}>{result.totalAmount} {result.currency}</div>
              </div>
              <div style={{ flex: 1, background: C.blueLight, borderRadius: 12, padding: 12, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: C.blue }}>NT${result.ntdEstimate}</div>
              </div>
            </div>
          </Card>
          <button onClick={() => setPhase("done")} style={{ width: "100%", background: C.orange, color: "#fff", border: "none", borderRadius: 16, padding: "18px", fontSize: 17, fontWeight: 800, cursor: "pointer" }}>确认入账</button>
        </>
      )}
    </div>
  );
}

function StatsScreen() {
  const maxDay = Math.max(...DAILY);
  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <Card style="{{" marginBottom: 16 }}>
        <SectionTitle>每日花费趋势（¥JPY）</SectionTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 110 }}>
          {DAILY.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: i === DAILY.length - 1 ? C.orange : C.orange + "55", height: Math.max((v / maxDay) * 85, 6) }} />
              <div style={{ fontSize: 9, color: C.sub }}>D{i + 1}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card style="{{" marginBottom: 16 }}>
        <SectionTitle>消费类别占比</SectionTitle>
        {CAT_STATS.map(s => (
          <div key={s.name} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{CAT_ICONS[s.name]} {s.name}</span>
              <span style={{ fontSize: 13, color: C.sub }}>¥{s.amount.toLocaleString()} · {s.pct}%</span>
            </div>
            <ProgressBar pct="{s.pct}" color="{CAT_COLORS[s.name]}"/>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div style={{ padding: "16px 16px 90px" }}>
      <Card><div style={{ fontWeight: 800, color: C.ink, fontSize: 15 }}>⚙️ 设定面板</div><div style={{ color: C.sub, fontSize: 13, marginTop: 6 }}>应用运行成功，数据本地沙盒隔离。</div></Card>
    </div>
  );
}

// ─── 核心：主骨架路由与全局状态总控组件 ───
function TripMateV2() {
  const [activeTab, setActiveTab] = useState("home");

  // 根据当前选择的 Tab 渲染对应屏幕
  const renderScreen = () => {
    switch (activeTab) {
      case "home":     return <HomeScreen onTabChange="{setActiveTab}"/>;
      case "records":  return <RecordsScreen/>;
      case "scan":     return <ScanScreen/>;
      case "stats":    return <StatsScreen/>;
      case "settings": return <SettingsScreen/>;
      default:         return <HomeScreen onTabChange="{setActiveTab}"/>;
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      
      
      {renderScreen()}

      
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${C.border}`,
        display: "flex", justifyContent: "space-around",
        padding: "10px 0 calc(10px + env(safe-area-inset-bottom))",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.03)", zIndex: 999
      }}>
        {TABS.map(t => {
          const isSel = activeTab === t.key;
          return (
            <div key={t.key} onClick={() => setActiveTab(t.key)} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              cursor: "pointer", opacity: isSel ? 1 : 0.45, transition: "opacity 0.2s"
            }}>
              <span style={{ fontSize: 22, marginBottom: 2 }}>{t.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: isSel ? C.orange : C.ink }}>{t.label}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
