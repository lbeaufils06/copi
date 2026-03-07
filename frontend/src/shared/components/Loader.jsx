import { useI18n } from "../../i18n/I18nContext";

function Loader({ text }) {
  const { t } = useI18n();
  const content = text ?? t("common.loading");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
      <p className="mt-4 text-slate-400 text-sm">{content}</p>
    </div>
  );
}

export default Loader;
