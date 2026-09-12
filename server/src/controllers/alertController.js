import Alert from "../models/Alert.js";

export async function createAlert(req, res) {
  try {
    const alert = await Alert.create({ ...req.body, createdBy: req.userId });
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAlerts(req, res) {
  try {
    const { village, district } = req.query;
    const filter = {};
    if (village) filter.village = village;
    if (district) filter.district = district;
    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(20);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}