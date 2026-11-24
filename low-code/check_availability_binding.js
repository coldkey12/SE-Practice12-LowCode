// Budibase JS binding used by the "Check availability" button
// (On click -> Update State, key "result"). This is the only script in the
// low-code app; inputs, data, table and layout are configured visually.
const pad = (n) => String(n).padStart(2, "0");
// v2 (security fix): escape data from the table before it reaches the Markdown/HTML text component
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hm = (d) => pad(d.getHours()) + ":" + pad(d.getMinutes());
const out = (available, code, message) => {
  const decision = available ? "Available" : (code === "ROOM_BLOCKED" || code === "OVERLAP" ? "Unavailable" : "Invalid input");
  return "**" + decision + "** | available = " + available + " | reason code = " + code + "\n\n" + message;
};
const rawStart = $("[New Form].Fields.start");
const rawDuration = $("[New Form].Fields.duration");
const blocked = $("[New Form].Fields.blocked") === true;
const rows = $("[New Data Provider].Rows") || [];
const now = new Date();

const start = rawStart ? new Date(rawStart) : null;
if (!start || isNaN(start.getTime())) return out(false, "START_REQUIRED", "Please choose a start date and time.");
if (start <= now) return out(false, "START_IN_PAST", "Start time must be in the future.");
if (rawDuration === undefined || rawDuration === null || rawDuration === "" || !Number.isInteger(Number(rawDuration)))
  return out(false, "DURATION_NOT_NUMBER", "Duration must be a whole number of minutes.");
const duration = Number(rawDuration);
if (duration <= 0) return out(false, "DURATION_NOT_POSITIVE", "Duration must be greater than 0 minutes.");
if (duration > 120) return out(false, "DURATION_TOO_LONG", "Duration must be at most 120 minutes.");
if (blocked) return out(false, "ROOM_BLOCKED", "Unavailable: the room is blocked.");
const end = new Date(start.getTime() + duration * 60000);
const hit = rows.find((r) => start < new Date(r.end) && new Date(r.start) < end);
if (hit) return out(false, "OVERLAP", 'Unavailable: overlaps with "' + esc(hit.title) + '" (' + hm(new Date(hit.start)) + "–" + hm(new Date(hit.end)) + ").");
return out(true, "AVAILABLE", "Available: Room A-101 is free from " + hm(start) + " to " + hm(end) + ".");
