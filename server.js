const express = require('express');
const { Client } = require('@googlemaps/google-maps-services-js');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

const client = new Client({});
const googleMapsApiKey = 'AIzaSyATXjhgxA95w2Rncd_at9Y8N6f55q1C5Zc';

app.use(bodyParser.json());
app.use(cors());

// 静的ファイルを提供する
app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/route', async (req, res) => {
  const { from, to, waypoints } = req.query;
  let waypointsArray = [];

  if (waypoints) {
    waypointsArray = waypoints.split('|').map(point => point.trim());
  }

  const params = {
    origin: from,
    destination: to,
    key: googleMapsApiKey,
  };

  if (waypointsArray.length > 0) {
    params.waypoints = waypointsArray; // 配列として渡す
  }

  try {
    const response = await client.directions({
      params: params,
      timeout: 10000, // milliseconds
    });

    console.log('API response:', JSON.stringify(response.data, null, 2)); // レスポンスの内容を詳細にログ出力

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const overviewPolyline = route.overview_polyline ? route.overview_polyline.points : null;

      const extractRouteInformation = (route) => {
        const legs = route.legs;

        let routeInfo = {
          totalDistance: 0,
          totalDuration: 0,
          segments: []
        };

        legs.forEach((leg) => {
          const segmentInfo = {
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            distance: leg.distance.text,
            duration: leg.duration.text
          };

          routeInfo.totalDistance += leg.distance.value;
          routeInfo.totalDuration += leg.duration.value;
          routeInfo.segments.push(segmentInfo);
        });

        // Convert total distance and duration to human-readable format
        routeInfo.totalDistanceText = (routeInfo.totalDistance / 1000).toFixed(2) + ' km';
        routeInfo.totalDurationText = (routeInfo.totalDuration / 60).toFixed(2) + ' mins';

        return routeInfo;
      };

      const routeInfo = extractRouteInformation(route);

      res.json({
        overviewPolyline,
        distance: routeInfo.totalDistanceText,
        duration: routeInfo.totalDurationText,
        segments: routeInfo.segments
      });
    } else {
      console.error('No routes found in the response.');
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    console.error('Error fetching route:', error);
    if (error.response) {
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).json({ error: 'Error fetching route' });
  }
});

// exeファイルを実行するエンドポイント
app.post('/run-exe', (req, res) => {
  console.log(req.body);
  const { hL, hR, oL, oR } = req.body;
  const exePath = path.join(__dirname, 'exe', 'calcWin.exe');
  const args = [hL, hR, oL, oR];

  console.log(`Executable path: ${exePath}`);
  const process = spawn(exePath, args);

  let output = '';
  process.stdout.on('data', (data) => {
    output += data.toString();
  });

  process.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  process.on('close', (code) => {
    if (code !== 0) {
      console.error(`Process exited with code ${code}`);
      res.status(500).json({ error: `Process exited with code ${code}` });
      return;
    }

    // 改行を削除し、JSON形式で返す
    console.log(`stdout: ${output}`);
    output = output.trim();
    console.log(`stdout: ${output}`);
    // スペースで分割して JSON 形式に変換
    const [newFrom, newTo] = output.split(' ').map(Number);
    res.json({ output: { from: newFrom, to: newTo } });
  });
});

// どのルートにも対応するための設定
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
