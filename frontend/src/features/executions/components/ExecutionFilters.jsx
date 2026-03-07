import { CustomSelect } from "../../../shared/components";

// ExecutionFilters: Renders execution search and filter controls for both mobile and desktop layouts.
function ExecutionFilters({
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  modeFilter,
  setModeFilter,
  periodFilter,
  setPeriodFilter,
  statusOptions,
  modeOptions,
  periodOptions,
  showMobileFilters,
  setShowMobileFilters,
  t,
}) {
  return (
    <>
      <div className="mt-4 sm:hidden flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("executions.searchPlaceholder")}
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => setShowMobileFilters((prev) => !prev)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200"
        >
          {t("executions.filters")}
        </button>
      </div>

      {showMobileFilters && (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:hidden">
          <CustomSelect id="exec-status-filter-mobile" name="statusFilter" value={statusFilter} options={statusOptions} onChange={(e) => setStatusFilter(e.target.value)} size="compact" />
          <CustomSelect id="exec-mode-filter-mobile" name="modeFilter" value={modeFilter} options={modeOptions} onChange={(e) => setModeFilter(e.target.value)} size="compact" />
          <CustomSelect id="exec-period-filter-mobile" name="periodFilter" value={periodFilter} options={periodOptions} onChange={(e) => setPeriodFilter(e.target.value)} size="compact" />
        </div>
      )}

      <div className="mt-4 hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <CustomSelect id="exec-status-filter" name="statusFilter" value={statusFilter} options={statusOptions} onChange={(e) => setStatusFilter(e.target.value)} size="compact" />
        <CustomSelect id="exec-mode-filter" name="modeFilter" value={modeFilter} options={modeOptions} onChange={(e) => setModeFilter(e.target.value)} size="compact" />
        <CustomSelect id="exec-period-filter" name="periodFilter" value={periodFilter} options={periodOptions} onChange={(e) => setPeriodFilter(e.target.value)} size="compact" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("executions.searchPlaceholder")}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
        />
      </div>
    </>
  );
}

export default ExecutionFilters;
