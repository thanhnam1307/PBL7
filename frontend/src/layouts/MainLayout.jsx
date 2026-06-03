import { useLocale } from "../locale";

const NAV_ITEMS = [
  { id: "dashboard", key: "nav.dashboard" },
  { id: "map", key: "nav.map" },
  { id: "prediction", key: "nav.prediction" },
  { id: "history", key: "nav.history" },
];

export default function MainLayout({ activePage, onNavigate, children }) {
  const { locale, toggleLocale, t } = useLocale();

  return (
    <div className="min-h-screen bg-bg text-slate-100 overflow-hidden">
      <header className="h-14 border-b border-white/10 bg-bg-2 flex items-center px-5 gap-6">
        <button
          type="button"
          onClick={() => onNavigate("dashboard")}
          className="flex items-center gap-2 text-left"
        >
          <span className="h-2.5 w-2.5 rounded-sm bg-accent shadow-[0_0_12px_rgba(43,232,164,0.8)]" />
          <span className="font-display font-bold text-[15px] text-white">
            Da Nang LandGIS
          </span>
        </button>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1.5 rounded-md text-[12px] transition-colors ${
                activePage === item.id
                  ? "bg-accent/10 text-accent"
                  : "text-white/45 hover:text-white/75"
              }`}
            >
              {t(item.key)}
            </button>
          ))}
        </nav>
        <div className="ml-auto">
          <button
            type="button"
            onClick={toggleLocale}
            aria-label={t("header.toggleLabel")}
            className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/10"
          >
            {locale === "en" ? "VI" : "EN"}
          </button>
        </div>
      </header>
      <main className="h-[calc(100vh-3.5rem)] overflow-hidden">{children}</main>
    </div>
  );
}
