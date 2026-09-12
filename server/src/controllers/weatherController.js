import { fetchCurrentWeather, getWeatherDescription } from "../services/weatherService.js";

function getIrrigationAdvice({ precipitation, humidity, soilMoisture, cropType }) {
  // Simple, practical rules for Indian farmers
  const rain = precipitation ?? 0;
  const hum = humidity ?? 50;
  const soil = (soilMoisture || "medium").toLowerCase();
  const crop = (cropType || "Other").toLowerCase();

  // High rain recently → usually no need to irrigate
  if (rain >= 8) {
    return {
      urgency: "low",
      label: "No irrigation needed",
      advice: "Good recent rain. Skip irrigation today. Check soil again in 2–3 days.",
    };
  }

  if (rain >= 3 && soil !== "low") {
    return {
      urgency: "low",
      label: "Light rain recently",
      advice: "Soil should still have moisture. Wait one more day before watering.",
    };
  }

  // Soil moisture based
  if (soil === "high") {
    return {
      urgency: "low",
      label: "Soil is already wet",
      advice: "Do not irrigate. Over-watering can damage roots and invite disease.",
    };
  }

  if (soil === "low") {
    // Extra care for water-loving crops
    if (["rice", "sugarcane"].includes(crop)) {
      return {
        urgency: "high",
        label: "Urgent – water-loving crop",
        advice: "Soil is dry and this crop needs water. Irrigate today if possible.",
      };
    }
    return {
      urgency: "high",
      label: "Soil is dry",
      advice: "Irrigate as soon as you can. Prefer early morning or late evening.",
    };
  }

  // Medium soil
  if (hum < 40 && rain < 2) {
    return {
      urgency: "medium",
      label: "Air is dry",
      advice: "Soil moisture is medium but air is dry. Light irrigation in the evening is useful.",
    };
  }

  return {
    urgency: "medium",
    label: "Monitor",
    advice: "Soil moisture is okay for now. Check again tomorrow morning.",
  };
}

export const getWeather = async (req, res) => {
  try {
    const { lat, lon, soilMoisture, cropType } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        message: "lat and lon are required",
      });
    }

    const data = await fetchCurrentWeather(Number(lat), Number(lon));

    const weather = {
      temperature: data.temperature,
      humidity: data.humidity,
      precipitation: data.precipitation,
      rainfall: data.precipitation, // alias
      windSpeed: data.windSpeed,
      weatherCode: data.weatherCode,
      description: getWeatherDescription(data.weatherCode),
      time: data.time,
      source: data.source,
      sourceUrl: data.sourceUrl,
    };

    // Only generate irrigation advice when both soil + crop are sent
    let irrigation = null;
    if (soilMoisture && cropType) {
      irrigation = getIrrigationAdvice({
        precipitation: data.precipitation,
        humidity: data.humidity,
        soilMoisture,
        cropType,
      });
    }

    // Shape the frontend expects
    res.status(200).json({
      weather,
      irrigation,
    });
  } catch (error) {
    console.error("Weather error:", error.message);
    res.status(502).json({
      message: "Could not fetch weather data. Please try again.",
    });
  }
};