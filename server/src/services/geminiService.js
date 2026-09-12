import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function askGemini(prompt) {
  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "Sorry, I couldn't generate a response right now.";
  } catch (err) {
    console.error("Gemini error:", err.message);
    return "AI service unavailable. Please consult a health worker directly.";
  }
}

export async function getSymptomAdvice(symptoms, language = "en") {
  const prompt = `You are a rural health assistant. A patient describes these symptoms: "${symptoms}".
Respond in simple ${language} language, in under 100 words. Give:
1. Possible general cause (not a diagnosis)
2. Basic home care advice
3. Whether they should visit a clinic urgently, soon, or can wait
Do NOT prescribe medicines. Always recommend seeing a doctor for serious symptoms.`;
  return askGemini(prompt);
}

export async function getSeasonalAdvice(season, district, language = "en") {
  const prompt = `Give 3 short, practical health precautions for rural families in ${district} during ${season} season, in simple ${language}. Keep it under 80 words, bullet points.`;
  return askGemini(prompt);
}