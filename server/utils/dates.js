// Dates are stored as "YYYY-MM-DD" strings and times as "HH:00" so comparisons are simple and timezone-proof.
const pad = (n) => String(n).padStart(2, '0');
exports.pad = pad;
exports.todayStr = () => new Date().toLocaleDateString('en-CA');
exports.addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('en-CA'); };
exports.isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
exports.hourOf = (t) => parseInt(t, 10);
exports.toTime = (h) => `${pad(h)}:00`;
// One key per booked hour. A unique index on these keys makes double booking impossible, even for simultaneous requests.
exports.slotKeys = (facilityId, date, startH, endH) =>
  Array.from({ length: endH - startH }, (_, i) => `${facilityId}|${date}|${pad(startH + i)}`);
