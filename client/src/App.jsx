import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Finance from "./pages/Finance";
import Schemes from "./pages/Schemes";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EMICalculator from "./pages/EMICalculator";
import VoiceTest from "./pages/VoiceTest";

// Agriculture
import AgricultureHome from "./pages/agriculture/AgricultureHome";
import Weather from "./pages/agriculture/Weather";
import YieldPrediction from "./pages/agriculture/YieldPrediction";
import MandiPrices from "./pages/agriculture/MandiPrices";
import SellTransport from "./pages/agriculture/SellTransport";
import CropDisease from "./pages/agriculture/CropDisease";
// Healthcare
import Healthcare from "./pages/healthcare/Healthcare";
import SymptomCheck from "./pages/healthcare/SymptomCheck";
import RegisterPatient from "./pages/healthcare/RegisterPatient";
import Alerts from "./pages/healthcare/Alerts";
// Healthcare — pages will be added back once rebuilt against new backend
// import Healthcare from "./pages/healthcare/Healthcare";
// import VillageHealthCheck from "./pages/healthcare/VillageHealthCheck";
// import SeasonalGuide from "./pages/healthcare/SeasonalGuide";
// import HealthRecords from "./pages/healthcare/HealthRecords";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Common */}
          <Route path="/" element={<Home />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/finance/emi-calculator" element={<EMICalculator />} />
          <Route path="/voice-test" element={<VoiceTest />} />

          {/* Agriculture */}
          <Route path="/agriculture" element={<AgricultureHome />} />
          <Route path="/agriculture/weather" element={<Weather />} />
          <Route path="/agriculture/yield-prediction" element={<YieldPrediction />} />
          <Route path="/agriculture/mandi-prices" element={<MandiPrices />} />
          <Route path="/agriculture/sell-transport" element={<SellTransport />} />
          <Route path="/agriculture/crop-disease" element={<CropDisease />} />

          {/* Healthcare — routes will be added back once new pages are built */}
          {/* Healthcare */}
<Route path="/healthcare" element={<Healthcare />} />
<Route path="/healthcare/symptom-check" element={<SymptomCheck />} />
<Route path="/healthcare/register-patient" element={<RegisterPatient />} />
<Route path="/healthcare/alerts" element={<Alerts />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;