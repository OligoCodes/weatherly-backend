const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(
  origin: 'https://weatherly-nine-pi.vercel.app',
  credentials: true
)); // 🔥 Enable CORS for the app
app.use(express.json());

app.get('/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: "City is required" });

  try {
    // Get coordinates from OpenStreetMap
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    // Fetch weather from RapidAPI
    const weatherUrl = `https://world-weather-online-api1.p.rapidapi.com/weather.ashx?q=${lat}%2C${lon}&num_of_days=3&tp=1&lang=en&aqi=yes&alerts=no&format=json`;

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'world-weather-online-api1.p.rapidapi.com',
        'x-rapidapi-key': process.env.API_KEY
      }
    };

    const weatherRes = await fetch(weatherUrl, options);
    const weatherData = await weatherRes.json();

    res.json({
      city,
      lat,
      lon,
      data: weatherData.data
    });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
