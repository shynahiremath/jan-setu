import { analyzeCropImage } from "../services/cropDiseaseService.js";

function formatDetail(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => (typeof val === "string" ? `${key}: ${val}` : key))
      .join(" • ");
  }
  return String(value);
}

export const analyzeCrop = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        message: "No image provided. Please take or upload a photo.",
      });
    }

    // Only call Crop.health API
    const rawResult = await analyzeCropImage(image);

    const cropSuggestions =
      rawResult?.result?.crop?.suggestions?.slice(0, 2).map((s) => ({
        name: s.name || "Unknown crop",
        probability: Math.round((s.probability || 0) * 100),
      })) || [];

    const diseaseSuggestions =
      rawResult?.result?.disease?.suggestions?.slice(0, 2).map((s) => {
        const details = s.details || {};
        return {
          name: s.name || "Unknown issue",
          probability: Math.round((s.probability || 0) * 100),
          description: formatDetail(details.description),
          treatment: formatDetail(details.treatment),
          symptoms: formatDetail(details.symptoms),
          severity: formatDetail(details.severity),
        };
      }) || [];

    res.status(200).json({
      source: "Crop.health (Kindwise)",
      sourceUrl: "https://www.kindwise.com/crop-health",
      cropSuggestions,
      diseaseSuggestions,
      message:
        diseaseSuggestions.length === 0
          ? "No clear disease detected. The plant may be healthy or the photo is unclear."
          : null,
    });
  } catch (error) {
    console.error("Crop analysis error:", error.response?.data || error.message);

    if (error.response?.status === 401 || error.response?.status === 403) {
      return res.status(502).json({
        message: "API key issue or insufficient credits. Please check your Crop.health account.",
      });
    }

    res.status(502).json({
      message:
        "REAL DATA SOURCE TEMPORARILY UNAVAILABLE. Please try again later or consult a local agriculture expert.",
    });
  }
};