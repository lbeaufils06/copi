export function formatRelativeTime(dateString) {
  if (!dateString) return "—";

  const now = new Date();
  const past = new Date(dateString);

  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return `il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? "s" : ""}`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? "s" : ""}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `il y a ${diffInMonths} mois`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `il y a ${diffInYears} an${diffInYears > 1 ? "s" : ""}`;
}

export function formatFutureTime(dateString) {
  if (!dateString) return "—";

  const now = new Date();
  const future = new Date(dateString);

  const diffInSeconds = Math.floor((future - now) / 1000);

  if (diffInSeconds <= 0) return "maintenant";

  if (diffInSeconds < 60) {
    return `dans ${diffInSeconds} seconde${diffInSeconds > 1 ? "s" : ""}`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `dans ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `dans ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `dans ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `dans ${diffInWeeks} semaine${diffInWeeks > 1 ? "s" : ""}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `dans ${diffInMonths} mois`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `dans ${diffInYears} an${diffInYears > 1 ? "s" : ""}`;
}