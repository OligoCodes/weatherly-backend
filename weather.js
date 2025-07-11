const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://weatherly-nine-pi.vercel.app',
  credentials: true
}));

app.get('/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: 'City is required' });

  try {
    // Step 1: Get coordinates from OpenStreetMap
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const lat = geoData[0].lat;
    const lon = geoData[0].lon;

    // Step 2: Get weather data using RapidAPI
    const weatherUrl = `https://world-weather-online-api1.p.rapidapi.com/weather.ashx?q=${lat}%2C${lon}&num_of_days=3&tp=1&lang=en&aqi=yes&alerts=no&format=json`;
    const weatherRes = await fetch(weatherUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'world-weather-online-api1.p.rapidapi.com',
        'x-rapidapi-key': process.env.API_KEY
      }
    });

    const weatherData = await weatherRes.json();

    res.json({
      city,
      coords: { lat, lon },
      weatherData
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
