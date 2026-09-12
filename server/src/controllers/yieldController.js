import { estimateYield } from "../services/yieldService.js";

export const estimateYieldHandler = async (req, res) => {
  try {
    const { crop, area_acres, season, irrigation, latitude, longitude } = req.body;

    if (!crop || !area_acres) {
      return res.status(400).json({ message: "crop and area_acres are required" });
    }

    const result = await estimateYield({
      crop,
      area_acres: Number(area_acres),
      season: season || "Kharif",
      irrigation: irrigation || "Partial",
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Yield error:", error.message);
    res.status(400).json({ message: error.message });
  }
};