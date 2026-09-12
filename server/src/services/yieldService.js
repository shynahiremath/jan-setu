import axios from "axios";

const YIELD_DATA = {
  Onion: { kharif: 85, rabi: 105, summer: 75 },
  Potato: { kharif: 95, rabi: 115, summer: 85 },
  Tomato: { kharif: 125, rabi: 145, summer: 110 },
  Wheat: { kharif: 0, rabi: 18, summer: 0 },
  Rice: { kharif: 22, rabi: 20, summer: 18 },
  Soyabean: { kharif: 9, rabi: 0, summer: 0 },
  Cotton: { kharif: 6.5, rabi: 0, summer: 0 },
  Maize: { kharif: 18, rabi: 20, summer: 16 },
  Groundnut: { kharif: 11, rabi: 13, summer: 9 },
  Chilli: { kharif: 16, rabi: 19, summer: 13 },
  Turmeric: { kharif: 26, rabi: 0, summer: 0 },
  Banana: { kharif: 180, rabi: 180, summer: 165 },
};

const IRRIGATION_FACTOR = {
  Rainfed: 0.78,
  Partial: 0.92,
  Full: 1.12,
};

async function getWeatherData(latitude, longitude) {
  try {
    // Call your existing weather endpoint that uses Open-Meteo
    const res = await axios.get(`http://localhost:5000/api/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
      },
      timeout: 8000,
    });

    const d = res.data || {};

    return {
      temperature: d.temperature ?? null,
      humidity: d.humidity ?? null,
      rainfall: d.precipitation ?? d.rainfall ?? null,   // Open-Meteo uses precipitation
      rain_probability: null,                            // Open-Meteo current doesn't give probability
      windSpeed: d.windSpeed ?? null,
      description: d.description ?? null,
      available: true,
    };
  } catch (err) {
    console.error("Weather fetch failed:", err.message);
    return {
      temperature: null,
      humidity: null,
      rainfall: null,
      rain_probability: null,
      windSpeed: null,
      description: null,
      available: false,
    };
  }
}

function getWeatherCondition(weather) {
  if (!weather.available) {
    return { overall: "Unknown", rainfall: "Unknown", temperature: "Unknown", humidity: "Unknown" };
  }

  let score = 0;
  const status = { rainfall: "Moderate", temperature: "Moderate", humidity: "Moderate" };

  // Rainfall logic
  if (weather.rainfall !== null) {
    if (weather.rainfall >= 40 && weather.rainfall <= 180) {
      status.rainfall = "Good";
      score += 2;
    } else if (weather.rainfall < 25) {
      status.rainfall = "Low";
      score -= 1;
    } else {
      status.rainfall = "High";
      score -= 0.5;
    }
  }

  // Temperature logic
  if (weather.temperature !== null) {
    if (weather.temperature >= 18 && weather.temperature <= 34) {
      status.temperature = "Good";
      score += 2;
    } else if (weather.temperature > 38) {
      status.temperature = "High";
      score -= 1.5;
    } else {
      status.temperature = "Low";
      score -= 1;
    }
  }

  // Humidity
  if (weather.humidity !== null) {
    if (weather.humidity >= 50 && weather.humidity <= 80) {
      status.humidity = "Good";
      score += 1;
    } else {
      status.humidity = "Moderate";
    }
  }

  let overall = "Moderate";
  if (score >= 3.5) overall = "Favorable";
  else if (score <= 0) overall = "Needs Attention";

  return { ...status, overall };
}

function generateExplanation({ crop, area, totalExpected, weather, condition }) {
  let text = `Based on the current weather and your ${area} acre ${crop} farm, the estimated harvest is around ${totalExpected} quintals.`;

  if (condition.overall === "Favorable") {
    text += ` Rainfall and temperature conditions are currently favorable for the crop.`;
  } else if (condition.overall === "Needs Attention") {
    text += ` Some weather conditions may put stress on the crop and could reduce the expected harvest.`;
  } else {
    text += ` Weather conditions are moderate.`;
  }

  if (weather.rainfall !== null && weather.rainfall < 30) {
    text += ` Recent rainfall is on the lower side.`;
  }
  if (weather.temperature !== null && weather.temperature > 37) {
    text += ` High temperatures may affect crop growth.`;
  }

  text += ` This is only an estimate for planning purposes.`;
  return text;
}

export async function estimateYield({
  crop,
  area_acres,
  season = "kharif",
  irrigation = "Partial",
  latitude = null,
  longitude = null,
}) {
  const cropData = YIELD_DATA[crop];
  if (!cropData) throw new Error(`Yield data not available for ${crop}`);

  const seasonKey = season.toLowerCase();
  let baseYield = cropData[seasonKey];
  if (!baseYield) throw new Error(`${crop} is not typically grown in ${season}`);

  const irrigationFactor = IRRIGATION_FACTOR[irrigation] || 1;
  const weather = await getWeatherData(latitude, longitude);
  const condition = getWeatherCondition(weather);

  // Weather adjustment factor
  let weatherFactor = 1.0;
  if (condition.overall === "Favorable") weatherFactor = 1.08;
  else if (condition.overall === "Needs Attention") weatherFactor = 0.88;

  const adjusted = baseYield * irrigationFactor * weatherFactor;

  const low = Math.round(adjusted * 0.85 * 10) / 10;
  const expected = Math.round(adjusted * 10) / 10;
  const high = Math.round(adjusted * 1.15 * 10) / 10;

  const totalLow = Math.round(low * area_acres * 10) / 10;
  const totalExpected = Math.round(expected * area_acres * 10) / 10;
  const totalHigh = Math.round(high * area_acres * 10) / 10;

  // Convert quintals to tonnes for display (1 tonne = 10 quintals)
  const totalExpectedTonnes = Math.round((totalExpected / 10) * 100) / 100;

  return {
    crop,
    area_acres: Number(area_acres),
    season,
    irrigation,
    yield_per_acre: { low, expected, high, unit: "quintals/acre" },
    total_production: {
      low: totalLow,
      expected: totalExpected,
      high: totalHigh,
      expected_tonnes: totalExpectedTonnes,
      unit: "quintals",
    },
    weather,
    condition,
    explanation: generateExplanation({
      crop,
      area: area_acres,
      totalExpected,
      weather,
      condition,
    }),
    notes: [
      "This is an estimate based on historical average yields + current weather.",
      "Actual harvest depends on seed, pests, nutrients and farm management.",
    ],
  };
}