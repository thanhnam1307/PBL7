const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "map", label: "Map" },
  { id: "prediction", label: "Prediction" },
  { id: "history", label: "History" },
];

export default function MainLayout({ activePage, onNavigate, children }) {
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
              {item.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto text-[10px] uppercase tracking-widest text-white/35">
          Cadastre Satellite AI
        </div>
      </header>
      <main className="h-[calc(100vh-3.5rem)] overflow-hidden">{children}</main>
    </div>
  );
}
