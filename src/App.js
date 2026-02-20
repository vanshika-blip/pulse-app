import { useState, useEffect } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
const BACKEND_URL = "https://pulse-backend-mob2.onrender.com"; // Change this if you deploy the backend

// ─── Pulse Logo ───────────────────────────────────────────────────────────────
const PulseLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="6" fill="#000" stroke="#00FF87" strokeWidth="1"/>
    <polyline points="4,20 10,20 13,10 17,30 21,14 25,26 28,20 36,20"
      fill="none" stroke="#00FF87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="36" cy="20" r="2.5" fill="#00FF87"/>
  </svg>
);

const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const RedditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);
const LinkedInIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const PLATFORMS = {
  twitter:  { name:"X / Twitter", Icon:XIcon,        color:"#1DA1F2" },
  reddit:   { name:"Reddit",       Icon:RedditIcon,   color:"#FF4500" },
  linkedin: { name:"LinkedIn",     Icon:LinkedInIcon, color:"#0A66C2" },
};

function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h/24)}d`;
}

function exportCSV(rows) {
  const h = ["Post ID","Platform","Author","URL","Content","Comment","Timestamp"];
  const lines = [h.join(","), ...rows.map(r =>
    [r.postId,r.platform,r.author,r.url,`"${r.content.replace(/"/g,'""')}"`,`"${(r.comment||"").replace(/"/g,'""')}"`,r.timestamp].join(",")
  )];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/csv"}));
  a.download = `pulse-${Date.now()}.csv`; a.click();
}

export default function App() {
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedError, setFeedError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [aiComments, setAiComments] = useState([]);
  const [chosen, setChosen] = useState("");
  const [custom, setCustom] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [history, setHistory] = useState([]);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("h_oai")||"");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [commentModal, setCommentModal] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // ─── Load history from localStorage
  useEffect(() => {
    const h = localStorage.getItem("h_hist");
    if (h) setHistory(JSON.parse(h));
  }, []);

  // ─── Fetch posts from backend on mount
// eslint-disable-next-line react-hooks/exhaustive-deps
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
    fetchPosts();
  }, []);


  const fetchPosts = async () => {
    setLoadingFeed(true);
    setFeedError(null);
    try {
      // Merge with skipped/commented statuses from localStorage
      const savedStatuses = JSON.parse(localStorage.getItem("h_statuses") || "{}");

      const res = await fetch(`${BACKEND_URL}/posts`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      // Apply saved statuses (skip/comment) so user actions persist across refresh
      const merged = data.map(p => ({
        ...p,
        status: savedStatuses[p.id] || "pending",
      }));

      setPosts(merged);
      setLastRefresh(new Date());
      showToast(`Loaded ${data.length} posts`, "ok");
    } catch (err) {
      setFeedError(err.message);
      showToast("Backend not reachable — run server.js", "err");
    }
    setLoadingFeed(false);
  };

  const saveStatus = (id, status) => {
    const saved = JSON.parse(localStorage.getItem("h_statuses") || "{}");
    saved[id] = status;
    localStorage.setItem("h_statuses", JSON.stringify(saved));
  };

  const saveHist = h => { setHistory(h); localStorage.setItem("h_hist", JSON.stringify(h)); };
  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const openComment = post => { setSelected(post); setAiComments([]); setChosen(""); setCustom(""); setCommentModal(true); };

  const skipPost = id => {
    setPosts(p => p.map(x => x.id===id ? {...x, status:"skipped"} : x));
    saveStatus(id, "skipped");
    showToast("Skipped","info");
  };

  const removePost = id => {
    setPosts(p => p.filter(x => x.id!==id));
    saveStatus(id, "removed");
    showToast("Removed","warn");
  };

  // ─── OpenAI Comment Generation
  const generate = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch(`${BACKEND_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: selected.platform,
          authorName: selected.authorName,
          content: selected.content,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Generation failed"); }
      const data = await res.json();
      setAiComments(data.comments);
      setChosen(data.comments[0]);
    } catch(e) { showToast(e.message || "Generation failed","err"); }
    setLoadingAI(false);
  };
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 600,
          messages: [
            {
              role: "system",
              content: "You are a social media engagement expert. Always respond with valid JSON only — no markdown, no extra text.",
            },
            {
              role: "user",
              content: `Generate 3 distinct engaging comments for this ${selected.platform} post. Return ONLY a JSON array of 3 strings.

Post by ${selected.authorName}: "${selected.content}"

Rules:
- Comment 1: Insightful/analytical
- Comment 2: Personal/relatable
- Comment 3: Question/curious
- 1-3 sentences each, genuine tone, no hashtags
Return only: ["c1","c2","c3"]`,
            },
          ],
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || "OpenAI error"); }
      const data = await res.json();
      const txt = data.choices?.[0]?.message?.content || "[]";
      const parsed = JSON.parse(txt.replace(/```json|```/g,"").trim());
      setAiComments(parsed);
      setChosen(parsed[0]);
    } catch(e) { showToast(e.message || "Generation failed","err"); }
    setLoadingAI(false);
  };

  const postComment = () => {
    const c = custom || chosen;
    if (!c) { showToast("Pick or write a comment","err"); return; }
    const entry = {...selected, comment:c, commentedAt:new Date().toISOString(), status:"commented"};
    saveHist([entry,...history]);
    setPosts(p => p.map(x => x.id===selected.id ? {...x, status:"commented"} : x));
    saveStatus(selected.id, "commented");
    showToast("Comment saved to history ✓");
    setCommentModal(false);
    setSelected(null);
  };

  const feedPosts = posts.filter(p => p.status==="pending" && (filter==="all" || p.platform===filter));
  const pendingN  = posts.filter(p => p.status==="pending").length;

  const TABS = [
    {id:"feed",    label:"Feed",    icon:"⊞"},
    {id:"history", label:"History", icon:"◷"},
    {id:"settings",label:"Settings",icon:"⚙"},
  ];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    :root {
      --bg:#000; --surf:#0A0A0A; --surf2:#111; --border:rgba(0,255,135,0.15);
      --green:#00FF87; --green2:#00CC6A; --text:#E0FFE8; --muted:#1A3A25; --muted2:#3A7A50; --r:10px;
    }
    body { background:var(--bg); font-family:'Space Mono',monospace; color:var(--text); }
    .app { min-height:100vh; display:flex; flex-direction:column; }
    .hdr { background:var(--surf); border-bottom:1px solid var(--border); padding:12px 20px;
           display:flex; align-items:center; gap:12px; position:sticky; top:0; z-index:200;
           box-shadow:0 4px 20px rgba(0,255,135,0.05); }
    .hdr-title h1 { font-size:18px; letter-spacing:3px; text-transform:uppercase; color:var(--green);
                    text-shadow:0 0 20px rgba(0,255,135,0.5); }
    .hdr-title p { font-size:9px; color:var(--muted2); letter-spacing:2px; text-transform:uppercase; margin-top:1px; }
    .hdr-right { margin-left:auto; display:flex; align-items:center; gap:8px; }
    .badge { background:var(--green); color:#000; border-radius:4px; padding:2px 9px; font-size:11px; font-weight:700; }
    .layout { display:flex; flex:1; }
    .sidenav { width:220px; background:var(--surf); border-right:1px solid var(--border);
               padding:24px 12px; display:flex; flex-direction:column; gap:4px;
               position:sticky; top:57px; height:calc(100vh - 57px); overflow:auto; }
    .sidenav-btn { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:6px;
                   background:none; border:none; color:var(--muted2); cursor:pointer; font-size:12px;
                   font-family:'Space Mono',monospace; width:100%; text-align:left; transition:all .2s; }
    .sidenav-btn:hover { background:var(--surf2); color:var(--text); border-left:2px solid var(--green); padding-left:12px; }
    .sidenav-btn.active { background:rgba(0,255,135,.08); color:var(--green); font-weight:700;
                          border-left:2px solid var(--green); }
    .sidenav-btn .icon { font-size:15px; width:20px; text-align:center; }
    .sidenav-section { font-size:9px; color:var(--muted2); text-transform:uppercase; letter-spacing:2px;
                       padding:16px 14px 6px; font-weight:700; }
    .sidenav-stats { background:var(--surf2); border:1px solid var(--border); border-radius:6px;
                     padding:12px; margin-top:auto; }
    .stat-row { display:flex; justify-content:space-between; font-size:11px; margin-bottom:6px; }
    .stat-num { color:var(--green); font-weight:700; }
    .main { flex:1; overflow:auto; }
    .filterbar { padding:16px 20px 12px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
    .chip { background:var(--surf); border:1px solid var(--border); color:var(--muted2); border-radius:4px;
            padding:5px 14px; font-size:11px; font-weight:700; cursor:pointer; transition:all .2s;
            display:flex; align-items:center; gap:6px; font-family:'Space Mono',monospace; }
    .chip:hover { border-color:var(--green); color:var(--text); }
    .chip.on { background:var(--green); color:#000; border-color:var(--green); }
    .refresh-btn { background:transparent; border:1px solid var(--border); color:var(--muted2);
                   border-radius:4px; padding:5px 14px; font-size:11px; font-weight:700; cursor:pointer;
                   font-family:'Space Mono',monospace; margin-left:auto; display:flex; align-items:center; gap:6px;
                   transition:all .2s; }
    .refresh-btn:hover { border-color:var(--green); color:var(--green); }
    .refresh-btn:disabled { opacity:.4; cursor:not-allowed; }
    .grid { padding:0 20px 100px; columns:1; column-gap:14px; }
    @media(min-width:640px)  { .grid { columns:2; } }
    @media(min-width:1024px) { .grid { columns:3; } }
    .widget { break-inside:avoid; margin-bottom:14px; background:var(--surf); border:1px solid var(--border);
              border-radius:var(--r); overflow:hidden; transition:transform .15s,box-shadow .15s,border-color .15s;
              animation:fadeUp .4s ease both; }
    .widget:hover { transform:translateY(-2px); border-color:rgba(0,255,135,0.35);
                    box-shadow:0 8px 32px rgba(0,0,0,.8),0 0 20px rgba(0,255,135,0.08); }
    @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    .w-stripe { height:2px; }
    .w-head { padding:12px 14px 8px; display:flex; align-items:flex-start; gap:8px; }
    .w-plat { display:flex; align-items:center; gap:5px; font-size:10px; font-weight:700;
              border-radius:4px; padding:3px 9px; flex-shrink:0; }
    .w-meta { flex:1; min-width:0; }
    .w-author { font-size:11px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--green); }
    .w-title  { font-size:11px; font-weight:700; color:var(--text); line-height:1.4; margin-bottom:3px; }
    .w-time   { font-size:9px; color:var(--muted2); }
    .w-body   { padding:0 14px 10px; font-size:12px; line-height:1.7; color:#6ACA8A; }
    .w-foot   { padding:8px 14px; border-top:1px solid var(--border); display:flex; align-items:center; gap:6px; }
    .w-stat   { font-size:10px; color:var(--muted2); }
    .w-actions { margin-left:auto; display:flex; gap:6px; }
    .btn-skip { background:transparent; border:1px solid var(--border); color:var(--muted2);
                border-radius:4px; padding:5px 11px; font-size:10px; cursor:pointer;
                font-family:'Space Mono',monospace; font-weight:700; transition:all .15s; }
    .btn-skip:hover { border-color:var(--muted2); color:var(--text); }
    .btn-remove { background:transparent; border:1px solid rgba(239,68,68,.25); color:#EF4444;
                  border-radius:4px; padding:5px 11px; font-size:10px; cursor:pointer;
                  font-family:'Space Mono',monospace; font-weight:700; transition:all .15s; }
    .btn-remove:hover { background:rgba(239,68,68,.1); border-color:#EF4444; }
    .btn-comment { background:var(--green); color:#000; border:none; border-radius:4px;
                   padding:5px 13px; font-size:10px; font-weight:700; cursor:pointer;
                   font-family:'Space Mono',monospace; transition:all .15s; }
    .btn-comment:hover { background:var(--green2); }
    .bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0; background:var(--surf);
                  border-top:1px solid var(--border); padding:8px 0 14px; z-index:200; }
    .bnav-btn { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px;
                background:none; border:none; color:var(--muted2); cursor:pointer;
                font-family:'Space Mono',monospace; font-size:9px; padding:4px 0; transition:color .2s; }
    .bnav-btn.active { color:var(--green); }
    .bnav-icon { font-size:18px; line-height:1; }
    @media(max-width:767px) {
      .sidenav { display:none!important; }
      .bottom-nav { display:flex!important; }
      .main { padding-bottom:70px; }
    }
    @media(min-width:768px) { .bottom-nav { display:none!important; } }
    .overlay { position:fixed; inset:0; background:rgba(0,0,0,.88); z-index:500;
               display:flex; align-items:flex-end; justify-content:center;
               backdrop-filter:blur(4px); animation:fadeIn .2s ease; }
    @media(min-width:600px) { .overlay { align-items:center; } }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .modal { background:var(--surf); border:1px solid var(--border); border-radius:10px 10px 0 0;
             width:100%; max-width:560px; max-height:90vh; overflow-y:auto; padding:24px 20px;
             animation:slideUp .25s ease; position:relative; }
    @media(min-width:600px) { .modal { border-radius:10px; } }
    @keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
    .modal-handle { width:36px; height:3px; background:var(--border); border-radius:2px; margin:0 auto 20px; }
    .modal-section { font-size:9px; color:var(--green); text-transform:uppercase; letter-spacing:2px;
                     font-weight:700; margin-bottom:10px; margin-top:18px; }
    .modal-post { background:var(--surf2); border-radius:6px; padding:14px; font-size:12px; line-height:1.7;
                  color:#6ACA8A; border-left:2px solid var(--green); margin-bottom:4px; }
    .gen-btn { width:100%; background:#050505; border:1px solid var(--green); color:var(--green);
               border-radius:6px; padding:13px; font-size:13px; font-weight:700; cursor:pointer;
               font-family:'Space Mono',monospace; display:flex; align-items:center; justify-content:center;
               gap:8px; transition:all .2s; margin-top:16px; }
    .gen-btn:hover { background:var(--green); color:#000; }
    .gen-btn:disabled { opacity:.4; cursor:not-allowed; }
    .spin { width:16px; height:16px; border:2px solid transparent; border-top-color:currentColor;
            border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg)} }
    .c-opt { background:var(--surf2); border:1px solid var(--border); border-radius:6px;
             padding:13px 14px; margin-bottom:9px; cursor:pointer; transition:all .2s; position:relative; }
    .c-opt.sel { border-color:var(--green); background:rgba(0,255,135,.06); }
    .c-tag { position:absolute; top:-9px; left:12px; background:var(--surf); border:1px solid var(--border);
             font-size:9px; color:var(--muted2); padding:2px 8px; border-radius:4px; font-weight:700; }
    .c-opt.sel .c-tag { background:var(--green); color:#000; border-color:var(--green); }
    .c-text { font-size:12px; line-height:1.6; color:#6ACA8A; margin-top:4px; }
    .c-area { width:100%; background:var(--surf2); border:1px solid var(--border); border-radius:6px;
              padding:12px 14px; color:var(--text); font-size:12px; line-height:1.6; resize:none;
              font-family:'Space Mono',monospace; margin-bottom:14px; min-height:90px; }
    .c-area:focus { outline:none; border-color:var(--green); }
    .post-btn { width:100%; background:var(--green); color:#000; border:none; border-radius:6px;
                padding:15px; font-size:14px; font-weight:700; cursor:pointer;
                font-family:'Space Mono',monospace; transition:all .2s; }
    .post-btn:hover { background:var(--green2); }
    .close-btn { position:absolute; top:20px; right:20px; background:var(--surf2); border:1px solid var(--border);
                 color:var(--muted2); border-radius:4px; width:30px; height:30px; font-size:16px;
                 cursor:pointer; display:flex; align-items:center; justify-content:center; }
    .page { padding:20px; max-width:900px; }
    .page-title { font-size:22px; margin-bottom:4px; font-weight:700; letter-spacing:2px;
                  text-transform:uppercase; color:var(--green); }
    .page-sub { font-size:11px; color:var(--muted2); margin-bottom:20px; }
    .hist-grid { display:grid; grid-template-columns:1fr; gap:12px; }
    @media(min-width:640px) { .hist-grid { grid-template-columns:1fr 1fr; } }
    .hist-card { background:var(--surf); border:1px solid var(--border); border-radius:8px; padding:16px; }
    .hist-comment { background:rgba(0,255,135,.05); border:1px solid rgba(0,255,135,.15); border-radius:6px;
                    padding:10px 13px; font-size:11px; color:#6ACA8A; line-height:1.6; margin-top:10px; }
    .hist-label { font-size:9px; color:var(--green); text-transform:uppercase; letter-spacing:1.5px;
                  font-weight:700; margin-bottom:4px; }
    .export-btn { background:transparent; border:1px solid var(--green); color:var(--green); border-radius:4px;
                  padding:8px 18px; font-size:11px; font-weight:700; cursor:pointer;
                  font-family:'Space Mono',monospace; display:inline-flex; align-items:center; gap:6px; margin-bottom:16px; }
    .export-btn:hover { background:var(--green); color:#000; }
    .settings-card { background:var(--surf); border:1px solid var(--border); border-radius:8px;
                     padding:20px; margin-bottom:14px; }
    .cc-title { font-size:14px; margin-bottom:4px; font-weight:700; text-transform:uppercase;
                letter-spacing:1.5px; color:var(--green); }
    .cc-sub { font-size:11px; color:var(--muted2); margin-bottom:14px; }
    .inp-label { font-size:10px; color:var(--muted2); margin-bottom:5px; display:block;
                 text-transform:uppercase; letter-spacing:1px; font-weight:700; }
    .inp { width:100%; background:var(--surf2); border:1px solid var(--border); border-radius:6px;
           padding:10px 14px; color:var(--text); font-size:12px; font-family:'Space Mono',monospace; margin-bottom:12px; }
    .inp:focus { outline:none; border-color:var(--green); }
    .save-btn { background:var(--green); color:#000; border:none; border-radius:6px;
                padding:11px 20px; font-size:12px; font-weight:700; cursor:pointer;
                font-family:'Space Mono',monospace; width:100%; }
    .save-btn:hover { background:var(--green2); }
    .empty { text-align:center; padding:80px 20px; }
    .empty h3 { font-size:20px; margin-bottom:8px; font-weight:700; letter-spacing:2px;
                text-transform:uppercase; color:var(--green); }
    .empty p { font-size:12px; color:var(--muted2); }
    .error-banner { margin:16px 20px; background:rgba(239,68,68,.08); border:1px solid rgba(239,68,68,.3);
                    border-radius:8px; padding:14px 16px; font-size:12px; color:#EF4444;
                    display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
    .loading-bar { height:2px; background:linear-gradient(90deg,var(--green),transparent);
                   animation:slide 1.2s linear infinite; }
    @keyframes slide { from{background-position:-200%} to{background-position:200%} }
    .toast { position:fixed; top:70px; left:50%; transform:translateX(-50%);
             background:var(--surf); border:1px solid var(--border); border-radius:6px;
             padding:10px 20px; font-size:12px; font-weight:700; z-index:1000;
             white-space:nowrap; animation:slideDown .25s ease; font-family:'Space Mono',monospace; }
    @keyframes slideDown { from{opacity:0;transform:translateX(-50%) translateY(-8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    .toast.ok   { border-color:var(--green); color:var(--green); }
    .toast.err  { border-color:#EF4444; color:#EF4444; }
    .toast.info { border-color:#3B82F6; color:#3B82F6; }
    .toast.warn { border-color:#F97316; color:#F97316; }
    .pill { border-radius:4px; padding:2px 9px; font-size:9px; font-weight:700; }
    .pill-ok { background:rgba(0,255,135,.1); color:var(--green); border:1px solid rgba(0,255,135,.25); }
    .status-dot { width:8px; height:8px; border-radius:50%; background:var(--green);
                  box-shadow:0 0 6px var(--green); animation:pulse 2s infinite; flex-shrink:0; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  `;

  const commentTags = ["Insightful","Relatable","Curious"];

  /* ── FEED ── */
  const Feed = () => (
    <>
      {loadingFeed && <div className="loading-bar"/>}

      {feedError && (
        <div className="error-banner">
          <span>⚠ Backend not reachable: {feedError}</span>
          <button onClick={fetchPosts} style={{marginLeft:"auto",background:"transparent",border:"1px solid #EF4444",
            color:"#EF4444",borderRadius:4,padding:"4px 12px",fontSize:11,cursor:"pointer",fontFamily:"Space Mono,monospace",fontWeight:700}}>
            Retry
          </button>
          <div style={{width:"100%",fontSize:11,color:"rgba(239,68,68,.7)",marginTop:4}}>
            Make sure server.js is running: <code>node server.js</code>
          </div>
        </div>
      )}

      <div className="filterbar">
        {[["all","All"],["twitter","X / Twitter"],["reddit","Reddit"],["linkedin","LinkedIn"]].map(([v,l])=>(
          <button key={v} className={`chip${filter===v?" on":""}`} onClick={()=>setFilter(v)}>
            {v!=="all" && (() => { const I=PLATFORMS[v]?.Icon; return I ? <I/> : null; })()}
            {l}
          </button>
        ))}
        <button className="refresh-btn" onClick={fetchPosts} disabled={loadingFeed}>
          {loadingFeed ? <><span className="spin" style={{width:12,height:12,border:"2px solid transparent",borderTopColor:"currentColor",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/>  Fetching...</> : "↻ Refresh"}
        </button>
        {lastRefresh && (
          <span style={{fontSize:10,color:"var(--muted2)",marginLeft:4}}>
            Updated {timeAgo(lastRefresh.toISOString())} ago
          </span>
        )}
      </div>

      {feedPosts.length===0 && !loadingFeed ? (
        <div className="empty">
          <div style={{fontSize:52,marginBottom:16}}>✦</div>
          <h3>{feedError ? "Backend offline" : "All caught up"}</h3>
          <p>{feedError
            ? "Start the backend: cd pulse-backend && npm install && node server.js"
            : "No pending posts. Add more RSS feeds in server.js"}</p>
        </div>
      ) : (
        <div className="grid">
          {feedPosts.map((post,i) => {
            const P = PLATFORMS[post.platform] || PLATFORMS.reddit;
            return (
              <div key={post.id} className="widget" style={{animationDelay:`${i*0.04}s`}}>
                <div className="w-stripe" style={{background:P.color}}/>
                <div className="w-head">
                  <div className="w-plat" style={{background:`${P.color}18`,color:P.color}}>
                    <P.Icon/> {P.name}
                  </div>
                  <div className="w-meta">
                    <div className="w-author">{post.authorName}</div>
                    <div className="w-time">{timeAgo(post.timestamp)} ago</div>
                  </div>
                </div>
                {post.title && <div className="w-title" style={{padding:"0 14px 4px"}}>{post.title}</div>}
                <div className="w-body">{post.content?.slice(0,280)}{post.content?.length>280?"…":""}</div>
                <div className="w-foot">
                  <a href={post.url} target="_blank" rel="noreferrer"
                     style={{fontSize:10,color:"var(--muted2)",textDecoration:"none"}}
                     onClick={e=>e.stopPropagation()}>↗ View</a>
                  <div className="w-actions">
                    <button className="btn-skip"    onClick={()=>skipPost(post.id)}>Skip</button>
                    <button className="btn-remove"  onClick={()=>removePost(post.id)}>✕</button>
                    <button className="btn-comment" onClick={()=>openComment(post)}>Comment ✦</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  /* ── HISTORY ── */
  const History = () => (
    <div className="page">
      <div className="page-title">Comment History</div>
      <div className="page-sub">{history.length} comments saved</div>
      {history.length>0 && (
        <button className="export-btn" onClick={()=>exportCSV(history)}>↓ Export CSV</button>
      )}
      {history.length===0 ? (
        <div className="empty">
          <div style={{fontSize:52,marginBottom:16}}>◷</div>
          <h3>No history yet</h3>
          <p>Comments you save will appear here.</p>
        </div>
      ) : (
        <div className="hist-grid">
          {history.map((item,i) => {
            const P = PLATFORMS[item.platform] || PLATFORMS.reddit;
            return (
              <div key={i} className="hist-card">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{background:`${P.color}18`,color:P.color,display:"flex",alignItems:"center",
                    gap:5,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700}}>
                    <P.Icon/>{P.name}
                  </span>
                  <span className="pill pill-ok">✓ Saved</span>
                </div>
                <div style={{fontSize:12,color:"var(--muted2)",marginBottom:6}}>
                  by {item.authorName} · {timeAgo(item.commentedAt)} ago
                </div>
                {item.title && <div style={{fontSize:12,color:"var(--text)",marginBottom:4,fontWeight:700}}>{item.title}</div>}
                <div style={{fontSize:12,color:"#7A96B4",lineHeight:1.6}}>{item.content?.slice(0,130)}...</div>
                <div className="hist-comment">
                  <div className="hist-label">Your Comment</div>
                  {item.comment}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ── SETTINGS ── */
  const Settings = () => (
    <div className="page">
      <div className="page-title">Settings</div>
      <div className="page-sub">Configure AI and backend connection</div>

      <div className="settings-card">
        <div className="cc-title">Backend Status</div>
        <div className="cc-sub">Your RSS backend server connection</div>
        <div style={{background:"var(--surf2)",border:"1px solid var(--border)",borderRadius:6,
          padding:"12px 14px",fontSize:12,display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div className="status-dot" style={{background: feedError ? "#EF4444" : "var(--green)",
            boxShadow: feedError ? "0 0 6px #EF4444" : "0 0 6px var(--green)"}}/>
          <span style={{color: feedError ? "#EF4444" : "var(--green)"}}>
            {feedError ? "Offline — run: node server.js" : `Online · ${posts.length} posts loaded`}
          </span>
        </div>
        <div style={{fontSize:11,color:"var(--muted2)",marginBottom:4}}>Backend URL</div>
        <div style={{background:"var(--surf2)",border:"1px solid var(--border)",borderRadius:6,
          padding:"10px 14px",fontSize:11,color:"var(--green)",fontFamily:"monospace",marginBottom:12}}>
          {BACKEND_URL}
        </div>
        <div style={{fontSize:11,color:"var(--muted2)"}}>
          To change the URL, edit <code>BACKEND_URL</code> at the top of App.jsx
        </div>
      </div>

      <div className="settings-card">
        <div className="cc-title">OpenAI API Key</div>
        <div className="cc-sub">For AI comment generation. Get your key at platform.openai.com</div>
        <label className="inp-label">API Key</label>
        <input className="inp" type="password" placeholder="sk-..." value={apiKey}
          onChange={e=>setApiKey(e.target.value)}/>
        <button className="save-btn" onClick={()=>{localStorage.setItem("h_oai",apiKey);showToast("Saved!","ok")}}>
          Save API Key
        </button>
      </div>

      <div className="settings-card">
        <div className="cc-title">How to Add More RSS Feeds</div>
        <div style={{fontSize:12,color:"var(--muted2)",lineHeight:1.8}}>
          Open <code>server.js</code> and add feeds to the <code>RSS_FEEDS</code> array:
          <pre style={{background:"var(--surf2)",border:"1px solid var(--border)",borderRadius:6,
            padding:"10px 14px",marginTop:10,fontSize:11,color:"var(--green)",overflow:"auto"}}>
{`{ url: "https://reddit.com/r/YOUR_SUB.rss",
  platform: "reddit" },
{ url: "https://rsshub.app/twitter/user/HANDLE",
  platform: "twitter" },`}
          </pre>
          Then restart the server: <code>node server.js</code>
        </div>
      </div>

      <div className="settings-card">
        <div className="cc-title" style={{color:"#EF4444"}}>Danger Zone</div>
        <div className="cc-sub">Clear all saved history and statuses</div>
        <button className="save-btn" style={{background:"transparent",border:"1px solid #EF4444",color:"#EF4444"}}
          onClick={()=>{localStorage.clear();setHistory([]);fetchPosts();showToast("Cleared","warn")}}>
          Clear All Local Data
        </button>
      </div>
    </div>
  );

  /* ── COMMENT MODAL ── */
  const CommentModal = () => {
    if (!commentModal||!selected) return null;
    const P = PLATFORMS[selected.platform] || PLATFORMS.reddit;
    return (
      <div className="overlay" onClick={e=>{if(e.target.className==="overlay")setCommentModal(false)}}>
        <div className="modal">
          <button className="close-btn" onClick={()=>setCommentModal(false)}>×</button>
          <div className="modal-handle"/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <span style={{background:`${P.color}18`,color:P.color,display:"flex",alignItems:"center",
              gap:5,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>
              <P.Icon/> {P.name}
            </span>
            <span style={{fontSize:12,color:"var(--muted2)"}}>by {selected.authorName}</span>
          </div>
          {selected.title && (
            <div style={{fontSize:13,fontWeight:700,color:"var(--text)",marginBottom:8}}>{selected.title}</div>
          )}
          <div className="modal-post" style={{borderColor:P.color}}>
            {selected.content?.slice(0,400)}{selected.content?.length>400?"…":""}
          </div>
          <button className="gen-btn" onClick={generate} disabled={loadingAI}>
            {loadingAI ? <><span className="spin"/>Generating...</> : "✦ Generate AI Comments"}
          </button>
          {aiComments.length>0 && (
            <>
              <div className="modal-section">Choose a Comment</div>
              {aiComments.map((c,i)=>(
                <div key={i} className={`c-opt${chosen===c?" sel":""}`} onClick={()=>{setChosen(c);setCustom("")}}>
                  <span className="c-tag">{commentTags[i]}</span>
                  <div className="c-text">{c}</div>
                </div>
              ))}
              <div className="modal-section">Or Write Your Own</div>
              <textarea className="c-area" placeholder="Type a custom comment..." value={custom}
                onChange={e=>{setCustom(e.target.value);setChosen("")}} rows={3}/>
              <button className="post-btn" onClick={postComment}>Save Comment →</button>
            </>
          )}
        </div>
      </div>
    );
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{css}</style>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      <CommentModal/>
      <div className="app">
        <div className="hdr">
          <PulseLogo size={36}/>
          <div className="hdr-title">
            <h1>PULSE</h1>
            <p>Social Command Centre</p>
          </div>
          <div className="hdr-right">
            {!feedError && <div className="status-dot"/>}
            {pendingN>0 && <span className="badge">{pendingN}</span>}
          </div>
        </div>

        <div className="layout">
          <nav className="sidenav">
            <div className="sidenav-section">Navigation</div>
            {TABS.map(t=>(
              <button key={t.id} className={`sidenav-btn${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
                <span className="icon">{t.icon}</span> {t.label}
                {t.id==="feed" && pendingN>0 && <span className="badge" style={{marginLeft:"auto"}}>{pendingN}</span>}
              </button>
            ))}

            <div className="sidenav-section">Platforms</div>
            {Object.entries(PLATFORMS).map(([k,P])=>{
              const count = posts.filter(p=>p.platform===k&&p.status==="pending").length;
              return (
                <button key={k} className={`sidenav-btn${filter===k&&tab==="feed"?" active":""}`}
                  onClick={()=>{setFilter(k);setTab("feed")}}>
                  <span style={{color:P.color,display:"flex",alignItems:"center"}}><P.Icon/></span>
                  <span style={{marginLeft:4}}>{P.name}</span>
                  {count>0 && <span className="badge" style={{marginLeft:"auto",background:P.color}}>{count}</span>}
                </button>
              );
            })}

            <div className="sidenav-stats">
              <div style={{fontSize:11,color:"var(--muted2)",textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontWeight:700}}>Stats</div>
              {[["Pending",pendingN],["Commented",history.length],["Total",posts.length]].map(([l,n])=>(
                <div key={l} className="stat-row">
                  <span style={{color:"var(--muted2)"}}>{l}</span>
                  <span className="stat-num">{n}</span>
                </div>
              ))}
            </div>
          </nav>

          <main className="main">
            {tab==="feed"     && <Feed/>}
            {tab==="history"  && <History/>}
            {tab==="settings" && <Settings/>}
          </main>
        </div>

        <nav className="bottom-nav">
          {TABS.map(t=>(
            <button key={t.id} className={`bnav-btn${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>
              <span className="bnav-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

