import axios from "axios";

const CROP_HEALTH_API_URL = "https://crop.kindwise.com/api/v1/identification";

// Temporary hard-coded key (we will move it back to .env later)
const API_KEY = "9af2RyxrF9TsTL4Dh8NXzzMr2ZLTqipmZLkhtpyWl1I2ZyUdRE";

export async function analyzeCropImage(imageBase64) {
  if (!API_KEY) {
    throw new Error("CROP_HEALTH_API_KEY is missing");
  }

  // Remove data:image/...;base64, prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const response = await axios.post(
    CROP_HEALTH_API_URL,
    {
      images: [base64Data],
    },
    {
      headers: {
        "Api-Key": API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}