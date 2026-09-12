import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const API_BASE = "http://localhost:5000/api";

const CROPS = [
  "Onion", "Potato", "Tomato", "Wheat", "Rice", "Soyabean",
  "Cotton", "Maize", "Groundnut", "Chilli", "Turmeric", "Banana",
  "Coconut", "Arecanut", "Black Pepper"
];

function SellTransport() {
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState("");
  const [costPerKm, setCostPerKm] = useState(30);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setError("Location permission denied. Please allow location access.");
        } else {
          setError("Could not get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const findBestMarket = async () => {
    if (!crop || !quantity || !location) {
      setError("Please select crop, enter quantity and allow location.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${API_BASE}/sell/optimize`, {
        latitude: location.latitude,
        longitude: location.longitude,
        crop,
        quantity_tonnes: Number(quantity),
        cost_per_km: Number(costPerKm),
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num || 0);

  const formatTime = (minutes) => {
    if (!minutes) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} hr ${m} min` : `${m} min`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🚛</div>
          <h1 className="text-2xl font-bold text-gray-800">Smart Sell & Transport</h1>
          <p className="text-gray-500 text-sm mt-1">
            Find where your crop can earn the most after transport costs
          </p>
        </div>

        {/* INPUT FORM */}
        {!result && (
          <div className="space-y-5 bg-gray-50 rounded-2xl p-6 border">
            {/* Crop */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Crop
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-white"
              >
                <option value="">-- Choose crop --</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (tonnes)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 15"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base"
              />
            </div>

            {/* Transport Rate Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transport rate: ₹{costPerKm} per km
              </label>
              <input
                type="range"
                min="15"
                max="60"
                step="1"
                value={costPerKm}
                onChange={(e) => setCostPerKm(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹15 (cheap)</span>
                <span>₹60 (expensive)</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <button
                onClick={getLocation}
                disabled={locating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {locating ? "Getting location..." : "📍 Use my location"}
              </button>
              {location && (
                <p className="text-green-700 text-sm mt-2 text-center font-medium">
                  ✅ Location detected
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={findBestMarket}
              disabled={loading || !crop || !quantity || !location}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-lg"
            >
              {loading ? "Finding the best markets..." : "Find Best Market"}
            </button>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-3 text-sm text-red-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div className="space-y-6">
            {/* Recommended Card */}
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6">
              <p className="text-center text-sm font-semibold text-green-800 uppercase tracking-wide mb-2">
                🥇 Recommended Market
              </p>
              <h2 className="text-2xl font-bold text-center text-gray-900 mb-5">
                {result.recommended_market.name}
              </h2>

              <div className="grid grid-cols-2 gap-3 text-center mb-5">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="font-bold text-lg">
                    {formatCurrency(result.recommended_market.price_per_tonne)}/t
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="font-bold text-lg">
                    {result.recommended_market.distance_km} km
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Est. Transport</p>
                  <p className="font-bold text-lg">
                    {formatCurrency(result.recommended_market.transport_cost)}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <p className="text-xs text-gray-500">Travel Time</p>
                  <p className="font-bold text-lg">
                    {formatTime(result.recommended_market.travel_time_minutes)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500">Estimated Net Realization</p>
                <p className="text-3xl font-bold text-green-700">
                  {formatCurrency(result.recommended_market.estimated_net_realization)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Gross {formatCurrency(result.recommended_market.gross_revenue)} − Transport
                </p>
              </div>
            </div>

            {/* Why this market */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="font-bold text-blue-900 mb-3">Why this market?</p>
              <ul className="space-y-2 text-sm text-gray-800">
                <li>✓ Highest estimated net realization after transport</li>
                <li>✓ Competitive mandi price</li>
                <li>✓ Distance: {result.recommended_market.distance_km} km</li>
                <li>✓ Calculated at ₹{result.config?.cost_per_km}/km</li>
              </ul>
            </div>

            {/* Comparison Table */}
            <div>
              <h3 className="font-bold text-lg mb-3">Compare Markets</h3>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left">Market</th>
                      <th className="p-3 text-right">Price/t</th>
                      <th className="p-3 text-right">Dist</th>
                      <th className="p-3 text-right">Transport</th>
                      <th className="p-3 text-right">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.markets.map((m, i) => (
                      <tr
                        key={i}
                        className={i === 0 ? "bg-green-50 font-semibold" : "border-t"}
                      >
                        <td className="p-3">
                          {i === 0 && "🥇 "}
                          {m.name}
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(m.price_per_tonne)}
                        </td>
                        <td className="p-3 text-right">{m.distance_km} km</td>
                        <td className="p-3 text-right">
                          {formatCurrency(m.transport_cost)}
                        </td>
                        <td className="p-3 text-right text-green-700">
                          {formatCurrency(m.estimated_net_realization)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-center text-gray-500 leading-relaxed">
              Transport costs are estimates only (₹{result.config?.cost_per_km}/km × trips).  
              Actual transporter rates may differ. Always confirm current mandi rates.
            </p>

            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-xl"
            >
              Check another crop
            </button>
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/agriculture"
            className="text-green-700 font-medium hover:underline"
          >
            ← Back to Agriculture
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SellTransport;