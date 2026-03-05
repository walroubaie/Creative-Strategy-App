import { useState, useRef, useEffect } from "react";

// ─── STAGES ───────────────────────────────────────────────────────────────────
const STAGES = [
  { id: 1, name: "Brand Audit",          icon: "01", tag: "Examine before you prescribe",    color: "#d4a853" },
  { id: 2, name: "Market Research",      icon: "02", tag: "Know the battlefield",             color: "#c47c3e" },
  { id: 3, name: "Customer Research",    icon: "03", tag: "Get inside their head",            color: "#9b5e8a" },
  { id: 4, name: "Strategic Foundation", icon: "04", tag: "Turn research into decisions",     color: "#4a7fa5" },
  { id: 5, name: "Creative Planning",    icon: "05", tag: "Build the architecture",           color: "#3d9e6a" },
  { id: 6, name: "Brief Writing",        icon: "06", tag: "Make it real for creators",        color: "#7a6eaa" },
  { id: 7, name: "Analysis Framework",   icon: "07", tag: "Turn results into intelligence",   color: "#c0574a" },
];

// ─── PER-STAGE REQUIRED OUTPUTS ───────────────────────────────────────────────
// The AI must cover ALL of these before writing its stage summary
const STAGE_REQUIREMENTS = {
  1: `STAGE 1 MANDATORY CHECKLIST — do not summarise until ALL are covered:
□ Brand identity elements: Mission, Voice/Tone, Values, Positioning, Visual Identity
□ Message audit: Primary Lead message, Key Claims, Emotion being triggered, CTA
□ Gap analysis: what the brand THINKS it is vs what the evidence ACTUALLY shows
□ Strategic Tension statement: the specific gap between what they are and what they could be
When all four are covered, produce the Stage 1 summary in this format:
STAGE 1 COMPLETE ✓
IDENTITY: [summary]
MESSAGE AUDIT: [summary]
STRATEGIC TENSION: [one clear sentence]
Then ask: "That's Stage 1 locked in. Ready to move to Stage 2 — Market Research? Or is there anything you want to add or push back on?"`,

  2: `STAGE 2 MANDATORY CHECKLIST — do not summarise until ALL are covered:
□ Direct competitors (same product, same customer)
□ Indirect competitors (different product, same problem)
□ Aspirational competitors (different category but same customer desire)
□ White space: the specific conversation NO competitor is currently having
□ Category understanding: how the customer ACTUALLY thinks about this category (not how brands describe it)
When all five are covered, produce the Stage 2 summary in this format:
STAGE 2 COMPLETE ✓
DIRECT COMPETITORS: [list]
INDIRECT COMPETITORS: [list]
ASPIRATIONAL COMPETITORS: [list]
WHITE SPACE: [the gap identified]
Then ask: "Stage 2 done. Ready for Stage 3 — Customer Research? Or anything to add?"`,

  3: `STAGE 3 MANDATORY CHECKLIST — do not summarise until ALL are covered:
□ Language Bank — TRIGGER PHRASES: exact words/phrases that make the customer pay attention
□ Language Bank — PAIN LANGUAGE: how they describe the problem in their own words (Reddit/reviews voice)
□ Language Bank — DESIRE LANGUAGE: what outcome they actually want, in their words
□ Language Bank — OBJECTION LANGUAGE: exact phrases they use to talk themselves out of buying
□ 3 Customer Personas: each with (a) daily reality, (b) inner monologue, (c) purchase trigger moment
□ Sources used or referenced: Reddit, reviews, Amazon, Instagram/TikTok comments, forums
When all are covered, produce the Stage 3 summary in this format:
STAGE 3 COMPLETE ✓
LANGUAGE BANK:
- Trigger Phrases: [list]
- Pain Language: [list]
- Desire Language: [list]
- Objection Language: [list]
PERSONA 1: [name, daily reality, inner monologue, purchase trigger]
PERSONA 2: [name, daily reality, inner monologue, purchase trigger]
PERSONA 3: [name, daily reality, inner monologue, purchase trigger]
Then ask: "Stage 3 locked. Ready for Stage 4 — Strategic Foundation? Or anything to add to the language bank?"`,

  4: `STAGE 4 MANDATORY CHECKLIST — do not summarise until ALL are covered:
□ Core Customer: ONE named person (not a segment) with age, daily emotional reality, and justification for why she's the right choice
□ Strategic Tension statement: refined from Stage 1, now sharp and specific
□ Organising Idea: the internal strategic idea that unifies all creative (NOT a tagline — this is for internal use only)
□ Brand Voice: at least 3 paired dimensions — what it IS / what it is NOT (e.g. "Direct / Not aggressive")
□ Proof Points: minimum 5 specific, concrete proof points (not claims — evidence)
When all are covered, produce the Stage 4 summary in this format:
STAGE 4 COMPLETE ✓
CORE CUSTOMER: [name, age, daily reality]
STRATEGIC TENSION: [one sentence]
ORGANISING IDEA: [one sentence — internal use only]
BRAND VOICE: [paired dimensions]
PROOF POINTS: [list of 5+]
Then ask: "Stage 4 done — that's our strategic foundation. Ready for Stage 5 — Creative Planning? Or anything to sharpen?"`,

  5: `STAGE 5 MANDATORY CHECKLIST — do not summarise until ALL are covered:
□ THREE Concept Clusters: each must come directly from research, named, with the core message territory described
□ For each concept: identify which of Cara Hoyt's 10 Hook Formulas apply (Tribal Identity, Investment Hook, Why Did No One Tell Me, Problem-First, POV Hook, Emotional Trigger, Give Me Time, Founder Intro, Creator Partnership, Golden Nugget)
□ Hook Battery: minimum 3 specific hook options per concept written out
□ Persuasion Type for each concept: Feeling First / Understanding First / Proof First
□ Creative Diversity plan: start at L0-L1 (format variations of same concept), plan to expand to L2-L5 only after Phase One data
□ Testing Structure: Phase One = 3 concepts in market, multiple hooks per concept, 4 weeks to first data
□ Format decisions based on: customer research signals, competitor landscape gaps, existing brand assets, category norms
When all are covered, produce the Stage 5 summary in this format:
STAGE 5 COMPLETE ✓
CONCEPT 1: [name + territory + hooks]
CONCEPT 2: [name + territory + hooks]
CONCEPT 3: [name + territory + hooks]
TESTING STRUCTURE: [Phase One plan]
CREATIVE DIVERSITY: [L0-L1 starting point, expansion triggers]
Then ask: "Stage 5 locked — we have our creative architecture. Ready for Stage 6 — Brief Writing? Or anything to add to the concepts?"`,

  6: `STAGE 6 MANDATORY CHECKLIST — brief must contain ALL 8 components:
□ 1. OVERVIEW: who the ad is for and what it needs to make them FEEL (not product description — strategic purpose)
□ 2. HOOK OPTIONS: 3 hook options from the hook battery (creator picks one)
□ 3. SCRIPT OUTLINE: beats only, not full script. Must follow GBP structure: Gut (0-5s emotional hook) → Brain A (product/proof, what it does) → Brain B (addresses the 6 macro objections: timeframe, personal fit, effort, sophistication, location, track record) → Pocket (CTA, 3-7s, one action only)
□ 4. DOS AND DON'TS: specific creative boundaries for this concept
□ 5. B-ROLL LIST: specific shots needed
□ 6. CASTING NOTE: who films this and why (founder, customer, creator type)
□ 7. VARIATIONS MENU: 3 variations the creator can film (different angle, different hook, different format)
□ 8. FILMING GUIDELINES: practical specs and environment notes
When all 8 are covered, produce the Stage 6 summary in this format:
STAGE 6 COMPLETE ✓
BRIEF: [concept name]
OVERVIEW: [paragraph]
HOOKS: [3 options]
SCRIPT OUTLINE (GBP): [beats]
DOS/DON'TS: [list]
B-ROLL: [list]
CASTING: [note]
VARIATIONS: [3 options]
FILMING: [guidelines]
Then ask: "Stage 6 done — that brief is ready to hand to a creator. One more stage. Ready for Stage 7 — Analysis Framework? Or anything to tighten in the brief?"`,

  7: `STAGE 7 MANDATORY CHECKLIST — do not summarise until ALL are covered:
□ The 5-Link Chain explained and applied to this brand's context:
  — Link 1: Hook Rate (3-sec views ÷ impressions) — benchmark above 25-30%
  — Link 2: Hold Rate (ThruPlays ÷ impressions) — benchmark above 15% for cold traffic
  — Link 3: Outbound CTR — benchmark above 1% for cold traffic
  — Link 4: Conversion Rate — category dependent, establish the brand's baseline
  — Link 5: CPA and ROAS — the business outcome
□ Iteration Decision Tree: for each link that breaks, what specifically gets tested next
□ Phase Two expansion plan: when Phase One produces a winning concept, how it gets scaled (more hooks, more formats, creative diversity L2-L5)
□ What "winning" looks like: define success criteria for this specific brand before any money is spent
When all are covered, produce the Stage 7 summary in this format:
STAGE 7 COMPLETE ✓
5-LINK BENCHMARKS: [with brand-specific targets]
ITERATION TREE: [what to test when each link breaks]
PHASE TWO PLAN: [expansion triggers and structure]
SUCCESS CRITERIA: [what winning looks like for this brand]
Then say: "That's all 7 stages. You now have a complete creative strategy. Well done — that was real work. Your strategy document is ready to export below."`
};

// ─── SYSTEM PROMPT ─────────────────────────────────────────────────────────────
const STRATEGIST_SYSTEM = (brandContext, currentStage, stageNotes) => `You are a senior creative strategist with 10+ years building paid creative strategy for DTC brands. You are sharp, direct, and push back hard on vague answers. You do not accept surface-level thinking.

You are running a live strategy session with a student creative strategist on this brand:

═══════════════════════════════
BRAND INTELLIGENCE
═══════════════════════════════
${brandContext}
═══════════════════════════════

YOUR FRAMEWORKS (use these actively):
- Eugene Schwartz: Life Force 8 + Learned Wants 9
- 5 Levels of Awareness: Unaware → Problem Aware → Solution Aware → Product Aware → Most Aware
- Market Sophistication: First to market → Young → Established → Saturated → Commodity
- GBP Method: Gut (emotional 0-5s) → Brain A (product/proof) → Brain B (6 macro objections: timeframe, personal fit, effort, sophistication, geolocation, track record) → Pocket (CTA 3-7s)
- Asset Triangle: Audience > Angle > Ad
- Cara Hoyt's 10 Hook Formulas: Tribal Identity, Investment Hook, Why Did No One Tell Me, Problem-First, POV Hook, Emotional Trigger, Give Me Time, Founder Intro, Creator Partnership, Golden Nugget
- Creative Diversity Levels: L0 (same concept, format variation) → L1 (same concept, hook variation) → L2 (same concept, angle variation) → L3 (new concept, proven format) → L4 (new concept, new format) → L5 (completely new territory)
- Alysha's Framework: Primary Organising Principle, Pain+Desire map, Aha Moment

YOUR RULES:
1. Ask ONE question at a time. Never two.
2. If their answer is vague ("women 25-45", "people who like natural beauty"), call it out directly and make them go deeper
3. If their answer is strong, validate it briefly and build on it
4. Occasionally share your own read on the brand to provoke sharper thinking — but always make them commit to the answer
5. Keep responses under 200 words unless giving a stage-end summary
6. Be human. Be a mentor. Be occasionally blunt. Don't be a bot.
7. IMPORTANT: You must work through the mandatory stage checklist for the current stage before you can summarise. Do not skip required outputs. Do not move on until the checklist is complete.
8. When all checklist items are covered, produce the stage summary in the specified format, then ASK if they're ready to move on — do NOT automatically move to the next stage. Let them confirm.

CURRENT STAGE: Stage ${currentStage} — ${STAGES[currentStage-1].name}

MANDATORY REQUIREMENTS FOR THIS STAGE:
${STAGE_REQUIREMENTS[currentStage]}

STRATEGY DOCUMENT SO FAR:
${Object.entries(stageNotes).length > 0 
  ? Object.entries(stageNotes).map(([k,v]) => `--- Stage ${k}: ${STAGES[k-1].name} ---\n${v}`).join("\n\n") 
  : "No stages completed yet."}`;

// ─── STAGE OPENERS ─────────────────────────────────────────────────────────────
const STAGE_OPENERS = [
`Alright. Stage 1 — Brand Audit.

Before strategy, examination. A doctor doesn't prescribe before examining the patient.

I've read the brand intelligence. Now I want to know what YOU see.

Look at their homepage, their ads, their social presence — not what they claim to be, but what the evidence actually shows.

What is the gap between the brand they *think* they are and the brand they *actually* are?`,

`Good. Stage 2 — the battlefield.

You can't find white space if you don't know what's crowded.

This brand has three layers of competition — direct, indirect, and aspirational. We need all three before we can find the gap.

Start with direct. Who are they actually competing with for the same customer, same category?`,

`Stage 3 — the most important one.

Forget demographics. I want language. Specifically: how do real customers talk about this category and their frustrations with it?

Think Reddit threads, Amazon 3-star reviews, Instagram comments, Facebook groups. What are the exact phrases people use when they're describing the problem this brand solves?

Give me their words, not your interpretation of their words.`,

`Stage 4. This is where we stop gathering and start deciding.

We have research. Now we make hard calls.

First decision — the hardest one: who is the ONE person this brand is talking to?

Not a segment. Not a demographic. One human being with a name, an age, and a daily emotional reality. The person who, if you write specifically for her, will make everyone else in the room feel seen too.

Who is she? And why is she the right call?`,

`Stage 5 — strategy becomes creative.

You've got your core customer, your organising idea, your language bank.

Now I need THREE concept directions. Not hooks yet, not formats — the broad message territories. The things this brand could be genuinely ABOUT in its ads.

Each concept should come directly from something in your customer research. No invented territories.

Walk me through Concept 1.`,

`Stage 6 — Brief Writing.

Strategy is worthless if the creator films the wrong thing.

Pick your strongest concept from Stage 5. We're going to write a full brief for it — all 8 components.

Start with the Overview. One paragraph. Tell me: who is this ad for, and what does it need to make them FEEL? Not what the product does — why this specific ad EXISTS.

Write it.`,

`Final stage — Analysis.

Before we set up the measurement framework, tell me: based on everything we've built, what do you think the most likely failure point is in Phase One?

Not "the ads won't work" — which specific link in the 5-link chain are you most worried about for this brand, and why?`,
];

// ─── DOCX EXPORT HELPER ────────────────────────────────────────────────────────
// Runs in-browser via a tiny Node-style script injected at runtime
// We use a lightweight approach: build a .docx using the docx library loaded via CDN-style workaround
// Since we can't use npm in the artifact, we'll use HTML Blob download with rich formatting
function generateDocxContent(brandName, stageNotes) {
  const sections = STAGES.map(st => {
    const notes = stageNotes[st.id] || "Not completed";
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAGE ${st.icon} — ${st.name.toUpperCase()}
${st.tag.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${notes}
`;
  }).join("\n");

  return `${brandName.toUpperCase()} — CREATIVE STRATEGY DOCUMENT
Generated by The Strategy Session
${"═".repeat(60)}

${sections}

${"═".repeat(60)}
END OF DOCUMENT
`;
}

// RTF export (works as a downloadable Word-compatible format from browser)
function buildRTF(brandName, stageNotes) {
  const escape = (str) => str
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\par\n");

  let body = `{\\rtf1\\ansi\\deff0\n{\\fonttbl{\\f0\\froman\\fcharset0 Georgia;}{\\f1\\fswiss\\fcharset0 Arial;}}\n{\\colortbl;\\red212\\green168\\blue83;\\red240\\green235\\blue224;\\red80\\green80\\blue80;}\n\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440\n`;

  // Title
  body += `\\f0\\fs48\\b\\cf2 ${escape(brandName)} \u2014 Creative Strategy\\par\n`;
  body += `\\f1\\fs20\\b0\\cf3 Generated by The Strategy Session\\par\\par\n`;
  body += `\\f1\\fs18\\cf3 ${"─".repeat(50)}\\par\\par\n`;

  STAGES.forEach(st => {
    const notes = stageNotes[st.id];
    // Stage header
    body += `\\f0\\fs28\\b\\cf1 Stage ${st.icon} \u2014 ${escape(st.name)}\\par\n`;
    body += `\\f1\\fs16\\b0\\cf3\\i ${escape(st.tag.toUpperCase())}\\i0\\par\n`;
    body += `\\f1\\fs18\\cf3 ${"─".repeat(40)}\\par\n`;
    
    if (notes) {
      body += `\\f1\\fs20\\cf2 ${escape(notes)}\\par\\par\n`;
    } else {
      body += `\\f1\\fs18\\cf3\\i Not completed.\\i0\\par\\par\n`;
    }
  });

  body += `}`;
  return body;
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function CreativeStrategyApp() {
  const [screen, setScreen]           = useState("landing");
  const [brandUrl, setBrandUrl]       = useState("");
  const [brandContext, setBrandContext] = useState("");
  const [brandName, setBrandName]     = useState("");
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [manualContext, setManualContext] = useState("");
  const [currentStage, setCurrentStage] = useState(1);
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showDoc, setShowDoc]         = useState(false);
  const [stageNotes, setStageNotes]   = useState({});
  const [pendingStage, setPendingStage] = useState(null); // stage awaiting user confirmation
  const [images, setImages]           = useState([]); // uploaded screenshots
  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);
  const fileInputRef   = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  // ── Brand Fetch ──────────────────────────────────────────────────────────────
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
            content: `You are a brand intelligence analyst. Use the web_search tool to look up real information about this brand: "${brandUrl.trim()}"

Search for the brand name + "reviews", "products", "about", and check their social channels.

After searching, produce a brand intelligence brief covering:
- Brand name (real one from the site)
- Founder story (if visible)
- Core products with prices and review counts
- Key claims and differentiators
- Target audience signals from copy
- Visual/aesthetic identity
- What they say vs what the evidence shows
- Social channels and posting style
- Price positioning
- Market sophistication level (First to market / Young / Established / Saturated / Commodity)

Be analytical. Flag contradictions or gaps. Max 500 words. Start your response with the brand name in bold.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
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

  // ── Session Start ────────────────────────────────────────────────────────────
  const startSession = () => {
    const ctx = brandContext || manualContext;
    if (!ctx.trim()) return;
    if (!brandName) {
      setBrandName("Brand");
    }
    setBrandContext(ctx);
    setScreen("session");
    setMessages([{
      role: "assistant",
      content: `Welcome. We're doing this properly.\n\nI've read the brand intelligence on ${brandName || "this brand"}. I have a point of view already — but I want to know what YOU see first.\n\nMy job: ask the questions that make you think harder than you want to. Your job: don't give me surface-level answers.\n\nAll 7 stages. I ask, you answer, we build the document together. When we're done you'll have a complete strategy ready to export.\n\nLet's go.\n\n──────────────────────\n\n${STAGE_OPENERS[0]}`
    }]);
  };

  // ── Image Upload ─────────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result.split(",")[1];
        const mediaType = file.type;
        setImages(prev => [...prev, { base64, mediaType, name: file.name }]);
        // Add a message to chat showing the image was received
        setMessages(prev => [...prev, {
          role: "user",
          content: `[Uploaded screenshot: ${file.name}]`,
          isImageNotice: true
        }]);
        // Send to AI for analysis
        sendImageToAI(base64, mediaType, file.name);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const sendImageToAI = async (base64, mediaType, fileName) => {
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: STRATEGIST_SYSTEM(brandContext, currentStage, stageNotes),
          messages: [
            ...messages.filter(m => !m.isImageNotice).map(m => ({ role: m.role, content: m.content })),
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: mediaType, data: base64 }
                },
                {
                  type: "text",
                  text: `I've uploaded a screenshot (${fileName}) for Stage ${currentStage} — ${STAGES[currentStage-1].name}. Read everything visible in this image. Extract any customer language, pain points, patterns, or insights that are relevant to our strategy work. What do you see, and how does it inform what we're building?`
                }
              ]
            }
          ]
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Couldn't read the image — try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      checkForStageComplete(reply);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue reading the image. Try again." }]);
    }
    setLoading(false);
  };

  // ── Stage Complete Detection ─────────────────────────────────────────────────
  const checkForStageComplete = (reply) => {
    // Save full stage notes when COMPLETE marker appears
    if (reply.includes("COMPLETE ✓") || (reply.includes("STAGE") && reply.includes("COMPLETE"))) {
      setStageNotes(prev => ({ ...prev, [currentStage]: reply }));
    }
    // Detect if AI is signalling readiness to move to next stage
    const nextStage = currentStage + 1;
    if (nextStage <= 7) {
      const signalsMove = 
        reply.toLowerCase().includes(`ready for stage ${nextStage}`) ||
        reply.toLowerCase().includes(`move to stage ${nextStage}`) ||
        reply.toLowerCase().includes(`stage ${nextStage} —`) ||
        (reply.includes("COMPLETE ✓") && reply.includes("Ready"));
      if (signalsMove) {
        setPendingStage(nextStage);
      }
    }
  };

  // ── Send Message ─────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Handle stage transition confirmation
    if (pendingStage) {
      const userText = input.trim().toLowerCase();
      const confirming = userText.includes("yes") || userText.includes("ready") || userText.includes("let's") || userText.includes("ok") || userText.includes("go") || userText.includes("move");
      const adding = userText.includes("add") || userText.includes("want") || userText.includes("actually") || userText.includes("one more") || userText.includes("wait");
      
      if (confirming && !adding) {
        const userMsg = { role: "user", content: input.trim() };
        setMessages(prev => [...prev, userMsg, {
          role: "assistant",
          content: `Good. Moving to Stage ${pendingStage} — ${STAGES[pendingStage-1].name}.\n\n──────────────────────\n\n${STAGE_OPENERS[pendingStage-1]}`
        }]);
        setCurrentStage(pendingStage);
        setPendingStage(null);
        setInput("");
        return;
      } else {
        setPendingStage(null); // they want to add more — cancel pending
      }
    }

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
          max_tokens: 4000,
          system: STRATEGIST_SYSTEM(brandContext, currentStage, stageNotes),
          messages: newMsgs
            .filter(m => !m.isImageNotice)
            .map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Connection issue — try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      checkForStageComplete(reply);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Check your network and try again." }]);
    }
    setLoading(false);
  };

  // ── Manual Stage Jump ─────────────────────────────────────────────────────────
  const jumpToStage = (s) => {
    if (s === currentStage) return;
    setPendingStage(null);
    setCurrentStage(s);
    setMessages(prev => [...prev, {
      role: "assistant",
      content: `Moving to Stage ${s} — ${STAGES[s-1].name}.\n\n──────────────────────\n\n${STAGE_OPENERS[s-1]}`
    }]);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Export .docx ──────────────────────────────────────────────────────────────
  const exportDoc = () => {
    const rtfContent = buildRTF(brandName, stageNotes);
    const blob = new Blob([rtfContent], { type: "application/rtf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brandName.replace(/\s+/g, "-").toLowerCase()}-creative-strategy.rtf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedStages = Object.keys(stageNotes).length;
  const allComplete = completedStages === 7;

  // ── Screens ───────────────────────────────────────────────────────────────────
  if (screen === "landing") return <Landing onStart={() => setScreen("setup")} />;

  if (screen === "setup") return (
    <Setup
      brandUrl={brandUrl}
      setBrandUrl={setBrandUrl}
      fetchStatus={fetchStatus}
      brandContext={brandContext}
      brandName={brandName}
      manualContext={manualContext}
      setManualContext={setManualContext}
      setBrandName={setBrandName}
      onFetch={fetchBrand}
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
              {stageNotes[st.id] ? "✓" : st.id}
            </button>
          ))}
          <div style={s.divider} />
          <button
            onClick={() => setShowDoc(d => !d)}
            style={{ ...s.docBtn, ...(showDoc ? s.docBtnActive : {}) }}
          >
            {showDoc ? "HIDE DOC" : "LIVE DOC"}
          </button>
          {completedStages > 0 && (
            <button onClick={exportDoc} style={s.exportBtn} title="Download strategy as Word document">
              ↓ EXPORT
            </button>
          )}
        </div>
      </div>

      {/* STAGE BANNER */}
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

      {/* PENDING STAGE TRANSITION BANNER */}
      {pendingStage && (
        <div style={s.transitionBanner}>
          <span style={{ color: "#d4a853" }}>Stage {currentStage} complete.</span>
          <span style={{ color: "#666", marginLeft: 8 }}>Ready to move to Stage {pendingStage} — {STAGES[pendingStage-1].name}? Reply "yes" to continue, or keep adding to this stage.</span>
        </div>
      )}

      {/* BODY */}
      <div style={s.body}>
        {/* CHAT */}
        <div style={{ ...s.chat, maxWidth: showDoc ? "58%" : "100%" }}>
          <div style={s.messages}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...s.msgRow, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
                {!m.isImageNotice && (
                  <div style={{ ...s.avatar, background: m.role === "assistant" ? "linear-gradient(135deg,#d4a853,#8b5e3c)" : "#1a1a2a", border: m.role === "user" ? "1px solid #2a2a4a" : "none" }}>
                    {m.role === "assistant" ? "S" : "Y"}
                  </div>
                )}
                <div style={{
                  ...s.bubble,
                  ...(m.role === "user" ? s.bubbleUser : s.bubbleBot),
                  ...(m.isImageNotice ? s.imageNotice : {})
                }}>
                  {m.role === "assistant" && !m.isImageNotice && (
                    <div style={s.bubbleLabel}>SENIOR STRATEGIST</div>
                  )}
                  <div style={{ ...s.bubbleText, color: m.isImageNotice ? "#555" : m.role === "assistant" ? "#d8d0c8" : "#9090b0", fontStyle: m.isImageNotice ? "italic" : "normal" }}>
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

          {/* INPUT AREA */}
          <div style={s.inputArea}>
            {/* Image upload strip */}
            <div style={s.uploadStrip}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={s.uploadBtn}
                title="Upload review screenshots, Reddit posts, social comments for analysis"
              >
                📎 Upload Screenshot
              </button>
              {images.length > 0 && (
                <span style={{ color: "#333", fontSize: 10, fontFamily: "monospace" }}>
                  {images.length} image{images.length > 1 ? "s" : ""} uploaded
                </span>
              )}
            </div>
            <div style={s.inputWrap}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={pendingStage ? `Reply "yes" to move to Stage ${pendingStage}, or keep adding...` : "Answer the question. Be specific — vague answers get pushed back on..."}
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

        {/* DOCUMENT PANEL */}
        {showDoc && (
          <div style={s.docPanel}>
            <div style={s.docHeader}>
              <div>
                <div style={s.docLive}>● LIVE DOCUMENT</div>
                <div style={s.docTitle}>{brandName} Creative Strategy</div>
              </div>
              {completedStages > 0 && (
                <button onClick={exportDoc} style={s.docExportBtn}>
                  ↓ .docx
                </button>
              )}
            </div>
            <div style={s.docScroll}>
              {STAGES.map(st => (
                <div key={st.id} style={s.docStage}>
                  <div style={s.docStageHeader}>
                    <span style={{ ...s.docStageNum, color: stageNotes[st.id] ? st.color : st.id === currentStage ? st.color + "88" : "#2a2a2a" }}>
                      {stageNotes[st.id] ? "✓" : st.icon}
                    </span>
                    <span style={{ ...s.docStageName, color: stageNotes[st.id] ? "#aaa" : st.id === currentStage ? "#666" : "#333" }}>
                      {st.name}
                    </span>
                  </div>
                  <div style={{ ...s.docStageBox, borderColor: st.id === currentStage ? st.color + "33" : "#1a1a22" }}>
                    {stageNotes[st.id] ? (
                      <div style={{ ...s.docNote, color: "#666" }}>
                        {/* Show first meaningful chunk of the stage summary */}
                        {stageNotes[st.id].split("\n").slice(0, 8).join("\n").slice(0, 400)}
                        {stageNotes[st.id].length > 400 ? "..." : ""}
                      </div>
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

              {allComplete ? (
                <div style={{ ...s.docFuture, borderColor: "#d4a85333" }}>
                  <div style={{ ...s.docFutureLabel, color: "#4a8a4a" }}>✓ ALL 7 STAGES COMPLETE</div>
                  <button onClick={exportDoc} style={s.exportFullBtn}>
                    ↓ Download Strategy Document (.rtf / Word)
                  </button>
                </div>
              ) : (
                <div style={s.docFuture}>
                  <div style={s.docFutureLabel}>AFTER ALL 7 STAGES</div>
                  <div style={s.docFutureItem}>→  Complete strategy document (.docx)</div>
                  <div style={{ ...s.docFutureItem, marginBottom: 0 }}>{completedStages}/7 stages done</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes dotPulse { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1)} }
        @keyframes liveBlink { 0%,100%{opacity:.3} 50%{opacity:1} }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { background:#080810; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:#080810; }
        ::-webkit-scrollbar-thumb { background:#222230; border-radius:2px; }
        textarea::placeholder { color:#252535; }
        textarea { caret-color:#d4a853; }
      `}</style>
    </div>
  );
}

// ─── LANDING ───────────────────────────────────────────────────────────────────
function Landing({ onStart }) {
  return (
    <div style={{ minHeight:"100vh", background:"#080810", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif" }}>
      <div style={{ maxWidth:560, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:11, letterSpacing:8, color:"#d4a853", fontFamily:"monospace", textTransform:"uppercase", marginBottom:40 }}>
          Creative Strategy System
        </div>
        <h1 style={{ fontSize:58, color:"#f0ebe0", fontWeight:"normal", lineHeight:1.1, marginBottom:20 }}>
          The Strategy<br />Session
        </h1>
        <p style={{ color:"#555", fontSize:17, lineHeight:1.8, marginBottom:48, maxWidth:420, margin:"0 auto 48px" }}>
          Paste any brand URL. Work through all 7 stages with a senior creative strategist who pushes back. Walk out with a complete strategy document.
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:48, maxWidth:360, margin:"0 auto 48px" }}>
          {[
            "Brand Audit + Strategic Tension",
            "Market Research + White Space",
            "Customer Research + Language Bank",
            "Strategic Foundation + Organising Idea",
            "Creative Planning + Hook Battery",
            "Brief Writing + GBP Method",
            "Analysis Framework + 5-Link Chain"
          ].map((item, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
              <span style={{ color:"#d4a853", fontFamily:"monospace", fontSize:11, width:20, flexShrink:0 }}>0{i+1}</span>
              <span style={{ color:"#444", fontSize:13 }}>{item}</span>
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
        <div style={{ color:"#252525", fontSize:11, marginTop:20, fontFamily:"monospace", letterSpacing:1 }}>
          Works for any brand · Any industry · Any stage
        </div>
      </div>
    </div>
  );
}

// ─── SETUP ─────────────────────────────────────────────────────────────────────
function Setup({ brandUrl, setBrandUrl, fetchStatus, brandContext, brandName, manualContext, setManualContext, setBrandName, onFetch, onStart }) {
  const canStart = (fetchStatus === "done" && brandContext) || manualContext.trim().length > 20;

  return (
    <div style={{ minHeight:"100vh", background:"#080810", display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif" }}>
      <div style={{ maxWidth:580, width:"100%" }}>
        <div style={{ fontSize:11, letterSpacing:6, color:"#d4a853", fontFamily:"monospace", marginBottom:32 }}>
          STEP 1 OF 1 — BRAND SETUP
        </div>
        <h2 style={{ fontSize:36, color:"#f0ebe0", fontWeight:"normal", marginBottom:12 }}>
          What brand are we working on?
        </h2>
        <p style={{ color:"#555", fontSize:15, lineHeight:1.7, marginBottom:36 }}>
          Paste the brand's website URL. I'll read it and build a brand intelligence brief before we start the session.
        </p>

        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <input
            value={brandUrl}
            onChange={e => setBrandUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onFetch()}
            placeholder="https://brandname.com"
            style={{ flex:1, background:"#0f0f1a", border:"1px solid #1e1e30", borderRadius:10, padding:"14px 18px", color:"#d8d0c8", fontSize:15, fontFamily:"monospace", outline:"none" }}
            onFocus={e => e.target.style.borderColor = "#d4a853"}
            onBlur={e => e.target.style.borderColor = "#1e1e30"}
          />
          <button
            onClick={onFetch}
            disabled={!brandUrl.trim() || fetchStatus === "fetching"}
            style={{ background: brandUrl.trim() ? "linear-gradient(135deg,#d4a853,#8b5e3c)" : "#111", border:"none", borderRadius:10, padding:"14px 24px", color: brandUrl.trim() ? "#fff" : "#333", fontSize:14, fontFamily:"monospace", cursor: brandUrl.trim() ? "pointer" : "default", letterSpacing:1, whiteSpace:"nowrap" }}
          >
            {fetchStatus === "fetching" ? "READING..." : "READ BRAND"}
          </button>
        </div>

        {fetchStatus === "fetching" && (
          <div style={{ background:"#0f0f1a", border:"1px solid #1e1e30", borderRadius:10, padding:"20px 24px", marginBottom:20 }}>
            <div style={{ color:"#d4a853", fontSize:12, fontFamily:"monospace", letterSpacing:2, marginBottom:12 }}>READING BRAND INTELLIGENCE...</div>
            <div style={{ display:"flex", gap:6 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ height:3, flex:1, background:"#1e1e30", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:"#d4a853", borderRadius:2, animation:`loadBar 1.5s ${i*0.1}s ease-in-out infinite` }} />
                </div>
              ))}
            </div>
            <style>{`@keyframes loadBar { 0%,100%{width:0%} 50%{width:100%} }`}</style>
          </div>
        )}

        {fetchStatus === "done" && brandContext && (
          <div style={{ background:"#0c0c16", border:"1px solid #d4a85333", borderRadius:12, padding:"20px 24px", marginBottom:24 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ color:"#d4a853", fontSize:11, fontFamily:"monospace", letterSpacing:3 }}>
                BRAND INTELLIGENCE — {brandName.toUpperCase()}
              </div>
              <div style={{ background:"#1a2a1a", border:"1px solid #2a4a2a", borderRadius:20, padding:"3px 10px", color:"#4a8a4a", fontSize:10, fontFamily:"monospace" }}>
                ● READY
              </div>
            </div>
            <div style={{ color:"#666", fontSize:13, lineHeight:1.8, maxHeight:180, overflowY:"auto" }}>
              {brandContext.slice(0, 600)}...
            </div>
          </div>
        )}

        {fetchStatus === "error" && (
          <div style={{ background:"#1a0c0c", border:"1px solid #4a2a2a", borderRadius:10, padding:"16px 20px", marginBottom:20, color:"#c06060", fontSize:13 }}>
            Couldn't read that URL. Paste what you know about the brand below to continue.
          </div>
        )}

        <div style={{ marginBottom:20 }}>
          <div style={{ color:"#333", fontSize:12, fontFamily:"monospace", marginBottom:8, letterSpacing:1 }}>
            {fetchStatus === "done" ? "ADD EXTRA BRAND NOTES (optional)" : "OR PASTE BRAND NOTES MANUALLY"}
          </div>
          {fetchStatus !== "done" && (
            <input
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="Brand name"
              style={{ width:"100%", background:"#0f0f1a", border:"1px solid #1e1e30", borderRadius:8, padding:"10px 14px", color:"#d8d0c8", fontSize:13, fontFamily:"monospace", outline:"none", marginBottom:8 }}
            />
          )}
          <textarea
            value={manualContext}
            onChange={e => setManualContext(e.target.value)}
            placeholder="Paste what you know about the brand — products, founder story, claims, positioning, target audience..."
            rows={5}
            style={{ width:"100%", background:"#0f0f1a", border:"1px solid #1e1e30", borderRadius:10, padding:"14px 18px", color:"#888", fontSize:13, fontFamily:"monospace", outline:"none", resize:"vertical", lineHeight:1.6 }}
          />
        </div>

        {canStart && (
          <button
            onClick={onStart}
            style={{ width:"100%", background:"linear-gradient(135deg,#d4a853,#8b5e3c)", border:"none", borderRadius:12, padding:"18px", color:"#fff", fontSize:17, fontFamily:"inherit", cursor:"pointer", letterSpacing:1, boxShadow:"0 8px 40px rgba(212,168,83,.25)" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 50px rgba(212,168,83,.4)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 40px rgba(212,168,83,.25)"}
          >
            Begin Strategy Session{brandName ? ` with ${brandName}` : ""} →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────────────
const s = {
  app:            { minHeight:"100vh", background:"#080810", display:"flex", flexDirection:"column", fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif" },
  topbar:         { background:"#0b0b14", borderBottom:"1px solid #141420", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, flexWrap:"wrap", gap:10 },
  topbarLeft:     { display:"flex", alignItems:"center", gap:12 },
  logoMark:       { width:34, height:34, background:"linear-gradient(135deg,#d4a853,#8b5e3c)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", fontFamily:"monospace", fontWeight:"bold", flexShrink:0 },
  topbarTitle:    { color:"#c8c0b0", fontSize:14 },
  topbarSub:      { color:"#333", fontSize:10, fontFamily:"monospace", letterSpacing:1, marginTop:2 },
  topbarRight:    { display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" },
  stagePill:      { width:26, height:26, borderRadius:"50%", border:"1.5px solid", background:"transparent", fontSize:10, fontFamily:"monospace", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" },
  divider:        { width:1, height:20, background:"#1a1a22", margin:"0 6px" },
  docBtn:         { background:"transparent", border:"1px solid #1e1e2a", borderRadius:6, padding:"5px 12px", color:"#333", fontSize:10, fontFamily:"monospace", letterSpacing:1, cursor:"pointer", transition:"all .2s" },
  docBtnActive:   { borderColor:"#d4a853", color:"#d4a853", background:"rgba(212,168,83,.08)" },
  exportBtn:      { background:"transparent", border:"1px solid #2a4a2a", borderRadius:6, padding:"5px 12px", color:"#4a8a4a", fontSize:10, fontFamily:"monospace", letterSpacing:1, cursor:"pointer" },
  stageBanner:    { background:"#0a0a12", borderBottom:"1px solid #121220", borderLeft:"3px solid", padding:"8px 20px", display:"flex", alignItems:"center", gap:10 },
  stageNum:       { fontSize:11, fontFamily:"monospace", letterSpacing:3, fontWeight:"bold" },
  stageSep:       { color:"#222", fontSize:11 },
  stageTag:       { color:"#333", fontSize:10, fontFamily:"monospace", letterSpacing:2 },
  skipBtn:        { marginLeft:"auto", background:"transparent", border:"none", color:"#333", fontSize:10, fontFamily:"monospace", letterSpacing:1, cursor:"pointer", padding:"4px 0", transition:"color .2s" },
  transitionBanner: { background:"#0d0d10", borderBottom:"1px solid #1a1a14", padding:"8px 20px", fontSize:12, fontFamily:"monospace" },
  body:           { display:"flex", flex:1, overflow:"hidden" },
  chat:           { flex:1, display:"flex", flexDirection:"column", transition:"max-width .3s", overflow:"hidden" },
  messages:       { flex:1, overflowY:"auto", padding:"28px 24px", display:"flex", flexDirection:"column", gap:22 },
  msgRow:         { display:"flex", gap:12, alignItems:"flex-start" },
  avatar:         { width:34, height:34, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#f0ebe0", fontFamily:"monospace", fontWeight:"bold" },
  bubble:         { maxWidth:"76%", borderRadius:12, padding:"14px 18px" },
  bubbleBot:      { background:"#0e0e18", border:"1px solid #161624", borderRadius:"3px 12px 12px 12px" },
  bubbleUser:     { background:"#12121e", border:"1px solid #1e1e34", borderRadius:"12px 3px 12px 12px" },
  imageNotice:    { background:"transparent", border:"1px solid #1a1a22", borderRadius:8, padding:"8px 14px", maxWidth:"60%" },
  bubbleLabel:    { fontSize:9, color:"#d4a853", fontFamily:"monospace", letterSpacing:3, marginBottom:8, textTransform:"uppercase" },
  bubbleText:     { fontSize:14, lineHeight:1.8, whiteSpace:"pre-wrap" },
  dots:           { display:"flex", gap:5, alignItems:"center", padding:"4px 0" },
  dot:            { width:7, height:7, borderRadius:"50%", background:"#d4a853", animation:"dotPulse 1.2s ease-in-out infinite", display:"inline-block" },
  inputArea:      { padding:"10px 20px 14px", borderTop:"1px solid #111118", background:"#0b0b12" },
  uploadStrip:    { display:"flex", alignItems:"center", gap:12, marginBottom:8 },
  uploadBtn:      { background:"transparent", border:"1px solid #1a1a28", borderRadius:6, padding:"4px 10px", color:"#444", fontSize:11, fontFamily:"monospace", cursor:"pointer", letterSpacing:.5 },
  inputWrap:      { display:"flex", gap:10, alignItems:"flex-end", background:"#0e0e18", border:"1px solid #1a1a28", borderRadius:14, padding:"10px 14px" },
  textarea:       { flex:1, background:"transparent", border:"none", outline:"none", color:"#c8c0b0", fontSize:14, fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif", lineHeight:1.6, resize:"none" },
  sendBtn:        { width:34, height:34, borderRadius:"50%", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#fff", flexShrink:0, transition:"all .2s" },
  inputHint:      { textAlign:"center", marginTop:6, color:"#1e1e28", fontSize:10, fontFamily:"monospace", letterSpacing:.5 },
  docPanel:       { width:"42%", borderLeft:"1px solid #111118", background:"#090912", display:"flex", flexDirection:"column", overflow:"hidden" },
  docHeader:      { padding:"14px 18px", borderBottom:"1px solid #111118", display:"flex", alignItems:"center", justifyContent:"space-between" },
  docLive:        { fontSize:9, color:"#4a8a4a", fontFamily:"monospace", letterSpacing:3, marginBottom:4 },
  docTitle:       { color:"#666", fontSize:13 },
  docExportBtn:   { background:"transparent", border:"1px solid #2a4a2a", borderRadius:6, padding:"5px 10px", color:"#4a8a4a", fontSize:10, fontFamily:"monospace", cursor:"pointer" },
  docScroll:      { flex:1, overflowY:"auto", padding:"16px" },
  docStage:       { marginBottom:18 },
  docStageHeader: { display:"flex", alignItems:"center", gap:8, marginBottom:8 },
  docStageNum:    { fontSize:10, fontFamily:"monospace", fontWeight:"bold", letterSpacing:1, transition:"color .5s" },
  docStageName:   { fontSize:11, fontFamily:"monospace", letterSpacing:1, transition:"color .5s" },
  docStageBox:    { background:"#0d0d16", border:"1px solid #111118", borderRadius:8, padding:"10px 12px", minHeight:44, transition:"border-color .3s" },
  docNote:        { fontSize:11, lineHeight:1.6, whiteSpace:"pre-wrap" },
  liveDot:        { width:6, height:6, borderRadius:"50%", background:"#d4a853", display:"inline-block", animation:"liveBlink 1.5s ease-in-out infinite", flexShrink:0 },
  docFuture:      { background:"#0a0a10", border:"1px solid #111118", borderRadius:10, padding:"14px", marginTop:8 },
  docFutureLabel: { color:"#222", fontSize:9, fontFamily:"monospace", letterSpacing:3, marginBottom:10 },
  docFutureItem:  { color:"#252530", fontSize:12, padding:"7px 10px", background:"#0d0d14", borderRadius:6, border:"1px solid #111118", marginBottom:6 },
  exportFullBtn:  { width:"100%", background:"linear-gradient(135deg,#d4a853,#8b5e3c)", border:"none", borderRadius:8, padding:"12px", color:"#fff", fontSize:13, fontFamily:"monospace", cursor:"pointer", letterSpacing:1, marginTop:4 },
};
