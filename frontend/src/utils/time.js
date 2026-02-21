function plural(value, unit) {
  if (unit === "mois") return `${value} mois`;
  if (unit === "an") return `${value} an${value > 1 ? "s" : ""}`;
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

function formatTime(dateString, isFuture = false) {
  if (!dateString) return "—";

  const now = new Date();
  const target = new Date(dateString);

  const diffInSeconds = Math.floor(
    isFuture ? (target - now) / 1000 : (now - target) / 1000
  );

  if (diffInSeconds <= 0) return "maintenant";

  const parts = buildTimeParts(diffInSeconds);

  if (!parts.length) return "maintenant";

  // 🔥 Passé = 1 unité
  // 🔥 Futur = 2 unités
  const limit = isFuture ? 2 : 1;

  const formatted = parts
    .slice(0, limit)
    .map(p => plural(p.value, p.unit))
    .join(" ");

  return isFuture ? `dans ${formatted}` : `il y a ${formatted}`;
}

export function formatRelativeTime(dateString) {
  return formatTime(dateString, false);
}

export function formatFutureTime(dateString) {
  return formatTime(dateString, true);
}

export function getReadableCron(cronExpression) {
  if (!cronExpression) return "Manuel";

  const parts = cronExpression.trim().split(" ");

  let sec, min, hour, day, month, weekDay;

  // 6 champs (Spring)
  if (parts.length === 6) {
    [sec, min, hour, day, month, weekDay] = parts;
  }
  // 5 champs (cron standard)
  else if (parts.length === 5) {
    sec = "0";
    [min, hour, day, month, weekDay] = parts;
  } else {
    return "Planification personnalisée";
  }

  const formatTime = () =>
    `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;

  // 🔹 Toutes les X secondes
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

  // 🔹 Toutes les X minutes
  if (
    min.startsWith("*/") &&
    hour === "*" &&
    day === "*" &&
    month === "*" &&
    weekDay === "*"
  ) {
    return `Toutes les ${min.replace("*/", "")} minutes`;
  }

  // 🔹 Toutes les X heures
  if (
    hour.startsWith("*/") &&
    day === "*" &&
    month === "*" &&
    weekDay === "*"
  ) {
    return `Toutes les ${hour.replace("*/", "")} heures`;
  }

  // 🔹 Toutes les heures
  if (
    hour === "*" &&
    day === "*" &&
    month === "*" &&
    weekDay === "*"
  ) {
    return min === "0"
      ? "Toutes les heures"
      : `Toutes les heures à ${min} minute${min > 1 ? "s" : ""}`;
  }

  // 🔹 Hebdomadaire
  if (weekDay !== "*" && weekDay !== "?") {
    const days = [
      "dimanche",
      "lundi",
      "mardi",
      "mercredi",
      "jeudi",
      "vendredi",
      "samedi",
    ];
    return `Chaque ${days[parseInt(weekDay)]} à ${formatTime()}`;
  }

  // 🔹 Mensuel
  if (day !== "*" && month === "*") {
    return `Chaque ${day} du mois à ${formatTime()}`;
  }

  // 🔹 Annuel
  if (day !== "*" && month !== "*") {
    const months = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    return `Chaque ${day} ${months[parseInt(month) - 1]} à ${formatTime()}`;
  }

  // 🔹 Quotidien
  if (day === "*" && month === "*" && weekDay === "*") {
    return `Tous les jours à ${formatTime()}`;
  }

  return "Planification personnalisée";
}

export function getScheduleStyle(cronExpression) {
  const label = getReadableCron(cronExpression);

  if (label.includes("secondes") || label.includes("minutes") || label.includes("heures"))
    return "bg-blue-900/40 text-blue-400";

  if (label.includes("jours"))
    return "bg-emerald-900/40 text-emerald-400";

  if (
    label.includes("lundi") ||
    label.includes("mardi") ||
    label.includes("mercredi") ||
    label.includes("jeudi") ||
    label.includes("vendredi") ||
    label.includes("samedi") ||
    label.includes("dimanche")
  )
    return "bg-purple-900/40 text-purple-400";

  if (label.includes("mois"))
    return "bg-amber-900/40 text-amber-400";

  if (label.includes("janvier"))
    return "bg-rose-900/40 text-rose-400";

  return "bg-slate-700 text-slate-300";
}