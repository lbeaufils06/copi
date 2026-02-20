export function statusStyle(status) {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-900/40 text-emerald-400";
    case "FAILED":
      return "bg-red-900/40 text-red-400";
    case "RUNNING":
      return "bg-blue-900/40 text-blue-400";
    default:
      return "bg-slate-700 text-slate-300";
  }
}