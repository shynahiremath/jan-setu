import HealthRecord from "../models/HealthRecord.js";

export async function addRecord(req, res) {
  try {
    const record = await HealthRecord.create({
      ...req.body,
      recordedBy: req.userId,
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getRecordsByPatient(req, res) {
  try {
    const records = await HealthRecord.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function bulkSyncRecords(req, res) {
  try {
    const { records } = req.body;
    const inserted = await HealthRecord.insertMany(
      records.map((r) => ({ ...r, syncStatus: "synced" }))
    );
    res.status(201).json(inserted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}