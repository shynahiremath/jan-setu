import axios from "axios";

const MANDI_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const MANDI_API_URL = `https://api.data.gov.in/resource/${MANDI_RESOURCE_ID}`;

const DEFAULT_COST_PER_KM = Number(process.env.TRANSPORT_COST_PER_KM) || 30;
const VEHICLE_CAPACITY = Number(process.env.VEHICLE_CAPACITY_TONNES) || 12;
const SEARCH_RADIUS_KM = Number(process.env.SEARCH_RADIUS_KM) || 600;

// ====================== REAL COORDINATES OF MAJOR MANDIS ======================
const MANDI_COORDS = {
  // Kerala
  "piravam": { lat: 9.8667, lon: 76.4667 },
  "ernakulam": { lat: 9.9816, lon: 76.2999 },
  "thrissur": { lat: 10.5276, lon: 76.2144 },
  "kozhikode": { lat: 11.2588, lon: 75.7804 },
  "calicut": { lat: 11.2588, lon: 75.7804 },
  "palakkad": { lat: 10.7867, lon: 76.6548 },
  "kottayam": { lat: 9.5916, lon: 76.5222 },
  "alappuzha": { lat: 9.4981, lon: 76.3388 },
  "kollam": { lat: 8.8932, lon: 76.6141 },
  "thiruvananthapuram": { lat: 8.5241, lon: 76.9366 },
  "mukkom": { lat: 11.3167, lon: 76.0000 },

  // Karnataka
  "bangalore": { lat: 12.9716, lon: 77.5946 },
  "bengaluru": { lat: 12.9716, lon: 77.5946 },
  "mysore": { lat: 12.2958, lon: 76.6394 },
  "hubli": { lat: 15.3647, lon: 75.1240 },
  "belgaum": { lat: 15.8497, lon: 74.4977 },
  "mangalore": { lat: 12.9141, lon: 74.8560 },
  "gulbarga": { lat: 17.3297, lon: 76.8343 },
  "raichur": { lat: 16.2076, lon: 77.3463 },
  "davangere": { lat: 14.4663, lon: 75.9238 },
  "hassan": { lat: 13.0072, lon: 76.0962 },

  // Maharashtra
  "pune": { lat: 18.5204, lon: 73.8567 },
  "nashik": { lat: 19.9975, lon: 73.7898 },
  "nagpur": { lat: 21.1458, lon: 79.0882 },
  "solapur": { lat: 17.6599, lon: 75.9064 },
  "kolhapur": { lat: 16.7050, lon: 74.2433 },
  "sangli": { lat: 16.8524, lon: 74.5815 },
  "ahmednagar": { lat: 19.0948, lon: 74.7480 },
  "aurangabad": { lat: 19.8762, lon: 75.3433 },
  "latur": { lat: 18.4088, lon: 76.5604 },
  "jalgaon": { lat: 21.0077, lon: 75.5626 },
  "satara": { lat: 17.6805, lon: 74.0183 },

  // Goa
  "mapusa": { lat: 15.5912, lon: 73.8075 },
  "margao": { lat: 15.2736, lon: 73.9581 },
  "ponda": { lat: 15.4013, lon: 74.0075 },

  // Gujarat
  "ahmedabad": { lat: 23.0225, lon: 72.5714 },
  "surat": { lat: 21.1702, lon: 72.8311 },
  "rajkot": { lat: 22.3039, lon: 70.8022 },
  "vadodara": { lat: 22.3072, lon: 73.1812 },

  // Others
  "indore": { lat: 22.7196, lon: 75.8577 },
  "bhopal": { lat: 23.2599, lon: 77.4126 },
  "hyderabad": { lat: 17.3850, lon: 78.4867 },
  "warangal": { lat: 17.9689, lon: 79.5941 },
  "vijayawada": { lat: 16.5062, lon: 80.6480 },
  "coimbatore": { lat: 11.0168, lon: 76.9558 },
  "madurai": { lat: 9.9252, lon: 78.1198 },
  "chennai": { lat: 13.0827, lon: 80.2707 },
};

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function roadDistance(lat1, lon1, lat2, lon2) {
  // Aerial distance × 1.35 gives a realistic road estimate
  return Math.round(haversine(lat1, lon1, lat2, lon2) * 1.35);
}

function findCoords(marketName = "", district = "") {
  const text = `${marketName} ${district}`.toLowerCase();
  for (const [key, coords] of Object.entries(MANDI_COORDS)) {
    if (text.includes(key)) return coords;
  }
  return null;
}

export async function optimizeSell({
  latitude,
  longitude,
  crop,
  quantity_tonnes,
  cost_per_km = DEFAULT_COST_PER_KM,
}) {
  const apiKey = process.env.MANDI_API_KEY;
  if (!apiKey) throw new Error("MANDI_API_KEY is missing in .env");

  // Real prices from Government API
  const response = await axios.get(MANDI_API_URL, {
    params: {
      "api-key": apiKey,
      format: "json",
      limit: 500,
      "filters[commodity]": crop,
    },
  });

  const records = response.data?.records || [];
  if (records.length === 0) {
    throw new Error(`No current price data found for ${crop}`);
  }

  const markets = [];

  for (const rec of records) {
    const marketName = rec.market || rec.Market || "";
    const district = rec.district || rec.District || "";
    const state = rec.state || rec.State || "";

    const modalPrice = Number(rec.modal_price || rec.Modal_Price || 0);
    if (!modalPrice || modalPrice <= 0) continue;

    const pricePerTonne = Math.round(modalPrice * 10); // quintal → tonne

    const coords = findCoords(marketName, district);
    if (!coords) continue; // only keep markets whose location we know

    const distanceKm = roadDistance(latitude, longitude, coords.lat, coords.lon);
    if (distanceKm > SEARCH_RADIUS_KM) continue;

    const trips = Math.ceil(quantity_tonnes / VEHICLE_CAPACITY);
    const transportCost = Math.round(distanceKm * cost_per_km * trips);
    const grossRevenue = Math.round(pricePerTonne * quantity_tonnes);
    const netRealization = grossRevenue - transportCost;
    const travelMinutes = Math.round((distanceKm / 40) * 60);

    markets.push({
      name: `${marketName}, ${district}`,
      state,
      price_per_tonne: pricePerTonne,
      distance_km: distanceKm,
      travel_time_minutes: travelMinutes,
      transport_cost: transportCost,
      gross_revenue: grossRevenue,
      estimated_net_realization: netRealization,
      trips,
    });
  }

  if (markets.length === 0) {
    throw new Error("No markets with known location found within range for this crop.");
  }

  // Highest net realization first
  markets.sort((a, b) => b.estimated_net_realization - a.estimated_net_realization);

  return {
    recommended_market: markets[0],
    markets: markets.slice(0, 12),
    config: {
      cost_per_km,
      vehicle_capacity_tonnes: VEHICLE_CAPACITY,
      search_radius_km: SEARCH_RADIUS_KM,
    },
  };
}