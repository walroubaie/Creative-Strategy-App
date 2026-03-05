import React, { useState, useRef, useEffect, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STAGES = [
  { id: 1, name: "Brand Audit",          icon: "01", tag: "Examine before you prescribe",       color: "#d4a853" },
  { id: 2, name: "Market Research",      icon: "02", tag: "Know the battlefield",                color: "#c47c3e" },
  { id: 3, name: "Customer Research",    icon: "03", tag: "Get inside their head",               color: "#9b5e8a" },
  { id: 4, name: "Strategic Foundation", icon: "04", tag: "Turn research into decisions",        color: "#4a7fa5" },
  { id: 5, name: "Creative Planning",    icon: "05", tag: "Build the architecture",              color: "#3d9e6a" },
  { id: 6, name: "Brief Writing",        icon: "06", tag: "Make it real for creators",           color: "#7a6eaa" },
  { id: 7, name: "Analysis Framework",   icon: "07", tag: "Turn results into intelligence",      color: "#c0574a" },
];

const STRATEGIST_SYSTEM = (brandContext) => `You are a senior creative strategist with 10+ years building paid creative strategy for DTC brands. You are sharp, direct, and push back hard on vague answers. You do not accept surface-level thinking. You have a reputation for being the person who asks the question nobody else asks.

You are running a live strategy session with a student creative strategist on this brand:

═══════════════════════════════
BRAND INTELLIGENCE
═══════════════════════════════
${brandContext}
═══════════════════════════════

YOUR FRAMEWORKS (use these actively):
- Eugene Schwartz: Life Force 8 (survival, food, freedom from pain, sex, comfort, superiority, care for loved ones, social approval) + Learned Wants 9
- 5 Levels of Awareness: Unaware → Problem Aware → Solution Aware → Product Aware → Most Aware
- Market Sophistication: First to market → Young → Established → Saturated → Commodity
- GBP Method: Gut (emotional 0-5s) → Brain A (product/proof) → Brain B (6 macro objections) → Pocket (CTA 3-7s)
- 6 Macro Objections: Time frame, Personal features, Effort required, Sophistication, Geolocation, History/track record
- Asset Triangle: Audience (largest) > Angle > Ad (shortest lifespan)
- Cara Hoyt's 10 Hook Formulas: Tribal Identity, Investment Hook, Why Did No One Tell Me, Problem-First, POV Hook, Emotional Trigger, Give Me Time, Founder Intro, Creator Partnership, Golden Nugget
- Alysha's Framework: Primary Organising Principle, Pain+Desire map, Aha Moment
- More/Better/New reactivation framework

YOUR RULES:
1. Ask ONE question at a time. Never two.
2. If their answer is vague ("women 25-45", "people who like natural beauty"), call it out directly and make them go deeper
3. If their answer is strong, validate it briefly and build on it  
4. Occasionally share your own read on the brand to provoke sharper thinking — but always make them commit to the answer
5. Keep responses under 180 words unless giving a stage-end summary
6. At the end of each stage, summarise what was decided in a tight block, then ask if they're ready to move on
7. Be human. Be a mentor. Be occasionally blunt. Don't be a bot.
8. When you produce a stage summary, format it clearly starting with "STAGE [N] COMPLETE ✓" so the document panel can capture it`;

const STAGE_OPENERS = [
`Alright. Stage 1 — Brand Audit.

Before strategy, examination. A doctor doesn't prescribe before examining the patient.

I've read everything I can find about this brand. Now I want to know what YOU see.

Look at their homepage, their ads, their social presence right now — not what they claim to be, but what the evidence actually shows.

What is the gap between the brand they *think* they are and the brand they *actually* are?`,

`Good. Stage 2 — the battlefield.

You can't find white space if you don't know what's crowded. 

Think beyond the obvious direct competitors. This brand has three layers of competition — direct, indirect, and aspirational.

What are they — and more importantly, what is the conversation that NO competitor in this space is currently having?`,

`Stage 3 — and this is the most important one.

Forget demographics. Forget "target audience." I want the human.

The person who finds this brand, buys it, and tells their friend about it. She has a specific Tuesday evening. She has a specific frustration. She uses specific words.

Picture her. Who is she and what does her relationship with this product category look like before she finds this brand?`,

`Stage 4. This is where we stop gathering and start deciding.

We have research. Now we make hard calls.

First decision — the hardest one: who is the ONE person this brand is talking to? Not a segment. Not a demographic. One human being with a name, an age, and a daily emotional reality.

Who is she? And how do you know she's the right choice?`,

`Stage 5 — strategy becomes creative.

You've got your core customer, your organising idea, your language bank.

Now I need THREE creative concept directions. Not formats, not hooks yet — concepts. The broad message territories that come directly out of your customer research clusters.

What are the three things this brand could be ABOUT in its ads? Walk me through the first one.`,

`Stage 6 — Brief Writing.

Strategy is worthless if the creator films the wrong thing.

You've got your winning concept. Now brief it.

Start with the Overview — one paragraph. Strategic purpose of this ad and who it's for. Not the product description. Why this ad EXISTS and what it needs to make the customer FEEL.

Write it.`,

`Final stage — Analysis.

Here's a real scenario: Phase One is done. 12 variations in market. Two weeks pass.

Your top concept has: Hook Rate 48% ✓, Hold Rate 19% ✗, CTR 1.1% ✗, CPA way above target.

Diagnose it. Walk me through the 5-link chain. What broke and what do you test next?`,
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function CreativeStrategyApp() {
  const [screen, setScreen] = useState("landing");
  const [brandUrl, setBrandUrl]     = useState("");
  const [brandContext, setBrandContext] = useState("");
  const [brandName, setBrandName]   = useState("");
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [currentStage, setCurrentStage] = useState(1);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showDoc, setShowDoc]       = useState(false);
  const [stageNotes, setStageNotes] = useState({});
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const inputWrapRef   = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const fetchBrand = async () => {
    if (!brandUrl.trim()) return;
    setFetchStatus("fetching");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `You are a brand intelligence analyst. You MUST use the web_search tool to look up real information about this brand before writing anything.

Search for: "${brandUrl.trim()}" and also search for the brand name + "reviews", "products", "about".

After searching, produce a brand intelligence brief covering:
- Brand name (real one from the site)
- Founder story (if visible)
- Core products with prices and review counts
- Key claims and differentiators
- Target audience signals from copy
- Visual/aesthetic identity
- What they say vs what the evidence shows
- Social channels mentioned
- Price positioning

Be analytical. Flag contradictions or gaps. Max 400 words. Start your response with the brand name in bold.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content
        ?.filter(b => b.type === "text")
        .map(b => b.text)
        .join("\n") || "";
      if (!text) throw new Error("No text response");
      const firstLine = text.split("\n")[0];
      const nameMatch = firstLine.match(/\*\*([^*]+)\*\*/) || firstLine.match(/^#\s*(.+)/);
      const extractedName = nameMatch ? nameMatch[1].trim() : brandUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0].split(".")[0];
      setBrandName(extractedName.charAt(0).toUpperCase() + extractedName.slice(1));
      setBrandContext(text);
      setFetchStatus("done");
    } catch {
      setFetchStatus("error");
    }
  };

  const useManualContext = () => {
    if (!brandContext.trim()) return;
    const firstLine = brandContext.split("\n")[0].replace(/[#*_]/g, "").trim();
    setBrandName(firstLine.split(" ")[0] || "Brand");
    setFetchStatus("done");
  };

  const startSession = () => {
    setScreen("session");
    setMessages([{
      role: "assistant",
      content: `Welcome. We're doing this properly.\n\nI've read the brand intelligence on ${brandName}. I have a point of view already — but I want to know what YOU see first.\n\nMy job: ask the questions that make you think harder than you want to. Your job: don't give me surface-level answers.\n\nAll 7 stages. I ask, you answer, we build the document together. When we're done you'll have a complete strategy ready for the client presentation.\n\nLet's go.\n\n──────────────────────\n\n${STAGE_OPENERS[0]}`
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: STRATEGIST_SYSTEM(brandContext) + `\n\nCURRENT STAGE: Stage ${currentStage} — ${STAGES[currentStage-1].name}\n\nSTAGE NOTES SO FAR:\n${Object.entries(stageNotes).map(([k,v])=>`Stage ${k}: ${v}`).join("\n") || "None yet."}`,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Connection issue — try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

      if (reply.includes("STAGE") && reply.includes("COMPLETE")) {
        setStageNotes(prev => ({ ...prev, [currentStage]: reply.substring(0, 300) }));
      }

      for (let s = currentStage + 1; s <= 7; s++) {
        if (reply.toLowerCase().includes(`stage ${s}`) && reply.toLowerCase().includes(STAGES[s-1].name.toLowerCase().split(" ")[0])) {
          setTimeout(() => setCurrentStage(s), 800);
          break;
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Check your network and try again." }]);
    }
    setLoading(false);
  };

  const jumpToStage = (s) => {
    if (s === currentStage) return;
    setCurrentStage(s);
    setMessages(prev => [...prev, {
      role: "assistant",
      content: `Moving to Stage ${s} — ${STAGES[s-1].name}.\n\n──────────────────────\n\n${STAGE_OPENERS[s-1]}`
    }]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (screen === "landing") return <Landing onStart={() => setScreen("setup")} />;

  if (screen === "setup") return (
    <Setup
      brandUrl={brandUrl}
      setBrandUrl={setBrandUrl}
      fetchStatus={fetchStatus}
      brandContext={brandContext}
      setBrandContext={setBrandContext}
      brandName={brandName}
      onFetch={(mode, text, name) => {
        if (mode === "manual") {
          setBrandContext(text);
          setBrandName(name || "Brand");
          setFetchStatus("done");
        } else {
          fetchBrand();
        }
      }}
      onStart={startSession}
      setBrandName={setBrandName}
      setFetchStatus={setFetchStatus}
    />
  );

  return (
    <div style={s.app}>
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.logoMark}>CS</div>
          <div>
            <div style={s.topbarTitle}>{brandName} — Strategy Session</div>
            <div style={s.topbarSub}>Stage {currentStage} of 7 · {STAGES[currentStage-1].name}</div>
          </div>
        </div>
        <div style={s.topbarRight}>
          {STAGES.map(st => (
            <button
              key={st.id}
              onClick={() => jumpToStage(st.id)}
              title={st.name}
              style={{
                ...s.stagePill,
                background: st.id === currentStage ? st.color + "22" : st.id < currentStage ? "#1e2e1e" : "#111",
                borderColor: st.id === currentStage ? st.color : st.id < currentStage ? "#2a4a2a" : "#222",
                color: st.id === currentStage ? st.color : st.id < currentStage ? "#4a8a4a" : "#333",
              }}
            >
              {st.id < currentStage ? "✓" : st.id}
            </button>
          ))}
          <div style={s.divider} />
          <button
            onClick={() => setShowDoc(d => !d)}
            style={{ ...s.docBtn, ...(showDoc ? s.docBtnActive : {}) }}
          >
            {showDoc ? "HIDE DOC" : "LIVE DOC"}
          </button>
        </div>
      </div>

      <div style={{ ...s.stageBanner, borderLeftColor: STAGES[currentStage-1].color }}>
        <span style={{ ...s.stageNum, color: STAGES[currentStage-1].color }}>
          STAGE {String(currentStage).padStart(2,"0")}
        </span>
        <span style={s.stageSep}>·</span>
        <span style={s.stageTag}>{STAGES[currentStage-1].tag.toUpperCase()}</span>
        {currentStage < 7 && (
          <button
            onClick={() => jumpToStage(currentStage + 1)}
            style={s.skipBtn}
            onMouseEnter={e => e.currentTarget.style.color = STAGES[currentStage-1].color}
            onMouseLeave={e => e.currentTarget.style.color = "#333"}
          >
            SKIP →
          </button>
        )}
      </div>

      <div style={s.body}>
        <div style={{ ...s.chat, maxWidth: showDoc ? "58%" : "100%" }}>
          <div style={s.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...s.msgRow, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{ ...s.avatar, background: m.role === "assistant" ? "linear-gradient(135deg,#d4a853,#8b5e3c)" : "#1a1a2a", border: m.role === "user" ? "1px solid #2a2a4a" : "none" }}>
                  {m.role === "assistant" ? "S" : "Y"}
                </div>
                <div style={{ ...s.bubble, ...(m.role === "user" ? s.bubbleUser : s.bubbleBot) }}>
                  {m.role === "assistant" && (
                    <div style={s.bubbleLabel}>SENIOR STRATEGIST</div>
                  )}
                  <div style={{ ...s.bubbleText, color: m.role === "assistant" ? "#1C1C1E" : "#444" }}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ ...s.msgRow, flexDirection: "row" }}>
                <div style={{ ...s.avatar, background: "linear-gradient(135deg,#d4a853,#8b5e3c)" }}>S</div>
                <div style={{ ...s.bubble, ...s.bubbleBot, padding: "14px 18px" }}>
                  <div style={s.dots}>
                    {[0,1,2].map(i => <span key={i} style={{ ...s.dot, animationDelay: `${i*0.2}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={s.inputArea}>
            <div ref={inputWrapRef} style={s.inputWrap}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Answer the question. Be specific — vague answers get pushed back on..."
                rows={1}
                style={s.textarea}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{ ...s.sendBtn, background: input.trim() && !loading ? "linear-gradient(135deg,#d4a853,#8b5e3c)" : "#1a1a22" }}
              >
                ↑
              </button>
            </div>
            <div style={s.inputHint}>Enter to send · Shift+Enter for new line</div>
          </div>
        </div>

        {showDoc && (
          <div style={s.docPanel}>
            <div style={s.docHeader}>
              <div>
                <div style={s.docLive}>● LIVE DOCUMENT</div>
                <div style={s.docTitle}>{brandName} Creative Strategy</div>
              </div>
            </div>
            <div style={s.docScroll}>
              {STAGES.map(st => (
                <div key={st.id} style={s.docStage}>
                  <div style={s.docStageHeader}>
                    <span style={{ ...s.docStageNum, color: st.id <= currentStage ? st.color : "#2a2a2a" }}>
                      {st.id < currentStage ? "✓" : st.icon}
                    </span>
                    <span style={{ ...s.docStageName, color: st.id <= currentStage ? "#aaa" : "#333" }}>
                      {st.name}
                    </span>
                  </div>
                  <div style={{ ...s.docStageBox, borderColor: st.id === currentStage ? st.color + "33" : "#1a1a22" }}>
                    {st.id < currentStage && stageNotes[st.id] ? (
                      <div style={{ ...s.docNote, color: "#666" }}>{stageNotes[st.id].slice(0, 200)}...</div>
                    ) : st.id < currentStage ? (
                      <div style={{ ...s.docNote, color: "#444", fontStyle: "italic" }}>Completed — content captured from conversation</div>
                    ) : st.id === currentStage ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={s.liveDot} />
                        <span style={{ ...s.docNote, color: "#555", fontStyle: "italic" }}>In progress...</span>
                      </div>
                    ) : (
                      <div style={{ ...s.docNote, color: "#222" }}>Not started</div>
                    )}
                  </div>
                </div>
              ))}

              <div style={s.docFuture}>
                <div style={s.docFutureLabel}>AFTER ALL 7 STAGES</div>
                {["→  Generate Client Presentation (.docx)", "→  Push complete strategy to Notion"].map(t => (
                  <div key={t} style={s.docFutureItem}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dotPulse {
          0%,100% { opacity:.2; transform:scale(.7); }
          50% { opacity:1; transform:scale(1); }
        }
        @keyframes liveBlink {
          0%,100% { opacity:.3; }
          50% { opacity:1; }
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#F7F3EE; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#F7F3EE; }
        ::-webkit-scrollbar-thumb { background:#d8cfc4; border-radius:2px; }
        textarea::placeholder { color:#bbb; }
        textarea { caret-color:#8b5e3c; }
      `}</style>
    </div>
  );
}

// ─── LANDING ──────────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  return (
    <div style={{ minHeight:"100vh", background:"#F7F3EE", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}>
      <div style={{ maxWidth:560, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:11, letterSpacing:8, color:"#5a4aaa", fontFamily:"monospace", textTransform:"uppercase", marginBottom:40 }}>
          Creative Strategy System
        </div>
        <h1 style={{ fontSize:58, color:"#1C1C1E", fontWeight:"normal", lineHeight:1.1, marginBottom:20 }}>
          The Strategy<br />Session
        </h1>
        <p style={{ color:"#666", fontSize:17, lineHeight:1.8, marginBottom:48, maxWidth:420, margin:"0 auto 48px" }}>
          Paste any brand URL. Work through all 7 stages with a senior creative strategist who pushes back. Walk out with a complete strategy document.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:48, maxWidth:360, margin:"0 auto 48px" }}>
          {["Brand Audit + Market Research", "Customer Research + Language Bank", "Strategic Foundation + Organising Idea", "Creative Planning + GBP Method", "Brief Writing + Hook Factory", "Analysis Framework + Iteration System"].map((item, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, textAlign:"left", background:"#fff", padding:"10px 14px", borderRadius:10, border:"1px solid #e8e0d4" }}>
              <span style={{ color:"#8b5e3c", fontFamily:"monospace", fontSize:11, width:20, flexShrink:0 }}>0{i+1}</span>
              <span style={{ color:"#555", fontSize:13 }}>{item}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onStart}
          style={{ background:"linear-gradient(135deg,#d4a853,#8b5e3c)", border:"none", borderRadius:10, padding:"18px 52px", color:"#fff", fontSize:16, fontFamily:"inherit", cursor:"pointer", letterSpacing:1, boxShadow:"0 8px 40px rgba(212,168,83,.2)" }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 50px rgba(212,168,83,.35)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 40px rgba(212,168,83,.2)"}
        >
          Start a New Brand →
        </button>
        <div style={{ color:"#bbb", fontSize:11, marginTop:20, fontFamily:"monospace", letterSpacing:1 }}>
          Works for any brand · Any industry · Any stage
        </div>
      </div>
    </div>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────────────────
function Setup({ brandUrl, setBrandUrl, fetchStatus, brandContext, setBrandContext, brandName, onFetch, onStart, setBrandName, setFetchStatus }) {
  const [manualText, setManualText] = useState("");

  const useManual = () => {
    if (!manualText.trim()) return;
    onFetch("manual", manualText, manualText.split("\n")[0].replace(/[#*_]/g, "").trim().split(/\s+/).slice(0,2).join(" ") || "Brand");
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F7F3EE", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif" }}>
      <div style={{ maxWidth:600, width:"100%" }}>
        <div style={{ fontSize:11, letterSpacing:6, color:"#5a4aaa", fontFamily:"monospace", marginBottom:32 }}>
          STEP 1 OF 1 — BRAND SETUP
        </div>
        <h2 style={{ fontSize:38, color:"#1C1C1E", fontWeight:"normal", marginBottom:12 }}>
          What brand are we working on?
        </h2>
        <p style={{ color:"#666", fontSize:15, lineHeight:1.7, marginBottom:36 }}>
          Paste the brand's website URL and I'll build a brief — or skip straight to pasting what you know below.
        </p>

        {/* URL input */}
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <input
            value={brandUrl}
            onChange={e => setBrandUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onFetch("url")}
            placeholder="https://brandname.com"
            style={{ flex:1, background:"#fff", border:"1px solid #e0d8cc", borderRadius:10, padding:"14px 18px", color:"#1C1C1E", fontSize:15, fontFamily:"monospace" }}
            onFocus={e => e.target.style.borderColor = "#7c6aff"}
            onBlur={e => e.target.style.borderColor = "#e0d8cc"}
          />
          <button
            onClick={() => onFetch("url")}
            disabled={!brandUrl.trim() || fetchStatus === "fetching"}
            style={{ background: brandUrl.trim() ? "linear-gradient(135deg,#d4a853,#8b5e3c)" : "#e8e0d4", border:"none", borderRadius:10, padding:"14px 24px", color: brandUrl.trim() ? "#fff" : "#aaa", fontSize:14, fontFamily:"monospace", cursor: brandUrl.trim() ? "pointer" : "default", letterSpacing:1, whiteSpace:"nowrap" }}
          >
            {fetchStatus === "fetching" ? "READING..." : "READ BRAND"}
          </button>
        </div>

        {/* Loading */}
        {fetchStatus === "fetching" && (
          <div style={{ background:"#fff", border:"1px solid #e0d8cc", borderRadius:10, padding:"20px 24px", marginBottom:20 }}>
            <div style={{ color:"#d4a853", fontSize:12, fontFamily:"monospace", letterSpacing:2, marginBottom:12 }}>READING BRAND...</div>
            <div style={{ display:"flex", gap:6 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ height:3, flex:1, background:"#e8e0d4", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:"#d4a853", borderRadius:2, animation:`loadBar 1.5s ${i*0.1}s ease-in-out infinite` }} />
                </div>
              ))}
            </div>
            <style>{`@keyframes loadBar { 0%,100%{width:0%} 50%{width:100%} }`}</style>
          </div>
        )}

        {/* URL success */}
        {fetchStatus === "done" && brandContext && !manualText && (
          <div style={{ background:"#fff", border:"1px solid #d4a85344", borderRadius:12, padding:"20px 24px", marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ color:"#8b5e3c", fontSize:11, fontFamily:"monospace", letterSpacing:3 }}>
                BRAND INTELLIGENCE — {brandName.toUpperCase()}
              </div>
              <div style={{ background:"#f0fff0", border:"1px solid #aaddaa", borderRadius:20, padding:"3px 10px", color:"#4a8a4a", fontSize:10, fontFamily:"monospace" }}>
                ● READY
              </div>
            </div>
            <div style={{ color:"#555", fontSize:13, lineHeight:1.8, maxHeight:180, overflowY:"auto" }}>
              {brandContext.slice(0, 600)}...
            </div>
          </div>
        )}

        {/* Error */}
        {fetchStatus === "error" && (
          <div style={{ background:"#fff5f5", border:"1px solid #f0cccc", borderRadius:10, padding:"14px 20px", marginBottom:16, color:"#c06060", fontSize:13 }}>
            Couldn't read that URL automatically. No problem — paste what you know about the brand below instead.
          </div>
        )}

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
          <div style={{ flex:1, height:1, background:"#e0d8cc" }} />
          <div style={{ color:"#bbb", fontSize:11, fontFamily:"monospace" }}>OR</div>
          <div style={{ flex:1, height:1, background:"#e0d8cc" }} />
        </div>

        {/* Manual input — always visible */}
        <div style={{ marginBottom:20 }}>
          <div style={{ color:"#8b7355", fontSize:11, fontFamily:"monospace", marginBottom:10, letterSpacing:1 }}>
            PASTE BRAND NOTES MANUALLY
          </div>
          <textarea
            value={manualText}
            onChange={e => setManualText(e.target.value)}
            placeholder="Paste what you know about the brand — products, founder story, claims, positioning, target customer, competitors, anything..."
            rows={5}
            style={{ width:"100%", background:"#fff", border:"1px solid #e0d8cc", borderRadius:10, padding:"14px 18px", color:"#333", fontSize:13, fontFamily:"monospace", resize:"vertical", lineHeight:1.6 }}
            onFocus={e => e.target.style.borderColor = "#7c6aff"}
            onBlur={e => e.target.style.borderColor = "#e0d8cc"}
          />
          {manualText.trim() && (
            <button
              onClick={useManual}
              style={{ marginTop:10, width:"100%", background:"linear-gradient(135deg,#7c6aff,#4a3aaa)", border:"none", borderRadius:10, padding:"14px", color:"#fff", fontSize:15, fontFamily:"inherit", cursor:"pointer", letterSpacing:1 }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Use These Notes →
            </button>
          )}
        </div>

        {/* Continue button after URL read or after manual ready */}
        {fetchStatus === "done" && (
          <button
            onClick={onStart}
            style={{ width:"100%", background:"linear-gradient(135deg,#d4a853,#8b5e3c)", border:"none", borderRadius:12, padding:"18px", color:"#fff", fontSize:17, fontFamily:"inherit", cursor:"pointer", letterSpacing:1, boxShadow:"0 8px 40px rgba(212,168,83,.25)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 50px rgba(212,168,83,.4)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 40px rgba(212,168,83,.25)"}
          >
            Begin Strategy Session with {brandName} →
          </button>
        )}
      </div>
    </div>
  );
}


// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  app:         { minHeight:"100vh", background:"#F7F3EE", display:"flex", flexDirection:"column", fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif" },
  topbar:      { background:"#1C1C1E", borderBottom:"1px solid #2a2a2a", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, flexWrap:"wrap", gap:10 },
  topbarLeft:  { display:"flex", alignItems:"center", gap:12 },
  logoMark:    { width:34, height:34, background:"linear-gradient(135deg,#d4a853,#8b5e3c)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", fontFamily:"monospace", fontWeight:"bold", flexShrink:0 },
  topbarTitle: { color:"#f0ebe0", fontSize:14 },
  topbarSub:   { color:"#666", fontSize:10, fontFamily:"monospace", letterSpacing:1, marginTop:2 },
  topbarRight: { display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" },
  stagePill:   { width:26, height:26, borderRadius:"50%", border:"1.5px solid", background:"transparent", fontSize:10, fontFamily:"monospace", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" },
  divider:     { width:1, height:20, background:"#1a1a22", margin:"0 6px" },
  docBtn:      { background:"transparent", border:"1px solid #1e1e2a", borderRadius:6, padding:"5px 12px", color:"#333", fontSize:10, fontFamily:"monospace", letterSpacing:1, cursor:"pointer", transition:"all .2s" },
  docBtnActive:{ borderColor:"#d4a853", color:"#d4a853", background:"rgba(212,168,83,.08)" },
  stageBanner: { background:"#fff", borderBottom:"1px solid #e8e0d4", borderLeft:"3px solid", padding:"8px 20px", display:"flex", alignItems:"center", gap:10 },
  stageNum:    { fontSize:11, fontFamily:"monospace", letterSpacing:3, fontWeight:"bold" },
  stageSep:    { color:"#222", fontSize:11 },
  stageTag:    { color:"#999", fontSize:10, fontFamily:"monospace", letterSpacing:2 },
  skipBtn:     { marginLeft:"auto", background:"transparent", border:"none", color:"#333", fontSize:10, fontFamily:"monospace", letterSpacing:1, cursor:"pointer", padding:"4px 0", transition:"color .2s" },
  body:        { display:"flex", flex:1, overflow:"hidden" },
  chat:        { flex:1, display:"flex", flexDirection:"column", transition:"max-width .3s", overflow:"hidden" },
  messages:    { flex:1, overflowY:"auto", padding:"28px 24px", display:"flex", flexDirection:"column", gap:22, background:"#F7F3EE" },
  msgRow:      { display:"flex", gap:12, alignItems:"flex-start" },
  avatar:      { width:34, height:34, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#f0ebe0", fontFamily:"monospace", fontWeight:"bold" },
  bubble:      { maxWidth:"76%", borderRadius:12, padding:"14px 18px" },
  bubbleBot:   { background:"#fff", border:"1px solid #e8e0d4", borderRadius:"3px 12px 12px 12px" },
  bubbleUser:  { background:"#ede8e0", border:"1px solid #d8d0c4", borderRadius:"12px 3px 12px 12px" },
  bubbleLabel: { fontSize:9, color:"#d4a853", fontFamily:"monospace", letterSpacing:3, marginBottom:8, textTransform:"uppercase" },
  bubbleText:  { fontSize:14, lineHeight:1.8, whiteSpace:"pre-wrap" },
  dots:        { display:"flex", gap:5, alignItems:"center", padding:"4px 0" },
  dot:         { width:7, height:7, borderRadius:"50%", background:"#d4a853", animation:"dotPulse 1.2s ease-in-out infinite", display:"inline-block" },
  inputArea:   { padding:"14px 20px 16px", borderTop:"1px solid #e0d8cc", background:"#fff" },
  inputWrap:   { display:"flex", gap:10, alignItems:"flex-end", background:"#F7F3EE", border:"1px solid #e0d8cc", borderRadius:14, padding:"10px 14px" },
  textarea:    { flex:1, background:"transparent", border:"none", outline:"none", color:"#f0ebe0", fontSize:14, fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif", lineHeight:1.6, resize:"none" },
  sendBtn:     { width:34, height:34, borderRadius:"50%", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#fff", flexShrink:0, transition:"all .2s" },
  inputHint:   { textAlign:"center", marginTop:6, color:"#bbb", fontSize:10, fontFamily:"monospace", letterSpacing:.5 },
  docPanel:    { width:"42%", borderLeft:"1px solid #e0d8cc", background:"#fff", display:"flex", flexDirection:"column", overflow:"hidden" },
  docHeader:   { padding:"14px 18px", borderBottom:"1px solid #e0d8cc", display:"flex", alignItems:"center", justifyContent:"space-between" },
  docLive:     { fontSize:9, color:"#5a9a5a", fontFamily:"monospace", letterSpacing:3, marginBottom:4 },
  docTitle:    { color:"#555", fontSize:13 },
  docScroll:   { flex:1, overflowY:"auto", padding:"16px" },
  docStage:    { marginBottom:18 },
  docStageHeader: { display:"flex", alignItems:"center", gap:8, marginBottom:8 },
  docStageNum: { fontSize:10, fontFamily:"monospace", fontWeight:"bold", letterSpacing:1, transition:"color .5s" },
  docStageName:{ fontSize:11, fontFamily:"monospace", letterSpacing:1, transition:"color .5s" },
  docStageBox: { background:"#F7F3EE", border:"1px solid #e8e0d4", borderRadius:8, padding:"10px 12px", minHeight:44, transition:"border-color .3s" },
  docNote:     { fontSize:11, lineHeight:1.6 },
  liveDot:     { width:6, height:6, borderRadius:"50%", background:"#d4a853", display:"inline-block", animation:"liveBlink 1.5s ease-in-out infinite", flexShrink:0 },
  docFuture:   { background:"#f0ebe0", border:"1px solid #e0d8cc", borderRadius:10, padding:"14px", marginTop:8 },
  docFutureLabel: { color:"#aaa", fontSize:9, fontFamily:"monospace", letterSpacing:3, marginBottom:10 },
  docFutureItem:  { color:"#888", fontSize:12, padding:"7px 10px", background:"#fff", borderRadius:6, border:"1px solid #111118", marginBottom:6 },
};
