import { getSymptomAdvice, getSeasonalAdvice } from "../services/geminiService.js";

export async function checkSymptoms(req, res) {
  try {
    const { symptoms, language } = req.body;
    const advice = await getSymptomAdvice(symptoms, language);
    res.json({ advice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function seasonalTips(req, res) {
  try {
    const { season, district, language } = req.body;
    const advice = await getSeasonalAdvice(season, district, language);
    res.json({ advice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}