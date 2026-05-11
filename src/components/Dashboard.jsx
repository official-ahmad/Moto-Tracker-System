import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import LogForm from "./LogForm";
import LogsList from "./LogsList";
import MaintenanceForm from "./MaintenanceForm";
import MaintenanceList from "./MaintenanceList";
import Stats from "./Stats";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("fuel");

  const handleLogAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully! 👋", { duration: 2000 });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            🏍️ Bike Petrol Tracker
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              {user?.displayName || user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
               Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("fuel")}
            className={`px-6 py-3 font-bold rounded-t-lg transition-all ${
              activeTab === "fuel"
                ? "bg-blue-600 text-white border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⛽ Fuel Logs
          </button>
          <button
            onClick={() => setActiveTab("maintenance")}
            className={`px-6 py-3 font-bold rounded-t-lg transition-all ${
              activeTab === "maintenance"
                ? "bg-purple-600 text-white border-b-2 border-purple-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🔧 Maintenance
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Statistics</h2>
          <Stats key={refreshKey} />
        </div>

        {/* Fuel Logs Tab */}
        {activeTab === "fuel" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <LogForm onSuccess={handleLogAdded} />
            </div>
            <div className="lg:col-span-2">
              <LogsList key={refreshKey} />
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === "maintenance" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <MaintenanceForm onSuccess={handleLogAdded} />
            </div>
            <div className="lg:col-span-2">
              <MaintenanceList key={refreshKey} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
