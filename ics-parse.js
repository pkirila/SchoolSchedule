/* Shared by the web page and the GitHub Action.
   Reads an .ics calendar and finds, for each date, the letter day (A–F)
   and the bell schedule named in event titles. */
(function (root) {
  function dateKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function shift(k, n) {
    const [y, m, d] = k.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + n);
    return dateKey(dt);
  }
  function unesc(s) { return s.replace(/\\n/gi, " ").replace(/\\([,;\\])/g, "$1").trim(); }
  function icsDate(v) {
    v = v.trim();
    if (/^\d{8}$/.test(v)) return { key: v.slice(0, 4) + "-" + v.slice(4, 6) + "-" + v.slice(6, 8), allDay: true };
    const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
    if (!m) return null;
    const d = m[7] ? new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5])) : new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5]);
    return { key: dateKey(d), allDay: false };
  }
  function parseICS(text) {
    const lines = text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
    const evs = []; let cur = null;
    for (const l of lines) {
      if (l === "BEGIN:VEVENT") { cur = {}; continue; }
      if (l === "END:VEVENT") { if (cur) evs.push(cur); cur = null; continue; }
      if (!cur) continue;
      const i = l.indexOf(":"); if (i < 0) continue;
      const name = l.slice(0, i).split(";")[0].toUpperCase(), val = l.slice(i + 1);
      if (name === "SUMMARY") cur.summary = unesc(val);
      else if (name === "DESCRIPTION") cur.desc = unesc(val);
      else if (name === "DTSTART") cur.start = icsDate(val);
      else if (name === "DTEND") cur.end = icsDate(val);
      else if (name === "STATUS") cur.status = val.trim().toUpperCase();
    }
    return evs;
  }
  function findLetter(s) {
    if (!s) return null; let m;
    if ((m = s.match(/^\s*([A-F])\s*$/))) return m[1];
    if ((m = s.match(/(?:^|[^A-Za-z])([A-F])[\s\-]?[Dd]ay\b/))) return m[1];
    if ((m = s.match(/\b[Dd]ay[\s\-:]*([A-F])(?![A-Za-z])/))) return m[1];
    return null;
  }
  function findSched(s) {
    if (!s) return null; let m;
    if ((m = s.match(/\bAct(?:ivity|\.)?\s*(?:Sched(?:ule)?\.?)?\s*(?:#|No\.?)?\s*(\d{1,2})\b/i))) { const n = +m[1]; if (n >= 1 && n <= 10) return "a" + n; }
    if ((m = s.match(/\b(?:Home\s*room|HR)\s*(?:Sched(?:ule)?\.?)?\s*(?:#|No\.?)?\s*([12])\b/i))) return "hr" + m[1];
    if (/\b(?:daily|regular|normal)\s*(?:sched|day|schedule)?\b/i.test(s)) return "daily";
    return null;
  }
  /* Returns { events, count, days: { "2026-11-09": { l:"B", s:"a4", t:["B Day - Activity #4"] } } } */
  function buildDays(text) {
    const evs = parseICS(text); const days = {};
    if (!evs.length) throw new Error("No events found. Make sure this is an .ics calendar file.");
    for (const e of evs) {
      if (!e.start || e.status === "CANCELLED") continue;
      const sum = e.summary || "";
      const letter = findLetter(sum);
      const sched = findSched(sum) || (letter ? findSched(e.desc) : null);
      if (!letter && !sched) continue;
      const keys = [e.start.key];
      if (e.start.allDay && e.end && e.end.allDay) {
        let k = shift(e.start.key, 1), guard = 0;
        while (k < e.end.key && guard++ < 14) { keys.push(k); k = shift(k, 1); }
      }
      for (const k of keys) {
        const d = days[k] || (days[k] = { l: null, s: null, t: [] });
        if (letter && !d.l) d.l = letter;
        if (sched && !d.s) d.s = sched;
        if (d.t.length < 3 && !d.t.includes(sum)) d.t.push(sum.slice(0, 80));
      }
    }
    const count = Object.values(days).filter(d => d.l).length;
    if (!Object.keys(days).length) throw new Error("Found " + evs.length + " events, but none named a letter day (like “B Day”) or a schedule (like “Activity #4”).");
    return { events: evs.length, count, days };
  }
  const api = { buildDays, parseICS, findLetter, findSched, dateKey, shift };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ICSParse = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
