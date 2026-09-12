import { useEffect, useState } from "react";
import { healthApi } from "../../utils/healthApi";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    healthApi.getAlerts()
      .then(setAlerts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const severityColor = {
    high: "border-red-300 bg-red-50",
    medium: "border-yellow-300 bg-yellow-50",
    low: "border-green-300 bg-green-50",
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 max-w-lg mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📢 Health Alerts</h1>

        {loading && <p className="text-gray-500">Loading alerts...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && alerts.length === 0 && (
          <p className="text-gray-500">No alerts posted yet for your area.</p>
        )}

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert._id}
              className={`border rounded-xl p-4 ${severityColor[alert.severity] || "border-gray-200"}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h2 className="font-bold text-gray-800">{alert.title}</h2>
                <span className="text-xs uppercase text-gray-500">{alert.type}</span>
              </div>
              <p className="text-sm text-gray-700">{alert.message}</p>
              <p className="text-xs text-gray-400 mt-2">
                {alert.village}, {alert.district} · {new Date(alert.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Alerts;