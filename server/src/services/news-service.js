import Parser from "rss-parser";
import * as cheerio from "cheerio";

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail"],
  },
});

// ✅ Sri Lanka sources (Daily Mirror RSS)
const SOURCES = [
  {
    name: "DailyMirror Political Gossip",
    url: "https://www.dailymirror.lk/rss/political_gossip/261",
    type: "political",
  },
  {
    name: "DailyMirror Fact Check",
    url: "https://www.dailymirror.lk/rss/fact_check/328",
    type: "political",
  },
  {
    name: "DailyMirror Breaking News",
    url: "https://www.dailymirror.lk/rss/breaking_news/108",
    type: "mixed", // we'll keyword-filter this
  },
];

// Keep these neutral (no party bias) — just political/governance keywords
const POLITICAL_KEYWORDS = [
  "parliament",
  "mp",
  "mps",
  "minister",
  "cabinet",
  "government",
  "opposition",
  "president",
  "prime minister",
  "election",
  "vote",
  "voting",
  "speaker",
  "supreme court",
  "court",
  "bill",
  "act",
  "law",
  "constitutional",
  "commission",
  "bribery",
  "ciaboc",
  "audit",
  "budget",
  "policy",
  "protest",
  "demonstration",
];

const UA =
  "PromiseTrackerSL/1.0 (+https://github.com/mahenperera/promise_tracker_sl)";

// ---------- small helpers ----------
const clampInt = (v, def, min, max) => {
  const n = parseInt(v, 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(n, min), max);
};

const normalizeText = (s) => (s || "").toString().toLowerCase();

const matchesKeywords = (text, keywords) => {
  const t = normalizeText(text);
  return keywords.some((k) => t.includes(k));
};

const safeUrl = (maybeUrl, baseUrl) => {
  if (!maybeUrl) return "";
  try {
    return new URL(maybeUrl, baseUrl).toString();
  } catch {
    return "";
  }
};

// ---------- caching ----------
const LIST_CACHE = new Map(); // key -> { expiresAt, data }
const OG_CACHE = new Map(); // url -> { expiresAt, image }

const now = () => Date.now();

const getCache = (map, key) => {
  const hit = map.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= now()) {
    map.delete(key);
    return null;
  }
  return hit.data;
};

const setCache = (map, key, data, ttlMs) => {
  map.set(key, { expiresAt: now() + ttlMs, data });
};

async function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": UA },
    });
    return res;
  } finally {
    clearTimeout(t);
  }
}

function rssImageFromItem(item) {
  // enclosure (common)
  const enc = item?.enclosure?.url;
  if (enc) return enc;

  // media:content sometimes comes as object/array with $.url
  const mc = item?.["media:content"];
  if (Array.isArray(mc) && mc[0]?.$?.url) return mc[0].$?.url;
  if (mc?.$?.url) return mc.$.url;

  const mt = item?.["media:thumbnail"];
  if (Array.isArray(mt) && mt[0]?.$?.url) return mt[0].$?.url;
  if (mt?.$?.url) return mt.$.url;

  return "";
}

async function extractOgImage(articleUrl) {
  // cache OG image for 24h
  const cached = getCache(OG_CACHE, articleUrl);
  if (cached) return cached;

  try {
    const res = await fetchWithTimeout(articleUrl, 9000);
    if (!res.ok) return "";

    const html = await res.text();
    const $ = cheerio.load(html);

    const og =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[property="og:image:secure_url"]').attr("content");

    const img = safeUrl(og, articleUrl);

    if (img) setCache(OG_CACHE, articleUrl, img, 24 * 60 * 60 * 1000);
    return img;
  } catch {
    return "";
  }
}

async function mapLimit(list, limit, fn) {
  const results = new Array(list.length);
  let idx = 0;

  const workers = Array.from({ length: limit }, async () => {
    while (idx < list.length) {
      const cur = idx++;
      results[cur] = await fn(list[cur], cur);
    }
  });

  await Promise.all(workers);
  return results;
}

// ---------- main function ----------
export async function getPoliticalNews({ q = "", limit = 12 } = {}) {
  const safeLimit = clampInt(limit, 12, 1, 30);
  const queryText = normalizeText(q);

  const cacheKey = `political|q=${queryText}|limit=${safeLimit}`;
  const cached = getCache(LIST_CACHE, cacheKey);
  if (cached) return cached;

  // fetch all feeds in parallel
  const feedResults = await Promise.allSettled(
    SOURCES.map(async (src) => {
      const feed = await parser.parseURL(src.url);
      return { src, feed };
    }),
  );

  // flatten + normalize
  let items = [];
  for (const r of feedResults) {
    if (r.status !== "fulfilled") continue;
    const { src, feed } = r.value;

    for (const it of feed.items || []) {
      const title = (it.title || "").trim();
      const url = (it.link || it.guid || "").trim();
      if (!title || !url) continue;

      // base filter: political feeds include all; mixed feeds must match political keywords
      const haystack = `${title} ${it.contentSnippet || ""} ${it.content || ""}`;
      if (
        src.type === "mixed" &&
        !matchesKeywords(haystack, POLITICAL_KEYWORDS)
      )
        continue;

      // optional search filter
      if (queryText && !normalizeText(haystack).includes(queryText)) continue;

      items.push({
        title,
        url,
        source: src.name,
        publishedAt: it.isoDate || it.pubDate || "",
        summary: (it.contentSnippet || "").trim(),
        image: rssImageFromItem(it),
      });
    }
  }

  // dedupe by url
  const seen = new Set();
  items = items.filter((x) => {
    if (seen.has(x.url)) return false;
    seen.add(x.url);
    return true;
  });

  // sort newest first (best-effort)
  items.sort((a, b) => {
    const ta = Date.parse(a.publishedAt) || 0;
    const tb = Date.parse(b.publishedAt) || 0;
    return tb - ta;
  });

  items = items.slice(0, safeLimit);

  // og:image fallback ONLY for items missing RSS image
  const missing = items.map((x, i) => ({ x, i })).filter(({ x }) => !x.image);

  const ogResults = await mapLimit(missing, 4, async ({ x, i }) => {
    const img = await extractOgImage(x.url);
    return { i, img };
  });

  for (const r of ogResults) {
    if (r?.img) items[r.i].image = r.img;
  }

  // final payload + cache list for 5 minutes
  const payload = {
    items,
    meta: {
      total: items.length,
      limit: safeLimit,
      query: q || "",
      sources: SOURCES.map((s) => s.name),
    },
  };

  setCache(LIST_CACHE, cacheKey, payload, 5 * 60 * 1000);
  return payload;
}
