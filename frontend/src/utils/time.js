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

  let parts = buildTimeParts(diffInSeconds);

  if (!parts.length) return "maintenant";

  // 🔥 Supprimer les secondes si on a au moins 1 minute
  const hasMinuteOrMore = parts.some(
    p => ["minute", "heure", "jour", "semaine", "mois", "an"].includes(p.unit)
  );

  if (hasMinuteOrMore) {
    parts = parts.filter(p => p.unit !== "seconde");
  }

  // 🔥 Passé = 1 unité, Futur = 2 unités
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