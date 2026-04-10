"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  db, addBook as dbAddBook, removeBook as dbRemoveBook, getAllBooks,
  logRead as dbLogRead, getBookStats, getGlobalStats, pickNextBook,
  getSetting, setSetting, exportAllData, importData, exportCSV, clearAllData,
} from "@/lib/db";
import { themes, applyTheme } from "@/lib/themes";
import { searchOpenLibrary } from "@/lib/openLibrary";
import {
  IconHome, IconShelf, IconDice, IconPlus, IconGear,
  IconCheck, IconSearch, IconStar, IconTrash, IconDownload, IconUpload,
  IconMoon, IconSun, IconPalette, IconBook,
} from "@/lib/icons";

const TABS = [
  { id: "home", label: "Home", Icon: IconHome },
  { id: "shelf", label: "Shelf", Icon: IconShelf },
  { id: "pick", label: "Tonight", Icon: IconDice },
  { id: "add", label: "Add", Icon: IconPlus },
  { id: "settings", label: "More", Icon: IconGear },
];

const DEFAULT_WIDGETS = ["recentBooks", "totalBooks", "totalReads", "weekReads", "streak", "mostRead"];

function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `toast`;
  el.style.background = type === "success" ? "var(--success)" : type === "error" ? "var(--danger)" : "var(--secondary)";
  el.style.color = "#fff";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

function CoverImg({ src, title, size = 50 }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className="cover-placeholder" style={{ width: size, height: size * 1.35 }}>
        <IconBook size={size * 0.45} />
      </div>
    );
  }
  return (
    <img
      src={src} alt={title} onError={() => setErr(true)}
      className="cover-img" style={{ width: size, height: size * 1.35 }}
    />
  );
}

function daysAgoLabel(dateStr) {
  if (!dateStr) return "";
  const days = Math.floor((Date.now() - new Date(dateStr + "T12:00:00")) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("home");
  const [books, setBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [themeId, setThemeId] = useState("meadow");
  const [mode, setMode] = useState("light");
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);

  // Load data & settings
  useEffect(() => {
    (async () => {
      const b = await getAllBooks();
      setBooks(b);
      const savedTheme = await getSetting("theme", "meadow");
      const savedMode = await getSetting("mode", "light");
      const savedWidgets = await getSetting("widgets", DEFAULT_WIDGETS);
      setThemeId(savedTheme);
      setMode(savedMode);
      setWidgets(savedWidgets);
      applyTheme(savedTheme, savedMode, document.documentElement);
      setLoaded(true);
    })();
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (loaded) {
      applyTheme(themeId, mode, document.documentElement);
      setSetting("theme", themeId);
      setSetting("mode", mode);
    }
  }, [themeId, mode, loaded]);

  const refreshBooks = useCallback(async () => {
    setBooks(await getAllBooks());
  }, []);

  const changeTheme = (id) => setThemeId(id);
  const toggleMode = () => setMode((m) => (m === "light" ? "dark" : "light"));

  const saveWidgets = (w) => {
    setWidgets(w);
    setSetting("widgets", w);
  };

  if (!loaded) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", fontFamily: "'Baloo 2', cursive" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, animation: "float 2s ease-in-out infinite" }}>📚</div>
          <div style={{ color: "var(--textDim)", marginTop: 8 }}>Loading your shelf...</div>
        </div>
      </div>
    );
  }

  // Register SW
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", transition: "background 0.3s" }}>
      {/* Header */}
      <header style={{ padding: "14px 16px 8px", background: "var(--surface)", borderBottom: "2.5px solid var(--border)", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "'Baloo 2', cursive", fontSize: 22, fontWeight: 800, color: "var(--accent)", lineHeight: 1 }}>
            Storytime Shelf
          </h1>
          <div style={{ fontSize: 11, color: "var(--textDim)", fontFamily: "'Nunito'" }}>Bedtime reading tracker</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={toggleMode} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            {mode === "dark" ? <IconSun size={22} /> : <IconMoon size={22} />}
          </button>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "14px 14px 80px" }} className="content-area-wrap">
        <div className="content-area">
          {tab === "home" && <HomeView books={books} widgets={widgets} saveWidgets={saveWidgets} themeId={themeId} changeTheme={changeTheme} mode={mode} />}
          {tab === "shelf" && <ShelfView books={books} refresh={refreshBooks} />}
          {tab === "pick" && <PickView books={books} refresh={refreshBooks} />}
          {tab === "add" && <AddView books={books} refresh={refreshBooks} />}
          {tab === "settings" && <SettingsView books={books} refresh={refreshBooks} themeId={themeId} changeTheme={changeTheme} mode={mode} toggleMode={toggleMode} />}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav safe-bottom">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
            <t.Icon size={24} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════
// HOME / DASHBOARD
// ═══════════════════════════════════════
const WIDGET_DEFS = {
  recentBooks: { label: "Last Read", full: true },
  totalBooks: { label: "Books Owned" },
  totalReads: { label: "Total Reads" },
  weekReads: { label: "This Week" },
  streak: { label: "Day Streak" },
  mostRead: { label: "Most Read", full: true },
};

function HomeView({ books, widgets, saveWidgets, themeId, changeTheme, mode }) {
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getGlobalStats(books).then(setStats);
  }, [books]);

  if (!stats) return null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: "var(--textDim)" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Theme circles */}
          {Object.entries(themes).map(([id, t]) => (
            <button
              key={id}
              className={`theme-circle ${themeId === id ? "active" : ""}`}
              style={{ background: `linear-gradient(135deg, ${t.light.accent}, ${t.light.secondary})` }}
              onClick={() => changeTheme(id)}
              title={t.name}
            />
          ))}
          <button className="crayon-pill" onClick={() => setEditing(true)} style={{ marginLeft: 4 }}>Edit</button>
        </div>
      </div>

      <div className="widget-grid">
        {widgets.map((wid) => {
          const def = WIDGET_DEFS[wid];
          if (!def) return null;
          return (
            <div key={wid} className={`widget ${def.full ? "full" : ""}`}>
              <div className="widget-label">{def.label}</div>
              {wid === "recentBooks" && (
                stats.recent.length > 0 ? (
                  <div className="recent-strip">
                    {stats.recent.map((r, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80, maxWidth: 90, textAlign: "center" }}>
                        <CoverImg src={r.book.cover} title={r.book.title} size={60} />
                        <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Baloo 2'", color: "var(--text)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {r.book.title}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--textDim)", fontFamily: "var(--font-mono)" }}>{daysAgoLabel(r.date)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "var(--textDim)", fontSize: 13, fontFamily: "'Nunito'" }}>No reads yet — pick a book tonight!</div>
                )
              )}
              {wid === "totalBooks" && <><div className="widget-value">{stats.totalBooks}</div><div className="widget-sub">on your shelf</div></>}
              {wid === "totalReads" && <><div className="widget-value">{stats.totalReads}</div><div className="widget-sub">all time</div></>}
              {wid === "weekReads" && <><div className="widget-value">{stats.weekReads}</div><div className="widget-sub">since Sunday</div></>}
              {wid === "streak" && <><div className="widget-value">{stats.streak}</div><div className="widget-sub">{stats.streak > 0 ? "keep going!" : "start tonight!"}</div></>}
              {wid === "mostRead" && (
                stats.mostRead ? (
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <CoverImg src={stats.mostRead.cover} title={stats.mostRead.title} size={44} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'Baloo 2'" }}>{stats.mostRead.title}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", marginTop: 2 }}>{stats.mostCount}x read</div>
                    </div>
                  </div>
                ) : <div style={{ color: "var(--textDim)", fontSize: 13 }}>Log some reads first!</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Widget editor modal */}
      {editing && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditing(false); }}>
          <div className="modal-sheet">
            <h3>Dashboard Widgets</h3>
            <div style={{ fontSize: 12, color: "var(--textDim)", marginBottom: 14 }}>Toggle widgets to show on your home screen.</div>
            {Object.entries(WIDGET_DEFS).map(([key, def]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 14, fontFamily: "'Baloo 2'" }}>{def.label}</div>
                <button
                  className={`toggle-track ${widgets.includes(key) ? "on" : ""}`}
                  onClick={() => {
                    const next = widgets.includes(key) ? widgets.filter((w) => w !== key) : [...widgets, key];
                    saveWidgets(next);
                  }}
                />
              </div>
            ))}
            <button className="btn-primary" style={{ width: "100%", marginTop: 14 }} onClick={() => setEditing(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// SHELF
// ═══════════════════════════════════════
function ShelfView({ books, refresh }) {
  const [sort, setSort] = useState("recent");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [bookStats, setBookStats] = useState({});
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    (async () => {
      const stats = {};
      for (const b of books) {
        stats[b.id] = await getBookStats(b.id);
      }
      setBookStats(stats);
    })();
  }, [books]);

  const filtered = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const sa = bookStats[a.id] || { total: 0, last: null };
    const sb = bookStats[b.id] || { total: 0, last: null };
    if (sort === "recent") return (sb.last || "0").localeCompare(sa.last || "0");
    if (sort === "most") return sb.total - sa.total;
    if (sort === "alpha") return a.title.localeCompare(b.title);
    if (sort === "added") return (b.addedAt || "").localeCompare(a.addedAt || "");
    return 0;
  });

  const handleLog = async (id) => {
    await dbLogRead(id);
    await refresh();
    toast("Read logged!");
  };

  const handleRemove = async (id) => {
    await dbRemoveBook(id);
    setExpanded(null);
    setConfirmDel(null);
    await refresh();
    toast("Removed", "warn");
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ position: "relative" }}>
          <IconSearch size={18} className="" />
          <input className="input" placeholder="Search your shelf..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 14 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {[["recent", "Last Read"], ["most", "Most Read"], ["alpha", "A → Z"], ["added", "Added"]].map(([k, l]) => (
          <button key={k} className={`crayon-pill ${sort === k ? "active" : ""}`} onClick={() => setSort(k)}>{l}</button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--textDim)", marginBottom: 10 }}>
        {books.length} book{books.length !== 1 ? "s" : ""} on shelf
      </div>

      {sorted.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--textDim)", fontFamily: "'Baloo 2'" }}>
          {books.length === 0 ? "Your shelf is empty — add some books!" : "No matches."}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map((book) => {
          const s = bookStats[book.id] || { total: 0, last: null, thisWeek: 0 };
          const isExp = expanded === book.id;
          return (
            <div key={book.id} className="crayon-card">
              <div
                onClick={() => setExpanded(isExp ? null : book.id)}
                style={{ display: "flex", gap: 10, padding: 10, alignItems: "center", cursor: "pointer" }}
              >
                <CoverImg src={book.cover} title={book.title} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {book.title}
                  </div>
                  {book.author && <div style={{ fontSize: 12, color: "var(--textDim)" }}>{book.author}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 3, fontSize: 11, fontFamily: "'JetBrains Mono'", color: "var(--textDim)" }}>
                    <span style={{ color: "var(--accent)" }}>{s.total}x</span>
                    {s.last && <span>last {s.last}</span>}
                    {s.thisWeek > 0 && <span style={{ color: "var(--success)" }}>{s.thisWeek} this wk</span>}
                  </div>
                </div>
                <button className="btn-primary" onClick={(e) => { e.stopPropagation(); handleLog(book.id); }} style={{ padding: "7px 12px", fontSize: 16, borderRadius: 12 }}>
                  <IconCheck size={18} />
                </button>
              </div>

              {isExp && (
                <div style={{ padding: 12, borderTop: "2px dashed var(--border)" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <CoverImg src={book.cover} title={book.title} size={76} />
                    <div style={{ fontSize: 12, color: "var(--textDim)", lineHeight: 1.7 }}>
                      {book.author && <div><strong style={{ color: "var(--text)" }}>Author:</strong> {book.author}</div>}
                      {book.isbn && <div><strong style={{ color: "var(--text)" }}>ISBN:</strong> {book.isbn}</div>}
                      {book.pageCount && <div><strong style={{ color: "var(--text)" }}>Pages:</strong> {book.pageCount}</div>}
                      {book.publisher && <div><strong style={{ color: "var(--text)" }}>Publisher:</strong> {book.publisher}</div>}
                      {book.year && <div><strong style={{ color: "var(--text)" }}>Year:</strong> {book.year}</div>}
                      <div><strong style={{ color: "var(--text)" }}>Read:</strong> {s.total} time{s.total !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <button className="btn-ghost" style={{ flex: 1, fontSize: 13, padding: 8 }} onClick={() => handleLog(book.id)}>
                      Log Tonight&apos;s Read
                    </button>
                    {confirmDel === book.id ? (
                      <button className="btn-danger" style={{ fontSize: 13, padding: "8px 12px" }} onClick={() => handleRemove(book.id)}>
                        Confirm Remove
                      </button>
                    ) : (
                      <button className="btn-dim" style={{ fontSize: 13, padding: "8px 12px" }} onClick={() => setConfirmDel(book.id)}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PICK / TONIGHT
// ═══════════════════════════════════════
function PickView({ books, refresh }) {
  const [pick, setPick] = useState(null);
  const [shuffling, setShuffling] = useState(false);
  const [pickStats, setPickStats] = useState(null);

  useEffect(() => {
    if (pick) {
      getBookStats(pick.id).then(setPickStats);
    }
  }, [pick]);

  const doPick = async () => {
    if (!books.length) return;
    setShuffling(true);
    setPick(null);
    setPickStats(null);
    let count = 0;
    const iv = setInterval(() => {
      setPick(books[Math.floor(Math.random() * books.length)]);
      count++;
      if (count >= 8) {
        clearInterval(iv);
        pickNextBook(books).then((b) => {
          setPick(b);
          setShuffling(false);
        });
      }
    }, 120);
  };

  const handleLog = async () => {
    if (!pick) return;
    await dbLogRead(pick.id);
    await refresh();
    toast("Read logged!");
    setPickStats(await getBookStats(pick.id));
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color: "var(--textDim)", fontSize: 15, marginBottom: 20, lineHeight: 1.5, fontFamily: "'Nunito'" }}>
        Picks books not yet read this week, or read the fewest times overall.
      </div>
      <button className="btn-primary" onClick={doPick} disabled={!books.length} style={{ fontSize: 16, padding: "14px 32px", borderRadius: 28, marginBottom: 28 }}>
        {pick && !shuffling ? "Pick Again" : "What Should We Read?"}
      </button>

      {pick && (
        <div className="pick-card" style={{ borderColor: shuffling ? "var(--border)" : "var(--accent)", transition: "border-color 0.3s" }}>
          <CoverImg src={pick.cover} title={pick.title} size={90} />
          <div style={{ fontFamily: "'Baloo 2'", fontWeight: 800, fontSize: 20, marginTop: 14, color: "var(--text)" }}>
            {pick.title}
          </div>
          {pick.author && <div style={{ color: "var(--textDim)", fontSize: 14, marginTop: 4 }}>{pick.author}</div>}
          {pickStats && !shuffling && (
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, color: "var(--textDim)", marginTop: 10, lineHeight: 1.8 }}>
              <div>Read {pickStats.total} time{pickStats.total !== 1 ? "s" : ""} total</div>
              <div>{pickStats.thisWeek} time{pickStats.thisWeek !== 1 ? "s" : ""} this week</div>
              {pickStats.last && <div>Last read: {pickStats.last}</div>}
            </div>
          )}
          {!shuffling && (
            <button className="btn-primary" onClick={handleLog} style={{ marginTop: 14, width: "100%", fontSize: 15, padding: 12 }}>
              We Read This Tonight <IconCheck size={16} />
            </button>
          )}
        </div>
      )}

      {!books.length && <div style={{ color: "var(--textDim)", marginTop: 20 }}>Add some books first!</div>}
    </div>
  );
}

// ═══════════════════════════════════════
// ADD BOOK
// ═══════════════════════════════════════
function AddView({ books, refresh }) {
  const [mode, setMode] = useState("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mTitle, setMTitle] = useState("");
  const [mAuthor, setMAuthor] = useState("");
  const [mIsbn, setMIsbn] = useState("");
  const [mPages, setMPages] = useState("");

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const r = await searchOpenLibrary(query.trim());
      setResults(r);
      if (!r.length) setError("No results — try different keywords or enter manually.");
    } catch {
      setError("Search failed — check your connection or enter manually.");
    }
    setLoading(false);
  };

  const handleAdd = async (data) => {
    const dup = books.find((b) => (data.isbn && b.isbn === data.isbn) || b.title.toLowerCase() === data.title.toLowerCase());
    if (dup) { toast(`"${data.title}" already on shelf`, "warn"); return; }
    await dbAddBook(data);
    await refresh();
    toast(`Added "${data.title}"!`);
  };

  const handleManualAdd = async () => {
    if (!mTitle.trim()) { toast("Title is required", "error"); return; }
    await handleAdd({ title: mTitle.trim(), author: mAuthor.trim(), isbn: mIsbn.trim(), pageCount: parseInt(mPages) || null });
    setMTitle(""); setMAuthor(""); setMIsbn(""); setMPages("");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className={`crayon-pill ${mode === "search" ? "active" : ""}`} onClick={() => setMode("search")}>Search Online</button>
        <button className={`crayon-pill ${mode === "manual" ? "active" : ""}`} onClick={() => setMode("manual")}>Manual Entry</button>
      </div>

      {mode === "search" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input className="input" style={{ flex: 1 }} placeholder="Title, author, or ISBN..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} />
            <button className="btn-primary" onClick={doSearch} disabled={loading} style={{ whiteSpace: "nowrap" }}>
              {loading ? "..." : "Search"}
            </button>
          </div>
          {error && <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 8 }}>{error}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r, i) => (
              <div key={i} className="crayon-card" style={{ display: "flex", gap: 10, padding: 10, alignItems: "center" }}>
                <CoverImg src={r.cover} title={r.title} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Baloo 2'", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: "var(--textDim)" }}>{r.author}</div>
                  {r.year && <div style={{ fontSize: 11, color: "var(--textDim)", fontFamily: "'JetBrains Mono'" }}>{r.year}</div>}
                </div>
                <button className="btn-primary" onClick={() => handleAdd(r)} style={{ padding: "6px 14px", fontSize: 18 }}>+</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input className="input" placeholder="Title *" value={mTitle} onChange={(e) => setMTitle(e.target.value)} />
          <input className="input" placeholder="Author" value={mAuthor} onChange={(e) => setMAuthor(e.target.value)} />
          <input className="input" placeholder="ISBN (optional)" value={mIsbn} onChange={(e) => setMIsbn(e.target.value)} />
          <input className="input" placeholder="Page count (optional)" type="number" value={mPages} onChange={(e) => setMPages(e.target.value)} />
          <button className="btn-primary" style={{ width: "100%" }} onClick={handleManualAdd} disabled={!mTitle.trim()}>Add to Shelf</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════
function SettingsView({ books, refresh, themeId, changeTheme, mode, toggleMode }) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExportJSON = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    dl(blob, `storytime-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast("Backup exported!");
  };

  const handleExportCSV = async () => {
    const csv = await exportCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    dl(blob, `storytime-log-${new Date().toISOString().slice(0, 10)}.csv`);
    toast("Spreadsheet exported!");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      await refresh();
      toast("Imported successfully!");
    } catch {
      toast("Invalid backup file", "error");
    }
    e.target.value = "";
  };

  const handleClear = async () => {
    await clearAllData();
    await refresh();
    setConfirmClear(false);
    toast("All data cleared", "warn");
  };

  const dl = (blob, name) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      {/* Appearance */}
      <h2 style={{ fontFamily: "'Baloo 2'", fontSize: 18, color: "var(--accent)", marginBottom: 14 }}>Appearance</h2>
      <div className="crayon-card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Baloo 2'", fontSize: 14 }}>
            {mode === "dark" ? "Dark Mode" : "Light Mode"}
          </div>
          <button className={`toggle-track ${mode === "dark" ? "on" : ""}`} onClick={toggleMode} />
        </div>
        <div style={{ fontFamily: "'Baloo 2'", fontSize: 13, color: "var(--textDim)", marginBottom: 8 }}>Color Theme</div>
        <div style={{ display: "flex", gap: 10 }}>
          {Object.entries(themes).map(([id, t]) => (
            <button
              key={id}
              onClick={() => changeTheme(id)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                padding: 8, borderRadius: 12, border: themeId === id ? "2.5px solid var(--accent)" : "2px solid var(--border)",
                background: themeId === id ? "var(--accentLight)" : "transparent", cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", gap: 2 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: t.light.accent }} />
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: t.light.secondary }} />
              </div>
              <div style={{ fontSize: 10, fontFamily: "'Baloo 2'", fontWeight: 600, color: "var(--text)" }}>{t.emoji} {t.name.split(" ")[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Data */}
      <h2 style={{ fontFamily: "'Baloo 2'", fontSize: 18, color: "var(--accent)", marginBottom: 14 }}>Data &amp; Backup</h2>
      <div className="crayon-card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "var(--textDim)", marginBottom: 12 }}>
          {books.length} book{books.length !== 1 ? "s" : ""} on shelf
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn-primary" style={{ width: "100%" }} onClick={handleExportJSON}>
            <IconDownload size={16} /> Export Backup (JSON)
          </button>
          <button className="btn-ghost" style={{ width: "100%" }} onClick={handleExportCSV}>
            <IconDownload size={16} /> Export Spreadsheet (CSV)
          </button>
          <label className="btn-ghost" style={{ width: "100%", cursor: "pointer", textAlign: "center" }}>
            <IconUpload size={16} /> Import Backup (JSON)
            <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {/* About */}
      <h2 style={{ fontFamily: "'Baloo 2'", fontSize: 18, color: "var(--accent)", marginBottom: 14 }}>About</h2>
      <div className="crayon-card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--textDim)" }}>
          <strong style={{ color: "var(--text)" }}>Storytime Shelf</strong> tracks bedtime reading for your family. All data is stored locally on this device using IndexedDB.
          <br /><br />
          Book lookup powered by <strong style={{ color: "var(--text)" }}>Open Library</strong> (requires internet). Works offline for all other features.
          <br /><br />
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 11 }}>v1.0 · Built with love for bedtime</span>
        </div>
      </div>

      {/* Danger */}
      <h2 style={{ fontFamily: "'Baloo 2'", fontSize: 18, color: "var(--danger)", marginBottom: 14 }}>Danger Zone</h2>
      <div className="crayon-card" style={{ padding: 14, borderColor: "var(--danger)" }}>
        {confirmClear ? (
          <div>
            <div style={{ fontSize: 14, color: "var(--danger)", marginBottom: 10, fontWeight: 700 }}>
              Delete all books and reading history? Export a backup first.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-dim" style={{ flex: 1 }} onClick={() => setConfirmClear(false)}>Cancel</button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={handleClear}>Clear Everything</button>
            </div>
          </div>
        ) : (
          <button className="btn-danger" style={{ width: "100%" }} onClick={() => setConfirmClear(true)}>
            <IconTrash size={16} /> Clear All Data
          </button>
        )}
      </div>
    </div>
  );
}
