export async function searchOpenLibrary(query) {
  const isISBN = /^[\d\-]{10,17}$/.test(query.replace(/[\s-]/g, ""));
  if (isISBN) {
    const clean = query.replace(/[\s-]/g, "");
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`
    );
    const data = await res.json();
    const key = Object.keys(data)[0];
    if (!key) return [];
    const b = data[key];
    return [{
      title: b.title || "",
      author: (b.authors || []).map((a) => a.name).join(", "),
      isbn: clean,
      cover: b.cover?.medium || b.cover?.small || "",
      pageCount: b.number_of_pages || null,
      publisher: (b.publishers || []).map((p) => p.name).join(", "),
      year: b.publish_date || "",
    }];
  }

  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=key,title,author_name,isbn,cover_i,publisher,first_publish_year,number_of_pages_median`
  );
  const data = await res.json();
  return (data.docs || []).map((d) => ({
    title: d.title || "",
    author: (d.author_name || []).join(", "),
    isbn: (d.isbn || [])[0] || "",
    cover: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : "",
    pageCount: d.number_of_pages_median || null,
    publisher: (d.publisher || []).slice(0, 2).join(", "),
    year: d.first_publish_year ? String(d.first_publish_year) : "",
  }));
}
