let serverOffset = 0;

export function syncServerTime(serverTime) {
  if (!serverTime) return;

  const before = Date.now();
  const serverDate = new Date(serverTime);
  const after = Date.now();
  const latency = (after - before) / 2;

  serverOffset = serverDate - (after - latency);
}

export function syncServerTimeNow() {
  return new Date(Date.now() + serverOffset);
}

function plural(value, unit) {
  if (unit === "mois") return `${value} mois`;
  return `${value} ${unit}${value > 1 ? "s" : ""}`;
}

function buildTimeParts(diffInSeconds) {
  const units = [
    { name: "an", seconds: 365 * 24 * 60 * 60 },
    { name: "mois", seconds: 30 * 24 * 60 * 60 },
    { name: "semaine", seconds: 7 * 24 * 60 * 60 },
    { name: "jour", seconds: 24 * 60 * 60 },
    { name: "heure", seconds: 60 * 60 },
    { name: "minute", seconds: 60 },
    { name: "seconde", seconds: 1 },
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

function formatTime(dateString, isFuture = false, isRunning = false) {
  if (!dateString) return "-";

  const now = syncServerTimeNow();
  const target = new Date(dateString);

  const diffMs = isFuture
    ? target.getTime() - now.getTime()
    : now.getTime() - target.getTime();

  if (isRunning) {
    return isFuture ? "maintenant" : "en cours";
  }

  if (diffMs <= 0) {
    return "maintenant";
  }

  const diffInSeconds = Math.floor(diffMs / 1000);
  const parts = buildTimeParts(diffInSeconds);
  const limit = isFuture ? 2 : 1;

  const formatted = parts
    .slice(0, limit)
    .map((p) => plural(p.value, p.unit))
    .join(" ");

  return isFuture ? `dans ${formatted}` : `il y a ${formatted}`;
}

export function formatRelativeTime(dateString, isRunning = false) {
  return formatTime(dateString, false, isRunning);
}

export function formatFutureTime(dateString, isRunning = false) {
  return formatTime(dateString, true, isRunning);
}

export function formatDateTimeFr(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  const day = date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return `${day} a ${time}`;
}

export function getReadableCron(cronExpression) {
  if (!cronExpression) return "Manuel";

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
    return "Planification personnalisee";
  }

  const formatHourMinute = () => `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;

  if (
    sec.startsWith("*/") &&
    min === "*" &&
    hour === "*" &&
    day === "*" &&
    month === "*" &&
    weekDay === "*"
  ) {
    return `Toutes les ${sec.replace("*/", "")} secondes`;
  }

  if (sec === "0" && min === "*" && hour === "*" && day === "*" && month === "*" && weekDay === "*") {
    return "Toutes les minutes";
  }

  if (min.startsWith("*/") && hour === "*" && day === "*" && month === "*" && weekDay === "*") {
    return `Toutes les ${min.replace("*/", "")} minutes`;
  }

  if (hour.startsWith("*/") && day === "*" && month === "*" && weekDay === "*") {
    return `Toutes les ${hour.replace("*/", "")} heures`;
  }

  if (hour === "*" && day === "*" && month === "*" && weekDay === "*") {
    return min === "0" ? "Toutes les heures" : `Toutes les heures a ${min} minute${min > 1 ? "s" : ""}`;
  }

  if (weekDay !== "*" && weekDay !== "?") {
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    return `Chaque ${days[parseInt(weekDay, 10)]} a ${formatHourMinute()}`;
  }

  if (day !== "*" && month === "*") {
    return `Chaque ${day} du mois a ${formatHourMinute()}`;
  }

  if (day !== "*" && month !== "*") {
    const months = [
      "janvier",
      "fevrier",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "aout",
      "septembre",
      "octobre",
      "novembre",
      "decembre",
    ];
    return `Chaque ${day} ${months[parseInt(month, 10) - 1]} a ${formatHourMinute()}`;
  }

  if (day === "*" && month === "*" && weekDay === "*") {
    return `Tous les jours a ${formatHourMinute()}`;
  }

  return "Planification personnalisee";
}

export function getScheduleStyle(cronExpression) {
  const label = getReadableCron(cronExpression);

  if (label.includes("seconde") || label.includes("minute") || label.includes("heure")) {
    return "bg-blue-900/40 text-blue-300 border border-blue-700/60";
  }

  if (label.includes("jour")) {
    return "bg-emerald-900/40 text-emerald-300 border border-emerald-700/60";
  }

  if (
    label.includes("lundi") ||
    label.includes("mardi") ||
    label.includes("mercredi") ||
    label.includes("jeudi") ||
    label.includes("vendredi") ||
    label.includes("samedi") ||
    label.includes("dimanche")
  ) {
    return "bg-violet-900/40 text-violet-300 border border-violet-700/60";
  }

  if (label.includes("mois") || label.includes("janvier")) {
    return "bg-amber-900/40 text-amber-300 border border-amber-700/60";
  }

  return "bg-slate-700/60 text-slate-200 border border-slate-600";
}
