import Clinic from "../models/Clinic.js";

export async function addClinic(req, res) {
  try {
    const clinic = await Clinic.create(req.body);
    res.status(201).json(clinic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getClinics(req, res) {
  try {
    const clinics = await Clinic.find();
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}