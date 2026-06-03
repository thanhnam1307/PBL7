import { useState } from "react";
import { LocaleProvider } from "./locale";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import PredictionPage from "./pages/PredictionPage";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [session, setSession] = useState(null);

  if (!session && process.env.REACT_APP_REQUIRE_LOGIN === "true") {
    return <LoginPage onAuthenticated={setSession} />;
  }

  const pages = {
    dashboard: <DashboardPage onNavigate={setActivePage} />,
    map: <MapPage />,
    prediction: <PredictionPage />,
    history: <HistoryPage />,
  };

  return (
    <LocaleProvider>
      <MainLayout activePage={activePage} onNavigate={setActivePage}>
        {pages[activePage] || pages.dashboard}
      </MainLayout>
    </LocaleProvider>
  );
}
