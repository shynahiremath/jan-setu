import { optimizeSell } from "../services/sellOptimizeService.js";

export const optimizeSellHandler = async (req, res) => {
  try {
    const { latitude, longitude, crop, quantity_tonnes, cost_per_km } = req.body;

    if (!latitude || !longitude || !crop || !quantity_tonnes) {
      return res.status(400).json({
        message: "latitude, longitude, crop and quantity_tonnes are required",
      });
    }

    const result = await optimizeSell({
      latitude: Number(latitude),
      longitude: Number(longitude),
      crop: crop.trim(),
      quantity_tonnes: Number(quantity_tonnes),
      cost_per_km: cost_per_km ? Number(cost_per_km) : undefined,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Sell optimize error:", error.message);
    res.status(502).json({
      message: error.message || "Could not calculate best market",
    });
  }
};