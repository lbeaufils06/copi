export function statusStyle(status) {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-900/40 text-emerald-300 border border-emerald-700/60";
    case "FAILED":
      return "bg-red-900/40 text-red-300 border border-red-700/60";
    case "RUNNING":
      return "bg-amber-900/40 text-amber-300 border border-amber-700/60";
    default:
      return "bg-slate-700/60 text-slate-200 border border-slate-600";
  }
}

export function statusLabel(status) {
  switch (status) {
    case "SUCCESS":
      return "Succes";
    case "FAILED":
      return "Echec";
    case "RUNNING":
      return "En cours";
    default:
      return "Non execute";
  }
}

export function executionModeLabel(mode) {
  if (mode === "MANUAL") return "Manuel";
  return "Cron";
}

export function executionModeStyle(mode) {
  if (mode === "MANUAL") {
    return "bg-sky-900/40 text-sky-300 border border-sky-700/60";
  }
  return "bg-violet-900/40 text-violet-300 border border-violet-700/60";
}
