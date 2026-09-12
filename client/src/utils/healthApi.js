const BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("jansetu_token");
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const healthApi = {
  checkSymptoms: (symptoms, language) =>
    request("/ai/symptom-check", {
      method: "POST",
      body: JSON.stringify({ symptoms, language }),
    }),

  getSeasonalTips: (season, district, language) =>
    request("/ai/seasonal-tips", {
      method: "POST",
      body: JSON.stringify({ season, district, language }),
    }),

  registerPatient: (patientData) =>
    request("/patients", {
      method: "POST",
      body: JSON.stringify(patientData),
    }),

  getPatients: (params = "") => request(`/patients${params}`),

  getAlerts: (params = "") => request(`/alerts${params}`),

  createAlert: (alertData) =>
    request("/alerts", {
      method: "POST",
      body: JSON.stringify(alertData),
    }),

  createConsultation: (data) =>
    request("/consultations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};