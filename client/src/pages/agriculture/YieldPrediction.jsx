import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const API_BASE = "http://localhost:5000/api";

const CROPS = [
  "Onion", "Potato", "Tomato", "Wheat", "Rice", "Soyabean",
  "Cotton", "Maize", "Groundnut", "Chilli", "Turmeric", "Banana"
];
const SEASONS = ["Kharif", "Rabi", "Summer"];
const IRRIGATION = ["Rainfed", "Partial", "Full"];

function YieldPrediction() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    crop: "",
    area_acres: "",
    season: "Kharif",
    irrigation: "Partial",
  });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
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
      () => {
        setLocating(false);
        setError("Could not get location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const handlePredict = async () => {
    if (!form.crop || !form.area_acres || !location) {
      setError("Please select crop, enter area and allow location.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${API_BASE}/yield/estimate`, {
        ...form,
        area_acres: Number(form.area_acres),
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const goToSell = () => {
    if (!result) return;
    navigate("/agriculture/sell-transport", {
      state: {
        crop: result.crop,
        quantity: result.total_production.expected_tonnes,
      },
    });
  };

  const getStatusColor = (status) => {
    if (status === "Good" || status === "Favorable") return "text-green-700 bg-green-100";
    if (status === "Moderate") return "text-yellow-700 bg-yellow-100";
    if (status === "Low" || status === "High" || status === "Needs Attention")
      return "text-red-700 bg-red-100";
    return "text-gray-600 bg-gray-100";
  };

  const getBarWidth = (status) => {
    if (status === "Good" || status === "Favorable") return "85%";
    if (status === "Moderate") return "60%";
    return "35%";
  };

  // Dummy trend data for charts (replace with real historical weather if available)
  const tempTrend = [
    { day: "Mon", temp: 27 },
    { day: "Tue", temp: 29 },
    { day: "Wed", temp: 28 },
    { day: "Thu", temp: 30 },
    { day: "Fri", temp: 28 },
    { day: "Sat", temp: 27 },
    { day: "Sun", temp: 29 },
  ];
  const rainTrend = [
    { day: "Mon", rain: 12 },
    { day: "Tue", rain: 5 },
    { day: "Wed", rain: 18 },
    { day: "Thu", rain: 2 },
    { day: "Fri", rain: 9 },
    { day: "Sat", rain: 15 },
    { day: "Sun", rain: 7 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-1">🌾</div>
          <h1 className="text-2xl font-bold text-gray-800">AI Yield Prediction</h1>
          <p className="text-gray-500 text-sm">Understand your expected harvest in simple terms</p>
        </div>

        {/* ========== INPUT FORM ========== */}
        {!result && (
          <div className="bg-white rounded-2xl border p-6 space-y-5 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-1">Crop</label>
              <select
                name="crop"
                value={form.crop}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 bg-white"
              >
                <option value="">-- Select crop --</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Farm Area (acres)</label>
              <input
                type="number"
                name="area_acres"
                min="0.1"
                step="0.1"
                value={form.area_acres}
                onChange={handleChange}
                placeholder="e.g. 2.5"
                className="w-full border rounded-xl px-4 py-3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Season</label>
                <select
                  name="season"
                  value={form.season}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 bg-white"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Irrigation</label>
                <select
                  name="irrigation"
                  value={form.irrigation}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3 bg-white"
                >
                  {IRRIGATION.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={getLocation}
              disabled={locating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl"
            >
              {locating ? "Getting location..." : "📍 Use My Location"}
            </button>
            {location && (
              <p className="text-center text-green-700 text-sm font-medium">
                ✅ Location detected
              </p>
            )}

            <button
              onClick={handlePredict}
              disabled={loading || !form.crop || !form.area_acres || !location}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-lg"
            >
              {loading ? "Predicting your harvest..." : "Predict My Harvest"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
            {error}
          </div>
        )}

        {/* ========== FINAL RESULT DASHBOARD ========== */}
        {result && (
          <div className="space-y-6">
            {/* 1. TOP RESULT CARD */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-400 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                🌾 Your Harvest Estimate
              </p>
              <h2 className="text-4xl font-extrabold text-gray-900 mt-2">
                {result.total_production.expected_tonnes} tonnes
              </h2>
              <p className="text-gray-600 mt-1">
                Expected range: { (result.total_production.low / 10).toFixed(1) } – { (result.total_production.high / 10).toFixed(1) } tonnes
              </p>
              <div className="mt-4 flex justify-center gap-6 text-sm text-gray-700">
                <span>Crop: <b>{result.crop}</b></span>
                <span>Area: <b>{result.area_acres} acres</b></span>
              </div>
            </div>

            {/* 2. WEATHER CARDS */}
            <div>
              <h3 className="font-bold text-lg mb-3">🌦 Weather Around Your Farm</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border text-center">
                  <div className="text-2xl">🌡️</div>
                  <p className="text-xl font-bold mt-1">
                    {result.weather.temperature !== null ? `${result.weather.temperature}°C` : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Temperature</p>
                </div>
                <div className="bg-white rounded-xl p-4 border text-center">
                  <div className="text-2xl">🌧️</div>
                  <p className="text-xl font-bold mt-1">
                    {result.weather.rainfall !== null ? `${result.weather.rainfall} mm` : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Rainfall</p>
                </div>
                <div className="bg-white rounded-xl p-4 border text-center">
                  <div className="text-2xl">💧</div>
                  <p className="text-xl font-bold mt-1">
                    {result.weather.humidity !== null ? `${result.weather.humidity}%` : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Humidity</p>
                </div>
                <div className="bg-white rounded-xl p-4 border text-center">
                  <div className="text-2xl">☔</div>
                  <p className="text-xl font-bold mt-1">
                    {result.weather.rain_probability !== null
                      ? `${result.weather.rain_probability}%`
                      : "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">Rain Chance</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Based on recent local weather data
              </p>
            </div>

            {/* 3. WEATHER CONDITION BARS */}
            <div className="bg-white rounded-2xl border p-5">
              <h3 className="font-bold text-lg mb-4">🌱 Weather Condition</h3>
              {["rainfall", "temperature", "humidity"].map((key) => (
                <div key={key} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{key}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.condition[key])}`}>
                      {result.condition[key]}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all"
                      style={{ width: getBarWidth(result.condition[key]) }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 text-center">
                <span className={`inline-block px-4 py-1.5 rounded-full font-semibold text-sm ${getStatusColor(result.condition.overall)}`}>
                  Overall: {result.condition.overall}
                </span>
              </div>
            </div>

            {/* 4. HOW HARVEST IS CALCULATED */}
            <div className="bg-white rounded-2xl border p-5 text-center">
              <h3 className="font-bold text-lg mb-4">🌾 How Your Harvest is Estimated</h3>
              <div className="flex flex-col items-center gap-2 text-lg">
                <div className="bg-green-50 px-4 py-2 rounded-xl font-semibold">
                  {result.yield_per_acre.expected} quintals / acre
                </div>
                <div className="text-2xl">×</div>
                <div className="bg-blue-50 px-4 py-2 rounded-xl font-semibold">
                  {result.area_acres} acres
                </div>
                <div className="text-2xl">↓</div>
                <div className="bg-green-100 border-2 border-green-400 px-6 py-3 rounded-2xl font-bold text-xl text-green-800">
                  🌾 {result.total_production.expected_tonnes} tonnes expected
                </div>
              </div>
            </div>

            {/* 5. DYNAMIC AI EXPLANATION */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
              <h3 className="font-bold text-indigo-900 mb-2">🤖 What This Means for You</h3>
              <p className="text-gray-800 leading-relaxed text-sm">
                {result.explanation}
              </p>
            </div>

            {/* 6. HARVEST SUMMARY */}
            <div className="bg-white rounded-2xl border p-5">
              <h3 className="font-bold text-lg mb-3 text-center">📦 Harvest Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Crop</span>
                  <span className="font-medium">{result.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Farm Area</span>
                  <span className="font-medium">{result.area_acres} acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expected Yield</span>
                  <span className="font-medium">{result.yield_per_acre.expected} q/acre</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expected Harvest</span>
                  <span className="font-bold text-green-700">
                    {result.total_production.expected_tonnes} tonnes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weather</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.condition.overall)}`}>
                    {result.condition.overall}
                  </span>
                </div>
              </div>
            </div>

            {/* 7. CHARTS */}
            <div className="bg-white rounded-2xl border p-5">
              <h3 className="font-bold text-lg mb-3">📈 Recent Temperature Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={tempTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl border p-5">
              <h3 className="font-bold text-lg mb-3">🌧️ Recent Rainfall Trend</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={rainTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rain" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 8. FIND BEST MARKET BUTTON */}
            <button
              onClick={goToSell}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2"
            >
              🚚 Find Best Market for this Harvest
            </button>

            <button
              onClick={() => setResult(null)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-xl"
            >
              Predict another crop
            </button>

            <p className="text-xs text-center text-gray-400">
              This is an estimate based on historical yields + current weather.  
              Not a guarantee of actual harvest.
            </p>
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/agriculture" className="text-green-700 font-medium hover:underline">
            ← Back to Agriculture
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default YieldPrediction;