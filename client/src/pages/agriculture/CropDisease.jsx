import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import CameraCapture from "../../components/camera/CameraCapture";
import ImageUploader from "../../components/camera/ImageUploader";
import ImagePreview from "../../components/camera/ImagePreview";
import VoiceOutput from "../../components/voice/VoiceOutput";

const API_BASE = "http://localhost:5000/api";

function CropDisease() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelected = ({ file, previewUrl }) => {
    setSelectedImage({ file, previewUrl });
    setResult(null);
    setError(null);
  };

  const clearImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const analyzeImage = async () => {
    if (!selectedImage?.previewUrl) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post(`${API_BASE}/crop/analyze`, {
        image: selectedImage.previewUrl,
      });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not check the plant right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Decide risk level from the top disease probability
  const getRiskInfo = () => {
    if (!result?.diseaseSuggestions?.length) {
      return {
        level: "Low",
        color: "green",
        emoji: "✅",
        title: "Looks mostly healthy",
        message: "No major problem found in this photo.",
      };
    }

    const top = result.diseaseSuggestions[0];
    const prob = top.probability || 0;

    if (prob >= 70) {
      return {
        level: "High",
        color: "red",
        emoji: "⚠️",
        title: "Possible serious problem",
        message: `The photo shows signs of ${top.name}.`,
      };
    }

    if (prob >= 40) {
      return {
        level: "Medium",
        color: "orange",
        emoji: "⚡",
        title: "Some problem may be present",
        message: `Possible issue: ${top.name}.`,
      };
    }

    return {
      level: "Low",
      color: "yellow",
      emoji: "🔍",
      title: "Small chance of problem",
      message: `Weak signs of ${top.name}.`,
    };
  };

  const risk = result ? getRiskInfo() : null;

  // Simple hardcoded recommendations based on risk
  const getRecommendations = () => {
    if (!risk) return [];

    if (risk.level === "High") {
      return [
        "Do not wait. Show this photo to a local agriculture officer today.",
        "Remove badly affected leaves if possible.",
        "Avoid watering the leaves — water only the soil.",
        "Keep the plant away from healthy plants.",
      ];
    }

    if (risk.level === "Medium") {
      return [
        "Watch the plant for 2–3 days.",
        "Take another clear photo if it gets worse.",
        "Ask a nearby farmer or agriculture officer for advice.",
        "Do not spray any chemical until you confirm the problem.",
      ];
    }

    return [
      "The plant looks mostly okay.",
      "Keep checking every few days.",
      "Make sure the plant gets enough sunlight and air.",
      "If new spots appear, take another photo.",
    ];
  };

  // Short voice text
  const getVoiceText = () => {
    if (!result || !risk) return "";
    return `${risk.title}. ${risk.message} This is only an estimate. Please ask a local farming expert for advice.`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-lg mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🌱</div>
          <h1 className="text-2xl font-bold text-gray-800">Check Plant Health</h1>
          <p className="text-gray-500 text-sm mt-1">
            Take a clear photo of the leaf or plant
          </p>
        </div>

        {/* Capture / Upload */}
        {!selectedImage && (
          <div className="space-y-4">
            <CameraCapture onImageSelected={handleImageSelected} />
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <ImageUploader onImageSelected={handleImageSelected} />
          </div>
        )}

        {/* Preview + Analyze */}
        {selectedImage && !result && !loading && (
          <div className="space-y-5">
            <ImagePreview imageUrl={selectedImage.previewUrl} onClear={clearImage} />
            <button
              onClick={analyzeImage}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl text-lg"
            >
              Check This Photo
            </button>
            <button
              onClick={clearImage}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl"
            >
              Choose different photo
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 animate-pulse">🔍</div>
            <p className="text-lg font-medium text-gray-700">Checking the plant...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait a few seconds</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">😕</div>
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={analyzeImage}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-xl font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ========== RESULT UI ========== */}
        {result && risk && (
          <div className="space-y-5">
            {/* Photo preview (small) */}
            <div className="flex justify-center">
              <img
                src={selectedImage.previewUrl}
                alt="Checked plant"
                className="w-32 h-32 object-cover rounded-xl border border-gray-200"
              />
            </div>

            {/* RISK CARD */}
            <div
              className={`rounded-2xl p-5 text-center border-2 ${
                risk.color === "red"
                  ? "bg-red-50 border-red-300"
                  : risk.color === "orange"
                  ? "bg-orange-50 border-orange-300"
                  : risk.color === "yellow"
                  ? "bg-yellow-50 border-yellow-300"
                  : "bg-green-50 border-green-300"
              }`}
            >
              <div className="text-5xl mb-2">{risk.emoji}</div>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-70">
                Risk Level: {risk.level}
              </p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{risk.title}</h2>
              <p className="text-gray-700 mt-2 text-base">{risk.message}</p>
            </div>

            {/* Top disease name */}
            {result.diseaseSuggestions?.[0] && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 mb-1">Possible problem</p>
                <p className="text-lg font-bold text-gray-800">
                  {result.diseaseSuggestions[0].name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Confidence: {result.diseaseSuggestions[0].probability}%
                </p>
              </div>
            )}

            {/* WHAT TO DO */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <p className="font-bold text-blue-900 mb-3 text-center">What you can do</p>
              <ul className="space-y-3">
                {getRecommendations().map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-blue-600 font-bold text-lg">{i + 1}.</span>
                    <span className="text-gray-800 text-base leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Voice button */}
            <div className="flex justify-center">
              <VoiceOutput text={getVoiceText()} label="🔊 Listen to result" />
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-center text-gray-500 px-4">
              This is only a computer estimate.  
              Always ask a local farming expert before using any medicine or spray.
            </p>

            {/* Source */}
            <p className="text-xs text-center text-gray-400">
              Powered by{" "}
              <a
                href="https://www.kindwise.com/crop-health"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Crop.health
              </a>
            </p>

            {/* Scan another */}
            <button
              onClick={clearImage}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-xl"
            >
              Check another photo
            </button>
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/agriculture" className="text-green-700 font-medium hover:underline">
            ← Back to Agriculture
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CropDisease;