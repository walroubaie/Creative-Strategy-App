import React, { useState, useRef, useEffect } from "react";

// --- CONSTANTS ----------------------------------------------------------------

const STAGES = [
  { id: 1, name: "Brand Audit",            tag: "Examine before you prescribe",    color: "#C4783C" },
  { id: 2, name: "Market Research",        tag: "Know the battlefield",             color: "#A85C8A" },
  { id: 3, name: "Customer Research",      tag: "Get inside their head",            color: "#4A7FA5" },
  { id: 4, name: "Strategic Foundation",   tag: "Turn research into decisions",     color: "#3D8A6A" },
  { id: 5, name: "Creative Planning",      tag: "Build the architecture",           color: "#7A6AAA" },
  { id: 6, name: "Brief Examples",         tag: "See what it looks like",           color: "#B85050" },
];

const STRATEGIST_SYSTEM = (brandContext, currentStage, stageNotes) => `You are a senior creative strategist with 10+ years building paid creative strategy for DTC brands. You are sharp, direct, and push back hard on vague answers. You do not accept surface-level thinking. You have a reputation for being the person who asks the question nobody else asks.

You are running a live strategy session with a student creative strategist. Your job is to guide them through all 6 stages, teach them the thinking behind every decision, and do the heavy lifting when real craft is required — organising the language bank, building hooks from verbatim quotes, writing the brief examples. You are both a mentor and a co-strategist.

You are working on this brand:

===============================
BRAND INTELLIGENCE
===============================
${brandContext}
===============================

YOUR FRAMEWORKS — apply these actively and explicitly at the right moments:

PSYCHOLOGY
- Eugene Schwartz Life Force 8: survival/self-preservation, food/drink, freedom from fear/pain/danger, sexual companionship, comfortable living conditions, superiority/winning, care/protection of loved ones, social approval
- Eugene Schwartz Learned Wants 9: information, curiosity, cleanliness, efficiency, convenience, dependability/quality, expression of beauty/style, economy/profit, bargains
- 5 Levels of Awareness: Unaware → Problem Aware → Solution Aware → Product Aware → Most Aware
- Market Sophistication Curve: First to market → Young → Established → Saturated → Commodity

STRATEGY
- Alysha's Framework: Primary Organising Principle, Pain+Desire map, Aha Moment
- Asset Triangle: Audience (largest, longest lifespan) → Angle (medium) → Ad (smallest, shortest lifespan)
- More/Better/New reactivation framework for existing customers

CREATIVE
- GBP Method: Gut (emotional hook 0-5s) → Brain A (product proof, features) → Brain B (6 macro objections: timeframe, personal features, effort required, sophistication, geolocation, history/track record) → Pocket (CTA 3-7s)
- Cara Hoyt's 10 Hook Formulas: Tribal Identity, Investment Hook, Why Did No One Tell Me, Problem-First, POV Hook, Emotional Trigger, Give Me Time, Founder Intro, Creator Partnership, Golden Nugget
- Brick-by-Brick brief structure: Hook → Problem → Feature → Benefit → Validation/Social Proof → Objection Handle → CTA

YOUR RULES:
1. Ask ONE question at a time. Never two.
2. If their answer is vague ("women 25-45", "people who want to feel better"), call it out directly and make them go deeper. Name exactly what is vague and why it matters.
3. If their answer is strong, validate it briefly and build on it — add your own read to sharpen it further.
4. Share your own point of view on the brand regularly. You have read the brand intelligence. You have opinions. Use them to provoke sharper thinking — but always make the student commit to the answer.
5. At the end of each stage, produce a tight WHAT WE ESTABLISHED summary block before moving on. Format it clearly starting with the exact text "WHAT WE ESTABLISHED" on its own line.
6. When real craft is needed — organising the language bank, building hooks from verbatim quotes, writing brief examples — do it properly. Do not ask the student to do what you can do better. Show them what great looks like.
7. Explicitly instruct the student when they need to go do external research. Tell them exactly where to look and what to bring back. Do not move forward without real data.
8. Keep responses under 200 words unless you are producing a stage summary, a language bank, hooks, or a brief. Those get full treatment — do not cut them short.
9. Be human. Be a mentor. Be occasionally blunt. You are not a bot running through a checklist.
10. Never use em dashes in any written output.
11. When a stage is fully complete and the WHAT WE ESTABLISHED block has been delivered, output the exact phrase [ADVANCE_STAGE] on its own line. This is critical — only output this after the full summary has been written.

CURRENT STAGE: Stage ${currentStage} — ${STAGES[currentStage - 1]?.name || ""}

DECISIONS FROM PREVIOUS STAGES:
${stageNotes || "None yet — this is the beginning of the session."}`;

const STAGE_OPENERS = [
`Stage 1. Brand Audit.

A doctor doesn't prescribe before examining the patient. We don't strategise before we examine the brand.

I've read the brand intelligence brief. I have a point of view already — but I want to know what YOU see first.

Your task before we go any further: spend 15 minutes looking at this brand cold. Homepage, social channels, any ads you can find in the Meta Ad Library, their TikTok if they have one. Look at it the way a stranger would — not the way the brand wants to be seen.

Come back and tell me this: what is the gap between the brand they think they are and the brand they actually are right now?`,

`Good. Stage 2 — the battlefield.

You cannot find white space if you don't know what's crowded.

Before you answer anything, I need you to do real research. Go to the Meta Ad Library and search the top 3 direct competitors you can identify. Look at what angles they're running. What's been running the longest — longevity usually means it's working.

Then think beyond direct competitors. There are three layers: direct (same product), indirect (different product, same problem), and aspirational (brands your customer admires even if unrelated).

Come back with all three layers identified. Then we'll find the conversation nobody in this space is currently having.

Start with the direct competitors. Who are they?`,

`Stage 3 — and this is the most important one.

Forget demographics. I don't want age ranges and household incomes. I want the human.

But here's the thing: you cannot invent this person. You have to find them.

Your task before we go any further: go find where this customer lives online and bring back their actual words. I need verbatim language — not your paraphrase of what they said. Their exact words.

Where to look:
- Reddit: search the problem this product solves, not the product itself
- Amazon: find competitor products and read the 1, 2, and 3 star reviews
- TikTok and Instagram comments on competitor content
- Facebook groups if relevant to the category

Bring back at least 10 verbatim quotes. Raw, unedited, exactly as they wrote them.

Do not come back with "people say they feel frustrated." Come back with "I've been doing this for 3 years and nothing works and I'm so tired."

Go find them. Come back when you have real language.`,

`Stage 4. This is where we stop gathering and start deciding.

We have the brand. We have the battlefield. We have the customer's actual words.

Now we make hard calls — and these are the decisions everything else is built on. Get them wrong and the creative will never work no matter how good the hooks are.

First decision — the hardest one: who is the ONE person we are talking to?

Not a segment. Not a demographic. One human being. She has a name, an age, a specific Tuesday evening, and a specific relationship with this product category before she ever finds this brand.

Use everything from Stage 3 to build her. I want her named, specific, and emotionally real.

Who is she?`,

`Stage 5 — strategy becomes creative.

You have your person. You have her language. You have the organising idea.

Now we build the creative architecture.

First: three concept directions. Not formats, not hooks yet — message territories. Each one must trace directly back to a specific Pain x Audience intersection from Stage 3. Each one must be distinct — if two concepts could run the same hook, they are not distinct enough.

For each concept I want:
- The angle in one sentence
- The specific pain it targets from the language bank
- The awareness level it speaks to
- The hypothesis: if we run this, we expect to see X because Y

Walk me through the first concept direction.

After we lock all three and choose the primary, I will build the full hook library from the verbatim language bank. That part is mine — your job is to get the concepts right first.`,

`Final stage — the brief.

Strategy is worthless if the creator films the wrong thing.

I am going to write two example briefs based on everything we have built — one for the primary concept, one for the secondary. These are not exercises for you to complete. I am going to show you exactly what a complete brief looks like when it is built from real strategy.

Watch how every element traces back to something specific we decided in Stages 1 through 5. The hook comes from the language bank. The GBP structure maps to the awareness level. The objection handles come from the competitive research. Nothing is invented.

After I write them, I will ask you what you notice — because understanding why a brief is built the way it is matters more than copying the format.

Tell me which concept direction you want as the primary brief.`,
];

// --- MAIN APP -----------------------------------------------------------------

export default function CreativeStrategyApp() {
  const [screen, setScreen]           = useState("landing");
  const [brandUrl, setBrandUrl]       = useState("");
  const [brandContext, setBrandContext] = useState("");
  const [brandName, setBrandName]     = useState("");
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [currentStage, setCurrentStage] = useState(1);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showDoc, setShowDoc]         = useState(false);
  const [stageNotes, setStageNotes]   = useState({});
  const [sessionComplete, setSessionComplete] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

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
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `You are a brand intelligence analyst. Use the web_search tool to research this brand: "${brandUrl.trim()}"

Search for the brand name + "reviews", "products", "about", and look at their website.

Produce a brand intelligence brief covering:
- Brand name (real one from the site)
- Founder story if visible
- Core products with prices and review counts
- Key claims and differentiators
- Target audience signals from copy
- Visual and aesthetic identity
- Social channels and rough follower/view counts if findable
- Price positioning vs category
- What they say vs what the evidence shows — flag contradictions

Be analytical. Flag gaps. Max 500 words. Start your response with the brand name in bold.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
      if (!text) throw new Error("No response");
      const firstLine = text.split("\n")[0];
      const nameMatch = firstLine.match(/\*\*([^*]+)\*\*/) || firstLine.match(/^#\s*(.+)/);
      const extracted = nameMatch ? nameMatch[1].trim() : brandUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0].split(".")[0];
      setBrandName(extracted.charAt(0).toUpperCase() + extracted.slice(1));
      setBrandContext(text);
      setFetchStatus("done");
    } catch {
      setFetchStatus("error");
    }
  };

  const startSession = () => {
    setScreen("session");
    setMessages([{
      role: "assistant",
      content: `Welcome. We are doing this properly.\n\nI have read the brand intelligence on ${brandName}. I have a point of view already — but I want to know what you see first.\n\nMy job: ask the questions that make you think harder than you want to. Your job: don't give me surface-level answers.\n\nAll 6 stages. I ask, you answer, we build the strategy together. When we are done you will have everything you need.\n\nLet's go.\n\n---\n\n${STAGE_OPENERS[0]}`
    }]);
  };

  const buildStageNotesString = (notes) => {
    return Object.entries(notes)
      .map(([k, v]) => `Stage ${k} — ${STAGES[k-1]?.name}:\n${v}`)
      .join("\n\n") || "None yet.";
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: STRATEGIST_SYSTEM(brandContext, currentStage, buildStageNotesString(stageNotes)),
          messages: newMsgs.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Connection issue — try again.";

      // Clean reply for display (remove [ADVANCE_STAGE] trigger)
      const displayReply = reply.replace(/\[ADVANCE_STAGE\]/g, "").trim();

      setMessages(prev => [...prev, { role: "assistant", content: displayReply }]);

      // Capture stage notes when WHAT WE ESTABLISHED appears
      if (reply.includes("WHAT WE ESTABLISHED")) {
        const summaryStart = reply.indexOf("WHAT WE ESTABLISHED");
        const summaryEnd = reply.indexOf("[ADVANCE_STAGE]") > -1
          ? reply.indexOf("[ADVANCE_STAGE]")
          : reply.length;
        const summary = reply.substring(summaryStart, summaryEnd).trim();
        setStageNotes(prev => ({ ...prev, [currentStage]: summary }));
      }

      // Auto-advance stage
      if (reply.includes("[ADVANCE_STAGE]")) {
        if (currentStage < 6) {
          const nextStage = currentStage + 1;
          setTimeout(() => {
            setCurrentStage(nextStage);
            setMessages(prev => [...prev, {
              role: "assistant",
              content: `---\n\n${STAGE_OPENERS[nextStage - 1]}`
            }]);
          }, 1200);
        } else {
          // Stage 6 complete — session done
          setTimeout(() => {
            setSessionComplete(true);
            setMessages(prev => [...prev, {
              role: "assistant",
              content: `━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSESSION COMPLETE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAll 6 stages complete. Copy this entire conversation and use it to generate your full creative strategy deliverables.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`
            }]);
          }, 1200);
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
      content: `---\n\n${STAGE_OPENERS[s - 1]}`
    }]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (screen === "landing") return <Landing onStart={() => setScreen("setup")} />;
  if (screen === "setup") return (
    <Setup
      brandUrl={brandUrl} setBrandUrl={setBrandUrl}
      fetchStatus={fetchStatus} brandContext={brandContext}
      setBrandContext={setBrandContext} brandName={brandName}
      setBrandName={setBrandName} setFetchStatus={setFetchStatus}
      onFetch={(mode, text, name) => {
        if (mode === "manual") {
          setBrandContext(text);
          setBrandName(name || "Brand");
          setFetchStatus("done");
        } else { fetchBrand(); }
      }}
      onStart={startSession}
    />
  );

  return (
    <div style={s.app}>
      {/* TOPBAR */}
      <div style={s.topbar}>
        <div style={s.topbarLeft}>
          <div style={s.logoMark}>CS</div>
          <div>
            <div style={s.topbarTitle}>{brandName} — Strategy Session</div>
            <div style={s.topbarSub}>
              {sessionComplete ? "Session Complete" : `Stage ${currentStage} of 6 · ${STAGES[currentStage-1].name}`}
            </div>
          </div>
        </div>
        <div style={s.topbarRight}>
          {STAGES.map(st => (
            <button
              key={st.id}
              onClick={() => !sessionComplete && jumpToStage(st.id)}
              title={st.name}
              style={{
                ...s.stagePill,
                background: st.id === currentStage ? st.color + "22" : st.id < currentStage ? "#1a2e1a" : "#111",
                borderColor: st.id === currentStage ? st.color : st.id < currentStage ? "#2a4a2a" : "#1e1e1e",
                color: st.id === currentStage ? st.color : st.id < currentStage ? "#4a8a4a" : "#2a2a2a",
                cursor: sessionComplete ? "default" : "pointer",
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
            {showDoc ? "HIDE" : "STAGES"}
          </button>
        </div>
      </div>

      {/* STAGE BANNER */}
      {!sessionComplete && (
        <div style={{ ...s.stageBanner, borderLeftColor: STAGES[currentStage-1].color }}>
          <span style={{ ...s.stageNum, color: STAGES[currentStage-1].color }}>
            STAGE {String(currentStage).padStart(2, "0")}
          </span>
          <span style={s.stageSep}>·</span>
          <span style={s.stageTag}>{STAGES[currentStage-1].tag.toUpperCase()}</span>
          {currentStage < 6 && (
            <button
              onClick={() => jumpToStage(currentStage + 1)}
              style={s.skipBtn}
              onMouseEnter={e => e.currentTarget.style.color = STAGES[currentStage-1].color}
              onMouseLeave={e => e.currentTarget.style.color = "#2a2a2a"}
            >
              SKIP →
            </button>
          )}
        </div>
      )}

      {sessionComplete && (
        <div style={{ ...s.stageBanner, borderLeftColor: "#4a8a4a", background: "#f0fff0" }}>
          <span style={{ ...s.stageNum, color: "#4a8a4a" }}>COMPLETE</span>
          <span style={s.stageSep}>·</span>
          <span style={{ ...s.stageTag, color: "#4a8a4a" }}>ALL 6 STAGES FINISHED · COPY CONVERSATION TO GENERATE DELIVERABLES</span>
        </div>
      )}

      {/* BODY */}
      <div style={s.body}>
        <div style={{ ...s.chat, maxWidth: showDoc ? "58%" : "100%" }}>
          <div style={s.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...s.msgRow, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                <div style={{
                  ...s.avatar,
                  background: m.role === "assistant" ? "linear-gradient(135deg,#C4783C,#8b5e3c)" : "#1a1a2a",
                  border: m.role === "user" ? "1px solid #2a2a3a" : "none"
                }}>
                  {m.role === "assistant" ? "S" : "Y"}
                </div>
                <div style={{ ...s.bubble, ...(m.role === "user" ? s.bubbleUser : s.bubbleBot) }}>
                  {m.role === "assistant" && (
                    <div style={s.bubbleLabel}>SENIOR STRATEGIST</div>
                  )}
                  <div style={{ ...s.bubbleText, whiteSpace: "pre-wrap" }}>
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ ...s.msgRow, flexDirection: "row" }}>
                <div style={{ ...s.avatar, background: "linear-gradient(135deg,#C4783C,#8b5e3c)" }}>S</div>
                <div style={{ ...s.bubble, ...s.bubbleBot, padding: "14px 18px" }}>
                  <div style={s.dots}>
                    {[0,1,2].map(i => <span key={i} style={{ ...s.dot, animationDelay: `${i*0.2}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!sessionComplete && (
            <div style={s.inputArea}>
              <div style={s.inputWrap}>
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
                  style={{
                    ...s.sendBtn,
                    background: input.trim() && !loading ? "linear-gradient(135deg,#C4783C,#8b5e3c)" : "#1a1a22"
                  }}
                >
                  ↑
                </button>
              </div>
              <div style={s.inputHint}>Enter to send · Shift+Enter for new line</div>
            </div>
          )}
        </div>

        {/* DOC PANEL */}
        {showDoc && (
          <div style={s.docPanel}>
            <div style={s.docHeader}>
              <div style={s.docLive}>● STAGE OVERVIEW</div>
              <div style={s.docTitle}>{brandName} Creative Strategy</div>
            </div>
            <div style={s.docScroll}>
              {STAGES.map(st => (
                <div key={st.id} style={s.docStage}>
                  <div style={s.docStageHeader}>
                    <span style={{ ...s.docStageNum, color: st.id <= currentStage ? st.color : "#222" }}>
                      {st.id < currentStage ? "✓" : `0${st.id}`}
                    </span>
                    <span style={{ ...s.docStageName, color: st.id <= currentStage ? "#999" : "#2a2a2a" }}>
                      {st.name}
                    </span>
                  </div>
                  <div style={{ ...s.docStageBox, borderColor: st.id === currentStage ? st.color + "44" : "#1a1a1a" }}>
                    {st.id < currentStage && stageNotes[st.id] ? (
                      <div style={{ color: "#666", fontSize: 11, lineHeight: 1.7, fontFamily: "monospace" }}>
                        {stageNotes[st.id].slice(0, 300)}{stageNotes[st.id].length > 300 ? "..." : ""}
                      </div>
                    ) : st.id < currentStage ? (
                      <div style={{ color: "#3a3a3a", fontSize: 11, fontStyle: "italic" }}>Completed</div>
                    ) : st.id === currentStage ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={s.liveDot} />
                        <span style={{ color: "#555", fontSize: 11, fontStyle: "italic" }}>In progress...</span>
                      </div>
                    ) : (
                      <div style={{ color: "#1e1e1e", fontSize: 11 }}>Not started</div>
                    )}
                  </div>
                  {st.id < 6 && <div style={{ color: "#1a1a1a", fontSize: 10, fontFamily: "monospace", textAlign: "center", margin: "4px 0" }}>↓</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dotPulse { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }
        @keyframes liveBlink { 0%,100%{opacity:.3} 50%{opacity:1} }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#F7F3EE; }
        ::-webkit-scrollbar-thumb { background:#d8cfc4; border-radius:2px; }
        textarea::placeholder { color:#bbb; }
      `}</style>
    </div>
  );
}

// --- LANDING ------------------------------------------------------------------

function Landing({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F7F3EE", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

        <div style={{ fontSize: 11, letterSpacing: 8, color: "#5a4aaa", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 40 }}>
          Creative Strategy System
        </div>

        <h1 style={{ fontSize: 56, color: "#1C1C1E", fontWeight: "normal", lineHeight: 1.1, marginBottom: 16 }}>
          Creative Strategy<br />Session
        </h1>

        <p style={{ color: "#666", fontSize: 16, lineHeight: 1.8, maxWidth: 420, margin: "0 auto 44px" }}>
          Paste any brand URL. Work through 6 stages with a senior creative strategist who pushes back and does the heavy lifting. Walk out with a complete strategy.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 380, margin: "0 auto 44px" }}>
          {[
            ["01", "Brand Audit",          "Examine before you prescribe"],
            ["02", "Market Research",      "Know the battlefield"],
            ["03", "Customer Research",    "Get inside their head — real verbatim language"],
            ["04", "Strategic Foundation", "The hard calls — one person, one idea"],
            ["05", "Creative Planning",    "Concepts, angles + hook factory"],
            ["06", "Brief Examples",       "See what complete looks like"],
          ].map(([num, name, desc]) => (
            <div key={num} style={{ display: "flex", alignItems: "center", gap: 12, textAlign: "left", background: "#fff", padding: "10px 14px", borderRadius: 10, border: "1px solid #e8e0d4" }}>
              <span style={{ color: "#8b5e3c", fontFamily: "monospace", fontSize: 11, width: 20, flexShrink: 0 }}>{num}</span>
              <div>
                <div style={{ color: "#333", fontSize: 13, marginBottom: 2 }}>{name}</div>
                <div style={{ color: "#aaa", fontSize: 11 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          style={{ background: "linear-gradient(135deg,#d4a853,#8b5e3c)", border: "none", borderRadius: 10, padding: "18px 52px", color: "#fff", fontSize: 16, fontFamily: "inherit", cursor: "pointer", letterSpacing: 1, boxShadow: "0 8px 40px rgba(212,168,83,.2)" }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 50px rgba(212,168,83,.35)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 40px rgba(212,168,83,.2)"}
        >
          Start a New Brand →
        </button>

        <div style={{ color: "#bbb", fontSize: 11, marginTop: 20, fontFamily: "monospace", letterSpacing: 1 }}>
          Works for any brand · Any industry · Any stage
        </div>

      </div>
    </div>
  );
}

// --- SETUP --------------------------------------------------------------------

function Setup({ brandUrl, setBrandUrl, fetchStatus, brandContext, setBrandContext, brandName, setBrandName, setFetchStatus, onFetch, onStart }) {
  const [manualText, setManualText] = useState("");

  const useManual = () => {
    if (!manualText.trim()) return;
    const name = manualText.split("\n")[0].replace(/[#*_]/g, "").trim().split(/\s+/).slice(0, 2).join(" ") || "Brand";
    onFetch("manual", manualText, name);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#F7F3EE",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,serif"
    }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        <div style={{ fontSize: 10, letterSpacing: 6, color: "#C4783C", fontFamily: "monospace", marginBottom: 32 }}>
          BRAND SETUP
        </div>
        <h2 style={{ fontSize: 36, color: "#1C1C1E", fontWeight: "normal", marginBottom: 12 }}>
          What brand are we working on?
        </h2>
        <p style={{ color: "#888", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
          Paste the brand URL and I will build a brief automatically — or paste what you know below.
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input
            value={brandUrl}
            onChange={e => setBrandUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onFetch("url")}
            placeholder="https://brandname.com"
            style={{
              flex: 1, background: "#fff", border: "1px solid #e0d8cc",
              borderRadius: 10, padding: "14px 18px", color: "#1C1C1E",
              fontSize: 14, fontFamily: "monospace"
            }}
            onFocus={e => e.target.style.borderColor = "#C4783C"}
            onBlur={e => e.target.style.borderColor = "#e0d8cc"}
          />
          <button
            onClick={() => onFetch("url")}
            disabled={!brandUrl.trim() || fetchStatus === "fetching"}
            style={{
              background: brandUrl.trim() ? "linear-gradient(135deg,#C4783C,#8b5e3c)" : "#e8e0d4",
              border: "none", borderRadius: 10, padding: "14px 22px",
              color: brandUrl.trim() ? "#fff" : "#aaa", fontSize: 13,
              fontFamily: "monospace", cursor: brandUrl.trim() ? "pointer" : "default",
              letterSpacing: 1, whiteSpace: "nowrap"
            }}
          >
            {fetchStatus === "fetching" ? "READING..." : "READ BRAND"}
          </button>
        </div>

        {fetchStatus === "fetching" && (
          <div style={{ background: "#fff", border: "1px solid #e0d8cc", borderRadius: 10, padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ color: "#C4783C", fontSize: 11, fontFamily: "monospace", letterSpacing: 2, marginBottom: 12 }}>READING BRAND...</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ height: 3, flex: 1, background: "#e8e0d4", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#C4783C", borderRadius: 2, animation: `loadBar 1.5s ${i*0.1}s ease-in-out infinite` }} />
                </div>
              ))}
            </div>
            <style>{`@keyframes loadBar{0%,100%{width:0%}50%{width:100%}}`}</style>
          </div>
        )}

        {fetchStatus === "done" && brandContext && !manualText && (
          <div style={{ background: "#fff", border: "1px solid #C4783C44", borderRadius: 12, padding: "18px 22px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ color: "#8b5e3c", fontSize: 10, fontFamily: "monospace", letterSpacing: 3 }}>
                BRAND INTELLIGENCE — {brandName.toUpperCase()}
              </div>
              <div style={{ background: "#f0fff0", border: "1px solid #aaddaa", borderRadius: 20, padding: "3px 10px", color: "#4a8a4a", fontSize: 10, fontFamily: "monospace" }}>
                ✓ READY
              </div>
            </div>
            <div style={{ color: "#666", fontSize: 13, lineHeight: 1.8, maxHeight: 180, overflowY: "auto" }}>
              {brandContext.slice(0, 600)}...
            </div>
          </div>
        )}

        {fetchStatus === "error" && (
          <div style={{ background: "#fff5f5", border: "1px solid #f0cccc", borderRadius: 10, padding: "14px 20px", marginBottom: 16, color: "#c06060", fontSize: 13 }}>
            Could not read that URL automatically. Paste what you know about the brand below instead.
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#e0d8cc" }} />
          <div style={{ color: "#ccc", fontSize: 10, fontFamily: "monospace" }}>OR</div>
          <div style={{ flex: 1, height: 1, background: "#e0d8cc" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#8b7355", fontSize: 10, fontFamily: "monospace", marginBottom: 10, letterSpacing: 1 }}>
            PASTE BRAND NOTES MANUALLY
          </div>
          <textarea
            value={manualText}
            onChange={e => setManualText(e.target.value)}
            placeholder="Paste what you know — products, founder story, positioning, competitors, anything..."
            rows={5}
            style={{
              width: "100%", background: "#fff", border: "1px solid #e0d8cc",
              borderRadius: 10, padding: "14px 18px", color: "#333",
              fontSize: 13, fontFamily: "monospace", resize: "vertical", lineHeight: 1.6
            }}
            onFocus={e => e.target.style.borderColor = "#C4783C"}
            onBlur={e => e.target.style.borderColor = "#e0d8cc"}
          />
          {manualText.trim() && (
            <button
              onClick={useManual}
              style={{
                marginTop: 10, width: "100%",
                background: "linear-gradient(135deg,#C4783C,#8b5e3c)",
                border: "none", borderRadius: 10, padding: "14px",
                color: "#fff", fontSize: 14,
                fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,serif",
                cursor: "pointer", letterSpacing: 1
              }}
            >
              Use These Notes →
            </button>
          )}
        </div>

        {fetchStatus === "done" && (
          <button
            onClick={onStart}
            style={{
              width: "100%", background: "linear-gradient(135deg,#C4783C,#8b5e3c)",
              border: "none", borderRadius: 12, padding: "18px",
              color: "#fff", fontSize: 16,
              fontFamily: "'Palatino Linotype','Book Antiqua',Palatino,serif",
              cursor: "pointer", letterSpacing: 1,
              boxShadow: "0 8px 40px rgba(196,120,60,.25)"
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 50px rgba(196,120,60,.4)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 40px rgba(196,120,60,.25)"}
          >
            Begin Strategy Session with {brandName} →
          </button>
        )}
      </div>
    </div>
  );
}

// --- STYLES -------------------------------------------------------------------

const s = {
  app:         { minHeight:"100vh", background:"#F7F3EE", display:"flex", flexDirection:"column", fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif" },
  topbar:      { background:"#1C1C1E", borderBottom:"1px solid #2a2a2a", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, flexWrap:"wrap", gap:10 },
  topbarLeft:  { display:"flex", alignItems:"center", gap:12 },
  logoMark:    { width:34, height:34, background:"linear-gradient(135deg,#C4783C,#8b5e3c)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", fontFamily:"monospace", fontWeight:"bold", flexShrink:0 },
  topbarTitle: { color:"#f0ebe0", fontSize:14 },
  topbarSub:   { color:"#555", fontSize:10, fontFamily:"monospace", letterSpacing:1, marginTop:2 },
  topbarRight: { display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" },
  stagePill:   { width:26, height:26, borderRadius:"50%", border:"1.5px solid", background:"transparent", fontSize:10, fontFamily:"monospace", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" },
  divider:     { width:1, height:20, background:"#2a2a2a", margin:"0 6px" },
  docBtn:      { background:"transparent", border:"1px solid #2a2a2a", borderRadius:6, padding:"5px 12px", color:"#444", fontSize:10, fontFamily:"monospace", letterSpacing:1, cursor:"pointer", transition:"all .2s" },
  docBtnActive:{ borderColor:"#C4783C", color:"#C4783C", background:"rgba(196,120,60,.08)" },
  stageBanner: { background:"#fff", borderBottom:"1px solid #e8e0d4", borderLeft:"3px solid", padding:"8px 20px", display:"flex", alignItems:"center", gap:10 },
  stageNum:    { fontSize:11, fontFamily:"monospace", letterSpacing:3, fontWeight:"bold" },
  stageSep:    { color:"#ccc", fontSize:11 },
  stageTag:    { color:"#aaa", fontSize:10, fontFamily:"monospace", letterSpacing:2 },
  skipBtn:     { marginLeft:"auto", background:"transparent", border:"none", color:"#2a2a2a", fontSize:10, fontFamily:"monospace", letterSpacing:1, cursor:"pointer", padding:"4px 0", transition:"color .2s" },
  body:        { display:"flex", flex:1, overflow:"hidden" },
  chat:        { flex:1, display:"flex", flexDirection:"column", transition:"max-width .3s", overflow:"hidden" },
  messages:    { flex:1, overflowY:"auto", padding:"28px 24px", display:"flex", flexDirection:"column", gap:24 },
  msgRow:      { display:"flex", gap:12, alignItems:"flex-start" },
  avatar:      { width:34, height:34, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#f0ebe0", fontFamily:"monospace", fontWeight:"bold" },
  bubble:      { maxWidth:"76%", borderRadius:12, padding:"14px 18px" },
  bubbleBot:   { background:"#fff", border:"1px solid #e8e0d4", borderRadius:"3px 12px 12px 12px" },
  bubbleUser:  { background:"#ede8e0", border:"1px solid #d8d0c4", borderRadius:"12px 3px 12px 12px" },
  bubbleLabel: { fontSize:9, color:"#C4783C", fontFamily:"monospace", letterSpacing:3, marginBottom:8 },
  bubbleText:  { fontSize:14, lineHeight:1.85, color:"#2a2a2a" },
  dots:        { display:"flex", gap:5, alignItems:"center", padding:"4px 0" },
  dot:         { width:7, height:7, borderRadius:"50%", background:"#C4783C", animation:"dotPulse 1.2s ease-in-out infinite", display:"inline-block" },
  inputArea:   { padding:"14px 20px 16px", borderTop:"1px solid #e0d8cc", background:"#fff" },
  inputWrap:   { display:"flex", gap:10, alignItems:"flex-end", background:"#F7F3EE", border:"1px solid #e0d8cc", borderRadius:14, padding:"10px 14px" },
  textarea:    { flex:1, background:"transparent", border:"none", outline:"none", color:"#1C1C1E", fontSize:14, fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif", lineHeight:1.6, resize:"none" },
  sendBtn:     { width:34, height:34, borderRadius:"50%", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#fff", flexShrink:0, transition:"all .2s" },
  inputHint:   { textAlign:"center", marginTop:6, color:"#ccc", fontSize:10, fontFamily:"monospace", letterSpacing:.5 },
  docPanel:    { width:"42%", borderLeft:"1px solid #e0d8cc", background:"#fff", display:"flex", flexDirection:"column", overflow:"hidden" },
  docHeader:   { padding:"14px 18px", borderBottom:"1px solid #e0d8cc" },
  docLive:     { fontSize:9, color:"#C4783C", fontFamily:"monospace", letterSpacing:3, marginBottom:4 },
  docTitle:    { color:"#888", fontSize:13 },
  docScroll:   { flex:1, overflowY:"auto", padding:"16px" },
  docStage:    { marginBottom:8 },
  docStageHeader: { display:"flex", alignItems:"center", gap:8, marginBottom:6 },
  docStageNum: { fontSize:10, fontFamily:"monospace", fontWeight:"bold", letterSpacing:1 },
  docStageName:{ fontSize:11, fontFamily:"monospace", letterSpacing:1 },
  docStageBox: { background:"#F7F3EE", border:"1px solid", borderRadius:8, padding:"10px 12px", minHeight:40, transition:"border-color .3s" },
  liveDot:     { width:6, height:6, borderRadius:"50%", background:"#C4783C", display:"inline-block", animation:"liveBlink 1.5s ease-in-out infinite", flexShrink:0 },
};
