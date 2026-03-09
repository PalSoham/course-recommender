import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const API_BASE = "http://127.0.0.1:8000";

const THEMES = {
  light: {
    bg:          "#ebebeb",
    panelBg:     "#f5f5f5",
    surface:     "#fce4ec",
    surfaceHov:  "#f8bbd0",
    border:      "#e8a0b4",
    borderFoc:   "#c2185b",
    divider:     "#d0d0d0",
    text:        "#1a1a1a",
    textMuted:   "#999",
    accent:      "#c2185b",
    accentHov:   "#ad1457",
    accentText:  "#fff",
    danger:      "#b71c1c",
    dropdown:    "#fff",
    dropHov:     "#fce4ec",
    pill:        "#f48fb1",
    pillText:    "#880e4f",
    shimA:       "#f8bbd0",
    shimB:       "#fce4ec",
    cardBg:      "#fce4ec",
    cardHov:     "#f8bbd0",
    cardText:    "#c2185b",
    error:       "#ffebee",
    errorBorder: "#e57373",
    errorText:   "#b71c1c",
    toggleBg:    "#e8a0b4",
    toggleKnob:  "#fff",
    emptyText:   "#e91e8c",
    topbar:      "#e0e0e0",
  },
  dark: {
    bg:          "#0a0a0a",
    panelBg:     "#111",
    surface:     "#1a1200",
    surfaceHov:  "#2a1e00",
    border:      "#3d2e00",
    borderFoc:   "#f59e0b",
    divider:     "#1e1e1e",
    text:        "#fef3c7",
    textMuted:   "#78716c",
    accent:      "#f59e0b",
    accentHov:   "#d97706",
    accentText:  "#0a0a0a",
    danger:      "#ef4444",
    dropdown:    "#1a1200",
    dropHov:     "#2a1e00",
    pill:        "#2a1e00",
    pillText:    "#fbbf24",
    shimA:       "#1a1200",
    shimB:       "#2a1e00",
    cardBg:      "#1a1200",
    cardHov:     "#2a1e00",
    cardText:    "#f59e0b",
    error:       "#1c0a00",
    errorBorder: "#b45309",
    errorText:   "#fbbf24",
    toggleBg:    "#3d2e00",
    toggleKnob:  "#f59e0b",
    emptyText:   "#f59e0b",
    topbar:      "#0d0d0d",
  }
};

/* ── Portal dropdown ── */
function PortalDropdown({ anchorRef, open, children }) {
  const [rect, setRect] = useState(null);
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const update = () => {
      const r = anchorRef.current.getBoundingClientRect();
      setRect({ top: r.bottom, left: r.left, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open, anchorRef]);
  if (!open || !rect) return null;
  return createPortal(
    <div style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width, zIndex: 99999 }}>
      {children}
    </div>,
    document.body
  );
}

/* ── Score ring ── */
function ScoreRing({ score, t }) {
  const pct = Math.round(score * 100);
  const r = 20, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: 50, height: 50, flexShrink: 0 }}>
      <svg width="50" height="50" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="25" cy="25" r={r} fill="none" stroke={t.border} strokeWidth="3" />
        <circle cx="25" cy="25" r={r} fill="none" stroke={t.accent}
          strokeWidth="3" strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="square"
          style={{ transition: "stroke-dasharray 0.7s ease" }} />
      </svg>
      <span style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "10px", fontWeight: 700, color: t.text, fontFamily: "'DM Mono', monospace",
      }}>{pct}%</span>
    </div>
  );
}

/* ── Course pill ── */
function CoursePill({ course, onRemove, t }) {
  const [hov, setHov] = useState(false);
  return (
    <span onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: hov ? t.surfaceHov : t.pill,
      border: `1px solid ${t.border}`,
      padding: "3px 6px 3px 9px",
      fontSize: 11, color: t.pillText, fontFamily: "'DM Mono', monospace",
      userSelect: "none", transition: "background 0.15s", maxWidth: "100%",
    }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {course.title}
      </span>
      <button onClick={() => onRemove(course.id)} style={{
        background: "none", border: "none", cursor: "pointer",
        color: hov ? t.danger : t.textMuted,
        fontSize: 14, lineHeight: 1, padding: "0 2px",
        transition: "color 0.15s", flexShrink: 0,
      }}>×</button>
    </span>
  );
}

/* ── Recommendation card ── */
function RecommendCard({ rec, index, t }) {
  const [vis, setVis] = useState(false);
  const [hov, setHov] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVis(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display: "flex", alignItems: "center", gap: 14,
      background: hov ? t.cardHov : t.cardBg,
      border: `1px solid ${t.border}`,
      padding: "13px 16px",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(10px)",
      transition: "opacity 0.32s ease, transform 0.32s ease, background 0.15s",
      boxShadow: `2px 2px 0 ${t.border}`,
    }}>
      <ScoreRing score={rec.score} t={t} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, color: t.accent, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3, opacity: 0.7 }}>
          {rec.course_id}
        </div>
        <div style={{ fontSize: 13, color: t.cardText, fontWeight: 500, lineHeight: 1.45, fontFamily: "'Syne', sans-serif" }}>
          {rec.title}
        </div>
      </div>
      <div style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: t.accent, fontWeight: 700, flexShrink: 0 }}>
        {Math.round(rec.score * 100)}%
      </div>
    </div>
  );
}

/* ── Slider ── */
function RecommendSlider({ value, onChange, t }) {
  const min = 1, max = 10;
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const calcValue = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    return Math.round(Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * (max - min) + min);
  };
  const onMouseDown = (e) => {
    dragging.current = true;
    onChange(calcValue(e.clientX));
    const onMove = (e2) => { if (dragging.current) onChange(calcValue(e2.clientX)); };
    const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div ref={trackRef} onMouseDown={onMouseDown} style={{ flex: 1, height: 4, cursor: "pointer", position: "relative", background: t.border }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: t.accent, transition: "width 0.08s" }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", transform: "translate(-50%,-50%)",
            left: `${(i / (max - min)) * 100}%`,
            width: i + 1 === value ? 12 : 6, height: i + 1 === value ? 12 : 6,
            background: i + 1 <= value ? t.accent : t.border,
            transition: "all 0.12s", zIndex: 2,
          }} />
        ))}
        <div style={{
          position: "absolute", top: "50%", left: `${pct}%`,
          transform: "translate(-50%,-50%)",
          width: 16, height: 16, background: t.accent,
          border: `2px solid ${t.panelBg}`, zIndex: 3, cursor: "grab",
        }} />
      </div>
      <div style={{ minWidth: 28, textAlign: "center", fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: t.accent }}>
        {value}
      </div>
    </div>
  );
}

/* ── Theme toggle ── */
function ThemeToggle({ dark, onToggle, t }) {
  return (
    <button onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 7,
      background: "none", border: `1px solid ${t.border}`,
      padding: "5px 10px", cursor: "pointer",
      fontFamily: "'DM Mono', monospace", fontSize: 10,
      letterSpacing: "0.1em", color: t.textMuted, transition: "border-color 0.2s",
    }}>
      <span style={{ fontWeight: 700, color: !dark ? t.accent : t.textMuted, transition: "color 0.2s" }}>LIGHT</span>
      <div style={{ width: 34, height: 16, background: t.toggleBg, border: `1px solid ${t.border}`, position: "relative", transition: "background 0.2s" }}>
        <div style={{
          position: "absolute", top: 2,
          left: dark ? "calc(100% - 14px)" : 2,
          width: 10, height: 10, background: t.toggleKnob,
          transition: "left 0.2s ease",
        }} />
      </div>
      <span style={{ fontWeight: 700, color: dark ? t.accent : t.textMuted, transition: "color 0.2s" }}>DARK</span>
    </button>
  );
}

/* ══════════════════════════════════
   MAIN APP
══════════════════════════════════ */
export default function App() {
  const [dark, setDark] = useState(false);
  const t = THEMES[dark ? "dark" : "light"];

  const [allCourses, setAllCourses]           = useState([]);
  const [selected, setSelected]               = useState([]);
  const [query, setQuery]                     = useState("");
  const [comboOpen, setComboOpen]             = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [fetching, setFetching]               = useState(true);
  const [error, setError]                     = useState("");
  const [nRec, setNRec]                       = useState(5);

  const comboWrapRef = useRef(null);
  const inputRef     = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/courses`)
      .then(r => r.json())
      .then(d => { setAllCourses(d.courses || []); setFetching(false); })
      .catch(() => { setFetching(false); setError("Cannot reach backend at " + API_BASE); });
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (!comboWrapRef.current?.contains(e.target)) {
        const portal = document.getElementById("combo-portal");
        if (portal?.contains(e.target)) return;
        setComboOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = allCourses
    .filter(c => !selected.find(s => s.id === c.id))
    .filter(c =>
      query === "" ||
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.id.toLowerCase().includes(query.toLowerCase())
    );

  const addCourse = (course) => {
    if (selected.length >= 10) return;
    setSelected(p => [...p, course]);
    setQuery("");
    setComboOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeCourse = (id) => setSelected(p => p.filter(c => c.id !== id));

  const getRecommendations = async () => {
    if (!selected.length) return;
    setLoading(true); setError(""); setRecommendations([]);
    try {
      const res = await fetch(`${API_BASE}/recommend?n=${nRec}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selected.map(c => c.id)),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch {
      setError("Failed to fetch recommendations. Is app.py running?");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; width: 100%; overflow: hidden; }
        body { background: ${t.bg}; color: ${t.text}; font-family: 'Syne', sans-serif; transition: background 0.25s, color 0.25s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .fu { animation: fadeUp 0.45s ease forwards; opacity: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; }
        ::-webkit-scrollbar-thumb:hover { background: ${t.accent}; }
        .dd-item:hover { background: ${t.dropHov} !important; }
        .sinput:focus { outline: none; }
        .rbtn:hover:not(:disabled) { background: ${t.accentHov} !important; }
      `}</style>

      {/* ROOT — full viewport, no scroll */}
      <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Top bar — full width ── */}
        <div style={{
          width: "100%",
          height: 48,
          flexShrink: 0,
          background: t.topbar,
          borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 40px",
          transition: "background 0.25s, border-color 0.25s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: t.accent, fontFamily: "'Syne', sans-serif", letterSpacing: "0.04em" }}>
              COURSE RECOMMENDER
            </span>
            {!fetching && (
              <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
                {allCourses.length} COURSES LOADED
              </span>
            )}
          </div>
          <ThemeToggle dark={dark} onToggle={() => setDark(p => !p)} t={t} />
        </div>

        {/* ── Two columns — each exactly 50vw, fill remaining height ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* ════ LEFT PANEL ════ */}
          <div style={{
            width: "50vw",
            flexShrink: 0,
            background: t.panelBg,
            borderRight: `1px solid ${t.divider}`,
            overflowY: "auto",
            overflowX: "hidden",
            transition: "background 0.25s",
          }}>
            <div style={{ padding: "40px 48px 60px", display: "flex", flexDirection: "column", gap: 32 }}>

              {/* 01 — Course selector */}
              <section className="fu">
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: t.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
                  01 · Select courses you've taken
                </div>

                {selected.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                    {selected.map(c => <CoursePill key={c.id} course={c} onRemove={removeCourse} t={t} />)}
                  </div>
                )}

                <div ref={comboWrapRef} style={{ position: "relative" }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    background: t.surface,
                    border: `1px solid ${comboOpen ? t.borderFoc : t.border}`,
                    transition: "border-color 0.15s",
                  }}>
                    <span style={{ padding: "0 12px", color: t.textMuted, fontSize: 14, flexShrink: 0, userSelect: "none" }}>⌕</span>
                    <input
                      ref={inputRef}
                      className="sinput"
                      value={query}
                      onChange={e => { setQuery(e.target.value); setComboOpen(true); }}
                      onFocus={() => setComboOpen(true)}
                      placeholder={fetching ? "Loading courses…" : selected.length >= 10 ? "Max 10 selected" : "Search or browse all courses…"}
                      disabled={selected.length >= 10 || fetching}
                      style={{
                        flex: 1, padding: "12px 0",
                        background: "none", border: "none",
                        color: t.text, fontSize: 13,
                        fontFamily: "'DM Mono', monospace",
                        opacity: fetching || selected.length >= 10 ? 0.45 : 1,
                      }}
                    />
                    {query && (
                      <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: t.textMuted, fontSize: 16, padding: "0 10px", transition: "color 0.15s",
                      }}>×</button>
                    )}
                    <div onClick={() => { setComboOpen(p => !p); inputRef.current?.focus(); }} style={{
                      padding: "0 12px", cursor: "pointer",
                      borderLeft: `1px solid ${t.border}`,
                      color: t.textMuted, fontSize: 9,
                      alignSelf: "stretch", display: "flex", alignItems: "center",
                      fontFamily: "'DM Mono', monospace", userSelect: "none",
                    }}>{comboOpen ? "▲" : "▼"}</div>
                  </div>

                  <PortalDropdown anchorRef={comboWrapRef} open={comboOpen}>
                    <div id="combo-portal" style={{
                      background: t.dropdown,
                      border: `1px solid ${t.borderFoc}`,
                      borderTop: "none",
                      maxHeight: 260, overflowY: "auto",
                      boxShadow: `3px 4px 0 ${t.border}`,
                    }}>
                      {filtered.length === 0 ? (
                        <div style={{ padding: "14px", fontSize: 11, color: t.textMuted, fontFamily: "'DM Mono', monospace", textAlign: "center" }}>
                          {query ? `No matches for "${query}"` : "All courses selected"}
                        </div>
                      ) : (
                        <>
                          <div style={{
                            padding: "5px 14px", fontSize: 9, color: t.textMuted,
                            fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em",
                            borderBottom: `1px solid ${t.border}`, background: t.surface,
                            position: "sticky", top: 0,
                          }}>
                            {filtered.length} COURSE{filtered.length !== 1 ? "S" : ""}{query ? " MATCHING" : ""}
                          </div>
                          {filtered.map((c, i) => (
                            <div key={c.id} className="dd-item"
                              onMouseDown={(e) => { e.preventDefault(); addCourse(c); }}
                              style={{
                                padding: "9px 14px", cursor: "pointer",
                                borderBottom: i < filtered.length - 1 ? `1px solid ${t.border}` : "none",
                                display: "flex", gap: 12, alignItems: "center",
                                background: t.dropdown, transition: "background 0.1s",
                              }}
                            >
                              <span style={{ fontSize: 9, color: t.textMuted, fontFamily: "'DM Mono', monospace", minWidth: 72, flexShrink: 0 }}>{c.id}</span>
                              <span style={{ fontSize: 12, color: t.text, flex: 1 }}>{c.title}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </PortalDropdown>
                </div>

                {selected.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 9, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>
                    {selected.length}/10 SELECTED
                  </div>
                )}
              </section>

              {/* 02 — How many */}
              <section className="fu" style={{ animationDelay: "0.08s" }}>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: t.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
                  02 · How many recommendations?
                </div>
                <div style={{ background: t.surface, border: `1px solid ${t.border}`, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, gap: 4 }}>
                    {[...Array(10)].map((_, i) => (
                      <button key={i + 1} onClick={() => setNRec(i + 1)} style={{
                        flex: 1, padding: "6px 0",
                        background: nRec === i + 1 ? t.accent : "none",
                        border: `1px solid ${nRec === i + 1 ? t.accent : t.border}`,
                        color: nRec === i + 1 ? t.accentText : t.textMuted,
                        fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 700,
                        cursor: "pointer", transition: "all 0.12s",
                      }}>{i + 1}</button>
                    ))}
                  </div>
                  <RecommendSlider value={nRec} onChange={setNRec} t={t} />
                  <div style={{ marginTop: 10, fontSize: 9, color: t.textMuted, fontFamily: "'DM Mono', monospace", textAlign: "right" }}>
                    UP TO {nRec} RESULT{nRec !== 1 ? "S" : ""}
                  </div>
                </div>
              </section>

              {/* 03 — Generate */}
              <section className="fu" style={{ animationDelay: "0.16s" }}>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: t.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
                  03 · Generate
                </div>
                <button className="rbtn" onClick={getRecommendations} disabled={selected.length === 0 || loading} style={{
                  width: "100%", padding: "14px 20px",
                  background: selected.length === 0 ? t.surface : t.accent,
                  border: `1px solid ${selected.length === 0 ? t.border : t.accent}`,
                  color: selected.length === 0 ? t.textMuted : t.accentText,
                  fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif",
                  cursor: selected.length === 0 ? "not-allowed" : "pointer",
                  transition: "all 0.15s", letterSpacing: "0.05em",
                }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{ width: 12, height: 12, border: `2px solid ${t.accentText}`, borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.75s linear infinite" }} />
                      CALCULATING…
                    </span>
                  ) : selected.length === 0
                    ? "SELECT A COURSE TO BEGIN"
                    : `FIND ${nRec} COURSE${nRec !== 1 ? "S" : ""} · ${selected.length} SELECTED`}
                </button>
              </section>

              {error && (
                <div style={{ padding: "10px 14px", background: t.error, border: `1px solid ${t.errorBorder}`, color: t.errorText, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                  ⚠ {error}
                </div>
              )}

            </div>
          </div>

          {/* ════ RIGHT PANEL ════ */}
          <div style={{
            width: "50vw",
            flexShrink: 0,
            background: t.bg,
            overflowY: "auto",
            overflowX: "hidden",
            transition: "background 0.25s",
          }}>
            <div style={{ padding: "40px 48px 60px", display: "flex", flexDirection: "column", height: "100%" }}>

              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: t.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
                {recommendations.length > 0
                  ? `04 · Results — ${recommendations.length} recommendation${recommendations.length !== 1 ? "s" : ""}`
                  : "04 · Results"}
              </div>

              {/* Empty state */}
              {!loading && recommendations.length === 0 && !error && (
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 14,
                  color: t.emptyText, fontFamily: "'DM Mono', monospace", textAlign: "center",
                }}>
                  <div style={{ fontSize: 64, lineHeight: 1 }}>◻</div>
                  <div style={{ fontSize: 11, letterSpacing: "0.1em" }}>SELECT COURSES AND HIT GENERATE</div>
                  <div style={{ fontSize: 10, opacity: 0.5 }}>RESULTS WILL APPEAR HERE</div>
                </div>
              )}

              {/* Shimmer */}
              {loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...Array(nRec)].map((_, i) => (
                    <div key={i} style={{
                      height: 70, border: `1px solid ${t.border}`,
                      background: `linear-gradient(90deg, ${t.shimA} 25%, ${t.shimB} 50%, ${t.shimA} 75%)`,
                      backgroundSize: "800px 100%",
                      animation: "shimmer 1.4s infinite",
                      animationDelay: `${i * 0.07}s`,
                    }} />
                  ))}
                </div>
              )}

              {/* Result cards */}
              {!loading && recommendations.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {recommendations.map((r, i) => (
                    <RecommendCard key={r.course_id} rec={r} index={i} t={t} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}