import QRCode from "qrcode";

export async function generatePatientQR(patientId) {
  try {
    const qrDataUrl = await QRCode.toDataURL(`PATIENT:${patientId}`);
    return qrDataUrl; // base64 image string, store or send directly to frontend
  } catch (err) {
    console.error("QR generation error:", err.message);
    return null;
  }
}