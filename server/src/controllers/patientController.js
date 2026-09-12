import Patient from "../models/Patient.js";
import { generatePatientQR } from "../services/qrService.js";

export async function registerPatient(req, res) {
  try {
    const { name, age, gender, phone, village, district, familyId } = req.body;
    const patient = await Patient.create({
      name, age, gender, phone, village, district, familyId,
      registeredBy: req.userId,
    });

    const qrCode = await generatePatientQR(patient._id);
    patient.qrCode = qrCode;
    await patient.save();

    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPatients(req, res) {
  try {
    const { village, district } = req.query;
    const filter = {};
    if (village) filter.village = village;
    if (district) filter.district = district;
    const patients = await Patient.find(filter).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPatientById(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}