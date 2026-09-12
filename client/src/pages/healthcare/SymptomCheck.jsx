import { useState } from "react";
import { healthApi } from "../../utils/healthApi";

function SymptomCheck() {
  const [symptoms, setSymptoms] = useState("");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setError("");
    setAdvice("");
    try {
      const res = await healthApi.checkSymptoms(symptoms, "en");
      setAdvice(res.advice);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 max-w-lg mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🩺 Check My Symptoms</h1>
        <p className="text-gray-500 text-sm mb-6">
          Describe how you're feeling in your own words. This is not a diagnosis.
        </p>

        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="E.g. I have had a fever and headache since yesterday..."
          className="w-full border border-gray-300 rounded-xl p-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleCheck}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Get Advice"}
        </button>

        {error && (
          <p className="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
        )}

        {advice && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h2 className="font-bold text-blue-900 mb-2">AI Guidance</h2>
            <p className="text-gray-800 whitespace-pre-line">{advice}</p>
            <p className="text-xs text-gray-500 mt-3">
              This is general guidance, not a medical diagnosis. Please visit a clinic for serious or worsening symptoms.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default SymptomCheck;