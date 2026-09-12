import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Healthcare() {
  const { user } = useAuth(); // assumes your AuthContext exposes `user`
  const healthRole = user?.healthRole || "patient";
  console.log("DEBUG →", { user, healthRole });

  const patientFeatures = [
    {
      to: "/healthcare/symptom-check",
      emoji: "🩺",
      title: "Check My Symptoms",
      desc: "Describe how you feel, get instant AI guidance",
    },
    {
      to: "/healthcare/alerts",
      emoji: "📢",
      title: "Health Alerts",
      desc: "Vaccination camps, outbreaks, seasonal tips near you",
    },
  ];

  const ashaFeatures = [
    {
      to: "/healthcare/register-patient",
      emoji: "📋",
      title: "Register Patient",
      desc: "Add a new patient and generate their QR health card",
    },
    {
      to: "/healthcare/patients",
      emoji: "👥",
      title: "My Patients",
      desc: "View registered patients in your village",
    },
    {
      to: "/healthcare/post-alert",
      emoji: "📣",
      title: "Post Health Alert",
      desc: "Notify the community about camps or outbreaks",
    },
  ];

  const features =
    healthRole === "asha" || healthRole === "doctor"
      ? [...ashaFeatures, ...patientFeatures]
      : patientFeatures;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 max-w-lg mx-auto px-4 py-10 w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🏥</div>
          <h1 className="text-2xl font-bold text-gray-800">Healthcare</h1>
          <p className="text-gray-500 text-sm mt-1">
            {healthRole === "asha"
              ? "ASHA worker dashboard"
              : healthRole === "doctor"
              ? "Doctor dashboard"
              : "Practical health tools for your family"}
          </p>
        </div>

        <div className="space-y-4">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="block border rounded-2xl p-5 bg-gray-50 border-gray-200 hover:bg-gray-100 transition"
            >
              <div className="text-3xl mb-2">{f.emoji}</div>
              <h2 className="font-bold text-gray-800 text-lg">{f.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/" className="text-green-700 font-medium hover:underline">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Healthcare;