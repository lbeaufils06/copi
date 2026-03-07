let serverOffset = 0;

export function syncServerTime(serverTime) {
  if (!serverTime) return;

  const before = Date.now();
  const serverDate = new Date(serverTime);
  const after = Date.now();
  // latency: Stores round-trip latency estimation to correct server-time offset.
  const latency = (after - before) / 2;

  serverOffset = serverDate - (after - latency);
}

export function syncServerTimeNow() {
  return new Date(Date.now() + serverOffset);
}

// plural: Returns localized singular or plural unit labels based on the numeric value.
function plural(value, unit, locale = "fr") {
  const catalog = {
    fr: {
      year: ["an", "ans"],
      month: ["mois", "mois"],
      week: ["semaine", "semaines"],
      day: ["jour", "jours"],
      hour: ["heure", "heures"],
      minute: ["minute", "minutes"],
      second: ["seconde", "secondes"],
    },
    en: {
      year: ["year", "years"],
      month: ["month", "months"],
      week: ["week", "weeks"],
      day: ["day", "days"],
      hour: ["hour", "hours"],
      minute: ["minute", "minutes"],
      second: ["second", "seconds"],
    },
  };

  const dict = catalog[locale] ?? catalog.en;
  const forms = dict[unit];
  return `${value} ${value > 1 ? forms[1] : forms[0]}`;
}

// buildTimeParts: Breaks a duration in seconds into ordered time-unit chunks for display.
function buildTimeParts(diffInSeconds) {
  const units = [
    { name: "year", seconds: 365 * 24 * 60 * 60 },
    { name: "month", seconds: 30 * 24 * 60 * 60 },
    { name: "week", seconds: 7 * 24 * 60 * 60 },
    { name: "day", seconds: 24 * 60 * 60 },
    { name: "hour", seconds: 60 * 60 },
    { name: "minute", seconds: 60 },
    { name: "second", seconds: 1 },
  ];

  let remaining = diffInSeconds;
  const parts = [];

  for (const unit of units) {
    const value = Math.floor(remaining / unit.seconds);
    if (value > 0) {
      parts.push({ unit: unit.name, value });
      remaining -= value * unit.seconds;
    }
  }

  return parts;
}

// formatTime: Converts a timestamp into localized relative or future-readable text.
function formatTime(dateString, isFuture = false, isRunning = false, locale = "fr") {
  if (!dateString) return "-";

  const now = syncServerTimeNow();
  const target = new Date(dateString);

  const diffMs = isFuture ? target.getTime() - now.getTime() : now.getTime() - target.getTime();

  if (isRunning) {
    return locale === "fr" ? (isFuture ? "maintenant" : "en cours") : isFuture ? "now" : "running";
  }

  if (diffMs <= 0) {
    return locale === "fr" ? "maintenant" : "now";
  }

  const diffInSeconds = Math.floor(diffMs / 1000);
  const parts = buildTimeParts(diffInSeconds);
  const limit = isFuture ? 2 : 1;

  const formatted = parts
    .slice(0, limit)
    .map((p) => plural(p.value, p.unit, locale))
    .join(" ");

  if (locale === "fr") {
    return isFuture ? `dans ${formatted}` : `il y a ${formatted}`;
  }

  return isFuture ? `in ${formatted}` : `${formatted} ago`;
}

export function formatRelativeTime(dateString, isRunning = false, locale = "fr") {
  return formatTime(dateString, false, isRunning, locale);
}

export function formatFutureTime(dateString, isRunning = false, locale = "fr") {
  return formatTime(dateString, true, isRunning, locale);
}

export function formatDateTimeLocale(dateString, locale = "fr") {
  if (!dateString) return "-";
  const uiLocale = locale === "fr" ? "fr-FR" : "en-US";

  const date = new Date(dateString);
  const day = date.toLocaleDateString(uiLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const time = date.toLocaleTimeString(uiLocale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return `${day} ${locale === "fr" ? "a" : "at"} ${time}`;
}

export function getReadableCron(cronExpression, locale = "fr") {
  if (!cronExpression) return locale === "fr" ? "Manuel" : "Manual";

  const parts = cronExpression.trim().split(" ");
  let sec;
  let min;
  let hour;
  let day;
  let month;
  let weekDay;

  if (parts.length === 6) {
    [sec, min, hour, day, month, weekDay] = parts;
  } else if (parts.length === 5) {
    sec = "0";
    [min, hour, day, month, weekDay] = parts;
  } else {
    return locale === "fr" ? "Planification personnalisee" : "Custom schedule";
  }

  // formatHourMinute: Formats hour and minute values into a zero-padded HH:MM string.
  const formatHourMinute = () => `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  const daysFr = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  const daysEn = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const monthsFr = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  const monthsEn = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

  if (sec.startsWith("*/") && min === "*" && hour === "*" && day === "*" && month === "*" && weekDay === "*") {
    return locale === "fr" ? `Toutes les ${sec.replace("*/", "")} secondes` : `Every ${sec.replace("*/", "")} seconds`;
  }

  if (sec === "0" && min === "*" && hour === "*" && day === "*" && month === "*" && weekDay === "*") {
    return locale === "fr" ? "Toutes les minutes" : "Every minute";
  }

  if (min.startsWith("*/") && hour === "*" && day === "*" && month === "*" && weekDay === "*") {
    return locale === "fr" ? `Toutes les ${min.replace("*/", "")} minutes` : `Every ${min.replace("*/", "")} minutes`;
  }

  if (hour.startsWith("*/") && day === "*" && month === "*" && weekDay === "*") {
    return locale === "fr" ? `Toutes les ${hour.replace("*/", "")} heures` : `Every ${hour.replace("*/", "")} hours`;
  }

  if (hour === "*" && day === "*" && month === "*" && weekDay === "*") {
    if (min === "0") return locale === "fr" ? "Toutes les heures" : "Every hour";
    return locale === "fr" ? `Toutes les heures a ${min} minute${min > 1 ? "s" : ""}` : `Every hour at ${min} minute${min > 1 ? "s" : ""}`;
  }

  if (weekDay !== "*" && weekDay !== "?") {
    const days = locale === "fr" ? daysFr : daysEn;
    return locale === "fr"
      ? `Chaque ${days[parseInt(weekDay, 10)]} a ${formatHourMinute()}`
      : `Every ${days[parseInt(weekDay, 10)]} at ${formatHourMinute()}`;
  }

  if (day !== "*" && month === "*") {
    return locale === "fr" ? `Chaque ${day} du mois a ${formatHourMinute()}` : `Every month on day ${day} at ${formatHourMinute()}`;
  }

  if (day !== "*" && month !== "*") {
    const months = locale === "fr" ? monthsFr : monthsEn;
    return locale === "fr"
      ? `Chaque ${day} ${months[parseInt(month, 10) - 1]} a ${formatHourMinute()}`
      : `Every ${months[parseInt(month, 10) - 1]} ${day} at ${formatHourMinute()}`;
  }

  if (day === "*" && month === "*" && weekDay === "*") {
    return locale === "fr" ? `Tous les jours a ${formatHourMinute()}` : `Every day at ${formatHourMinute()}`;
  }

  return locale === "fr" ? "Planification personnalisee" : "Custom schedule";
}

export function getScheduleStyle(cronExpression, locale = "fr") {
  const label = getReadableCron(cronExpression, locale).toLowerCase();

  const secondWord = locale === "fr" ? "seconde" : "second";
  const minuteWord = locale === "fr" ? "minute" : "minute";
  const hourWord = locale === "fr" ? "heure" : "hour";
  const dayWord = locale === "fr" ? "jour" : "day";
  const weekWord = locale === "fr" ? "lundi" : "monday";
  const monthWord = locale === "fr" ? "mois" : "month";

  if (label.includes(secondWord) || label.includes(minuteWord) || label.includes(hourWord)) {
    return "bg-blue-900/40 text-blue-300 border border-blue-700/60";
  }

  if (label.includes(dayWord)) {
    return "bg-emerald-900/40 text-emerald-300 border border-emerald-700/60";
  }

  if (label.includes(weekWord)) {
    return "bg-violet-900/40 text-violet-300 border border-violet-700/60";
  }

  if (label.includes(monthWord) || label.includes("january") || label.includes("janvier")) {
    return "bg-amber-900/40 text-amber-300 border border-amber-700/60";
  }

  return "bg-slate-700/60 text-slate-200 border border-slate-600";
}
