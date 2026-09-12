import { useState } from "react";
import { healthApi } from "../../utils/healthApi";

function RegisterPatient() {
  const [form, setForm] = useState({
    name: "", age: "", gender: "male", phone: "", village: "", district: "",
  });
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const patient = await healthApi.registerPatient(form);
      setQrCode(patient.qrCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 max-w-lg mx-auto px-4 py-10 w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Register Patient</h1>

        {!qrCode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name" value={form.name} onChange={handleChange}
              placeholder="Full name" required
              className="w-full border border-gray-300 rounded-xl p-3"
            />
            <input
              name="age" type="number" value={form.age} onChange={handleChange}
              placeholder="Age"
              className="w-full border border-gray-300 rounded-xl p-3"
            />
            <select
              name="gender" value={form.gender} onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              name="phone" value={form.phone} onChange={handleChange}
              placeholder="Phone number"
              className="w-full border border-gray-300 rounded-xl p-3"
            />
            <input
              name="village" value={form.village} onChange={handleChange}
              placeholder="Village" required
              className="w-full border border-gray-300 rounded-xl p-3"
            />
            <input
              name="district" value={form.district} onChange={handleChange}
              placeholder="District" required
              className="w-full border border-gray-300 rounded-xl p-3"
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-purple-600 text-white font-medium py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register Patient"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-green-700 font-medium mb-4">✅ Patient registered successfully</p>
            <img src={qrCode} alt="Patient QR Code" className="mx-auto w-56 h-56 border rounded-xl" />
            <p className="text-sm text-gray-500 mt-3">
              Print or save this QR code as the patient's health card.
            </p>
            <button
              onClick={() => { setQrCode(null); setForm({ name: "", age: "", gender: "male", phone: "", village: "", district: "" }); }}
              className="mt-6 text-purple-700 font-medium hover:underline"
            >
              Register another patient
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default RegisterPatient;