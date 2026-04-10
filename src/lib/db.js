import Dexie from "dexie";

export const db = new Dexie("StorytimeShelf");

db.version(1).stores({
  books: "id, title, author, isbn, addedAt",
  reads: "++autoId, bookId, date, duration",
  settings: "key",
});

// --- Book operations ---
export async function addBook(data) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const book = {
    id,
    title: data.title || "Untitled",
    author: data.author || "",
    isbn: data.isbn || "",
    cover: data.cover || "",
    pageCount: data.pageCount || null,
    publisher: data.publisher || "",
    year: data.year || "",
    addedAt: new Date().toISOString(),
  };
  await db.books.add(book);
  return book;
}

export async function removeBook(id) {
  await db.transaction("rw", db.books, db.reads, async () => {
    await db.books.delete(id);
    await db.reads.where("bookId").equals(id).delete();
  });
}

export async function getAllBooks() {
  return db.books.toArray();
}

// --- Read log operations ---
export async function logRead(bookId) {
  const today = new Date().toISOString().slice(0, 10);
  await db.reads.add({ bookId, date: today });
}

export async function getReadsForBook(bookId) {
  return db.reads.where("bookId").equals(bookId).toArray();
}

export async function getAllReads() {
  return db.reads.toArray();
}

// --- Settings ---
export async function getSetting(key, defaultValue) {
  const row = await db.settings.get(key);
  return row ? row.value : defaultValue;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}

// --- Stats helpers ---
const weekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

export async function getBookStats(bookId) {
  const reads = await getReadsForBook(bookId);
  const total = reads.length;
  const last = total ? reads[total - 1].date : null;
  const ws = weekStart();
  const thisWeek = reads.filter((r) => r.date >= ws).length;
  return { total, last, thisWeek };
}

export async function getGlobalStats(books) {
  const allReads = await getAllReads();
  const ws = weekStart();
  const totalReads = allReads.length;
  const weekReads = allReads.filter((r) => r.date >= ws).length;

  // Streak
  const allDates = new Set(allReads.map((r) => r.date));
  let streak = 0;
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const today = d.toISOString().slice(0, 10);
  let checkDate = allDates.has(today) ? today : (() => { const yd = new Date(d); yd.setDate(yd.getDate() - 1); return yd.toISOString().slice(0, 10); })();
  const cd = new Date(checkDate + "T12:00:00");
  for (let i = 0; i < 365; i++) {
    if (allDates.has(cd.toISOString().slice(0, 10))) { streak++; cd.setDate(cd.getDate() - 1); }
    else break;
  }

  // Reads per book
  const readCounts = {};
  allReads.forEach((r) => { readCounts[r.bookId] = (readCounts[r.bookId] || 0) + 1; });

  // Most read
  let mostReadId = null, mostCount = 0;
  Object.entries(readCounts).forEach(([id, count]) => {
    if (count > mostCount) { mostReadId = id; mostCount = count; }
  });
  const mostRead = mostReadId ? books.find((b) => b.id === mostReadId) : null;

  // Recent 3 unique books
  const sorted = [...allReads].sort((a, b) => b.date.localeCompare(a.date));
  const seen = new Set();
  const recent = [];
  for (const r of sorted) {
    if (!seen.has(r.bookId)) {
      seen.add(r.bookId);
      const book = books.find((b) => b.id === r.bookId);
      if (book) recent.push({ book, date: r.date });
    }
    if (recent.length >= 3) break;
  }

  return { totalBooks: books.length, totalReads, weekReads, streak, mostRead, mostCount, recent, readCounts };
}

export async function pickNextBook(books) {
  if (!books.length) return null;
  const allReads = await getAllReads();
  const ws = weekStart();
  const readCounts = {};
  const weekCounts = {};
  const lastRead = {};
  allReads.forEach((r) => {
    readCounts[r.bookId] = (readCounts[r.bookId] || 0) + 1;
    if (r.date >= ws) weekCounts[r.bookId] = (weekCounts[r.bookId] || 0) + 1;
    if (!lastRead[r.bookId] || r.date > lastRead[r.bookId]) lastRead[r.bookId] = r.date;
  });

  const daysAgo = (dateStr) => {
    if (!dateStr) return 999;
    return Math.floor((Date.now() - new Date(dateStr + "T12:00:00")) / 86400000);
  };

  const scored = books.map((b) => {
    const wk = weekCounts[b.id] || 0;
    const total = readCounts[b.id] || 0;
    const daysSince = daysAgo(lastRead[b.id]);
    const score = (wk === 0 ? 50 : 0) + daysSince * 2 + Math.max(0, 10 - total) * 3 + Math.random() * 10;
    return { book: b, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const pool = scored.slice(0, Math.min(5, scored.length));
  const totalScore = pool.reduce((s, p) => s + p.score, 0);
  let r = Math.random() * totalScore;
  for (const p of pool) { r -= p.score; if (r <= 0) return p.book; }
  return pool[0].book;
}

// --- Export / Import ---
export async function exportAllData() {
  const books = await db.books.toArray();
  const reads = await db.reads.toArray();
  const settings = await db.settings.toArray();
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    books,
    reads,
    settings: settings.filter((s) => s.key !== "theme" && s.key !== "mode"),
  };
}

export async function importData(data) {
  if (!data.books || !Array.isArray(data.books)) throw new Error("Invalid format");

  await db.transaction("rw", db.books, db.reads, async () => {
    let added = 0, merged = 0;
    for (const b of data.books) {
      const existing = await db.books.get(b.id);
      if (existing) { merged++; }
      else { await db.books.add(b); added++; }
    }
    if (data.reads) {
      for (const r of data.reads) {
        await db.reads.add({ bookId: r.bookId, date: r.date, duration: r.duration });
      }
    }
    // V1 migration: readLog embedded in books
    if (!data.reads && data.books[0]?.readLog) {
      for (const b of data.books) {
        if (b.readLog) {
          for (const entry of b.readLog) {
            const date = entry.date || entry;
            await db.reads.add({ bookId: b.id, date, duration: entry.duration });
          }
        }
      }
    }
    return { added, merged };
  });
}

export async function exportCSV() {
  const books = await db.books.toArray();
  const reads = await db.reads.toArray();
  const headers = ["Book Title", "Author", "ISBN", "Pages", "Publisher", "Year", "Date Read", "Read #", "Total Reads", "Added Date"];
  const rows = [headers.join(",")];
  for (const b of books) {
    const bookReads = reads.filter((r) => r.bookId === b.id).sort((a, b) => a.date.localeCompare(b.date));
    if (bookReads.length === 0) {
      rows.push([b.title, b.author, b.isbn, b.pageCount || "", b.publisher, b.year, "", "0", "0", b.addedAt?.slice(0, 10) || ""].map(csvCell).join(","));
    } else {
      bookReads.forEach((r, i) => {
        rows.push([b.title, b.author, b.isbn, b.pageCount || "", b.publisher, b.year, r.date, i + 1, bookReads.length, b.addedAt?.slice(0, 10) || ""].map(csvCell).join(","));
      });
    }
  }
  return rows.join("\n");
}

function csvCell(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function clearAllData() {
  await db.transaction("rw", db.books, db.reads, db.settings, async () => {
    await db.books.clear();
    await db.reads.clear();
    await db.settings.clear();
  });
}
