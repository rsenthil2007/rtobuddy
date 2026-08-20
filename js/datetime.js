function pad(n) {
  return String(n).padStart(2, '0');
}

/** YYYY-MM-DD in the user's local timezone (not UTC). */
export function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function localYesterdayKey(d = new Date()) {
  return localDateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
}

/** Local datetime as YYYY-MM-DDTHH:mm:ss (no UTC conversion). */
export function localDateTimeISO(d = new Date()) {
  return `${localDateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function hashDateKey(key) {
  let h = 0;
  for (const c of String(key)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function dailyIndex(length, d = new Date()) {
  if (!length) return 0;
  return hashDateKey(localDateKey(d)) % length;
}
