// Downloads the school's Google Calendar (.ics) and writes calendar.json
// with only the letter day + schedule for each date. Run by GitHub Actions.
const fs = require("fs");
const path = require("path");
const { buildDays } = require("../ics-parse.js");

(async () => {
  let url = (process.env.ICS_URL || "").trim();
  if (!url) {
    console.error("ICS_URL secret is missing. Add it under Settings → Secrets and variables → Actions.");
    process.exit(1);
  }
  url = url.replace(/^webcals?:\/\//i, "https://");
  const res = await fetch(url, { headers: { "User-Agent": "mod-day-planner" } });
  if (!res.ok) {
    console.error("Calendar download failed: HTTP " + res.status + ". Check that the iCal address is correct.");
    process.exit(1);
  }
  const text = await res.text();
  const r = buildDays(text);

  // Keep the file small: drop dates more than 30 days in the past.
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
  const cut = cutoff.toISOString().slice(0, 10);
  const days = {};
  Object.keys(r.days).sort().forEach(k => { if (k >= cut) days[k] = r.days[k]; });

  const out = path.join(__dirname, "..", "calendar.json");
  const prev = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
  if (JSON.stringify(prev.days) === JSON.stringify(days)) {
    console.log("No calendar changes.");
    return;
  }
  fs.writeFileSync(out, JSON.stringify({ updatedAt: new Date().toISOString(), days }, null, 1) + "\n");
  console.log("Wrote " + Object.keys(days).length + " dates (" + r.count + " letter days found in " + r.events + " events).");
})().catch(e => { console.error(e.message || e); process.exit(1); });
