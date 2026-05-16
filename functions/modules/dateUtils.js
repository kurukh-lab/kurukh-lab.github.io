/**
 * Shared date helpers for daily-snapshot pipelines.
 *
 * All daily pipelines anchor on IST so the snapshot doc for a given local
 * day stays stable regardless of when within the day a (re)compute fires.
 */

const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Today's IST date as a YYYY-MM-DD string. `en-CA` formats numerically in
 * the order we want, so no manual padding/joining is needed.
 */
function istDateString(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

module.exports = {
  IST_TIMEZONE,
  istDateString,
};
