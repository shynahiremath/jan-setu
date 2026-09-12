import Consultation from "../models/Consultation.js";
import { getSymptomAdvice } from "../services/geminiService.js";

export async function createConsultation(req, res) {
  try {
    const { patientId, symptomsText, photoUrl, language } = req.body;
    const aiSuggestion = await getSymptomAdvice(symptomsText, language);

    const consultation = await Consultation.create({
      patientId,
      symptomsText,
      photoUrl,
      aiSuggestion,
      type: "async",
      status: "pending",
    });

    res.status(201).json(consultation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getConsultations(req, res) {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const consultations = await Consultation.find(filter).populate("patientId").sort({ createdAt: -1 });
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function respondToConsultation(req, res) {
  try {
    const { doctorResponse } = req.body;
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { doctorResponse, status: "resolved", doctorId: req.userId },
      { new: true }
    );
    res.json(consultation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}