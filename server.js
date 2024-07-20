const express = require('express');
const { Client } = require('@googlemaps/google-maps-services-js');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

const client = new Client({});
const googleMapsApiKey = 'AIzaSyATXjhgxA95w2Rncd_at9Y8N6f55q1C5Zc';

// 静的ファイルを提供する
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/route', async (req, res) => {
  const { from, to, waypoints } = req.query;
  let waypointsArray = [];

  if (waypoints) {
    waypointsArray = waypoints.split('|').map(point => ({
      location: point,
      stopover: true
    }));
  }

  try {
    const response = await client.directions({
      params: {
        origin: from,
        destination: to,
        waypoints: waypointsArray.length > 0 ? waypointsArray : undefined,
        key: googleMapsApiKey,
      },
      timeout: 10000, // milliseconds
    });

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const overviewPolyline = route.overview_polyline.points;
      const distance = route.legs[0].distance.text;
      const duration = route.legs[0].duration.text;
      
      res.json({
        overviewPolyline,
        distance,
        duration,
      });
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    console.error('Error fetching route:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    res.status(500).json({ error: 'Error fetching route' });
  }
});

// どのルートにも対応するための設定
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
